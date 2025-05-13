import { TradingContext } from "@/modules/agents/trading-sentiment/types/trading-sentiment.types";
import { z } from "zod";
import { Agent, AgentBuilder } from "../agent";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { EventBus, LoggingMiddleware, Message } from "../core";
import { AgentImpl } from "./agent-impl";

export const cognitiveBiasSchema = z.object({
	// Cognitive biases analysis
	cognitiveDistortions: z
		.array(
			z.object({
				biasType: z.string().describe("Type of cognitive bias or trading distortion"),
				// confidence: z.number().min(0).max(1).describe("Confidence in bias detection (0-1)"),
				confidence: z.number().describe("Confidence in bias detection (0-1)"),
				evidence: z.string().describe("Text evidence supporting this bias detection"),
				potentialConsequence: z
					.string()
					.describe("Potential negative outcome of this bias"),
			}),
		)
		.describe("Cognitive biases and distortions detected in trading thinking"),

	// Trading psychology patterns
	psychologyPatterns: z
		.array(
			z.object({
				pattern: z.string().describe("Trading psychology pattern identified"),
				frequency: z
					.enum(["one-time", "occasional", "frequent", "persistent"])
					.describe("Frequency of this pattern in the journal entry"),
				impact: z
					.enum(["minimal", "moderate", "significant", "severe"])
					.describe("Potential impact on trading performance"),
				recommendation: z.string().describe("Suggestion for addressing this pattern"),
			}),
		)
		.describe("Trading psychology patterns identified in journal entry"),
});

export type CognitiveBiasAnalysis = z.infer<typeof cognitiveBiasSchema>;

export const contextualSentimentPromptTemplate = (
	journalEntry: string,
	context: TradingContext,
): string => {
	return `
    Trading Journal Entry: "${journalEntry}"
    
    Trading Context:
    ${context.tradingStyle ? `Trading Style: ${context.tradingStyle}` : ""}
    ${context.marketContext ? `Market Context: ${context.marketContext}` : ""}
    ${context.accountSize ? `Account Size: ${context.accountSize}` : ""}
    ${context.experience ? `Experience Level: ${context.experience}` : ""}
    ${context.recentPerformance ? `Recent Performance: ${context.recentPerformance}` : ""}
    ${context.knownPatterns?.length ? `Known Psychological Patterns: ${context.knownPatterns.join(", ")}` : ""}
    ${context.tradingPlan ? `Today's Trading Plan: ${context.tradingPlan}` : ""}
    ${context.tickers?.length ? `Tickers Being Traded: ${context.tickers.join(", ")}` : ""}
    
    Please analyze this trading journal entry considering the provided context.`;
};

const SYSTEM_PROMPT =
	"You analyze day trading journal entries with additional context to extract detailed psychological insights.";

export class ContextualSentimentAgent extends AgentImpl {
	protected agent: Agent;

	/**
	 * Create a new contextual sentiment analyzer
	 *
	 * @param openaiClient - OpenAI client service
	 */
	constructor(openaiClient: OpenAIClientService) {
		super();
		this.agent = new AgentBuilder("ContextualSentimentAgent")
			.withDescription(
				"Analyzes day trading journal entries with additional context to extract detailed psychological insights",
			)
			.withSystemPrompt(SYSTEM_PROMPT)
			.withOpenAIClient(openaiClient)
			.withEventBus(new EventBus())
			.withMiddleware(new LoggingMiddleware())
			.build();
	}

	/**
	 * Analyze a trading journal entry with context
	 *
	 * @param journalEntry - Trading journal entry to analyze
	 * @param context - Trading context information
	 * @param onMessage - Optional callback for messages during processing
	 * @returns Cognitive bias analysis or null if processing failed
	 */
	async analyze(
		journalEntry: string,
		context: TradingContext,
		onMessage?: (message: Message) => void | Promise<void>,
	): Promise<CognitiveBiasAnalysis | null> {
		// Generate the prompt from the template
		const prompt = contextualSentimentPromptTemplate(journalEntry, context);

		// Default message handler if none provided
		const messageHandler = onMessage || this.createDefaultMessageHandler();

		try {
			// Process the query with schema validation
			const result = await this.agent.processQueryWithSchema<CognitiveBiasAnalysis>(
				prompt,
				cognitiveBiasSchema,
				messageHandler,
			);

			return result;
		} catch (error) {
			console.error("Error analyzing contextual sentiment:", error);
			return null;
		}
	}
}
