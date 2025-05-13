// /**
//  * Example of running an agent with schema (optimized)
//  */
// import { createExampleAgent } from "./create-agent";
// import { Message } from "../core/types";
// import { z } from "zod";
// import { Agent } from "../agent/agent";

// /**
//  * Schema for assistant responses
//  */
// export const exampleResponseSchema = z.object({
// 	answer: z.string().describe("The answer to the user's question"),
// 	confidence: z.number().min(0).max(1).describe("Confidence level in the answer"),
// 	sources: z.array(z.string()).optional().describe("Sources of information used"),
// 	calculations: z.record(z.string(), z.any()).optional().describe("Any calculations performed"),
// 	weatherData: z
// 		.object({
// 			location: z.string().describe("Location of the weather data"),
// 			temperature: z.number().describe("Temperature in the requested unit"),
// 			condition: z.string().describe("Weather condition (e.g., sunny, cloudy, rainy)"),
// 			unit: z.enum(["celsius", "fahrenheit"]).describe("Temperature unit"),
// 		})
// 		.optional()
// 		.describe("Weather information if requested"),
// });

// /**
//  * Type for the example response
//  */
// export type ExampleResponse = z.infer<typeof exampleResponseSchema>;

// /**
//  * Options for running the agent example
//  */
// interface RunAgentOptions {
// 	query?: string;
// 	schema?: z.ZodSchema<any>;
// 	verbose?: boolean;
// 	timeoutMs?: number;
// }

// /**
//  * Run the agent with a query and schema
//  */
// export async function runAgentWithSchema<T>(
// 	agent: Agent,
// 	query: string,
// 	schema: z.ZodSchema<T>,
// 	options: { verbose?: boolean; timeoutMs?: number } = {},
// ): Promise<{ result: T | null; messages: Message[] }> {
// 	const messages: Message[] = [];

// 	// Create a promise that will be resolved when processing is complete
// 	let resolvePromise: (value: T | null) => void;
// 	const resultPromise = new Promise<T | null>((resolve) => {
// 		resolvePromise = resolve;
// 	});

// 	// Create a timeout promise if timeoutMs is provided
// 	let timeoutId: NodeJS.Timeout | undefined;
// 	if (options.timeoutMs) {
// 		timeoutId = setTimeout(() => {
// 			console.log(`Query execution timed out after ${options.timeoutMs}ms`);
// 			resolvePromise(null);
// 		}, options.timeoutMs);
// 	}

// 	// Process the query
// 	try {
// 		const result = await agent.processQueryWithSchema<T>(
// 			query,
// 			schema,
// 			async (message: Message) => {
// 				messages.push(message);

// 				if (options.verbose) {
// 					if (message.role === "assistant") {
// 						try {
// 							// Try to parse and pretty-print as JSON
// 							const content = JSON.parse(message.content);
// 							console.log(`Assistant: ${JSON.stringify(content, null, 2)}`);
// 						} catch {
// 							// If not valid JSON, just show the content
// 							console.log(`Assistant: ${message.content}`);
// 						}
// 					} else if (message.role === "tool") {
// 						console.log(`[Tool ${message.name}]: ${message.content}`);
// 					} else {
// 						console.log(`${message.role.toUpperCase()}: ${message.content}`);
// 					}
// 				}
// 			},
// 		);

// 		// Clear the timeout if it was set
// 		if (timeoutId) {
// 			clearTimeout(timeoutId);
// 		}

// 		return { result, messages };
// 	} catch (error) {
// 		// Clear the timeout if it was set
// 		if (timeoutId) {
// 			clearTimeout(timeoutId);
// 		}

// 		console.error("Error running agent:", error);
// 		return { result: null, messages };
// 	}
// }

// /**
//  * Example of using the agent in an application
//  */
// export async function runAgentExample(options: RunAgentOptions = {}): Promise<void> {
// 	try {
// 		// Create the agent
// 		const agent = await createExampleAgent();
// 		console.log("Agent created successfully!");

// 		// Set up the query and schema
// 		const query =
// 			options.query || "What's 135 * 28? And after that, what's the weather in Paris?";
// 		const schema = options.schema || exampleResponseSchema;

// 		console.log(`User: ${query}`);

// 		// Process the query with schema
// 		const { result, messages } = await runAgentWithSchema(agent, query, schema, {
// 			verbose: options.verbose !== false,
// 			timeoutMs: options.timeoutMs || 30000,
// 		});

// 		// Display the result
// 		if (result) {
// 			console.log("\n--- Result Summary ---");

// 			// Handle calculation results
// 			if ("calculations" in result && result.calculations) {
// 				const calculations = result.calculations as Record<string, any>;
// 				Object.entries(calculations).forEach(([key, value]) => {
// 					console.log(`${key}: ${value}`);
// 				});
// 			}

// 			// Handle weather data
// 			if ("weatherData" in result && result.weatherData) {
// 				const weather = result.weatherData as any;
// 				console.log(
// 					`Weather in ${weather.location}: ${weather.temperature}°${weather.unit.charAt(0).toUpperCase()} (${weather.condition})`,
// 				);
// 			}

// 			// Handle confidence level
// 			if ("confidence" in result && typeof result.confidence === "number") {
// 				console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
// 			}

// 			// Handle answer field
// 			if ("answer" in result && typeof result.answer === "string") {
// 				console.log(`Answer: ${result.answer}`);
// 			}
// 		} else {
// 			console.log("\n--- No result returned ---");
// 		}

// 		console.log("Agent example completed!");
// 	} catch (error) {
// 		console.error("Error running agent example:", error);
// 	}
// }

// /**
//  * Run the example if called directly
//  */
// if (require.main === module) {
// 	runAgentExample().catch(console.error);
// }
