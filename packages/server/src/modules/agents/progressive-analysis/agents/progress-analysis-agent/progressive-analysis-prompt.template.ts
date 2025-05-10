// // progressive-analysis/progressive-analysis-prompt.template.ts

import { AgentName } from "@/modules/agents/agent-name.enum";

/**
 * Creates a prompt for the progressive analysis agent
 *
 * @param previousResults - Array of previous analysis results
 * @param targetAgentName - Name of the agent being improved
 * @param iterationNumber - Current iteration number
 * @returns Formatted prompt string
 */
export const progressiveAnalysisPromptTemplate = (
	previousResults: any[],
	targetAgentName: AgentName,
	iterationNumber: number,
): string => {
	// Get the most recent result
	const latestResult = previousResults[previousResults.length - 1];

	// Format the latest result as a string (handling potential complex objects)
	const formattedResult = JSON.stringify(latestResult, null, 2);

	return `
  You are performing iteration ${iterationNumber} of a progressive analysis to improve the output of the ${targetAgentName} agent.

  Here is the latest result from iteration ${iterationNumber - 1}:
  
  ${formattedResult}
  
  Analyze this result and provide structured feedback according to the following guidelines:
  
  1. Identify strengths: What aspects of the analysis are strong and should be preserved?
  2. Identify weaknesses: What aspects could be improved and how?
  3. Provide comprehensive improvement guidance: Give specific, actionable advice for enhancing the analysis
  4. Suggest focus areas: List specific areas that should receive more attention in the next iteration
  5. Assess overall quality: Rate the current analysis on a scale of 1-10
  
  Your meta-analysis will be used to guide the next iteration of the analysis to make it more valuable, 
  detailed, insightful, and practical for traders. Be thorough but focused on the most important 
  improvements that would benefit the user.
  `;
};

// export function buildProgressivePrompt(
// 	basePrompt: string,
// 	previousResponses: string[] = [],
// 	iterationNumber: number = 1,
// 	analysisGoal: string = "comprehensive trading psychology analysis",
// 	targetAgentName?: string,
// ): string {
// 	// Handle progressive execution of another agent
// 	if (targetAgentName) {
// 		return buildTargetAgentProgressivePrompt(
// 			basePrompt,
// 			previousResponses,
// 			iterationNumber,
// 			analysisGoal,
// 			targetAgentName,
// 		);
// 	}

// 	// First iteration - basic prompt
// 	if (iterationNumber === 1 || previousResponses.length === 0) {
// 		return `
//       ${basePrompt}

//       Please provide an initial ${analysisGoal}. Focus on the most prominent patterns and insights.
//     `;
// 	}

// 	// Construct context from previous responses
// 	const previousResponsesContext = previousResponses
// 		.map((response, index) => `Response #${index + 1}: ${response}`)
// 		.join("\n\n");

// 	// Iteration-specific instructions
// 	let iterationInstructions = "";

// 	if (iterationNumber === 2) {
// 		// Second iteration - expand on key points
// 		iterationInstructions = `
//       Based on your initial analysis, please expand on the key points and provide more detailed insights.
//       Identify specific patterns that might have been overlooked in the first analysis.
//       Look for nuanced emotional indicators and subtle trading behaviors.
//     `;
// 	} else if (iterationNumber === 3) {
// 		// Third iteration - add depth and examples
// 		iterationInstructions = `
//       Now that we have established the main insights and patterns, please:
//       1. Add specific examples from the trading journal that illustrate each point
//       2. Explore potential root causes for the observed behaviors
//       3. Provide more detailed and personalized recommendations
//       4. Connect different aspects of the analysis into a cohesive narrative
//     `;
// 	} else {
// 		// Further iterations - refinement and precision
// 		iterationInstructions = `
//       For this ${iterationNumber}th iteration, please:
//       1. Refine your analysis by focusing on the most impactful insights
//       2. Add quantitative assessments where possible (confidence levels, impact ratings)
//       3. Provide more specific, actionable recommendations tailored to this trader's specific psychology
//       4. Identify connections between different psychological patterns
//       5. Address any contradictions or inconsistencies in previous analyses
//       6. Add deeper psychological context that might help the trader understand underlying motivations
//     `;
// 	}

// 	// Quality enhancement instructions
// 	const qualityInstructions = `
//     For this iteration:
//     - Be more specific and detailed than in previous responses
//     - Avoid repeating information unless adding substantial new insights to it
//     - Use concrete examples from the trading journal wherever possible
//     - Make recommendations more actionable and personalized
//     - Consider the emotional impact of your analysis - aim to be constructive and empowering
//     - Structure your response in a way that builds upon previous insights
//   `;

// 	// Put it all together
// 	return `
//     Original input: "${basePrompt}"

//     Previous analyses:
//     ${previousResponsesContext}

//     Iteration #${iterationNumber} instructions:
//     ${iterationInstructions}

//     Quality guidelines:
//     ${qualityInstructions}

//     Based on everything above, provide the next level of ${analysisGoal}.
//   `;
// }

// /**
//  * Build a prompt for progressive execution of a target agent
//  */
// function buildTargetAgentProgressivePrompt(
// 	basePrompt: string,
// 	previousResponses: string[] = [],
// 	iterationNumber: number = 1,
// 	analysisGoal: string = "comprehensive trading psychology analysis",
// 	targetAgentName: string,
// ): string {
// 	// First iteration - just use the original basePrompt
// 	if (iterationNumber === 1 || previousResponses.length === 0) {
// 		return basePrompt;
// 	}

// 	// Determine enhancement focus based on iteration
// 	let enhancementFocus = "";

// 	if (iterationNumber === 2) {
// 		enhancementFocus = `
//         Please enhance your previous analysis with a focus on:
//         - Expanding key insights with more details
//         - Identifying patterns that might have been missed
//         - Adding more nuanced emotional and behavioral analysis
//         `;
// 	} else if (iterationNumber === 3) {
// 		enhancementFocus = `
//         For this third analysis, please focus on:
//         - Adding specific examples from the trading journal
//         - Exploring root causes of the observed behaviors
//         - Providing more personalized recommendations
//         - Creating connections between different aspects of the analysis
//         `;
// 	} else {
// 		enhancementFocus = `
//         For this advanced analysis iteration, please focus on:
//         - Refining insights to focus on the most impactful ones
//         - Adding quantitative assessments where possible
//         - Creating highly specific and actionable recommendations
//         - Identifying connections between psychological patterns
//         - Addressing any contradictions or inconsistencies
//         - Adding deeper psychological context for better understanding
//         `;
// 	}

// 	// Add a section specifically about how to use the previous analysis
// 	const previousAnalysisGuidance = `
//     Important guidance about the previous analysis:
//     - Use it as a foundation to build upon, not as a constraint
//     - Feel free to disagree with previous conclusions if you see better alternatives
//     - Don't just repeat the same insights - add depth, nuance, and new perspectives
//     - Maintain the valuable insights from previous analysis while adding new ones
//     `;

// 	// For most recent previous analysis
// 	const lastResponse = previousResponses[previousResponses.length - 1];

// 	// Construct the enhanced prompt
// 	return `
//     ${basePrompt}

//     Previous Analysis (Iteration ${iterationNumber - 1}):
//     ${lastResponse}

//     ${enhancementFocus}

//     ${previousAnalysisGuidance}

//     Please provide an enhanced ${analysisGoal} for iteration #${iterationNumber}.
//     `;
// }
