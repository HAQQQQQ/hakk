/**
 * Example of running an agent
 */
import { createExampleAgent } from "./create-agent";
import { Message } from "../core/types";

/**
 * Example of using the agent in an application
 */
export async function runAgentExample(): Promise<void> {
	try {
		const agent = await createExampleAgent();

		console.log("Agent created successfully!");

		// Example query that might trigger tool usage
		const query = "What's 135 * 28? And after that, what's the weather in Paris?";
		console.log(`User: ${query}`);

		// Process the query and stream responses
		const messages: Message[] = [];
		await agent.processQuery(query, async (message: Message) => {
			messages.push(message);
			if (message.role === "assistant") {
				console.log(`Assistant: ${message.content}`);
			} else if (message.role === "tool") {
				console.log(`[Tool ${message.name}]: ${message.content}`);
			}
		});

		console.log("Agent example completed!");
	} catch (error) {
		console.error("Error running agent example:", error);
	}
}

/**
 * Run the example if called directly
 */
if (require.main === module) {
	runAgentExample().catch(console.error);
}
