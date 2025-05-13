/**
 * Multi-agent orchestration system
 * Refactored for improved readability and maintainability
 */
import { Agent } from "./agent";
import { Message } from "../core/types";
import { EventBus } from "../core/events";
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
}

/**
 * Step execution result
 */
export interface StepExecutionResult {
	messages: Message[];
	result: any | null;
}

/**
 * Multi-agent orchestration for complex workflows
 */
export class AgentOrchestrator {
	private agents: Map<string, Agent> = new Map();
	private eventBus: EventBus;

	constructor(eventBus: EventBus = new EventBus()) {
		this.eventBus = eventBus;
	}

	/**
	 * Register an agent with the orchestrator
	 */
	registerAgent(id: string, agent: Agent): void {
		this.agents.set(id, agent);
	}

	/**
	 * Get an agent by ID
	 */
	getAgent(id: string): Agent | undefined {
		return this.agents.get(id);
	}

	/**
	 * Execute a workflow with multiple agents using schemas
	 */
	async executeWorkflow<T = BasicResponse>(
		workflowSteps: Array<WorkflowStep<T>>,
		defaultSchema: ZodSchema<any> = basicResponseSchema,
	): Promise<Map<string, StepExecutionResult>> {
		const completedSteps = new Map<string, StepExecutionResult>();

		// Process steps until all are completed
		while (completedSteps.size < workflowSteps.length) {
			// Step 1: Find eligible steps to execute in this iteration
			const eligibleSteps = this.findEligibleSteps(workflowSteps, completedSteps);

			// Step 2: Verify we have steps to execute
			this.validateEligibleSteps(eligibleSteps);

			// Step 3: Execute all eligible steps in parallel
			await this.executeEligibleSteps(eligibleSteps, completedSteps, defaultSchema);
		}

		return completedSteps;
	}

	/**
	 * Find steps that are eligible for execution
	 */
	private findEligibleSteps<T>(
		workflowSteps: Array<WorkflowStep<T>>,
		completedSteps: Map<string, StepExecutionResult>,
	): Array<WorkflowStep<T>> {
		return workflowSteps.filter((step) => {
			// Check if the step is not completed and its dependencies are satisfied
			return (
				!completedSteps.has(step.agentId) &&
				(!step.dependsOn || completedSteps.has(step.dependsOn))
			);
		});
	}

	/**
	 * Validate that there are eligible steps to execute
	 */
	private validateEligibleSteps<T>(eligibleSteps: Array<WorkflowStep<T>>): void {
		if (eligibleSteps.length === 0) {
			throw new Error("Circular dependency or missing steps in workflow");
		}
	}

	/**
	 * Execute all eligible steps in parallel
	 */
	private async executeEligibleSteps<T>(
		eligibleSteps: Array<WorkflowStep<T>>,
		completedSteps: Map<string, StepExecutionResult>,
		defaultSchema: ZodSchema<any>,
	): Promise<void> {
		await Promise.all(
			eligibleSteps.map(async (step) => {
				// Execute the individual step
				const result = await this.executeWorkflowStep(step, completedSteps, defaultSchema);

				// Store the result
				completedSteps.set(step.agentId, result);
			}),
		);
	}

	/**
	 * Execute a single workflow step
	 */
	private async executeWorkflowStep<T>(
		step: WorkflowStep<T>,
		completedSteps: Map<string, StepExecutionResult>,
		defaultSchema: ZodSchema<any>,
	): Promise<StepExecutionResult> {
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

		// Return the execution result
		return {
			messages: stepMessages,
			result,
		};
	}

	/**
	 * Get the agent for a step, throwing an error if not found
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
