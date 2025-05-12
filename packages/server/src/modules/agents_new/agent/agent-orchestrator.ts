/**
 * Multi-agent orchestration system
 */
import { Agent } from "./agent";
import { Message } from "../core/types";
import { EventBus } from "../core/events";

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
	 * Execute a workflow with multiple agents
	 */
	async executeWorkflow(
		workflowSteps: Array<{
			agentId: string;
			query: string;
			dependsOn?: string;
		}>,
	): Promise<Map<string, Message[]>> {
		const completedSteps = new Map<string, Message[]>();

		while (completedSteps.size < workflowSteps.length) {
			const eligibleSteps = workflowSteps.filter((step) => {
				// Check if the step is not completed and its dependencies are satisfied
				return (
					!completedSteps.has(step.agentId) &&
					(!step.dependsOn || completedSteps.has(step.dependsOn))
				);
			});

			await Promise.all(
				eligibleSteps.map(async (step) => {
					const agent = this.agents.get(step.agentId);
					if (!agent) {
						throw new Error(`Agent with ID ${step.agentId} not found`);
					}

					const stepResults: Message[] = [];

					// Use the callback-based approach to process the query
					await agent.processQuery(step.query, async (message: Message) => {
						stepResults.push(message);
					});

					// Mark the step as completed
					completedSteps.set(step.agentId, stepResults);
				}),
			);
		}

		return completedSteps;
	}
}
