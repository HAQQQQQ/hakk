// progressive-analysis/progressive-analysis.service.ts
import { Injectable } from "@nestjs/common";
import { AgentFactory } from "@/modules/agents/agent.factory";
import { AgentName } from "@/modules/agents/agent-name.enum";
import { IterativePromptParams } from "../types/agent-params.types";
import { IterativePromptResult } from "../agents/progress-analysis-agent/iterative-prompt.schema";
import { ProgressiveAnalysisAgent } from "../agents/progress-analysis-agent/iterative-prompt.agent";

@Injectable()
export class ProgressiveAnalysisService {
	constructor(private readonly agentFactory: AgentFactory) {}

	/**
	 * Run a single iteration of progressive analysis
	 */
	// async analyzeIteration(params: IterativePromptParams): Promise<IterativePromptResult> {
	//     const agent: ProgressiveAnalysisAgent = this.agentFactory.getAgent(
	//         AgentName.PROGRESSIVE_ANALYSIS
	//     );
	//     return agent.execute(params);
	// }

	/**
	 * Run a complete progressive analysis through multiple iterations
	 * @param journalEntry The trading journal entry to analyze
	 * @param iterations Number of iterations to perform (default: 3)
	 */
	async runProgressiveAnalysis(
		journalEntry: string,
		iterations: number = 3,
		analysisGoal: string = "trading psychology analysis",
	): Promise<IterativePromptResult[]> {
		const agent: ProgressiveAnalysisAgent = this.agentFactory.getAgent(
			AgentName.PROGRESSIVE_ANALYSIS,
		);

		return agent.runProgressiveAnalysis(journalEntry, iterations, analysisGoal);
	}

	/**
	 * Get only the final, most refined analysis
	 */
	async getFinalAnalysis(
		journalEntry: string,
		iterations: number = 3,
		analysisGoal: string = "trading psychology analysis",
	): Promise<IterativePromptResult> {
		const agent: ProgressiveAnalysisAgent = this.agentFactory.getAgent(
			AgentName.PROGRESSIVE_ANALYSIS,
		);

		return agent.getFinalAnalysis(journalEntry, iterations, analysisGoal);
	}

	// /**
	//  * Get deepest possible analysis in a single call
	//  * This is a convenience method that runs a single iteration with instructions
	//  * that request the highest level of detail
	//  */
	// async getDeepAnalysis(
	//     journalEntry: string,
	//     analysisGoal: string = "trading psychology analysis"
	// ): Promise<IterativePromptResult> {
	//     // Use parameters that simulate a 4th iteration even though it's our first call
	//     const params: IterativePromptParams = {
	//         basePrompt: journalEntry,
	//         previousResponses: [],
	//         iterationNumber: 4,  // Pretend we're on the 4th iteration
	//         analysisGoal
	//     };

	//     const agent: ProgressiveAnalysisAgent = this.agentFactory.getAgent(
	//         AgentName.PROGRESSIVE_ANALYSIS
	//     );

	//     return agent.execute(params);
	// }
}
