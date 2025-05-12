/**
 * Calculator tool implementation
 */
import { ToolDefinition } from "./tool-executor";

/**
 * Calculator tool for performing arithmetic calculations
 */
export const calculatorTool: ToolDefinition = {
	name: "calculator",
	description: "Perform arithmetic calculations",
	parameters: {
		type: "object",
		properties: {
			expression: {
				type: "string",
				description: 'The math expression to evaluate (e.g., "2 + 2")',
			},
		},
		required: ["expression"],
	},
	execute: async ({ expression }) => {
		// Simple evaluation (in a real app, use a safer method)
		try {
			// This is just an example - a real implementation would use a safer eval
			// return { result: eval(expression as string) };

			// A safer implementation might use a math library
			return {
				result: `Result of ${expression}`,
				// In a real implementation, calculate the actual result
			};
		} catch (e) {
			throw new Error(`Could not evaluate expression: ${e.message}`);
		}
	},
};
