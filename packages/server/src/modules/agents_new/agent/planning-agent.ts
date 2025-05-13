/**
 * Planning agent implementation
 * Updated to use processQueryWithSchema instead of processQuery
 */
import { Message } from "../core/types";
import { Agent, AgentConfig, AgentDependencies } from "./agent";
// import { LanguageModelInterface } from "../llm/interfaces";
import { z, ZodSchema } from "zod";

/**
 * Schema for step responses
 */
export const stepResponseSchema = z.object({
	response: z.string().describe("Response to the current step"),
	status: z.enum(["success", "partial", "failure"]).describe("Status of the step execution"),
	details: z.any().optional().describe("Additional details or data"),
});

/**
 * Type for the step response
 */
export type StepResponse = z.infer<typeof stepResponseSchema>;

/**
 * Schema for the plan summary
 */
export const planSummarySchema = z.object({
	summary: z.string().describe("Summary of the plan execution"),
	steps: z
		.array(
			z.object({
				step: z.string().describe("Step description"),
				result: z.string().describe("Result of the step execution"),
			}),
		)
		.describe("Steps completed in the plan"),
	status: z.enum(["completed", "partial", "failed"]).describe("Overall status of the plan"),
});

/**
 * Type for the plan summary
 */
export type PlanSummary = z.infer<typeof planSummarySchema>;

/**
 * Agent with planning capabilities
 */
export class PlanningAgent extends Agent {
	// private planningLLM: LanguageModelInterface;

	constructor(
		config: AgentConfig,
		dependencies: AgentDependencies,
		// planningLLM: LanguageModelInterface
	) {
		super(config, dependencies);
		// this.planningLLM = planningLLM;
	}

	/**
	 * Create a plan for complex tasks
	 */
	async createPlan(task: string): Promise<string[]> {
		const planningPrompt = `
Task: ${task}

Break down this task into a sequence of concrete steps that can be executed in order.
Each step should be a single action, not a complex or multi-part step.
Output only the steps, one per line, numbered from 1.
    `;

		const planningMessages: Message[] = [
			{
				role: "system",
				content:
					"You are a planning assistant. Your job is to break down complex tasks into simpler steps.",
			},
			{
				role: "user",
				content: planningPrompt,
			},
		];

		let planText = "";
		// const generator = this.planningLLM.generateResponse(planningMessages);

		// for await (const chunk of generator) {
		//     if (typeof chunk === "string") {
		//         planText += chunk;
		//     }
		// }

		// Parse the plan into steps
		const steps = planText
			.split("\n")
			.filter((line) => /^\d+\./.test(line.trim()))
			.map((line) => line.replace(/^\d+\.\s*/, "").trim());

		return steps;
	}

	/**
	 * Execute a plan step by step with schema
	 */
	async executePlanWithSchema(
		task: string,
		onMessage: (message: Message) => void | Promise<void>,
	): Promise<PlanSummary> {
		try {
			// Create a plan
			const steps = await this.createPlan(task);

			// Context for the execution
			let context = "";
			const completedSteps: { step: string; result: string }[] = [];

			// Execute each step
			for (let i = 0; i < steps.length; i++) {
				const step = steps[i];

				// Add context from previous steps
				const query = `
${context ? `Previous progress:\n${context}\n\n` : ""}
Overall task: ${task}
Current step (${i + 1}/${steps.length}): ${step}

Please execute this specific step only.
`;

				// Execute the step using the schema-based approach
				const result = await super.processQueryWithSchema<StepResponse>(
					query,
					stepResponseSchema,
					async (message: Message) => {
						await onMessage(message);
					},
				);

				// Use the result to update context
				if (result) {
					// Update context with result from this step
					const stepResult = result.response;
					context += `Step ${i + 1}: ${step}\nResult: ${stepResult}\n\n`;

					// Add to completed steps
					completedSteps.push({
						step,
						result: stepResult,
					});
				} else {
					context += `Step ${i + 1}: ${step}\nResult: Failed to execute step\n\n`;
					completedSteps.push({
						step,
						result: "Failed to execute step",
					});
				}
			}

			// Create the summary
			const summary: PlanSummary = {
				summary: `Task completed: ${task}. Executed ${steps.length} steps.`,
				steps: completedSteps,
				status: "completed",
			};

			// Send the final summary message
			const summaryMessage: Message = {
				role: "assistant",
				content: JSON.stringify(summary, null, 2),
			};

			await onMessage(summaryMessage);

			return summary;
		} catch (error) {
			console.error("Error executing plan:", error);

			// Create a failure summary
			const failureSummary: PlanSummary = {
				summary: `Error executing plan: ${error instanceof Error ? error.message : String(error)}`,
				steps: [],
				status: "failed",
			};

			// Send the error message
			const errorMessage: Message = {
				role: "assistant",
				content: JSON.stringify(failureSummary, null, 2),
			};

			await onMessage(errorMessage);

			return failureSummary;
		}
	}
}
