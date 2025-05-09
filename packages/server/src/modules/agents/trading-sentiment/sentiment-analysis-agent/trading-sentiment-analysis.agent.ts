// 1. SentimentAnalysisAgent
import { Injectable } from "@nestjs/common";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { AgentName } from "../../agent.factory";
import { BaseTradingSentimentAgent } from "../../__trading-sentiment/trading-sentimental-analysis.agent";
import { JournalEntryParams } from "../../__trading-sentiment/analysis/agent-params.types";
import { TradingSentimentAnalysis } from "../../__trading-sentiment/types/trading-sentiment.types";
import { SentimentAnalysisPromptBuilder } from "./sentiment-analysis-prompt.builder";

@Injectable()
export class SentimentAnalysisAgent extends BaseTradingSentimentAgent<
	JournalEntryParams,
	TradingSentimentAnalysis
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
}
