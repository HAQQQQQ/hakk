// 2. ContextualSentimentAgent
import { Injectable } from "@nestjs/common";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { TradingSentimentBaseAgent } from "../trading-sentiment-base.agent";
import { ContextualSentimentPromptBuilder } from "./contextual-sentiment-prompt.builder";
import { ContextualAnalysisParams } from "../../types/agent-params.types";
import { CognitiveBiasAnalysis, cognitiveBiasSchema } from "./cognitive-bias.schema";
import { z, ZodTypeAny } from "zod";
import { AgentName } from "@/modules/agents/agent-name.enum";

@Injectable()
export class ContextualSentimentAgent extends TradingSentimentBaseAgent<
	ContextualAnalysisParams,
	CognitiveBiasAnalysis
> {
	constructor(
		openaiClient: OpenAIClientService,
		promptBuilder: ContextualSentimentPromptBuilder,
	) {
		super(
			openaiClient,
			promptBuilder,
			AgentName.CONTEXTUAL_SENTIMENT_ANALYSIS, // Updated
			"contextual_sentiment_tool", // Updated
			"You analyze day trading journal entries with additional context to extract detailed psychological insights.",
		);
	}

	getSchema(): z.ZodSchema<CognitiveBiasAnalysis> {
		return cognitiveBiasSchema;
	}
}
