import { Injectable } from "@nestjs/common";
import { TradingProgressiveAnalysisAgent } from "./trading-progressive-analysis.agent";
import { AgentResponse } from "@/modules/agents/base.agent";
import { TradingProgressiveAnalysisResult } from "./trade-analysis-progressive.schema";
import { JournalEntryParams } from "@/modules/agents/trading-sentiment/types/agent-params.types";
import { GeneralTradingAnalysis } from "@/modules/agents/trading-sentiment/agents/general-analysis-agent/general-analysis.schema";

/**
 * Adapter for progressive analysis of trading journal entries
 * Makes it easy to use the ProgressiveAnalysisAgent with specific agent types
 */
@Injectable()
export class ProgressiveJournalAnalysisAdapter {
	constructor(
		private readonly tradingProgressiveAnalysisAgent: TradingProgressiveAnalysisAgent,
	) {}

	/**
	 * Progressively analyze a trading journal entry
	 *
	 * @param journalEntry - The trading journal entry to analyze
	 * @param targetAgent - The agent to use for analysis (e.g., GeneralAnalysisAgent)
	 * @param iterations - Number of iterations to perform (default: 3)
	 * @returns Enhanced analysis result
	 */
	async analyzeJournalEntry(
		journalEntry: string,
		targetAgent: any,
		iterations: number = 3,
	): Promise<AgentResponse<TradingProgressiveAnalysisResult>> {
		// Create parameters for the journal entry
		const params: JournalEntryParams = {
			journalEntry,
		};

		// Execute progressive analysis with the trading-specific agent
		return this.tradingProgressiveAnalysisAgent.execute({
			targetAgent,
			targetAgentParams: params,
			iterations,
		}) as Promise<AgentResponse<TradingProgressiveAnalysisResult>>;
	}

	/**
	 * Get a simplified best result from progressive analysis
	 * This extracts just the best result without the iteration history
	 *
	 * @param journalEntry - The trading journal entry to analyze
	 * @param targetAgent - The agent to use for analysis
	 * @param iterations - Number of iterations to perform
	 * @returns Only the best result from the progressive analysis
	 */
	async getBestAnalysis(
		journalEntry: string,
		targetAgent: any,
		iterations: number = 3,
	): Promise<GeneralTradingAnalysis> {
		const result = await this.analyzeJournalEntry(journalEntry, targetAgent, iterations);
		return result.response.bestResult as GeneralTradingAnalysis;
	}
}
