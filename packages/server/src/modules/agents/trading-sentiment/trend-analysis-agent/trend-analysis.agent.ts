// 3. TrendAnalysisAgent
import { Injectable } from "@nestjs/common";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { AgentName } from "../../agent.factory";
import { BaseTradingSentimentAgent } from "../../__trading-sentiment/trading-sentimental-analysis.agent";
import { TrendAnalysisParams } from "../../__trading-sentiment/analysis/agent-params.types";
import { TradingSentimentTrendAnalysis } from "../../__trading-sentiment/types/trading-sentiment.types";
import { TrendAnalysisPromptBuilder } from "./trend-analysis-prompt.builder";

@Injectable()
export class TrendAnalysisAgent extends BaseTradingSentimentAgent<
	TrendAnalysisParams,
	TradingSentimentTrendAnalysis
> {
	constructor(openaiClient: OpenAIClientService, promptBuilder: TrendAnalysisPromptBuilder) {
		super(
			openaiClient,
			promptBuilder,
			AgentName.TREND_ANALYSIS, // Updated
			"trend_analysis_tool", // Updated
			"You analyze trends across multiple trading journal entries to identify psychological patterns over time.",
		);
	}
}
