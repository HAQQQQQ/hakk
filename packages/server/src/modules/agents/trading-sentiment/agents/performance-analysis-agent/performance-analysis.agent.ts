// 4. PerformanceAnalysisAgent
import { Injectable } from "@nestjs/common";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { TradingSentimentBaseAgent } from "../trading-sentiment-base.agent";
import { PerformanceAnalysisPromptBuilder } from "./performance-analysis-prompt.builder";
import {
	PerformanceAnalysisResponse,
	performanceAnalysisResponseSchema,
} from "./performance-analysis.schema";
import { PerformanceAnalysisParams } from "../../types/agent-params.types";
import { z, ZodTypeAny } from "zod";
import { AgentName } from "@/modules/agents/agent-name.enum";

@Injectable()
export class PerformanceAnalysisAgent extends TradingSentimentBaseAgent<
	PerformanceAnalysisParams,
	PerformanceAnalysisResponse
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

	getSchema(): z.ZodSchema<PerformanceAnalysisResponse> {
		return performanceAnalysisResponseSchema;
	}
}
