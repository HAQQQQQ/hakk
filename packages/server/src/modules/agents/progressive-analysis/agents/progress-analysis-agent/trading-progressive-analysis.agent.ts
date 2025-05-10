import { Injectable } from "@nestjs/common";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { ProgressiveAnalysisAgent } from "./progressive-analysis.agent";
import { ProgressiveAnalysisPromptBuilder } from "./progressive-analysis-prompt.builder";
import { z } from "zod";
import {
	TradingProgressiveAnalysisResult,
	tradingProgressiveAnalysisSchema,
} from "./trade-analysis-progressive.schema";

/**
 * Specialized progressive analysis agent for trading analysis
 * This provides a concrete implementation for GeneralTradingAnalysis
 */
@Injectable()
export class TradingProgressiveAnalysisAgent extends ProgressiveAnalysisAgent {
	constructor(
		openaiClient: OpenAIClientService,
		promptBuilder: ProgressiveAnalysisPromptBuilder,
	) {
		super(openaiClient, promptBuilder);
	}

	/**
	 * Override getSchema to always use the specific trading analysis schema
	 */
	getSchema(): z.ZodSchema<TradingProgressiveAnalysisResult> {
		return tradingProgressiveAnalysisSchema;
	}
}
