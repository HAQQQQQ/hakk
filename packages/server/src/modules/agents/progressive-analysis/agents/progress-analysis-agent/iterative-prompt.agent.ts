// progressive-analysis/progressive-analysis.agent.ts
import { Injectable } from "@nestjs/common";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { BaseAgent } from "@/modules/agents/base.agent";
import { AgentName } from "@/modules/agents/agent-name.enum";
import { ZodTypeAny } from "zod";
import { IterativePromptBuilder } from "./iterative-prompt.builder";
import {
	IterativePromptParams,
	IterativePromptResult,
	iterativePromptResultSchema,
} from "./iterative-prompt.schema";

const SYSTEM_MESSAGE = `You are an expert trading psychology analyst specializing in progressive insight development. 
      Your role is to analyze trading journals with increasing depth and detail across multiple iterations.
      Each iteration should build upon previous insights while adding new depth, examples, and specificity.
      Always focus on providing actionable insights that help traders improve their performance and psychology.`;

@Injectable()
export class ProgressiveAnalysisAgent extends BaseAgent<
	IterativePromptParams,
	IterativePromptResult
> {
	constructor(openaiClient: OpenAIClientService, promptBuilder: IterativePromptBuilder) {
		super(
			openaiClient,
			promptBuilder,
			AgentName.PROGRESSIVE_ANALYSIS,
			SYSTEM_MESSAGE,
			// Schema name (keep under 64 chars)
			"progressive_trading_analysis",
			// Tool description
			"Analyzes trading journals with increasing depth across multiple iterations",
		);
	}

	getSchema(): ZodTypeAny {
		return iterativePromptResultSchema;
	}

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
		const results: IterativePromptResult[] = [];
		const textResponses: string[] = [];

		for (let i = 1; i <= iterations; i++) {
			// Prepare params for this iteration
			const params: IterativePromptParams = {
				basePrompt: journalEntry,
				previousResponses: textResponses,
				iterationNumber: i,
				analysisGoal,
			};

			// Execute the analysis for this iteration
			const result = await this.execute(params);
			results.push(result);

			// Store the text response for use in next iteration
			textResponses.push(result.analysis);

			// Add a small delay between iterations to avoid rate limits
			if (i < iterations) {
				await new Promise((resolve) => setTimeout(resolve, 500));
			}
		}

		return results;
	}

	/**
	 * Get only the final, most refined analysis
	 */
	async getFinalAnalysis(
		journalEntry: string,
		iterations: number = 3,
		analysisGoal: string = "trading psychology analysis",
	): Promise<IterativePromptResult> {
		const results = await this.runProgressiveAnalysis(journalEntry, iterations, analysisGoal);
		return results[results.length - 1];
	}
}
