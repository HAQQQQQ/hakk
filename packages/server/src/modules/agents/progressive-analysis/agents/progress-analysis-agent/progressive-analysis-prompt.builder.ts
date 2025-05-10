import { Injectable } from "@nestjs/common";
import { PromptBuilder } from "../../../prompt-builder.interface";
import { progressiveAnalysisPromptTemplate } from "./progressive-analysis-prompt.template";
import { ProgressiveAnalysisParams } from "./progressive-analysis.agent";
import { AgentName } from "@/modules/agents/agent-name.enum";

/**
 * Extended parameters for building progressive analysis prompts
 */
export interface ProgressiveAnalysisPromptParams {
	// Previous results from target agent
	previousResults: any[];
	// Current iteration number
	iterationNumber: number;
	// Name of the target agent being improved
	targetAgentName: AgentName;
}

@Injectable()
export class ProgressiveAnalysisPromptBuilder implements PromptBuilder<ProgressiveAnalysisParams> {
	build(params: ProgressiveAnalysisParams): string {
		// Extract the data we need from the params
		const targetAgentName = params.targetAgent.name;
		const previousResults = params.previousResults || [];

		// Determine the current iteration number
		const iterationNumber = previousResults.length;

		// Call the template with the extracted parameters
		return progressiveAnalysisPromptTemplate(previousResults, targetAgentName, iterationNumber);
	}
}
// /**
//  * Parameters for the enhanced prompt builder
//  */
// export interface EnhancedPromptParams {
//     // Original prompt/parameters
//     originalPrompt: string;
//     // Previous agent result
//     previousResult: any;
//     // Improvement guidance from progressive analysis
//     enhancementGuidance: string;
//     // Current iteration number
//     iterationNumber: number;
// }

// /**
//  * Enhanced prompt builder for progressive improvement
//  * This adds a thin wrapper around existing prompts to incorporate
//  * feedback from previous iterations
//  */
// @Injectable()
// export class EnhancedPromptBuilder implements PromptBuilder<EnhancedPromptParams> {
//     build(params: EnhancedPromptParams): string {
//         const { originalPrompt, previousResult, enhancementGuidance, iterationNumber } = params;

//         // Format the previous result as a string
//         const formattedResult = JSON.stringify(previousResult, null, 2);

//         return `
//     [ITERATION ${iterationNumber}]

//     Original Request:
//     ${originalPrompt}

//     Previous Result:
//     ${formattedResult}

//     Improvement Guidance:
//     ${enhancementGuidance}

//     Please generate an improved analysis based on the original request and the improvement guidance above.
//     Focus on enhancing the quality, depth, and actionability of the analysis while maintaining its accuracy.
//     This is iteration ${iterationNumber} of a progressive improvement process.
//     `;
//     }
// }
