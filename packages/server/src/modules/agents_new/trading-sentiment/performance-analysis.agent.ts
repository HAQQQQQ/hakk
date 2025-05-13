import { TradingSessionResults } from "@/modules/agents/trading-sentiment/types/trading-sentiment.types";
import { Agent, AgentBuilder } from "../agent";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { EventBus, LoggingMiddleware, Message } from "../core";

import { z } from "zod";
import { AgentImpl } from "./agent-impl";

export const performanceCorrelationSchema = z.object({
	sentimentPerformanceAlignment: z
		.number()
		// .min(-1)
		// .max(1)
		.describe("Correlation between sentiment and performance (-1 to 1)"),
	overconfidenceIndicator: z
		.number()
		// .min(0)
		// .max(1)
		.describe("Measure of overconfidence (0-1)"),
	underconfidenceIndicator: z
		.number()
		// .min(0)
		// .max(1)
		.describe("Measure of underconfidence (0-1)"),
	sentimentAccuracy: z
		.number()
		// .min(0)
		// .max(1)
		.describe("Accuracy of sentiment predictions (0-1)"),
	psychologicalObservations: z.array(z.string()).describe("List of psychological observations"),
	recommendedAdjustments: z
		.array(z.string())
		.describe("List of recommended psychological adjustments"),
});

export const marketTradeSchema = z.object({
	// Market sentiment analysis
	marketPerception: z
		.object({
			overallMarketSentiment: z
				.enum(["very bearish", "bearish", "neutral", "bullish", "very bullish"])
				.describe("Trader's perception of overall market conditions"),
			specificMarkets: z
				.array(
					z.object({
						market: z.string().describe("Specific market or sector mentioned"),
						sentiment: z
							.enum(["very bearish", "bearish", "neutral", "bullish", "very bullish"])
							.describe("Sentiment toward this specific market"),
						confidence: z
							.number()
							// .min(0)
							// .max(1)
							.describe("Confidence in this market sentiment assessment (0-1)"),
					}),
				)
				// .optional()
				.nullable()
				.describe("Sentiment toward specific markets or sectors mentioned"),
		})
		.describe("Analysis of the trader's market sentiment and outlook"),

	// Trade-specific sentiment
	tradeAnalysis: z
		.array(
			z.object({
				// ticker: z.string().optional().describe("Stock or asset ticker symbol"),
				ticker: z.string().nullable().describe("Stock or asset ticker symbol"),
				tradeDirection: z
					.enum([
						"long",
						"short",
						"considering long",
						"considering short",
						"exited long",
						"exited short",
						"unclear",
					])
					.describe("Direction of trade or potential trade"),
				sentiment: z
					.enum(["very negative", "negative", "neutral", "positive", "very positive"])
					.describe("Sentiment toward this specific trade"),
				confidence: z
					.number()
					// .min(0)
					// .max(1)
					.describe("Trader's confidence level in this trade or analysis (0-1)"),
				rationale: z
					.array(z.string())
					.describe("Trading rationales mentioned for this trade"),
				emotionalDrivers: z
					.array(z.string())
					.nullable()
					// .optional()
					.describe("Emotional factors potentially driving this trade decision"),
			}),
		)
		.describe("Analysis of sentiment toward specific trades or potential trades"),
});

export const performanceAnalysisResponseSchema = z.object({
	...marketTradeSchema.shape,
	...performanceCorrelationSchema.shape,
});

export type PerformanceAnalysisResponse = z.infer<typeof performanceAnalysisResponseSchema>;

export const performanceAnalysisPromptTemplate = (
	journalEntry: string,
	results: TradingSessionResults,
): string => {
	const tradesFormatted = results.trades
		.map(
			(trade) =>
				`- ${trade.ticker} (${trade.direction}): ${trade.result} (${
					trade.profitLoss >= 0 ? "+" : ""
				}$${trade.profitLoss})${trade.notes ? ` - ${trade.notes}` : ""}`,
		)
		.join("\n");

	return `
    Trading Journal Entry: "${journalEntry}"
    
    Trading Session Results:
    Overall P&L: ${results.profitLoss >= 0 ? "+" : ""}$${results.profitLoss}
    
    Individual Trades:
    ${tradesFormatted}
    
    ${results.sessionNotes ? `Session Notes: ${results.sessionNotes}` : ""}
    
    Please analyze:
    1. The trading psychology revealed in the journal entry
    2. How psychological factors correlate with actual trading results
    3. Alignment or misalignment between sentiment and performance
    4. Signs of overconfidence or underconfidence relative to results
    5. How accurately the trader's sentiment predicted outcomes
    6. Recommended psychological adjustments based on the performance correlation
    `;
};

const SYSTEM_PROMPT =
	"You analyze trading journal entries in relation to actual performance to identify correlation between psychology and results.";

export class PerformanceAnalysisAgent extends AgentImpl {
	protected agent: Agent;

	/**
	 * Create a new performance analysis agent
	 *
	 * @param openaiClient - OpenAI client service
	 */
	constructor(openaiClient: OpenAIClientService) {
		super();
		// Create the agent using the builder pattern
		this.agent = new AgentBuilder("PerformanceAnalysisAgent")
			.withDescription(
				"Analyzes trading journal entries in relation to actual performance to identify correlation between psychology and results",
			)
			.withSystemPrompt(SYSTEM_PROMPT)
			.withOpenAIClient(openaiClient)
			.withEventBus(new EventBus())
			.withMiddleware(new LoggingMiddleware())
			.build();
	}

	/**
	 * Analyze a trading journal entry with performance results
	 *
	 * @param journalEntry - Trading journal entry to analyze
	 * @param results - Trading session results
	 * @param onMessage - Optional callback for messages during processing
	 * @returns Performance analysis or null if processing failed
	 */
	async analyzePerformance(
		journalEntry: string,
		results: TradingSessionResults,
		onMessage?: (message: Message) => void | Promise<void>,
	): Promise<PerformanceAnalysisResponse | null> {
		// Generate the prompt from the template
		const prompt = performanceAnalysisPromptTemplate(journalEntry, results);

		// Default message handler if none provided
		const messageHandler = onMessage || this.createDefaultMessageHandler();

		try {
			// Process the query with schema validation
			const result = await this.agent.processQueryWithSchema<PerformanceAnalysisResponse>(
				prompt,
				performanceAnalysisResponseSchema,
				messageHandler,
			);

			return result;
		} catch (error) {
			console.error("Error analyzing performance:", error);
			return null;
		}
	}
}
