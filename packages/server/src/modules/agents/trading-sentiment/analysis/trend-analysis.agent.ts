// trend-analysis-agent.ts
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { Injectable } from "@nestjs/common";
import { TradingPromptBuilderService } from "../services/prompt-builder.service";
import { BaseTradingSentimentAgent } from "../trading-sentimental-analysis.agent";
import { TrendAnalysisParams } from "./agent-params.types";
import { TradingSentimentTrendAnalysis } from "../types/trading-sentiment.types";
import { AgentName } from "../../agent.factory";

@Injectable()
export class TradingSentimentTrendAgent extends BaseTradingSentimentAgent<
	TrendAnalysisParams,
	TradingSentimentTrendAnalysis
> {
	constructor(openaiClient: OpenAIClientService, promptBuilder: TradingPromptBuilderService) {
		super(
			openaiClient,
			promptBuilder,
			AgentName.TRADING_SENTIMENT_TREND,
			"trading_sentiment_trend",
			"You analyze trends across multiple trading journal entries to identify psychological patterns over time.",
		);
	}

	buildPrompt(params: TrendAnalysisParams): string {
		return this.promptBuilder.buildTrendAnalysisPrompt(params.journalEntries);
	}
}
