/**
 * Example of creating an agent with schema support
 */
import { ToolExecutor } from "../tools/tool-executor";
import { SimpleMemorySystem } from "../memory/simple-memory";
import { EventBus } from "../core/events";
import { LoggingMiddleware } from "../core/middleware";
import { AgentBuilder } from "../agent/agent-builder";
import { Agent } from "../agent/agent";
import { AgentEventType } from "../core/events";
import { ToolCall } from "../core/types";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { calculatorTool } from "../tools/calculator-tool";
import { weatherTool } from "../tools/weather-tool";

// Import or create the OpenAI client service
const createOpenAIClient = (): OpenAIClientService => {
	// This implementation will depend on your actual OpenAI client setup
	// Return your properly initialized OpenAIClientService

	// For example purposes, let's assume an implementation like this:
	// const openaiConfigService = new OpenAIConfigService();
	// const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
	// return new OpenAIClientService(openaiClient, openaiConfigService);

	// Mock implementation - replace with your actual code
	return {} as OpenAIClientService;
};

/**
 * Example function to create an agent
 */
export async function createExampleAgent(): Promise<Agent> {
	// Create the language model
	// const llm = createLanguageModel({
	//     provider: "openai",
	//     model: "gpt-4o",
	//     apiKey: process.env.OPENAI_API_KEY || "",
	// });

	// Create the OpenAI client service
	const openaiClient = createOpenAIClient();

	// Create the tool executor with our tools
	const toolExecutor = new ToolExecutor([calculatorTool, weatherTool]);

	// Create the memory system
	const memory = new SimpleMemorySystem();

	// Create the event bus
	const eventBus = new EventBus();

	// Set up logging middleware
	const loggingMiddleware = new LoggingMiddleware();

	// Build the agent
	const agent = new AgentBuilder("MathWeatherAssistant")
		.withDescription("An assistant that can perform calculations and check the weather")
		// .withLanguageModel(llm)
		.withToolExecutor(toolExecutor)
		.withMemory(memory)
		.withEventBus(eventBus)
		.withMiddleware(loggingMiddleware)
		.withOpenAIClient(openaiClient)
		.build();

	// Subscribe to events
	agent.on<ToolCall>(AgentEventType.TOOL_CALLED, (event) => {
		console.log(`Tool called: ${event.payload.name}`);
	});

	agent.on(AgentEventType.TOOL_RESULT, (event) => {
		console.log(`Tool result received: ${JSON.stringify((event.payload as any).result)}`);
	});

	return agent;
}
