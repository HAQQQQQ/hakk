// 1. SentimentAnalysisAgent
import { Injectable } from "@nestjs/common";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { TradingSentimentBaseAgent } from "../../trading-sentiment-base.agent";
import { JournalEntryParams } from "../../types/agent-params.types";
import { SentimentAnalysisPromptBuilder } from "./sentiment-analysis-prompt.builder";
import { CoreSentimentAnalysis, coreSentimentSchema } from "./core-sentiment.schema";
import { ZodTypeAny } from "zod";
import { AgentName } from "@/modules/agents/agent-name.enum";

@Injectable()
export class SentimentAnalysisAgent extends TradingSentimentBaseAgent<
	JournalEntryParams,
	CoreSentimentAnalysis
> {
	constructor(openaiClient: OpenAIClientService, promptBuilder: SentimentAnalysisPromptBuilder) {
		super(
			openaiClient,
			promptBuilder,
			AgentName.SENTIMENT_ANALYSIS, // Updated
			"sentiment_analysis_tool", // Updated
			"You analyze trading journal entries to extract detailed psychological insights, emotions, cognitive biases, and actionable recommendations to improve trading performance.",
		);
	}

	getSchema(): ZodTypeAny {
		return coreSentimentSchema;
	}
}
