import { Injectable } from "@nestjs/common";
import { TranscriptionRepository } from "./transcription.repository";
import { AgentFactory, AgentName } from "../agents/agent.factory";
import {
	TradingContext,
	TradingSentimentAnalysis,
} from "../agents/trading-sentiment/types/trading-sentiment.types";

@Injectable()
export class TranscriptionService {
	constructor(
		private readonly transcriptionRepository: TranscriptionRepository,
		private readonly agentFactory: AgentFactory,
	) {}

	/**
	 * Analyze a trading journal entry for sentiment and psychological patterns
	 */
	async analyzeTradingJournal(journalEntry: string): Promise<TradingSentimentAnalysis> {
		// Get the trading sentiment agent from the factory
		const tradingSentimentAgent = this.agentFactory.get(AgentName.TRADING_SENTIMENT_ANALYSIS);

		// Execute the analysis
		return tradingSentimentAgent.execute(journalEntry);
	}

	/**
	 * Analyze with trading context
	 */
	async analyzeWithContext(
		journalEntry: string,
		context: TradingContext,
	): Promise<TradingSentimentAnalysis> {
		const tradingSentimentAgent = this.agentFactory.get(AgentName.TRADING_SENTIMENT_ANALYSIS);
		return tradingSentimentAgent.executeWithContext(journalEntry, context);
	}

	/**
	 * Analyze trading results correlation with psychology
	 */
	async analyzeTradeResults(
		journalEntry: string,
		profitLoss: number,
		trades: Array<{
			ticker: string;
			direction: "long" | "short";
			result: "win" | "loss" | "breakeven";
			profitLoss: number;
			notes?: string;
		}>,
	) {
		const tradingSentimentAgent = this.agentFactory.get(AgentName.TRADING_SENTIMENT_ANALYSIS);

		return tradingSentimentAgent.analyzeWithResults(journalEntry, {
			profitLoss,
			trades,
			sessionNotes: "Analysis requested through TradingJournalService",
		});
	}

	/**
	 * Create a trading psychology improvement plan
	 */
	async createPsychologyPlan(journalEntries: string[]) {
		const tradingSentimentAgent = this.agentFactory.get(AgentName.TRADING_SENTIMENT_ANALYSIS);
		return tradingSentimentAgent.createTradingPsychologyPlan(journalEntries);
	}
}
