// progressive-analysis/iterative-prompt.template.ts
import { IterativePromptParams } from "./iterative-prompt.schema";

export function buildIterativePrompt(
	basePrompt: string,
	previousResponses: string[] = [],
	iterationNumber: number = 1,
	analysisGoal: string = "comprehensive trading psychology analysis",
): string {
	// First iteration - basic prompt
	if (iterationNumber === 1 || previousResponses.length === 0) {
		return `
      ${basePrompt}
      
      Please provide an initial ${analysisGoal}. Focus on the most prominent patterns and insights.
    `;
	}

	// Construct context from previous responses
	const previousResponsesContext = previousResponses
		.map((response, index) => `Response #${index + 1}: ${response}`)
		.join("\n\n");

	// Iteration-specific instructions
	let iterationInstructions = "";

	if (iterationNumber === 2) {
		// Second iteration - expand on key points
		iterationInstructions = `
      Based on your initial analysis, please expand on the key points and provide more detailed insights.
      Identify specific patterns that might have been overlooked in the first analysis.
      Look for nuanced emotional indicators and subtle trading behaviors.
    `;
	} else if (iterationNumber === 3) {
		// Third iteration - add depth and examples
		iterationInstructions = `
      Now that we have established the main insights and patterns, please:
      1. Add specific examples from the trading journal that illustrate each point
      2. Explore potential root causes for the observed behaviors
      3. Provide more detailed and personalized recommendations
      4. Connect different aspects of the analysis into a cohesive narrative
    `;
	} else {
		// Further iterations - refinement and precision
		iterationInstructions = `
      For this ${iterationNumber}th iteration, please:
      1. Refine your analysis by focusing on the most impactful insights
      2. Add quantitative assessments where possible (confidence levels, impact ratings)
      3. Provide more specific, actionable recommendations tailored to this trader's specific psychology
      4. Identify connections between different psychological patterns
      5. Address any contradictions or inconsistencies in previous analyses
      6. Add deeper psychological context that might help the trader understand underlying motivations
    `;
	}

	// Quality enhancement instructions
	const qualityInstructions = `
    For this iteration:
    - Be more specific and detailed than in previous responses
    - Avoid repeating information unless adding substantial new insights to it
    - Use concrete examples from the trading journal wherever possible
    - Make recommendations more actionable and personalized
    - Consider the emotional impact of your analysis - aim to be constructive and empowering
    - Structure your response in a way that builds upon previous insights
  `;

	// Put it all together
	return `
    Original input: "${basePrompt}"
    
    Previous analyses:
    ${previousResponsesContext}
    
    Iteration #${iterationNumber} instructions:
    ${iterationInstructions}
    
    Quality guidelines:
    ${qualityInstructions}
    
    Based on everything above, provide the next level of ${analysisGoal}.
  `;
}
