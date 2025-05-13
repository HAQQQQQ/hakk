import { z } from "zod";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { EventBus } from "../core/events";
import { Message } from "../core/types";
import { LoggingMiddleware } from "../core/middleware";
import { Agent, AgentBuilder } from "../agent";
import { coreSentimentSchema } from "@/modules/agents/trading-sentiment/agents/sentiment-analysis-agent/core-sentiment.schema";
import { cognitiveBiasSchema } from "@/modules/agents/trading-sentiment/agents/contextual-sentiment-agent/cognitive-bias.schema";
import { marketTradeSchema } from "@/modules/agents/trading-sentiment/agents/performance-analysis-agent/performance-analysis.schema";
import { strategyRiskSchema } from "@/modules/agents/trading-sentiment/agents/trend-analysis-agent/trend-analysis-response.schema";
import { additionalAnalysisSchema } from "@/modules/agents/trading-sentiment/agents/psychological-issues-agent/psychological-issues.schema";
import { recommendationsSchema } from "@/modules/agents/trading-sentiment/agents/psychology-plan-agent/psychology-plan-response.schema";
import { AgentImpl } from "./agent-impl";

/**
 * Schema for trading journal sentiment analysis
 */

// // Combine all schemas into one comprehensive schema
export const generalTradingSchema = z.object({
	...coreSentimentSchema.shape,
	...cognitiveBiasSchema.shape,
	...marketTradeSchema.shape,
	...strategyRiskSchema.shape,
	...additionalAnalysisSchema.shape,
	...recommendationsSchema.shape,
});

export type GeneralTradingAnalysis = z.infer<typeof generalTradingSchema>;

/**
 * Generate the prompt for sentiment analysis
 */
export const generalTradingAnalysisPromptTemplate = (journalEntry: string): string => {
	return `Trading Journal Entry: "${journalEntry}"
      
    Please analyze this trading journal entry for psychological patterns, emotions, 
    cognitive biases, and provide actionable recommendations.`;
};

const SYSTEM_PROMPT =
	"You analyze trading journal entries to extract detailed psychological insights, emotions, cognitive biases, and actionable recommendations to improve trading performance.";

/**
 * Class for the Trading Journal Sentiment Analyzer
 */
export class GeneralAnalysisAgent extends AgentImpl {
	protected agent: Agent;

	/**
	 * Create a new trading sentiment analyzer
	 *
	 * @param openaiClient - OpenAI client service
	 */
	constructor(openaiClient: OpenAIClientService) {
		super();
		// Create the agent using the builder pattern
		this.agent = new AgentBuilder("GeneralAnalysisAgent")
			.withDescription(
				"Analyzes trading journal entries to extract psychological insights, emotions, cognitive biases, and provide actionable trading performance recommendations",
			)
			.withSystemPrompt(SYSTEM_PROMPT)
			.withOpenAIClient(openaiClient)
			.withEventBus(new EventBus())
			.withMiddleware(new LoggingMiddleware())
			.build();
	}

	/**
	 * Analyze a trading journal entry
	 *
	 * @param journalEntry - Trading journal entry to analyze
	 * @param onMessage - Optional callback for messages during processing
	 * @returns Sentiment analysis or null if processing failed
	 */
	async analyzeSentiment(
		journalEntry: string,
		onMessage?: (message: Message) => void | Promise<void>,
	): Promise<GeneralTradingAnalysis | null> {
		// Generate the prompt from the template
		const prompt = generalTradingAnalysisPromptTemplate(journalEntry);

		// Default message handler if none provided
		const messageHandler = onMessage || this.createDefaultMessageHandler();

		try {
			// Process the query with schema validation
			const result = await this.agent.processQueryWithSchema<GeneralTradingAnalysis>(
				prompt,
				generalTradingSchema,
				messageHandler,
			);

			return result;
		} catch (error) {
			console.error("Error analyzing trading sentiment:", error);
			return null;
		}
	}
}
