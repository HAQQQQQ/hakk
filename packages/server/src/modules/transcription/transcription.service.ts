import { Injectable } from "@nestjs/common";
// import { GeneralTradingAnalysis } from "../agents/trading-sentiment/agents/general-analysis-agent/general-analysis.schema";
import { OpenAIClientService } from "../openai/openai-client.service";
import {
	GeneralAnalysisAgent,
	GeneralTradingAnalysis,
} from "../agents_new/trading-sentiment/general-analysis.agent";
import { AgentResponse } from "../agents_new";

@Injectable()
export class TranscriptionService {
	constructor(
		// private readonly tradingSentimentService: TradingSentimentService,
		private readonly openaiClient: OpenAIClientService,
	) {}

	/**
	 * Analyze a trading journal entry for sentiment and psychological patterns
	 */
	// async generalAnalysisOld(journalEntry: string): Promise<AgentResponseOld<GeneralTradingAnalysis>> {
	//     // Get the trading sentiment agent from the factory
	//     return this.tradingSentimentService.generalAnalysis({ journalEntry });
	// }

	async generalAnalysis(
		journalEntry: string,
	): Promise<AgentResponse<GeneralTradingAnalysis> | null> {
		const newAgent = new GeneralAnalysisAgent(this.openaiClient);
		return newAgent.analyzeSentiment(journalEntry);
	}
}
