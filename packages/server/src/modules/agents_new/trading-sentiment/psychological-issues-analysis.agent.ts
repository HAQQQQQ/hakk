import { z } from "zod";
import { Agent, AgentBuilder, AgentResponse } from "../agent";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { EventBus, LoggingMiddleware, Message } from "../core";
import { AgentImpl } from "./agent-impl";

export const tradingPsychologicalIssueSchema = z.object({
	issue: z.string().describe("Description of the psychological issue"),
	confidence: z
		.number()
		// .min(0)
		// .max(1)
		.describe("Confidence level in identifying the issue (0-1)"),
	evidence: z
		.array(z.string())
		.describe("List of evidence supporting the identification of the issue"),
	impact: z
		.enum(["low", "medium", "high", "critical"])
		.describe("Impact level of the issue on trading performance"),
	recommendedIntervention: z.string().describe("Recommended intervention to address the issue"),
	resources: z
		.array(z.string())
		.nullable()
		// .optional()
		.describe("Optional list of resources to help address the issue"),
});

export const psychologicalIssuesAnalysisSchema = z.object({
	issues: z
		.array(tradingPsychologicalIssueSchema)
		.describe("List of identified psychological issues"),
	prioritizedAction: z
		.string()
		.describe("The highest priority action to address psychological issues"),
	overallRiskAssessment: z
		.string()
		.describe("Overall risk assessment based on psychological issues"),
});

export const additionalAnalysisSchema = z.object({
	// Temporal analysis
	temporalSentiment: z
		.object({
			pastTrades: z
				.enum([
					"very negative",
					"negative",
					"neutral",
					"positive",
					"very positive",
					"not discussed",
				])
				.describe("Sentiment toward past trading results"),
			currentMarket: z
				.enum([
					"very negative",
					"negative",
					"neutral",
					"positive",
					"very positive",
					"not discussed",
				])
				.describe("Sentiment toward current market conditions"),
			futurePerspective: z
				.enum([
					"very negative",
					"negative",
					"neutral",
					"positive",
					"very positive",
					"not discussed",
				])
				.describe("Outlook on future trading performance"),
			comparison: z
				.string()
				.describe("Brief analysis of sentiment change from past to future"),
		})
		.describe("Temporal analysis of trading sentiment across timeframes"),

	// Key trading phrases
	keyPhrases: z
		.array(
			z.object({
				phrase: z.string().describe("Important trading-related phrase from the journal"),
				significanceLevel: z
					.number()
					// .min(0)
					// .max(1)
					.describe("Significance of this phrase to trading psychology (0-1)"),
				implication: z.string().describe("Psychological implication of this phrase"),
			}),
		)
		.describe("Key phrases with significance to trading psychology"),

	// Trading journal insights
	journalInsights: z
		.object({
			selfAwareness: z
				.number()
				// .min(0)
				// .max(1)
				.describe("Level of trading self-awareness demonstrated (0-1)"),
			lessonsDerived: z
				.array(z.string())
				.describe("Trading lessons the trader appears to be learning"),
			blindSpots: z
				.array(z.string())
				.describe("Psychological blind spots apparent in journal"),
			developmentAreas: z
				.array(z.string())
				.describe("Suggested areas for psychological development"),
			strengths: z.array(z.string()).describe("Psychological trading strengths demonstrated"),
		})
		.describe("Insights about trading psychology from journal content"),
});

export const psychologicalIssuesResponseSchema = z.object({
	...additionalAnalysisSchema.shape,
	...psychologicalIssuesAnalysisSchema.shape,
});

export type PsychologicalIssuesResponse = z.infer<typeof psychologicalIssuesResponseSchema>;

export const psychologicalAnalysisPromptTemplate = (journalEntry: string): string => {
	return `
    Trading Journal Entry: "${journalEntry}"
    
    Please identify potential trading psychology issues in this journal entry:
    1. Name specific trading psychology issues with confidence levels
    2. Provide evidence from the text for each issue
    3. Assess the potential impact of each issue on trading performance
    4. Recommend specific interventions for each issue
    5. Suggest resources to help address each issue (books, techniques, exercises)
    6. Identify the single highest priority action item
    7. Provide an overall risk assessment of how these psychological factors may affect trading
    `;
};

const SYSTEM_PROMPT =
	"You identify and prioritize potential psychological issues affecting a trader based on their journal entries.";

export class PsychologicalAnalysisAgent extends AgentImpl {
	protected agent: Agent;

	/**
	 * Create a new psychological analysis agent
	 *
	 * @param openaiClient - OpenAI client service
	 */
	constructor(openaiClient: OpenAIClientService) {
		super();
		// Create the agent using the builder pattern
		this.agent = new AgentBuilder("PsychologicalAnalysisAgent")
			.withDescription(
				"Identifies and prioritizes potential psychological issues affecting a trader based on their journal entries",
			)
			.withSystemPrompt(SYSTEM_PROMPT)
			.withOpenAIClient(openaiClient)
			.withEventBus(new EventBus())
			.withMiddleware(new LoggingMiddleware())
			.build();
	}

	/**
	 * Analyze psychological issues in a trading journal entry
	 *
	 * @param journalEntry - Trading journal entry to analyze
	 * @param onMessage - Optional callback for messages during processing
	 * @returns Psychological issues analysis or null if processing failed
	 */
	async analyzePsychologicalIssues(
		journalEntry: string,
		onMessage?: (message: Message) => void | Promise<void>,
	): Promise<AgentResponse<PsychologicalIssuesResponse> | null> {
		// Generate the prompt from the template
		const prompt = psychologicalAnalysisPromptTemplate(journalEntry);

		// Default message handler if none provided
		const messageHandler = onMessage || this.createDefaultMessageHandler();

		try {
			// Process the query with schema validation
			const result = await this.agent.processQueryWithSchema<PsychologicalIssuesResponse>(
				prompt,
				psychologicalIssuesResponseSchema,
				messageHandler,
			);

			return result;
		} catch (error) {
			console.error("Error analyzing psychological issues:", error);
			return null;
		}
	}
}
