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
 * Type for sentiment analysis result
 */
// export type CoreSentimentAnalysis = z.infer<typeof coreSentimentSchema>;

/**
 * Generate the prompt for sentiment analysis
 */
export const generalTradingAnalysisPromptTemplate = (journalEntry: string): string => {
	return `Trading Journal Entry: "${journalEntry}"
      
    Please analyze this trading journal entry for psychological patterns, emotions, 
    cognitive biases, and provide actionable recommendations.`;
};

/**
 * Class for the Trading Journal Sentiment Analyzer
 */
export class TradingSentimentAnalyzer {
	private agent: Agent;

	/**
	 * Create a new trading sentiment analyzer
	 *
	 * @param openaiClient - OpenAI client service
	 */
	constructor(openaiClient: OpenAIClientService) {
		// Create the agent using the builder pattern
		this.agent = new AgentBuilder("TradingSentimentAnalyzer")
			.withDescription(
				"Analyzes trading journal entries to extract psychological insights, emotions, cognitive biases, and provide actionable trading performance recommendations",
			)
			.withSystemPrompt(
				"You analyze trading journal entries to extract detailed psychological insights, emotions, cognitive biases, and actionable recommendations to improve trading performance.",
			)
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
		const messageHandler =
			onMessage ||
			(async (message: Message) => {
				console.log(`[${message.role}]: ${message.content.substring(0, 50)}...`);
			});

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

	/**
	 * Subscribe to events from the agent
	 *
	 * @param eventType - Event type to subscribe to
	 * @param handler - Handler function
	 * @returns Subscription with unsubscribe method
	 */
	onEvent(eventType: any, handler: (event: { payload: any }) => void) {
		return this.agent.on(eventType, handler);
	}

	/**
	 * Clear the agent's memory
	 */
	clearMemory(): void {
		this.agent.clearMemory();
	}
}

/**
 * Example usage of the TradingSentimentAnalyzer
 */
export async function analyzeTraderJournal(openaiClient: OpenAIClientService) {
	// Create the analyzer
	const analyzer = new TradingSentimentAnalyzer(openaiClient);

	// Example journal entry
	const journalEntry = `Today was a rollercoaster. Started with a big win on my AAPL position (+5%), 
  but then I got greedy and doubled down on TSLA without doing proper research. 
  It tanked almost immediately, and I panicked and sold at the bottom.
  I feel like I'm never going to learn this lesson about FOMO. Too tired to think straight now.`;

	// Analyze the sentiment
	const result = await analyzer.analyzeSentiment(journalEntry, async (message) => {
		console.log(`[${message.role}]: ${message.content.substring(0, 100)}...`);
	});

	if (result) {
		console.log("Overall sentiment:", result.overallSentiment);
		console.log("Sentiment score:", result.sentimentScore);
		console.log("Detected emotions:", result.tradingEmotions.map((e) => e.emotion).join(", "));
		console.log("Mental state impact:", result.mentalState.mentalStateImpact);
	} else {
		console.log("Failed to analyze sentiment");
	}

	return result;
}

/**
 * Example using the AgentOrchestrator for a multi-agent trading analysis workflow
 */
export function createTradingAnalysisWorkflow(openaiClient: OpenAIClientService) {
	// Import the necessary classes
	const { AgentOrchestrator, AgentBuilder } = require("./index");

	// Create an orchestrator
	const orchestrator = new AgentOrchestrator();

	// Create the sentiment analyzer agent
	const sentimentAgent = new AgentBuilder("SentimentAnalyzer")
		.withDescription("Analyzes trading journal entries for psychological patterns")
		.withSystemPrompt(
			"You analyze trading journal entries to extract detailed psychological insights, emotions, cognitive biases, and actionable recommendations to improve trading performance.",
		)
		.withOpenAIClient(openaiClient)
		.build();

	// Create a strategy recommendation agent
	const strategyAgent = new AgentBuilder("StrategyRecommender")
		.withDescription("Recommends trading strategies based on psychological analysis")
		.withSystemPrompt(
			"You recommend specific trading strategies and improvements based on psychological analysis of trading patterns.",
		)
		.withOpenAIClient(openaiClient)
		.build();

	// Create a training plan agent
	const trainingAgent = new AgentBuilder("TrainingPlanner")
		.withDescription("Creates personalized training plans for traders")
		.withSystemPrompt(
			"You create personalized trading psychology training plans to help traders overcome their specific emotional challenges.",
		)
		.withOpenAIClient(openaiClient)
		.build();

	// Register all agents with the orchestrator
	orchestrator.registerAgent("sentiment", sentimentAgent);
	orchestrator.registerAgent("strategy", strategyAgent);
	orchestrator.registerAgent("training", trainingAgent);

	// Return the configured orchestrator
	return orchestrator;
}

/**
 * Execute a multi-agent trading journal analysis workflow
 */
export async function executeTraderJournalWorkflow(
	openaiClient: OpenAIClientService,
	journalEntry: string,
) {
	// Create the workflow orchestrator
	const orchestrator = createTradingAnalysisWorkflow(openaiClient);

	// Define the workflow steps
	const workflowSteps = [
		{
			agentId: "sentiment",
			query: generalTradingAnalysisPromptTemplate(journalEntry),
			schema: coreSentimentSchema,
		},
		{
			agentId: "strategy",
			query: "Based on the psychological analysis: ${previousResult}, what specific trading strategies would you recommend to improve performance?",
			dependsOn: "sentiment",
		},
		{
			agentId: "training",
			query: "Create a 1-week training plan to address the psychological challenges identified in: ${previousResult}",
			dependsOn: "strategy",
		},
	];

	// Execute the workflow
	const results = await orchestrator.executeWorkflow(workflowSteps);

	// Process and return the results
	return {
		sentimentAnalysis: results.get("sentiment")?.result,
		strategyRecommendations: results.get("strategy")?.result,
		trainingPlan: results.get("training")?.result,
	};
}
