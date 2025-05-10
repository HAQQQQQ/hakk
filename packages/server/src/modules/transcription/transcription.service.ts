import { Injectable } from "@nestjs/common";
import { TradingSentimentService } from "../agents/trading-sentiment/services/trading-sentiment.service";
import { GeneralTradingAnalysis } from "../agents/trading-sentiment/agents/general-analysis-agent/general-analysis.schema";

@Injectable()
export class TranscriptionService {
	constructor(private readonly tradingSentimentService: TradingSentimentService) {}

	/**
	 * Analyze a trading journal entry for sentiment and psychological patterns
	 */
	async generalAnalysis(journalEntry: string): Promise<GeneralTradingAnalysis> {
		// Get the trading sentiment agent from the factory
		return this.tradingSentimentService.generalAnalysis({ journalEntry });
	}
}
