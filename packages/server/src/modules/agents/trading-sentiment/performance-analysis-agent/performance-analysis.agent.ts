// 4. PerformanceAnalysisAgent
import { Injectable } from "@nestjs/common";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { AgentName } from "../../agent.factory";
import { BaseTradingSentimentAgent } from "../../__trading-sentiment/trading-sentimental-analysis.agent";
import { PerformanceAnalysisParams } from "../../__trading-sentiment/analysis/agent-params.types";
import { TradingSentimentPerformanceAnalysis } from "../../__trading-sentiment/types/trading-sentiment.types";
import { PerformanceAnalysisPromptBuilder } from "./performance-analysis-prompt.builder";

@Injectable()
export class PerformanceAnalysisAgent extends BaseTradingSentimentAgent<
	PerformanceAnalysisParams,
	TradingSentimentPerformanceAnalysis
> {
	constructor(
		openaiClient: OpenAIClientService,
		promptBuilder: PerformanceAnalysisPromptBuilder,
	) {
		super(
			openaiClient,
			promptBuilder,
			AgentName.PERFORMANCE_ANALYSIS, // Updated
			"performance_analysis_tool", // Updated
			"You analyze trading journal entries in relation to actual performance to identify correlation between psychology and results.",
		);
	}
}
