// 3. TrendAnalysisAgent
import { Injectable } from "@nestjs/common";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { AgentName } from "../../../agent.factory";
import { TradingSentimentBaseAgent } from "../../trading-sentiment-base.agent";
import { TrendAnalysisParams } from "../../types/agent-params.types";
import { TrendAnalysisPromptBuilder } from "./trend-analysis-prompt.builder";
import {
	TrendAnalysisResponse,
	trendAnalysisResponseSchema,
} from "./trend-analysis-response.schema";
import { ZodTypeAny } from "zod";

@Injectable()
export class TrendAnalysisAgent extends TradingSentimentBaseAgent<
	TrendAnalysisParams,
	TrendAnalysisResponse
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

	getSchema(): ZodTypeAny {
		return trendAnalysisResponseSchema;
	}
}
