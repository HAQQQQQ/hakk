/**
 * Example of running an agent with schema
 */
import { createExampleAgent } from "./create-agent";
import { Message } from "../core/types";
import { z } from "zod";

/**
 * Schema for assistant responses
 */
export const exampleResponseSchema = z.object({
	answer: z.string().describe("The answer to the user's question"),
	confidence: z.number().min(0).max(1).describe("Confidence level in the answer"),
	sources: z.array(z.string()).optional().describe("Sources of information used"),
	calculations: z.record(z.string(), z.any()).optional().describe("Any calculations performed"),
	weatherData: z
		.object({
			location: z.string().describe("Location of the weather data"),
			temperature: z.number().describe("Temperature in the requested unit"),
			condition: z.string().describe("Weather condition (e.g., sunny, cloudy, rainy)"),
			unit: z.enum(["celsius", "fahrenheit"]).describe("Temperature unit"),
		})
		.optional()
		.describe("Weather information if requested"),
});

/**
 * Type for the example response
 */
export type ExampleResponse = z.infer<typeof exampleResponseSchema>;

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

		// Process the query with schema
		const messages: Message[] = [];
		const result = await agent.processQueryWithSchema<ExampleResponse>(
			query,
			exampleResponseSchema,
			async (message: Message) => {
				messages.push(message);
				if (message.role === "assistant") {
					try {
						// Try to parse as JSON if possible
						const content = JSON.parse(message.content);
						console.log(`Assistant: ${JSON.stringify(content, null, 2)}`);
					} catch {
						// If not valid JSON, just show the content
						console.log(`Assistant: ${message.content}`);
					}
				} else if (message.role === "tool") {
					console.log(`[Tool ${message.name}]: ${message.content}`);
				}
			},
		);

		if (result) {
			console.log("\n--- Result Summary ---");
			if (result.calculations) {
				console.log(`Calculation result: ${Object.values(result.calculations)[0]}`);
			}
			if (result.weatherData) {
				console.log(
					`Weather in ${result.weatherData.location}: ${result.weatherData.temperature}°${result.weatherData.unit.charAt(0).toUpperCase()} (${result.weatherData.condition})`,
				);
			}
			console.log(`Confidence: ${result.confidence * 100}%`);
		}

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
