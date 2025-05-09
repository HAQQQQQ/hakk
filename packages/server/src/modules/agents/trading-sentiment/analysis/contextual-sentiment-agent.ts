import { Injectable } from "@nestjs/common";
import { BaseTradingSentimentAgent } from "../trading-sentimental-analysis.agent";
import { ContextualAnalysisParams } from "./agent-params.types";
import { TradingSentimentAnalysis } from "../types/trading-sentiment.types";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { TradingPromptBuilderService } from "../services/prompt-builder.service";
import { AgentName } from "../../agent.factory";

@Injectable()
export class ContextualTradingSentimentAgent extends BaseTradingSentimentAgent<
	ContextualAnalysisParams,
	TradingSentimentAnalysis
> {
	constructor(openaiClient: OpenAIClientService, promptBuilder: TradingPromptBuilderService) {
		super(
			openaiClient,
			promptBuilder,
			AgentName.TRADING_SENTIMENT_CONTEXTUAL,
			"trading_sentiment_contextual",
			"You analyze day trading journal entries with additional context to extract detailed psychological insights.",
		);
	}

	buildPrompt(params: ContextualAnalysisParams): string {
		return this.promptBuilder.buildContextualPrompt(params.journalEntry, params.context);
	}
}
