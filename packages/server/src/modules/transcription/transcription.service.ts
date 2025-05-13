import { Injectable } from "@nestjs/common";
import { TradingSentimentService } from "../agents/trading-sentiment/services/trading-sentiment.service";
// import { GeneralTradingAnalysis } from "../agents/trading-sentiment/agents/general-analysis-agent/general-analysis.schema";
import { AgentResponse } from "../agents/base.agent";
import { OpenAIClientService } from "../openai/openai-client.service";
import {
	GeneralAnalysisAgent,
	GeneralTradingAnalysis,
} from "../agents_new/trading-sentiment/general-analysis.agent";

@Injectable()
export class TranscriptionService {
	constructor(
		private readonly tradingSentimentService: TradingSentimentService,
		private readonly openaiClient: OpenAIClientService,
	) {}

	/**
	 * Analyze a trading journal entry for sentiment and psychological patterns
	 */
	async generalAnalysisOld(journalEntry: string): Promise<AgentResponse<GeneralTradingAnalysis>> {
		// Get the trading sentiment agent from the factory
		return this.tradingSentimentService.generalAnalysis({ journalEntry });
	}

	async generalAnalysis(journalEntry: string): Promise<GeneralTradingAnalysis | null> {
		const newAgent = new GeneralAnalysisAgent(this.openaiClient);
		return newAgent.analyzeSentiment(journalEntry);
	}
}
