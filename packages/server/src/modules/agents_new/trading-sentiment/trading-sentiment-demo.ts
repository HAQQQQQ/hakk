/**
 * Example usage of the Trading Journal Sentiment Analysis Agent
 */

import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import {
	executeTraderJournalWorkflow,
	TradingSentimentAnalyzer,
} from "./trading-sentiment-analyzer";

/**
 * Initialize the OpenAI client
 */
async function initOpenAIClient(): Promise<OpenAIClientService> {
	// This would be your actual implementation for creating the OpenAI client
	// const openaiClient = new OpenAIClientService({
	//     apiKey: process.env.OPENAI_API_KEY,
	//     model: 'gpt-4-turbo',
	//     organization: process.env.OPENAI_ORG_ID
	// });

	// return openaiClient;
	return {} as OpenAIClientService;
}

/**
 * Main function to demonstrate the trading journal analysis
 */
async function main() {
	try {
		// Initialize the OpenAI client
		const openaiClient = await initOpenAIClient();

		// Example journal entry
		const journalEntry = `
    Market was volatile today after the Fed announcement. I had planned to stay on the sidelines,
    but when I saw NVDA jumping 3% in the first hour, I couldn't resist and jumped in with a large position.
    Initially it worked out as it climbed another 2%, but then it started reversing. I kept telling myself
    it would bounce back, but it kept dropping. I froze and couldn't decide whether to cut losses or hold.
    Ended up holding until end of day and took a 4% loss on a position that was too large to begin with.
    I know I broke my own rules about position sizing and FOMO, but it's hard to stay disciplined when you
    see opportunities slipping away. Feel pretty disappointed in myself right now.
    `;

		console.log("===== Simple Agent Analysis =====");

		// Create the analyzer
		const analyzer = new TradingSentimentAnalyzer(openaiClient);

		// Analyze the sentiment
		console.log("Analyzing trading journal...");
		const result = await analyzer.analyzeSentiment(journalEntry);

		if (result) {
			console.log("\nAnalysis Results:");
			console.log("----------------");
			console.log(`Overall Sentiment: ${result.overallSentiment}`);
			console.log(`Sentiment Score: ${result.sentimentScore.toFixed(2)}`);

			console.log("\nTrading Emotions:");
			result.tradingEmotions.forEach((emotion) => {
				console.log(`- ${emotion.emotion} (Intensity: ${emotion.intensity.toFixed(2)})`);
				console.log(`  Impact: ${emotion.tradingImpact}`);
				console.log(`  Evidence: "${emotion.evidence}"`);
			});

			console.log("\nMental State:");
			console.log(`- Focus: ${result.mentalState.focus.toFixed(2)}`);
			console.log(`- Stress: ${result.mentalState.stress.toFixed(2)}`);
			console.log(`- Fatigue: ${result.mentalState.fatigue.toFixed(2)}`);
			console.log(`- Overconfidence: ${result.mentalState.overconfidence.toFixed(2)}`);
			console.log(`- Impact: ${result.mentalState.mentalStateImpact}`);
		} else {
			console.log("Failed to analyze sentiment");
		}

		console.log("\n\n===== Multi-Agent Workflow Analysis =====");

		// Run the multi-agent workflow
		console.log("Executing multi-agent analysis workflow...");
		const workflowResults = await executeTraderJournalWorkflow(openaiClient, journalEntry);

		console.log("\nWorkflow Results:");
		console.log("----------------");

		// Display sentiment analysis summary
		const sentimentAnalysis = workflowResults.sentimentAnalysis;
		console.log(
			`\nSentiment Analysis: ${sentimentAnalysis.overallSentiment} (${sentimentAnalysis.sentimentScore.toFixed(2)})`,
		);
		console.log(
			`Primary Emotions: ${sentimentAnalysis.tradingEmotions.map((e) => e.emotion).join(", ")}`,
		);

		// Display strategy recommendations
		console.log("\nStrategy Recommendations:");
		console.log(
			workflowResults.strategyRecommendations.message ||
				workflowResults.strategyRecommendations,
		);

		// Display training plan
		console.log("\nTraining Plan:");
		console.log(workflowResults.trainingPlan.message || workflowResults.trainingPlan);
	} catch (error) {
		console.error("Error in trading journal analysis:", error);
	}
}

// Execute the main function
main().catch(console.error);
