// trading-sentiment-analysis-agent.ts
import { Injectable } from "@nestjs/common";
import { TradingSentimentAnalysis } from "../types/trading-sentiment.types";
import { JournalEntryParams } from "./agent-params.types";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { TradingPromptBuilderService } from "../services/prompt-builder.service";
import { BaseTradingSentimentAgent } from "../trading-sentimental-analysis.agent";
import { AgentName } from "../../agent.factory";

@Injectable()
export class TradingSentimentAnalysisAgent extends BaseTradingSentimentAgent<
	JournalEntryParams,
	TradingSentimentAnalysis
> {
	constructor(openaiClient: OpenAIClientService, promptBuilder: TradingPromptBuilderService) {
		super(openaiClient, promptBuilder, AgentName.TRADING_SENTIMENT_ANALYSIS);
	}

	buildPrompt(params: JournalEntryParams): string {
		return this.promptBuilder.buildBasePrompt(params.journalEntry);
	}
}
