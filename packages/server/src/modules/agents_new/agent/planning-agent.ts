/**
 * Planning agent implementation
 */
import { Message } from "../core/types";
import { Agent, AgentConfig, AgentDependencies } from "./agent";
import { z } from "zod";

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
	metrics: z
		.object({
			totalSteps: z.number().describe("Total number of steps in the plan"),
			successfulSteps: z.number().describe("Number of successfully completed steps"),
			failedSteps: z.number().describe("Number of failed steps"),
			executionTimeMs: z.number().describe("Total execution time in milliseconds"),
		})
		.optional()
		.describe("Execution metrics"),
});

/**
 * Type for the plan summary
 */
export type PlanSummary = z.infer<typeof planSummarySchema>;

/**
 * Schema for the plan creation
 */
export const planCreationSchema = z.object({
	steps: z
		.array(z.string().describe("A single step in the plan"))
		.describe("Steps to execute the task"),
	reasoning: z.string().describe("Reasoning behind the plan structure"),
});

/**
 * Type for the plan creation
 */
export type PlanCreation = z.infer<typeof planCreationSchema>;

/**
 * Options for plan execution
 */
export interface PlanExecutionOptions {
	maxRetries?: number;
	stepTimeoutMs?: number;
	totalTimeoutMs?: number;
	onProgress?: (progress: number, totalSteps: number) => void;
}

/**
 * Step execution context to track state during plan execution
 */
interface StepExecutionContext {
	task: string;
	steps: string[];
	completedSteps: { step: string; result: string }[];
	context: string;
	successfulSteps: number;
	failedSteps: number;
	startTime: number;
}

/**
 * Agent with planning capabilities
 */
export class PlanningAgent extends Agent {
	/**
	 * Creates a new planning agent
	 *
	 * @param config - Agent configuration
	 * @param dependencies - Agent dependencies
	 */
	constructor(config: AgentConfig, dependencies: AgentDependencies) {
		super(config, dependencies);
	}

	/**
	 * Create a plan for complex tasks using OpenAI structured output
	 *
	 * @param task - Task description to plan
	 * @returns Array of steps to execute
	 */
	async createPlan(task: string): Promise<string[]> {
		const planningPrompt = this.generatePlanningPrompt(task);

		try {
			// Use the OpenAI client to create a structured plan
			const planResult = await this.processQueryWithSchema<PlanCreation>(
				planningPrompt,
				planCreationSchema,
				// Swallow messages during planning for cleaner output
				async () => {},
			);

			if (planResult && planResult.steps.length > 0) {
				return planResult.steps;
			} else {
				// Fallback if the schema-based approach fails
				return this.createSimplePlan(task);
			}
		} catch (error) {
			console.error("Error creating structured plan:", error);
			// Fallback to simple plan creation
			return this.createSimplePlan(task);
		}
	}

	/**
	 * Generate a planning prompt for the given task
	 *
	 * @param task - Task to create a plan for
	 * @returns Formatted planning prompt
	 */
	private generatePlanningPrompt(task: string): string {
		return `
Task: ${task}

Break down this task into a sequence of concrete steps that can be executed in order.
Each step should be a single action, not a complex or multi-part step.
Provide a detailed reasoning of your approach to this task.
`;
	}

	/**
	 * Create a simple plan as a fallback
	 *
	 * @param task - Task description
	 * @returns Array of steps
	 */
	private async createSimplePlan(task: string): Promise<string[]> {
		const simplePlanPrompt = this.generateSimplePlanPrompt(task);

		try {
			const planResult = await this.processQueryWithSchema<{ steps: string[] }>(
				simplePlanPrompt,
				z.object({
					steps: z.array(z.string()),
				}),
				async () => {}, // Silent callback
			);

			if (planResult && planResult.steps.length > 0) {
				return planResult.steps;
			}
		} catch (error) {
			console.error("Error creating simple plan:", error);
		}

		// Last resort fallback
		return this.createFallbackPlan();
	}

	/**
	 * Generate a prompt for simple plan creation
	 *
	 * @param task - Task to create a plan for
	 * @returns Formatted planning prompt
	 */
	private generateSimplePlanPrompt(task: string): string {
		return `
Task: ${task}

Break down this task into a sequence of concrete steps that can be executed in order.
Each step should be a single action, not a complex or multi-part step.
Output only the steps, one per line, numbered from 1.
`;
	}

	/**
	 * Create a fallback plan as last resort
	 *
	 * @returns Generic step list
	 */
	private createFallbackPlan(): string[] {
		return [
			"Research the task",
			"Analyze the information",
			"Execute the primary action",
			"Verify the results",
		];
	}

	/**
	 * Execute a plan step by step with schema and progress tracking
	 *
	 * @param task - Task description
	 * @param onMessage - Message callback
	 * @param options - Execution options
	 * @returns Plan summary
	 */
	async executePlanWithSchema(
		task: string,
		onMessage: (message: Message) => void | Promise<void>,
		options?: PlanExecutionOptions,
	): Promise<PlanSummary> {
		const startTime = Date.now();

		try {
			// Create a plan
			const steps = await this.createPlan(task);

			// Send plan creation message
			await this.sendPlanCreationMessage(task, steps, onMessage);

			// Initialize execution context
			const context: StepExecutionContext = {
				task,
				steps,
				completedSteps: [],
				context: "",
				successfulSteps: 0,
				failedSteps: 0,
				startTime,
			};

			// Execute each step
			for (let i = 0; i < steps.length; i++) {
				const step = steps[i];
				const stepNumber = i + 1;

				// Report progress
				this.reportProgress(i, steps.length, options);

				// Execute the step
				const timedOut = await this.executeStep(
					step,
					stepNumber,
					context,
					onMessage,
					options,
				);

				// Check if execution timed out
				if (timedOut) {
					return this.createPartialSummary(context, onMessage);
				}
			}

			// Create the final summary
			return this.createFinalSummary(context, onMessage);
		} catch (error) {
			console.error("Error executing plan:", error);
			return this.createErrorSummary(error, startTime, onMessage);
		}
	}

	/**
	 * Send the initial plan creation message
	 *
	 * @param task - Task being executed
	 * @param steps - Plan steps
	 * @param onMessage - Message callback
	 */
	private async sendPlanCreationMessage(
		task: string,
		steps: string[],
		onMessage: (message: Message) => void | Promise<void>,
	): Promise<void> {
		const planCreationMessage: Message = {
			role: "assistant",
			content:
				`I've created a plan with ${steps.length} steps to accomplish: ${task}\n\n` +
				steps.map((step, i) => `${i + 1}. ${step}`).join("\n"),
		};
		await onMessage(planCreationMessage);
	}

	/**
	 * Report progress to the progress callback if provided
	 *
	 * @param currentStep - Current step index
	 * @param totalSteps - Total steps count
	 * @param options - Execution options
	 */
	private reportProgress(
		currentStep: number,
		totalSteps: number,
		options?: PlanExecutionOptions,
	): void {
		if (options?.onProgress) {
			options.onProgress(currentStep, totalSteps);
		}
	}

	/**
	 * Execute a single step of the plan
	 *
	 * @param step - Step to execute
	 * @param stepNumber - Step number (1-based)
	 * @param context - Execution context
	 * @param onMessage - Message callback
	 * @param options - Execution options
	 * @returns Whether the execution timed out
	 */
	private async executeStep(
		step: string,
		stepNumber: number,
		context: StepExecutionContext,
		onMessage: (message: Message) => void | Promise<void>,
		options?: PlanExecutionOptions,
	): Promise<boolean> {
		// Create step query
		const query = this.createStepQuery(step, stepNumber, context);

		try {
			// Execute the step with timeout if specified
			const result = await this.executeStepWithTimeout(
				query,
				onMessage,
				options?.stepTimeoutMs,
			);

			// Process step result
			this.processStepResult(step, stepNumber, result, context);
		} catch (error) {
			// Handle step execution error
			await this.handleStepError(step, stepNumber, error, context, onMessage);
		}

		// Check if total execution time exceeds timeout
		if (options?.totalTimeoutMs && Date.now() - context.startTime > options.totalTimeoutMs) {
			await this.sendTimeoutMessage(
				context.steps.length,
				stepNumber,
				options.totalTimeoutMs,
				onMessage,
			);

			return true; // Timed out
		}

		return false; // Did not time out
	}

	/**
	 * Create the query for a step
	 *
	 * @param step - Step to execute
	 * @param stepNumber - Step number (1-based)
	 * @param context - Execution context
	 * @returns Formatted query for the step
	 */
	private createStepQuery(
		step: string,
		stepNumber: number,
		context: StepExecutionContext,
	): string {
		return `
${context.context ? `Previous progress:\n${context.context}\n\n` : ""}
Overall task: ${context.task}
Current step (${stepNumber}/${context.steps.length}): ${step}

Please execute this specific step only.
`;
	}

	/**
	 * Execute a step with timeout if specified
	 *
	 * @param query - Step query
	 * @param onMessage - Message callback
	 * @param timeoutMs - Timeout in milliseconds
	 * @returns Step response or null if timed out
	 */
	private async executeStepWithTimeout(
		query: string,
		onMessage: (message: Message) => void | Promise<void>,
		timeoutMs?: number,
	): Promise<StepResponse | null> {
		// Execute the step
		const stepPromise = this.processQueryWithSchema<StepResponse>(
			query,
			stepResponseSchema,
			async (message: Message) => {
				await onMessage(message);
			},
		);

		// Apply timeout if specified
		if (timeoutMs) {
			const timeoutPromise = new Promise<null>((resolve) => {
				setTimeout(() => resolve(null), timeoutMs);
			});

			const result = await Promise.race([stepPromise, timeoutPromise]);
			if (result === null) {
				throw new Error(`Step execution timed out after ${timeoutMs}ms`);
			}
			return result;
		}

		return stepPromise;
	}

	/**
	 * Process the result of a step execution
	 *
	 * @param step - Step that was executed
	 * @param stepNumber - Step number (1-based)
	 * @param result - Step execution result
	 * @param context - Execution context
	 */
	private processStepResult(
		step: string,
		stepNumber: number,
		result: StepResponse | null,
		context: StepExecutionContext,
	): void {
		if (result) {
			// Update context with result from this step
			const stepResult = result.response;
			context.context += `Step ${stepNumber}: ${step}\nResult: ${stepResult}\n\n`;

			// Add to completed steps
			context.completedSteps.push({
				step,
				result: stepResult,
			});

			// Update metrics
			if (result.status === "success") {
				context.successfulSteps++;
			} else if (result.status === "failure") {
				context.failedSteps++;
			}
		} else {
			// Handle null result
			context.context += `Step ${stepNumber}: ${step}\nResult: Failed to execute step\n\n`;
			context.completedSteps.push({
				step,
				result: "Failed to execute step",
			});
			context.failedSteps++;
		}
	}

	/**
	 * Handle an error during step execution
	 *
	 * @param step - Step that failed
	 * @param stepNumber - Step number (1-based)
	 * @param error - Error that occurred
	 * @param context - Execution context
	 * @param onMessage - Message callback
	 */
	private async handleStepError(
		step: string,
		stepNumber: number,
		error: unknown,
		context: StepExecutionContext,
		onMessage: (message: Message) => void | Promise<void>,
	): Promise<void> {
		const errorMessage = error instanceof Error ? error.message : String(error);

		// Update context
		context.context += `Step ${stepNumber}: ${step}\nResult: Error - ${errorMessage}\n\n`;

		// Update metrics
		context.completedSteps.push({
			step,
			result: `Error - ${errorMessage}`,
		});
		context.failedSteps++;

		// Notify about the error
		await onMessage({
			role: "assistant",
			content: `Error executing step ${stepNumber}: ${errorMessage}`,
		});
	}

	/**
	 * Send a timeout message
	 *
	 * @param totalSteps - Total number of steps
	 * @param completedSteps - Number of completed steps
	 * @param timeoutMs - Timeout that was reached
	 * @param onMessage - Message callback
	 */
	private async sendTimeoutMessage(
		totalSteps: number,
		completedSteps: number,
		timeoutMs: number,
		onMessage: (message: Message) => void | Promise<void>,
	): Promise<void> {
		await onMessage({
			role: "assistant",
			content: `Plan execution timed out after ${timeoutMs}ms. Completed ${completedSteps} of ${totalSteps} steps.`,
		});
	}

	/**
	 * Create a partial summary for an interrupted plan
	 *
	 * @param context - Execution context
	 * @param onMessage - Message callback
	 * @returns Partial plan summary
	 */
	private async createPartialSummary(
		context: StepExecutionContext,
		onMessage: (message: Message) => void | Promise<void>,
	): Promise<PlanSummary> {
		const partialSummary: PlanSummary = {
			summary: `Partial execution of task due to timeout: ${context.task}. Completed ${context.completedSteps.length} of ${context.steps.length} steps.`,
			steps: context.completedSteps,
			status: "partial",
			metrics: {
				totalSteps: context.steps.length,
				successfulSteps: context.successfulSteps,
				failedSteps: context.failedSteps,
				executionTimeMs: Date.now() - context.startTime,
			},
		};

		// Send the summary message
		const summaryMessage: Message = {
			role: "assistant",
			content: JSON.stringify(partialSummary, null, 2),
		};

		await onMessage(summaryMessage);
		return partialSummary;
	}

	/**
	 * Create the final summary for a completed plan
	 *
	 * @param context - Execution context
	 * @param onMessage - Message callback
	 * @returns Final plan summary
	 */
	private async createFinalSummary(
		context: StepExecutionContext,
		onMessage: (message: Message) => void | Promise<void>,
	): Promise<PlanSummary> {
		// Calculate final status
		const status =
			context.failedSteps === 0
				? "completed"
				: context.successfulSteps > 0
					? "partial"
					: "failed";

		// Create the summary
		const summary: PlanSummary = {
			summary: `Task ${status}: ${context.task}. Executed ${context.steps.length} steps with ${context.successfulSteps} successful and ${context.failedSteps} failed.`,
			steps: context.completedSteps,
			status: status as any,
			metrics: {
				totalSteps: context.steps.length,
				successfulSteps: context.successfulSteps,
				failedSteps: context.failedSteps,
				executionTimeMs: Date.now() - context.startTime,
			},
		};

		// Send the final summary message
		const summaryMessage: Message = {
			role: "assistant",
			content: JSON.stringify(summary, null, 2),
		};

		await onMessage(summaryMessage);
		return summary;
	}

	/**
	 * Create an error summary for a failed plan
	 *
	 * @param error - Error that occurred
	 * @param startTime - Time the execution started
	 * @param onMessage - Message callback
	 * @returns Error plan summary
	 */
	private async createErrorSummary(
		error: unknown,
		startTime: number,
		onMessage: (message: Message) => void | Promise<void>,
	): Promise<PlanSummary> {
		const errorMessage = error instanceof Error ? error.message : String(error);

		// Create a failure summary
		const failureSummary: PlanSummary = {
			summary: `Error executing plan: ${errorMessage}`,
			steps: [],
			status: "failed",
			metrics: {
				totalSteps: 0,
				successfulSteps: 0,
				failedSteps: 0,
				executionTimeMs: Date.now() - startTime,
			},
		};

		// Send the error message
		const errorResponseMessage: Message = {
			role: "assistant",
			content: JSON.stringify(failureSummary, null, 2),
		};

		await onMessage(errorResponseMessage);
		return failureSummary;
	}
}
