/**
 * Planning agent implementation
 */
import { Message } from "../core/types";
import { Agent, AgentConfig, AgentDependencies } from "./agent";
import { LanguageModelInterface } from "../llm/interfaces";

/**
 * Agent with planning capabilities
 */
export class PlanningAgent extends Agent {
	private planningLLM: LanguageModelInterface;

	constructor(
		config: AgentConfig,
		dependencies: AgentDependencies,
		planningLLM: LanguageModelInterface,
	) {
		super(config, dependencies);
		this.planningLLM = planningLLM;
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
		const generator = this.planningLLM.generateResponse(planningMessages);

		for await (const chunk of generator) {
			if (typeof chunk === "string") {
				planText += chunk;
			}
		}

		// Parse the plan into steps
		const steps = planText
			.split("\n")
			.filter((line) => /^\d+\./.test(line.trim()))
			.map((line) => line.replace(/^\d+\.\s*/, "").trim());

		return steps;
	}

	/**
	 * Execute a plan step by step
	 */
	async *executePlan(task: string): AsyncGenerator<Message> {
		try {
			// Create a plan
			const steps = await this.createPlan(task);

			// Context for the execution
			let context = "";

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

				// Execute the step using the callback-based approach
				const stepResults: Message[] = [];
				await super.processQuery(query, async (message: Message) => {
					stepResults.push(message);
				});

				// Yield each message after processing
				for (const message of stepResults) {
					yield message;
				}

				// Extract result from this step
				const lastMessage = stepResults[stepResults.length - 1];

				// Update context with result from this step
				context += `Step ${i + 1}: ${step}\nResult: ${lastMessage.content}\n\n`;
			}

			// Final summary
			yield {
				role: "assistant",
				content: `Task completed: ${task}\n\nSummary of steps:\n${context}`,
			};
		} catch (error) {
			console.error("Error executing plan:", error);

			yield {
				role: "assistant",
				content: `Error executing plan: ${error.message}`,
			};
		}
	}
}
