// 2. ContextualSentimentAgent
import { Injectable } from "@nestjs/common";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { AgentName } from "../../agent.factory";
import { TradingSentimentBaseAgent } from "../trading-sentiment-base.agent";
import { ContextualAnalysisParams } from "../../__trading-sentiment/analysis/agent-params.types";
import { TradingSentimentAnalysis } from "../../__trading-sentiment/types/trading-sentiment.types";
import { ContextualSentimentPromptBuilder } from "./contextual-sentiment-prompt.builder";

@Injectable()
export class ContextualSentimentAgent extends TradingSentimentBaseAgent<
	ContextualAnalysisParams,
	TradingSentimentAnalysis
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
}
