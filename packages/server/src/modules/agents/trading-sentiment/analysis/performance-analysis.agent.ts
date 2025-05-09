// performance-analysis-agent.ts
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { Injectable } from "@nestjs/common";
import { TradingPromptBuilderService } from "../services/prompt-builder.service";
import { BaseTradingSentimentAgent } from "../trading-sentimental-analysis.agent";
import { PerformanceAnalysisParams } from "./agent-params.types";
import { TradingSentimentPerformanceAnalysis } from "../types/trading-sentiment.types";
import { AgentName } from "../../agent.factory";
@Injectable()
export class TradingSentimentPerformanceAgent extends BaseTradingSentimentAgent<
	PerformanceAnalysisParams,
	TradingSentimentPerformanceAnalysis
> {
	constructor(openaiClient: OpenAIClientService, promptBuilder: TradingPromptBuilderService) {
		super(
			openaiClient,
			promptBuilder,
			AgentName.TRADING_SENTIMENT_PERFORMANCE,
			"trading_sentiment_performance",
			"You analyze trading journal entries in relation to actual performance to identify correlation between psychology and results.",
		);
	}

	buildPrompt(params: PerformanceAnalysisParams): string {
		return this.promptBuilder.buildResultsAnalysisPrompt(params.journalEntry, params.results);
	}
}
