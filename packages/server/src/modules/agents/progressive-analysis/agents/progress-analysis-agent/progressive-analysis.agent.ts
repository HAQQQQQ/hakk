// progressive-analysis/progressive-analysis.agent.ts
import { Injectable } from "@nestjs/common";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { BaseAgent, AgentResponse } from "@/modules/agents/base.agent";
import { AgentName } from "@/modules/agents/agent-name.enum";
import { ZodTypeAny, z } from "zod";
import { AgentFactory } from "@/modules/agents/agent.factory";

import {
	ContextualAnalysisParams,
	JournalEntryParams,
	PerformanceAnalysisParams,
	PsychologyPlanParams,
	TrendAnalysisParams,
} from "@/modules/agents/trading-sentiment/types/agent-params.types";
import {
	createTypedProgressiveSchema,
	ProgressiveAnalysisParams,
	ProgressiveAnalysisResult,
	progressiveAnalysisResultSchema,
} from "./progressive-analysis.schema";
import { ProgressiveAnalysisPromptBuilder } from "./progressive-analysis-prompt.builder";

// Define a type for all possible agent parameters
type AllAgentParams = JournalEntryParams &
	ContextualAnalysisParams &
	TrendAnalysisParams &
	PerformanceAnalysisParams &
	PsychologyPlanParams;

const SYSTEM_MESSAGE = `You are an expert trading psychology analyst specializing in progressive insight development. 
    Your role is to analyze trading journals with increasing depth and detail across multiple iterations.
    Each iteration should build upon previous insights while adding new depth, examples, and specificity.
    Always focus on providing actionable insights that help traders improve their performance and psychology.`;

@Injectable()
export class ProgressiveAnalysisAgent extends BaseAgent<
	ProgressiveAnalysisParams,
	ProgressiveAnalysisResult
> {
	getSchema(): any {
		return "Currently working on this class";
	}
}

// @Injectable()
// export class ProgressiveAnalysisAgent extends BaseAgent<
//     ProgressiveAnalysisParams,
//     ProgressiveAnalysisResult
// > {
//     constructor(
//         openaiClient: OpenAIClientService,
//         promptBuilder: ProgressiveAnalysisPromptBuilder,
//         private readonly agentFactory: AgentFactory
//     ) {
//         super(
//             openaiClient,
//             promptBuilder,
//             AgentName.PROGRESSIVE_ANALYSIS,
//             SYSTEM_MESSAGE,
//             "progressive_analysis",
//             "Analyzes trading journals with increasing depth across multiple iterations",
//         );
//     }

//     getSchema(): z.ZodSchema<ProgressiveAnalysisResult> {
//         return progressiveAnalysisResultSchema;
//     }

//     /**
//      * Execute another agent progressively, improving results with each iteration
//      * @param agentName The name of the agent to execute
//      * @param params Parameters for the target agent
//      * @param iterations Number of progressive iterations (default: 3)
//      */
//     async executeAgentProgressively<TParams extends Partial<AllAgentParams>, TResponseData>(
//         agentName: AgentName,
//         params: TParams,
//         iterations: number = 3
//     ): Promise<AgentResponse<ProgressiveAnalysisResult<TResponseData>>[]> {
//         // Get the target agent
//         const targetAgent = this.agentFactory.getAgent(agentName);

//         // Get the target agent's schema
//         const targetSchema = targetAgent.getSchema();

//         // Create a typed schema for the target agent's response
//         const typedProgressiveSchema = createTypedProgressiveSchema(targetSchema);

//         // Array to store all results
//         const results: AgentResponse<ProgressiveAnalysisResult<TResponseData>>[] = [];

//         // Extract the journal entry from params (assuming it has a journalEntry property)
//         const journalEntry = (params as any).journalEntry || '';

//         // First iteration - execute the agent with original params
//         console.log(`Progressive Analysis: Running ${agentName} - Iteration 1 of ${iterations}`);
//         const startTime = Date.now();
//         const firstAgentResponse = await targetAgent.execute(params as any);
//         const firstResult = firstAgentResponse.response as TResponseData;
//         const endTime = Date.now();

//         // Create the progressive result data
//         const firstProgressiveResult: ProgressiveAnalysisResult<TResponseData> = {
//             meta: {
//                 iteration: 1,
//                 insightLevel: "initial",
//                 processingTimeMs: endTime - startTime,
//                 improvementFocus: ["Initial analysis"],
//                 confidenceScore: 0.7, // Default initial confidence
//                 nextIterationSuggestions: "Expand on key insights and add more specific examples"
//             },
//             originalResponse: firstResult,
//             summary: this.generateSummary(firstResult)
//         };

//         // Create the full agent response with the progressive data
//         const firstProgressiveResponse: AgentResponse<ProgressiveAnalysisResult<TResponseData>> = {
//             status: 'success',
//             completionTime: endTime - startTime,
//             modelUsed: firstAgentResponse.modelUsed,
//             version: firstAgentResponse.version,
//             confidence: 0.7, // Default initial confidence
//             response: firstProgressiveResult
//         };

//         results.push(firstProgressiveResponse);

//         // If only one iteration requested, return now
//         if (iterations <= 1) {
//             return results;
//         }

//         // For subsequent iterations, use our progressive approach
//         let previousResult = firstResult;
//         let previousProgressiveResult = firstProgressiveResult;

//         for (let i = 2; i <= iterations; i++) {
//             // Format the previous result
//             const formattedPreviousResult = this.formatResult(previousResult);

//             // Create enhanced parameters for the next execution
//             const enhancedParams = this.createEnhancedParams(
//                 params,
//                 formattedPreviousResult,
//                 i,
//                 iterations,
//                 previousProgressiveResult.summary.keyInsights
//             );

//             // Determine the insight level for this iteration
//             const insightLevel = i === 2 ? "expanded" :
//                 i === 3 ? "detailed" : "refined";

//             // Execute the agent with enhanced parameters
//             console.log(`Progressive Analysis: Running ${agentName} - Iteration ${i} of ${iterations}`);
//             const iterationStartTime = Date.now();
//             const nextAgentResponse = await targetAgent.execute(enhancedParams as any);
//             const nextResult = nextAgentResponse.response as TResponseData;
//             const iterationEndTime = Date.now();

//             // Generate improvement focus areas based on iteration
//             const improvementFocus = this.getImprovementFocus(i);

//             // Calculate confidence score based on iteration
//             const confidenceScore = Math.min(0.7 + (i * 0.1), 0.95);

//             // Create the progressive result wrapper
//             const nextProgressiveResult: ProgressiveAnalysisResult<TResponseData> = {
//                 meta: {
//                     iteration: i,
//                     insightLevel,
//                     processingTimeMs: iterationEndTime - iterationStartTime,
//                     improvementFocus,
//                     confidenceScore, // Increase confidence with iterations
//                     nextIterationSuggestions: i < iterations ?
//                         "Focus on connections between insights and more personalized recommendations" :
//                         "Consider additional data sources or specialized analysis"
//                 },
//                 originalResponse: nextResult,
//                 summary: this.generateSummary(nextResult, previousResult)
//             };

//             // Create the full agent response
//             const nextProgressiveResponse: AgentResponse<ProgressiveAnalysisResult<TResponseData>> = {
//                 status: 'success',
//                 completionTime: iterationEndTime - iterationStartTime,
//                 modelUsed: nextAgentResponse.modelUsed,
//                 version: nextAgentResponse.version,
//                 confidence: confidenceScore,
//                 response: nextProgressiveResult
//             };

//             results.push(nextProgressiveResponse);

//             // Store for next iteration
//             previousResult = nextResult;
//             previousProgressiveResult = nextProgressiveResult;

//             // Add a small delay between iterations to avoid rate limits
//             if (i < iterations) {
//                 await new Promise(resolve => setTimeout(resolve, 500));
//             }
//         }

//         return results;
//     }

//     /**
//      * Get only the final result from progressive execution
//      */
//     async getFinalResult<TParams extends Partial<AllAgentParams>, TResponseData>(
//         agentName: AgentName,
//         params: TParams,
//         iterations: number = 3
//     ): Promise<AgentResponse<ProgressiveAnalysisResult<TResponseData>>> {
//         const results = await this.executeAgentProgressively<TParams, TResponseData>(
//             agentName,
//             params,
//             iterations
//         );
//         return results[results.length - 1];
//     }

//     /**
//      * Get only the response data from the final result of progressive execution
//      */
//     async getFinalResponseData<TParams extends Partial<AllAgentParams>, TResponseData>(
//         agentName: AgentName,
//         params: TParams,
//         iterations: number = 3
//     ): Promise<ProgressiveAnalysisResult<TResponseData>> {
//         const finalResult = await this.getFinalResult<TParams, TResponseData>(
//             agentName,
//             params,
//             iterations
//         );
//         return finalResult.response;
//     }

//     /**
//      * Generate improvement focus areas based on iteration number
//      */
//     private getImprovementFocus(iteration: number): string[] {
//         if (iteration === 2) {
//             return [
//                 "Expanding on key insights",
//                 "Adding depth to initial observations",
//                 "Providing more specific examples"
//             ];
//         } else if (iteration === 3) {
//             return [
//                 "Connecting different psychological patterns",
//                 "Adding root cause analysis",
//                 "Providing more personalized recommendations",
//                 "Creating a cohesive narrative"
//             ];
//         } else {
//             return [
//                 "Refining and focusing on most impactful insights",
//                 "Adding quantitative assessments",
//                 "Creating extremely specific, actionable recommendations",
//                 "Addressing contradictions or inconsistencies",
//                 "Adding psychological context"
//             ];
//         }
//     }

//     /**
//      * Generate a summary of the analysis
//      */
//     private generateSummary(result: any, previousResult?: any): {
//         keyInsights: string[];
//         improvements: string[];
//         recommendedNextSteps: string;
//     } {
//         // Extract insights based on common patterns in trading analysis
//         let keyInsights: string[] = [];
//         let recommendedNextSteps = "Continue refining your trading approach based on these insights";

//         try {
//             // Try to intelligently extract key insights from different possible result structures
//             if (typeof result === 'object') {
//                 // Handle different result structure patterns

//                 // Pattern 1: Object with array properties like "insights", "keyPoints", etc.
//                 const candidateArrayProps = [
//                     'insights', 'keyInsights', 'keyPoints', 'findings',
//                     'observations', 'patterns', 'biases', 'emotionalPatterns',
//                     'tradingEmotions', 'recommendations', 'tradingRecommendations'
//                 ];

//                 for (const prop of candidateArrayProps) {
//                     if (result[prop] && Array.isArray(result[prop])) {
//                         if (result[prop].length > 0) {
//                             // If array contains objects with string properties, extract those
//                             if (typeof result[prop][0] === 'object') {
//                                 const subProps = ['name', 'description', 'text', 'insight',
//                                     'recommendation', 'emotion', 'bias'];

//                                 for (const item of result[prop]) {
//                                     for (const subProp of subProps) {
//                                         if (item[subProp] && typeof item[subProp] === 'string') {
//                                             keyInsights.push(item[subProp]);
//                                             break; // Only add one insight per item
//                                         }
//                                     }
//                                 }
//                             }
//                             // If array contains strings, add those directly
//                             else if (typeof result[prop][0] === 'string') {
//                                 keyInsights = keyInsights.concat(result[prop].slice(0, 5));
//                             }
//                         }
//                     }
//                 }

//                 // Pattern 2: Object with nested objects that might contain insights
//                 const candidateNestedProps = [
//                     'coreSentiment', 'cognitiveBiases', 'recommendations',
//                     'strategyRisk', 'mentalState', 'summary'
//                 ];

//                 for (const prop of candidateNestedProps) {
//                     if (result[prop] && typeof result[prop] === 'object') {
//                         // Look for nested arrays
//                         for (const [key, value] of Object.entries(result[prop])) {
//                             if (Array.isArray(value) && value.length > 0) {
//                                 if (typeof value[0] === 'string') {
//                                     keyInsights = keyInsights.concat(value.slice(0, 3));
//                                 } else if (typeof value[0] === 'object') {
//                                     // Extract from objects in array
//                                     for (const item of value.slice(0, 3)) {
//                                         for (const [itemKey, itemValue] of Object.entries(item)) {
//                                             if (typeof itemValue === 'string' &&
//                                                 ['description', 'text', 'recommendation', 'name', 'insight'].includes(itemKey)) {
//                                                 keyInsights.push(itemValue);
//                                                 break;
//                                             }
//                                         }
//                                     }
//                                 }
//                             }
//                             // Look for string properties that might be summaries or key insights
//                             else if (typeof value === 'string' &&
//                                 ['summary', 'tradingSummary', 'overview', 'assessment'].includes(key)) {
//                                 keyInsights.push(value);
//                             }
//                         }
//                     }
//                 }

//                 // Extract recommended next steps if present
//                 const recommendationProps = [
//                     'recommendedNextSteps', 'nextSteps', 'actionItems', 'recommendations',
//                     'tradingRecommendations', 'actionPlan'
//                 ];

//                 for (const prop of recommendationProps) {
//                     if (result[prop]) {
//                         if (typeof result[prop] === 'string') {
//                             recommendedNextSteps = result[prop];
//                             break;
//                         } else if (Array.isArray(result[prop]) && result[prop].length > 0) {
//                             if (typeof result[prop][0] === 'string') {
//                                 recommendedNextSteps = result[prop].join('; ');
//                                 break;
//                             } else if (typeof result[prop][0] === 'object') {
//                                 const items = result[prop].slice(0, 3).map(item => {
//                                     for (const key of ['text', 'recommendation', 'action', 'description']) {
//                                         if (item[key] && typeof item[key] === 'string') return item[key];
//                                     }
//                                     return '';
//                                 }).filter(Boolean);

//                                 if (items.length > 0) {
//                                     recommendedNextSteps = items.join('; ');
//                                     break;
//                                 }
//                             }
//                         }
//                     }
//                 }
//             }

//             // Ensure we have at least some key insights
//             if (keyInsights.length === 0) {
//                 keyInsights = [
//                     "Trading psychology analysis completed",
//                     "Analysis found patterns in trading behavior",
//                     "Further iterations will provide more detailed insights"
//                 ];
//             }

//             // Truncate insights to a reasonable length and limit number
//             keyInsights = keyInsights
//                 .map(insight => insight.length > 100 ? insight.substring(0, 100) + '...' : insight)
//                 .slice(0, 5);

//             // Generate improvements based on comparison with previous result
//             let improvements: string[] = [];
//             if (previousResult) {
//                 improvements = [
//                     "Added more detailed analysis of trading patterns",
//                     "Provided more specific and actionable recommendations"
//                 ];
//             }

//             return {
//                 keyInsights,
//                 improvements,
//                 recommendedNextSteps
//             };

//         } catch (error) {
//             console.error("Error generating summary:", error);
//             // Fallback to default summary if extraction fails
//             return {
//                 keyInsights: [
//                     "Trading psychology analysis completed",
//                     "Further iterations will provide more detailed insights",
//                     "Review the full analysis for specific recommendations"
//                 ],
//                 improvements: previousResult ? [
//                     "Enhanced analysis from previous iteration",
//                     "Added more depth to psychological insights"
//                 ] : [],
//                 recommendedNextSteps: "Review the complete analysis for specific action items and recommendations"
//             };
//         }
//     }

//     /**
//      * Format a result object into a string
//      */
//     private formatResult(result: any): string {
//         // Simple case - if it's already a string
//         if (typeof result === 'string') return result;

//         try {
//             // For complex objects, try to create a readable formatted representation
//             let formatted = '';

//             // Format based on common structure patterns
//             if (typeof result === 'object' && result !== null) {
//                 // Add key sections with headers
//                 const topLevelHeadings = {
//                     coreSentiment: 'CORE SENTIMENT ANALYSIS',
//                     cognitiveBiases: 'COGNITIVE BIASES IDENTIFIED',
//                     recommendations: 'TRADING RECOMMENDATIONS',
//                     strategyRisk: 'STRATEGY AND RISK ASSESSMENT',
//                     psychologicalIssues: 'PSYCHOLOGICAL ISSUES',
//                     emotionalPatterns: 'EMOTIONAL PATTERNS',
//                     tradingBehavior: 'TRADING BEHAVIOR ANALYSIS'
//                 };

//                 // Add top-level sections with headings
//                 for (const [key, heading] of Object.entries(topLevelHeadings)) {
//                     if (result[key]) {
//                         formatted += `\n${heading}:\n`;
//                         formatted += this.formatSection(result[key]);
//                         formatted += '\n';
//                     }
//                 }

//                 // Include any other significant properties not already included
//                 for (const [key, value] of Object.entries(result)) {
//                     if (!Object.keys(topLevelHeadings).includes(key) &&
//                         value !== null &&
//                         typeof value !== 'undefined') {

//                         // Skip any "__typename" or internal properties
//                         if (key.startsWith('__') || key === 'typename') continue;

//                         const heading = key
//                             .replace(/([A-Z])/g, ' $1')
//                             .replace(/^./, c => c.toUpperCase());

//                         formatted += `\n${heading}:\n`;
//                         formatted += this.formatSection(value);
//                         formatted += '\n';
//                     }
//                 }
//             }

//             // If we couldn't create a good formatted representation, fall back to JSON
//             if (!formatted.trim()) {
//                 return JSON.stringify(result, null, 2);
//             }

//             return formatted;
//         } catch (e) {
//             // Fallback if any error occurs during formatting
//             console.error("Error formatting result:", e);
//             try {
//                 return JSON.stringify(result, null, 2);
//             } catch {
//                 return "Previous analysis result (could not format properly)";
//             }
//         }
//     }

//     /**
//      * Format a section of the analysis result
//      */
//     private formatSection(section: any, indent: number = 1): string {
//         const indentStr = '  '.repeat(indent);
//         let result = '';

//         if (typeof section === 'string') {
//             result += `${indentStr}${section}\n`;
//         } else if (typeof section === 'number' || typeof section === 'boolean') {
//             result += `${indentStr}${section}\n`;
//         } else if (Array.isArray(section)) {
//             for (const item of section) {
//                 if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
//                     result += `${indentStr}- ${item}\n`;
//                 } else if (typeof item === 'object' && item !== null) {
//                     result += `${indentStr}-\n`;
//                     result += this.formatSection(item, indent + 1);
//                 }
//             }
//         } else if (typeof section === 'object' && section !== null) {
//             for (const [key, value] of Object.entries(section)) {
//                 // Skip internal properties
//                 if (key.startsWith('__')) continue;

//                 const formattedKey = key
//                     .replace(/([A-Z])/g, ' $1')
//                     .replace(/^./, c => c.toUpperCase());

//                 if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
//                     result += `${indentStr}${formattedKey}: ${value}\n`;
//                 } else if (Array.isArray(value)) {
//                     result += `${indentStr}${formattedKey}:\n`;
//                     for (const item of value) {
//                         if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
//                             result += `${indentStr}  - ${item}\n`;
//                         } else if (typeof item === 'object' && item !== null) {
//                             result += `${indentStr}  -\n`;
//                             result += this.formatSection(item, indent + 2);
//                         }
//                     }
//                 } else if (typeof value === 'object' && value !== null) {
//                     result += `${indentStr}${formattedKey}:\n`;
//                     result += this.formatSection(value, indent + 1);
//                 }
//             }
//         }

//         return result;
//     }

//     /**
//      * Create enhanced parameters with instructions for improvement
//      */
//     private createEnhancedParams<TParams extends Partial<AllAgentParams>>(
//         originalParams: TParams,
//         previousResult: string,
//         currentIteration: number,
//         totalIterations: number,
//         previousKeyInsights: string[] = []
//     ): TParams {
//         // Get the journal entry text
//         const journalEntry = (originalParams as any).journalEntry || '';

//         // Format previous key insights
//         const keyInsightsText = previousKeyInsights.length > 0
//             ? `Previous Key Insights:\n${previousKeyInsights.map(insight => `- ${insight}`).join('\n')}`
//             : '';

//         // Create iteration-specific instructions
//         let iterationInstructions = '';
//         if (currentIteration === 2) {
//             iterationInstructions = `
//                 Based on the previous analysis, please expand on the key points and provide more detailed insights.
//                 Identify specific patterns that might have been overlooked in the first analysis.
//                 Look for nuanced emotional indicators and subtle trading behaviors.
//             `;
//         } else if (currentIteration === 3) {
//             iterationInstructions = `
//                 Now that we have established the main insights and patterns, please:
//                 1. Add specific examples from the trading journal that illustrate each point
//                 2. Explore potential root causes for the observed behaviors
//                 3. Provide more detailed and personalized recommendations
//                 4. Connect different aspects of the analysis into a cohesive narrative
//             `;
//         } else {
//             iterationInstructions = `
//                 For this ${currentIteration}th iteration, please:
//                 1. Refine your analysis by focusing on the most impactful insights
//                 2. Add quantitative assessments where possible (confidence levels, impact ratings)
//                 3. Provide more specific, actionable recommendations tailored to this trader's specific psychology
//                 4. Identify connections between different psychological patterns
//                 5. Address any contradictions or inconsistencies in previous analyses
//                 6. Add deeper psychological context that might help the trader understand underlying motivations
//             `;
//         }

//         // Create an enhanced journal entry that includes the previous result and instructions
//         const enhancedJournalEntry = `
//             Original Trading Journal:
//             ${journalEntry}

//             Previous Analysis (Iteration ${currentIteration - 1}):
//             ${previousResult}

//             ${keyInsightsText}

//             Instructions for Iteration ${currentIteration}:
//             ${iterationInstructions}

//             Please provide an improved analysis based on the original journal and the previous analysis.
//             Focus on adding depth, specificity, and actionable insights that were not present in the previous analysis.
//         `;

//         // Create a copy of the original params and update the journal entry
//         const enhancedParams = { ...originalParams };
//         (enhancedParams as any).journalEntry = enhancedJournalEntry;

//         return enhancedParams;
//     }
// }
