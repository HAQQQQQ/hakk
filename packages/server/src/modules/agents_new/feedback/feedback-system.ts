/**
 * Feedback system for agent improvement
 */
import { LanguageModelInterface } from "../llm/interfaces";
import { Message } from "../core/types";

/**
 * Interface for feedback items
 */
export interface FeedbackItem {
	conversationId: string;
	messageId: string;
	rating: number;
	comment?: string;
	timestamp: number;
}

/**
 * Feedback statistics
 */
export interface FeedbackStats {
	averageRating: number;
	totalFeedback: number;
	positiveFeedback: number;
	negativeFeedback: number;
}

/**
 * Feedback system for agent improvement
 */
export class FeedbackSystem {
	private feedbackStore: any; // Would be a database client

	constructor(feedbackStore: any) {
		this.feedbackStore = feedbackStore;
	}

	/**
	 * Record user feedback
	 */
	async recordFeedback(
		conversationId: string,
		messageId: string,
		rating: number,
		comment?: string,
	): Promise<void> {
		await this.feedbackStore.saveFeedback({
			conversationId,
			messageId,
			rating,
			comment,
			timestamp: Date.now(),
		});
	}

	/**
	 * Get feedback statistics
	 */
	async getFeedbackStats(conversationId?: string): Promise<FeedbackStats> {
		// Retrieve feedback data
		const feedbackItems = await this.feedbackStore.getFeedback(conversationId);

		// Calculate statistics
		const totalFeedback = feedbackItems.length;
		const positiveFeedback = feedbackItems.filter((item) => item.rating >= 4).length;
		const negativeFeedback = feedbackItems.filter((item) => item.rating <= 2).length;
		const averageRating =
			totalFeedback > 0
				? feedbackItems.reduce((sum, item) => sum + item.rating, 0) / totalFeedback
				: 0;

		return {
			averageRating,
			totalFeedback,
			positiveFeedback,
			negativeFeedback,
		};
	}

	/**
	 * Generate improvement recommendations
	 */
	async generateImprovementRecommendations(
		llm: LanguageModelInterface,
		conversationId?: string,
	): Promise<string[]> {
		// Get recent negative feedback
		const feedbackItems = await this.feedbackStore.getFeedback(conversationId);
		const negativeFeedback = feedbackItems
			.filter((item) => item.rating <= 2 && item.comment)
			.slice(-10);

		if (negativeFeedback.length === 0) {
			return ["No negative feedback to analyze"];
		}

		// Prepare prompt for the LLM
		const prompt = `
Analyze the following user feedback on AI assistant responses and generate 
specific, actionable recommendations for improvement:

${negativeFeedback
	.map(
		(item) => `
Rating: ${item.rating}/5
Comment: ${item.comment}
`,
	)
	.join("\n")}

Provide 3-5 concrete recommendations for improvement based on the patterns in 
this feedback. Focus on actionable changes to make responses better.
`;

		// Generate recommendations
		const messages: Message[] = [
			{
				role: "system",
				content:
					"You are an AI improvement analyst. Your job is to identify patterns in user feedback and recommend concrete improvements.",
			},
			{
				role: "user",
				content: prompt,
			},
		];

		let recommendations = "";
		const generator = llm.generateResponse(messages);

		for await (const chunk of generator) {
			if (typeof chunk === "string") {
				recommendations += chunk;
			}
		}

		// Parse recommendations into a list
		return recommendations
			.split("\n")
			.filter((line) => line.trim().startsWith("-") || line.trim().startsWith("•"))
			.map((line) => line.replace(/^[•-]\s*/, "").trim());
	}
}
