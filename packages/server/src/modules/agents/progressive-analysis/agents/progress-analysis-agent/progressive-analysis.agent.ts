import { Injectable } from "@nestjs/common";
import { z } from "zod";
import { ProgressiveAnalysisPromptBuilder } from "./progressive-analysis-prompt.builder";
import {
	baseProgressiveAnalysisSchema,
	createProgressiveAnalysisSchema,
	ProgressiveAnalysisResult,
} from "./progressive-analysis.schema";
import { MetaAnalysis, metaAnalysisSchema } from "./meta-analysis.schema";
import { AgentResponse, BaseAgent, RetryOptions } from "@/modules/agents/base.agent";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { AgentName } from "@/modules/agents/agent-name.enum";
import { tradingProgressiveAnalysisSchema } from "./trade-analysis-progressive.schema";
import { OpenAIResponse, OpenAIResponseStatus } from "@/modules/openai/openai.types";

/**
 * Parameters required for progressive analysis
 */
export interface ProgressiveAnalysisParams {
	// The agent to iteratively improve
	targetAgent: BaseAgent<any, any>;
	// The parameters to pass to the target agent
	targetAgentParams: any;
	// Number of iterations to perform (default: 3)
	iterations?: number;
	// Previous results to build upon (optional)
	previousResults?: any[];
}

const PROGRESSIVE_SYSTEM_MESSAGE = `You are an expert meta-analysis system that iteratively improves the outputs of other AI agents.
Your goal is to analyze the results from previous iterations and provide guidance on how to enhance the next iteration.

You should:
1. Carefully analyze the previous result for areas of improvement
2. Identify specific aspects that could be enhanced (detail, actionability, clarity, depth)
3. Suggest specific improvements for the next iteration
4. Focus on progressive enhancement while maintaining the core analysis quality

Your meta-analysis should be balanced, identifying both strengths to preserve and weaknesses to address.
Always consider the original purpose of the analysis and ensure each iteration moves closer to an optimal result.`;

@Injectable()
export class ProgressiveAnalysisAgent extends BaseAgent<
	ProgressiveAnalysisParams,
	ProgressiveAnalysisResult
> {
	// Store current parameters for schema generation
	protected params?: ProgressiveAnalysisParams;

	protected readonly retryOptions: RetryOptions = {
		maxRetries: 3,
		initialDelayMs: 200,
		maxDelayMs: 30000,
		backoffFactor: 3,
		jitter: true,
		shouldRetry: (error) => error.status === 429 || error.status >= 500,
	};

	constructor(
		protected readonly openaiClient: OpenAIClientService,
		protected readonly promptBuilder: ProgressiveAnalysisPromptBuilder,
	) {
		super(
			openaiClient,
			promptBuilder,
			AgentName.PROGRESSIVE_ANALYSIS,
			PROGRESSIVE_SYSTEM_MESSAGE,
			"progressive_analysis_tool",
			"You iteratively analyze and improve the responses from other agents over multiple iterations to produce the best possible result.",
			// retryOptions
		);
	}

	/**
	 * Schema for progressive analysis results
	 */
	getSchema(): z.ZodSchema<ProgressiveAnalysisResult> {
		// If no target agent is available or we need a generic schema, return the base schema
		if (!this.params?.targetAgent) {
			return baseProgressiveAnalysisSchema;
		}

		// If the target agent is GeneralAnalysisAgent, use the specific schema
		if (this.params.targetAgent.name === AgentName.GENERAL_TRADING_ANALYSIS_AGENT) {
			return tradingProgressiveAnalysisSchema as unknown as z.ZodSchema<ProgressiveAnalysisResult>;
		}

		// Otherwise, create a dynamic schema based on the target agent's schema
		const targetSchema = this.params.targetAgent.getSchema();
		return createProgressiveAnalysisSchema(
			targetSchema,
		) as unknown as z.ZodSchema<ProgressiveAnalysisResult>;
	}

	/**
	 * Execute the progressive analysis process
	 */
	async execute(
		params: ProgressiveAnalysisParams,
	): Promise<AgentResponse<ProgressiveAnalysisResult>> {
		// Store current parameters for schema generation
		this.params = params;

		const { targetAgent, targetAgentParams, iterations = 3, previousResults = [] } = params;

		// Store results from each iteration
		const iterationResults: any[] = [...previousResults];
		const improvementAnalysis: string[] = [];

		// Start timer for overall execution
		const startTime = Date.now();

		// Run the initial execution if we don't have previous results
		if (iterationResults.length === 0) {
			const initialResult = await targetAgent.execute(targetAgentParams);
			iterationResults.push(initialResult.response);
			improvementAnalysis.push("Initial analysis completed.");
		}

		// Perform requested number of iterations
		for (let i = iterationResults.length; i < iterations; i++) {
			// Get previous result
			const previousResult = iterationResults[i - 1];

			// Generate improvement suggestions using our own meta-analysis
			// The prompt builder will extract what it needs from the params
			const improvementPrompt = this.buildPrompt({
				targetAgent,
				targetAgentParams,
				previousResults: iterationResults,
			});

			// Execute a meta-analysis with a structured schema to get improvement suggestions
			const metaAnalysisResult = await this.openaiClient.executeStructuredOutput(
				improvementPrompt,
				metaAnalysisSchema,
				this.systemMessage,
				"meta_analysis_tool",
			);

			// Extract improvement guidance from the meta-analysis
			const metaAnalysis = this.handleMetaAnalysisResponse(metaAnalysisResult);
			const enhancementGuidance = metaAnalysis.improvementGuidance;
			improvementAnalysis.push(enhancementGuidance);

			// Create enhanced params with improvement guidance
			const enhancedParams = {
				...targetAgentParams,
				enhancementGuidance,
				previousResult: iterationResults[iterationResults.length - 1],
			};

			// Execute the target agent with enhanced params
			const enhancedResult = await targetAgent.execute(enhancedParams);
			iterationResults.push(enhancedResult.response);
		}

		// Determine the best result using scores from meta-analysis
		let bestResultIndex = iterationResults.length - 1; // Default to the last iteration
		let bestScore = 0;

		// If we have quality scores from meta-analysis, use them to find the best result
		if (improvementAnalysis.length > 0) {
			// We need to perform one final meta-analysis to score the last result
			const finalAnalysisPrompt = this.buildPrompt({
				targetAgent,
				targetAgentParams,
				previousResults: iterationResults,
			});

			const finalMetaAnalysisResult = await this.openaiClient.executeStructuredOutput(
				finalAnalysisPrompt,
				metaAnalysisSchema,
				this.systemMessage,
				"meta_analysis_tool",
			);

			const finalMetaAnalysis = this.handleMetaAnalysisResponse(finalMetaAnalysisResult);
			const finalScore = finalMetaAnalysis.qualityScore;

			// Compare with previous scores to find the best result
			if (finalScore > bestScore) {
				bestScore = finalScore;
				bestResultIndex = iterationResults.length - 1;
			}
		}

		const bestResult = iterationResults[bestResultIndex];
		const finalIteration = bestResultIndex;

		// Calculate completion time
		const completionTime = Date.now() - startTime;

		// Return the progressive analysis result
		return {
			status: "success",
			completionTime,
			modelUsed: "gpt-4-turbo", // This should be dynamically determined
			version: "1.0",
			response: {
				bestResult,
				iterationResults,
				improvementAnalysis,
				finalIteration,
			},
		};
	}

	private handleMetaAnalysisResponse(response: OpenAIResponse<MetaAnalysis>): MetaAnalysis {
		if (response.status === OpenAIResponseStatus.SUCCESS) {
			// Safely access the data property
			return response.data;
		} else {
			// Handle the error case
			throw new Error(
				`Meta-analysis failed: ${typeof response.error === "object" && "message" in response.error ? response.error.message : response.error || "Unknown error"}`,
			);
		}
	}
}
