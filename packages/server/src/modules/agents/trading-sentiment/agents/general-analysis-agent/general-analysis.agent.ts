// 1. SentimentAnalysisAgent
import { Injectable } from "@nestjs/common";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { TradingSentimentBaseAgent } from "../trading-sentiment-base.agent";
import { JournalEntryParams } from "../../types/agent-params.types";
import { ZodTypeAny } from "zod";
import { AgentName } from "@/modules/agents/agent-name.enum";
import { GeneralTradingAnalysis, generalTradingSchema } from "./general-analysis.schema";
import { GeneralTradingAnalysisPromptBuilder } from "./general-analysis-prompt.builder";

@Injectable()
export class GeneralAnalysisAgent extends TradingSentimentBaseAgent<
	JournalEntryParams,
	GeneralTradingAnalysis
> {
	constructor(
		openaiClient: OpenAIClientService,
		promptBuilder: GeneralTradingAnalysisPromptBuilder,
	) {
		super(
			openaiClient,
			promptBuilder,
			AgentName.GENERAL_TRADING_ANALYSIS_AGENT, // Updated
			"sentiment_analysis_tool", // Updated
			"You analyze trading journal entries to extract detailed psychological insights, emotions, cognitive biases, and actionable recommendations to improve trading performance.",
		);
	}

	getSchema(): ZodTypeAny {
		return generalTradingSchema;
	}
}
