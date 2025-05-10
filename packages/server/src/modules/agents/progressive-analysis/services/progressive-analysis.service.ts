import { Injectable } from "@nestjs/common";
import { AgentFactory } from "../../agent.factory";
import { AgentName } from "../../agent-name.enum";
import { ProgressiveJournalAnalysisAdapter } from "../agents/progress-analysis-agent/progressive-analysis-adapter";

@Injectable()
export class ProgressiveAnalysisService {
	constructor(
		private readonly agentFactory: AgentFactory,
		private readonly progressiveAnalysisAdapter: ProgressiveJournalAnalysisAdapter,
	) {}

	/**
	 * Analyze a trading journal entry with progressive improvement
	 *
	 * @param journalEntry - The trading journal entry to analyze
	 * @param iterations - Number of iterations to perform (default: 3)
	 * @returns The progressively improved analysis
	 */
	async analyzeJournalEntry(journalEntry: string, iterations: number = 3) {
		// Get the general analysis agent
		const generalAnalysisAgent = this.agentFactory.getAgent(
			AgentName.GENERAL_TRADING_ANALYSIS_AGENT,
		);

		// Run progressive analysis
		const result = await this.progressiveAnalysisAdapter.analyzeJournalEntry(
			journalEntry,
			generalAnalysisAgent,
			iterations,
		);

		return result;
	}

	/**
	 * Get just the best analysis result for a journal entry
	 *
	 * @param journalEntry - The trading journal entry to analyze
	 * @param iterations - Number of iterations to perform (default: 3)
	 * @returns Only the best result from the progressive analysis
	 */
	async getBestAnalysis(journalEntry: string, iterations: number = 3) {
		// Get the general analysis agent
		const generalAnalysisAgent = this.agentFactory.getAgent(
			AgentName.GENERAL_TRADING_ANALYSIS_AGENT,
		);

		// Get the best analysis from the progressive analyzer
		const bestResult = await this.progressiveAnalysisAdapter.getBestAnalysis(
			journalEntry,
			generalAnalysisAgent,
			iterations,
		);

		return bestResult;
	}

	/**
	 * Progressively improve any agent's analysis
	 *
	 * @param agentName - The name of the agent to use
	 * @param params - Parameters to pass to the agent
	 * @param iterations - Number of iterations to perform
	 * @returns The progressively improved analysis
	 */
	async progressivelyImprove(agentName: AgentName, params: any, iterations: number = 3) {
		// Get the target agent
		const targetAgent = this.agentFactory.getAgent(agentName);

		// Get the progressive analysis agent
		const progressiveAnalysisAgent = this.agentFactory.getAgent(AgentName.PROGRESSIVE_ANALYSIS);

		// Run progressive analysis
		const result = await progressiveAnalysisAgent.execute({
			targetAgent,
			targetAgentParams: params,
			iterations,
		});

		return result;
	}
}
