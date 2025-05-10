import { Injectable } from "@nestjs/common";
import { PromptBuilder } from "../../../prompt-builder.interface";
import { ProgressiveAnalysisParams } from "./progressive-analysis.agent";

/**
 * Enhanced prompt builder for progressive improvement
 * This adds a thin wrapper around existing prompts to incorporate
 * feedback from previous iterations
 */
@Injectable()
export class EnhancedPromptBuilder implements PromptBuilder<ProgressiveAnalysisParams> {
	build(params: ProgressiveAnalysisParams): string {
		const { targetAgent, targetAgentParams, previousResults = [] } = params;

		// Get the original prompt from the target agent
		const originalPrompt = targetAgent.buildPrompt(targetAgentParams);

		// If we don't have previous results, just return the original prompt
		if (!previousResults || previousResults.length === 0) {
			return originalPrompt;
		}

		// Get the latest result and any enhancement guidance
		const previousResult = previousResults[previousResults.length - 1];
		const enhancementGuidance =
			targetAgentParams.enhancementGuidance ||
			"Improve the analysis by adding more depth, detail, and actionable recommendations.";
		const iterationNumber = previousResults.length + 1;

		// Format the previous result as a string
		const formattedResult = JSON.stringify(previousResult, null, 2);

		return `
    [ITERATION ${iterationNumber}]
    
    Original Request:
    ${originalPrompt}
    
    Previous Result:
    ${formattedResult}
    
    Improvement Guidance:
    ${enhancementGuidance}
    
    Please generate an improved analysis based on the original request and the improvement guidance above.
    Focus on enhancing the quality, depth, and actionability of the analysis while maintaining its accuracy.
    This is iteration ${iterationNumber} of a progressive improvement process.
    `;
	}
}
