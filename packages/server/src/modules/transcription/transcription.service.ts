import { Injectable } from "@nestjs/common";
import { TradingSentimentService } from "../agents/trading-sentiment/services/trading-sentiment.service";
import { CoreSentimentAnalysis } from "../agents/trading-sentiment/agents/sentiment-analysis-agent/core-sentiment.schema";

@Injectable()
export class TranscriptionService {
	constructor(private readonly tradingSentimentService: TradingSentimentService) {}

	/**
	 * Analyze a trading journal entry for sentiment and psychological patterns
	 */
	async analyzeSentiment(journalEntry: string): Promise<CoreSentimentAnalysis> {
		// Get the trading sentiment agent from the factory
		return this.tradingSentimentService.analyzeSentiment({ journalEntry });
	}
}
