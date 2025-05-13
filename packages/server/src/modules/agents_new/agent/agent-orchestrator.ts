/**
 * Multi-agent orchestration system
 * Optimized for improved readability and maintainability
 */
import { Agent } from "./agent";
import { Message } from "../core/types";
import { EventBus, AgentEventType } from "../core/events";
import { z, ZodSchema } from "zod";

/**
 * Generic schema for basic responses
 */
export const basicResponseSchema = z.object({
	message: z.string().describe("Response message from the agent"),
	details: z.any().optional().describe("Additional details or data"),
});

/**
 * Type for the basic response
 */
export type BasicResponse = z.infer<typeof basicResponseSchema>;

/**
 * Workflow step definition
 */
export interface WorkflowStep<T = any> {
	agentId: string;
	query: string;
	schema?: ZodSchema<T>;
	dependsOn?: string;
	timeoutMs?: number; // Optional timeout for the step
	maxRetries?: number; // Optional retry count for failed steps
}

/**
 * Step execution result
 */
export interface StepExecutionResult {
	messages: Message[];
	result: any | null;
	executionTimeMs?: number; // Execution time in milliseconds
	success: boolean; // Whether the step completed successfully
}

/**
 * Workflow execution options
 */
export interface WorkflowExecutionOptions {
	defaultTimeout?: number; // Default timeout for all steps
	defaultRetries?: number; // Default retry count for all steps
	parallelExecution?: boolean; // Whether to execute eligible steps in parallel
	abortOnFailure?: boolean; // Whether to abort the workflow on step failure
	logProgress?: boolean; // Whether to log workflow progress
}

/**
 * Multi-agent orchestration for complex workflows
 */
export class AgentOrchestrator {
	private agents: Map<string, Agent> = new Map();
	private eventBus: EventBus;
	private defaultOptions: WorkflowExecutionOptions = {
		defaultTimeout: 30000, // 30 seconds
		defaultRetries: 1, // 1 retry
		parallelExecution: true, // Execute in parallel by default
		abortOnFailure: false, // Continue on step failure by default
		logProgress: true, // Log progress by default
	};

	/**
	 * Create a new agent orchestrator
	 *
	 * @param eventBus - Optional event bus to use
	 * @param options - Optional default options for workflow execution
	 */
	constructor(eventBus: EventBus = new EventBus(), options?: Partial<WorkflowExecutionOptions>) {
		this.eventBus = eventBus;
		if (options) {
			this.defaultOptions = { ...this.defaultOptions, ...options };
		}
	}

	/**
	 * Register an agent with the orchestrator
	 *
	 * @param id - Identifier for the agent
	 * @param agent - Agent instance to register
	 */
	registerAgent(id: string, agent: Agent): void {
		this.agents.set(id, agent);
	}

	/**
	 * Get an agent by ID
	 *
	 * @param id - Identifier of the agent to get
	 * @returns Agent instance or undefined if not found
	 */
	getAgent(id: string): Agent | undefined {
		return this.agents.get(id);
	}

	/**
	 * Execute a workflow with multiple agents using schemas
	 *
	 * @param workflowSteps - Array of workflow steps to execute
	 * @param defaultSchema - Default schema to use for steps without a schema
	 * @param options - Options for workflow execution
	 * @returns Map of step results by agent ID
	 */
	async executeWorkflow<T = BasicResponse>(
		workflowSteps: Array<WorkflowStep<T>>,
		defaultSchema: ZodSchema<any> = basicResponseSchema,
		options?: Partial<WorkflowExecutionOptions>,
	): Promise<Map<string, StepExecutionResult>> {
		// Merge options with defaults
		const execOptions: WorkflowExecutionOptions = {
			...this.defaultOptions,
			...(options || {}),
		};

		const completedSteps = new Map<string, StepExecutionResult>();
		const failedSteps = new Set<string>();

		// Process steps until all are completed or workflow is aborted
		while (completedSteps.size + failedSteps.size < workflowSteps.length) {
			// Step 1: Find eligible steps to execute in this iteration
			const eligibleSteps = this.findEligibleSteps(
				workflowSteps,
				completedSteps,
				failedSteps,
			);

			// Step 2: Verify we have steps to execute
			if (eligibleSteps.length === 0) {
				if (execOptions.logProgress) {
					console.log(
						`[Workflow] No eligible steps found. Completed: ${completedSteps.size}, Failed: ${failedSteps.size}`,
					);
				}

				if (completedSteps.size + failedSteps.size < workflowSteps.length) {
					throw new Error("Circular dependency or missing steps in workflow");
				}

				break;
			}

			if (execOptions.logProgress) {
				console.log(
					`[Workflow] Executing ${eligibleSteps.length} steps: ${eligibleSteps.map((s) => s.agentId).join(", ")}`,
				);
			}

			// Step 3: Execute eligible steps (in parallel or sequentially)
			if (execOptions.parallelExecution) {
				// Execute all eligible steps in parallel
				const results = await Promise.allSettled(
					eligibleSteps.map((step) =>
						this.executeWorkflowStepWithTimeout(
							step,
							completedSteps,
							defaultSchema,
							step.timeoutMs || execOptions.defaultTimeout!,
							step.maxRetries || execOptions.defaultRetries!,
						),
					),
				);

				// Process the results
				for (let i = 0; i < results.length; i++) {
					const result = results[i];
					const step = eligibleSteps[i];

					if (result.status === "fulfilled") {
						// Step completed successfully
						completedSteps.set(step.agentId, result.value);

						if (execOptions.logProgress) {
							console.log(`[Workflow] Step ${step.agentId} completed successfully`);
						}
					} else {
						// Step failed
						failedSteps.add(step.agentId);

						if (execOptions.logProgress) {
							console.error(
								`[Workflow] Step ${step.agentId} failed: ${result.reason}`,
							);
						}

						// Publish error event
						this.eventBus.publish({
							type: AgentEventType.ERROR,
							payload: {
								message: `Workflow step ${step.agentId} failed`,
								error: result.reason,
							},
							timestamp: Date.now(),
						});

						// Abort workflow if configured to do so
						if (execOptions.abortOnFailure) {
							throw new Error(
								`Workflow aborted due to step failure: ${step.agentId}`,
							);
						}
					}
				}
			} else {
				// Execute steps sequentially
				for (const step of eligibleSteps) {
					try {
						const result = await this.executeWorkflowStepWithTimeout(
							step,
							completedSteps,
							defaultSchema,
							step.timeoutMs || execOptions.defaultTimeout!,
							step.maxRetries || execOptions.defaultRetries!,
						);

						completedSteps.set(step.agentId, result);

						if (execOptions.logProgress) {
							console.log(`[Workflow] Step ${step.agentId} completed successfully`);
						}
					} catch (error) {
						failedSteps.add(step.agentId);

						if (execOptions.logProgress) {
							console.error(`[Workflow] Step ${step.agentId} failed:`, error);
						}

						// Publish error event
						this.eventBus.publish({
							type: AgentEventType.ERROR,
							payload: {
								message: `Workflow step ${step.agentId} failed`,
								error,
							},
							timestamp: Date.now(),
						});

						// Abort workflow if configured to do so
						if (execOptions.abortOnFailure) {
							throw new Error(
								`Workflow aborted due to step failure: ${step.agentId}`,
							);
						}
					}
				}
			}
		}

		return completedSteps;
	}

	/**
	 * Find steps that are eligible for execution
	 *
	 * @param workflowSteps - All workflow steps
	 * @param completedSteps - Map of completed steps
	 * @param failedSteps - Set of failed step IDs
	 * @returns Array of eligible steps
	 */
	private findEligibleSteps<T>(
		workflowSteps: Array<WorkflowStep<T>>,
		completedSteps: Map<string, StepExecutionResult>,
		failedSteps: Set<string>,
	): Array<WorkflowStep<T>> {
		return workflowSteps.filter((step) => {
			// Check if the step is not completed/failed and its dependencies are satisfied
			return (
				!completedSteps.has(step.agentId) &&
				!failedSteps.has(step.agentId) &&
				(!step.dependsOn || completedSteps.has(step.dependsOn))
			);
		});
	}

	/**
	 * Execute a workflow step with timeout and retry logic
	 *
	 * @param step - Workflow step to execute
	 * @param completedSteps - Map of completed steps
	 * @param defaultSchema - Default schema to use
	 * @param timeoutMs - Timeout in milliseconds
	 * @param maxRetries - Maximum number of retries
	 * @returns Step execution result
	 */
	private async executeWorkflowStepWithTimeout<T>(
		step: WorkflowStep<T>,
		completedSteps: Map<string, StepExecutionResult>,
		defaultSchema: ZodSchema<any>,
		timeoutMs: number,
		maxRetries: number,
	): Promise<StepExecutionResult> {
		let lastError: unknown;

		// Try to execute the step with retries
		for (let attempt = 0; attempt <= maxRetries; attempt++) {
			if (attempt > 0) {
				console.log(
					`[Workflow] Retrying step ${step.agentId} (attempt ${attempt} of ${maxRetries})`,
				);
			}

			try {
				// Create timeout promise
				const timeoutPromise = new Promise<never>((_, reject) => {
					setTimeout(() => {
						reject(new Error(`Step execution timed out after ${timeoutMs}ms`));
					}, timeoutMs);
				});

				// Create execution promise
				const executionPromise = this.executeWorkflowStep(
					step,
					completedSteps,
					defaultSchema,
				);

				// Race the promises
				const result = await Promise.race([executionPromise, timeoutPromise]);
				return result;
			} catch (error) {
				lastError = error;

				// If this was the last attempt, rethrow the error
				if (attempt === maxRetries) {
					throw error;
				}

				// Otherwise, wait before retrying
				await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
			}
		}

		// This should never happen due to the throw above
		throw lastError;
	}

	/**
	 * Execute a single workflow step
	 *
	 * @param step - Workflow step to execute
	 * @param completedSteps - Map of completed steps
	 * @param defaultSchema - Default schema to use
	 * @returns Step execution result
	 */
	private async executeWorkflowStep<T>(
		step: WorkflowStep<T>,
		completedSteps: Map<string, StepExecutionResult>,
		defaultSchema: ZodSchema<any>,
	): Promise<StepExecutionResult> {
		const startTime = Date.now();

		try {
			// Step 1: Get the agent
			const agent = this.getAgentForStep(step.agentId);

			// Step 2: Prepare the query (resolve dependencies)
			const resolvedQuery = this.prepareStepQuery(step, completedSteps);

			// Step 3: Execute the query with the appropriate schema
			const stepMessages: Message[] = [];
			const schema = step.schema || defaultSchema;

			const result = await agent.processQueryWithSchema(
				resolvedQuery,
				schema,
				async (message: Message) => {
					stepMessages.push(message);
				},
			);

			const executionTime = Date.now() - startTime;

			// Return the execution result
			return {
				messages: stepMessages,
				result,
				executionTimeMs: executionTime,
				success: true,
			};
		} catch (error) {
			const executionTime = Date.now() - startTime;

			// Rethrow the error after recording execution time
			throw Object.assign(error, { executionTimeMs: executionTime });
		}
	}

	/**
	 * Get the agent for a step, throwing an error if not found
	 *
	 * @param agentId - ID of the agent to get
	 * @returns Agent instance
	 * @throws Error if agent not found
	 */
	private getAgentForStep(agentId: string): Agent {
		const agent = this.agents.get(agentId);
		if (!agent) {
			throw new Error(`Agent with ID ${agentId} not found`);
		}
		return agent;
	}

	/**
	 * Prepare the query for a step, resolving any dependencies
	 *
	 * @param step - Workflow step
	 * @param completedSteps - Map of completed steps
	 * @returns Resolved query string
	 */
	private prepareStepQuery(
		step: WorkflowStep<any>,
		completedSteps: Map<string, StepExecutionResult>,
	): string {
		let query = step.query;

		// If this step depends on another, substitute results
		if (step.dependsOn && completedSteps.has(step.dependsOn)) {
			query = this.resolveDependencyInQuery(query, completedSteps.get(step.dependsOn)!);
		}

		return query;
	}

	/**
	 * Resolve dependency placeholders in a query
	 *
	 * @param query - Query string with placeholders
	 * @param dependencyResult - Result of the dependency step
	 * @returns Resolved query string
	 */
	private resolveDependencyInQuery(query: string, dependencyResult: StepExecutionResult): string {
		const prevResult = dependencyResult.result;

		// Replace ${previousResult} placeholder with actual result
		if (prevResult) {
			return query.replace(
				"${previousResult}",
				typeof prevResult === "object" ? JSON.stringify(prevResult) : String(prevResult),
			);
		}

		return query;
	}
}
