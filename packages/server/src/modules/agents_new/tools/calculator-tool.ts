/**
 * Enhanced calculator tool implementation with validation
 */
import { ToolCategory, ToolFactory } from "./tool-registry";
import { ExtendedToolDefinition } from "./tool-registry";
import { z } from "zod";

/**
 * Schema for calculator tool parameters
 */
const calculatorSchema = z.object({
	expression: z.string().min(1).describe('The math expression to evaluate (e.g., "2 + 2")'),
});

/**
 * Type for calculator parameters
 */
type CalculatorParams = z.infer<typeof calculatorSchema>;

/**
 * Safe math expression evaluation
 *
 * @param expression - Expression to evaluate
 * @returns Evaluation result or error
 */
function safeEvaluate(expression: string): { result: number | null; error?: string } {
	try {
		// Remove any potential code execution
		const sanitized = expression
			.replace(/[^0-9+\-*/().%\s]/g, "")
			.replace(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g, "");

		// Check if the expression is empty after sanitization
		if (!sanitized.trim()) {
			return { result: null, error: "Invalid expression after sanitization" };
		}

		// Use Function instead of eval for better sandboxing
		// This is still not 100% safe but better than direct eval
		const result = new Function(`return ${sanitized}`)();

		if (typeof result !== "number" || !isFinite(result)) {
			return { result: null, error: "Result is not a valid number" };
		}

		return { result };
	} catch (e) {
		return {
			result: null,
			error: e instanceof Error ? e.message : String(e),
		};
	}
}

/**
 * Enhanced calculator tool with validation
 */
export const calculatorTool: ExtendedToolDefinition = ToolFactory.createUtilityTool({
	name: "calculator",
	description: "Perform arithmetic calculations safely",
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
	execute: async (args: Record<string, unknown>) => {
		// Validate arguments with zod
		try {
			const { expression } = calculatorSchema.parse(args);

			// Evaluate the expression safely
			const { result, error } = safeEvaluate(expression);

			if (error) {
				throw new Error(`Could not evaluate expression: ${error}`);
			}

			return {
				result,
				expression,
				message: `The result of ${expression} is ${result}`,
			};
		} catch (e) {
			if (e instanceof z.ZodError) {
				throw new Error(
					`Invalid arguments: ${e.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ")}`,
				);
			}
			throw e;
		}
	},
	version: "1.0.0",
});
