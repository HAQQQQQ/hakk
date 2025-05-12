/**
 * Example of creating an agent
 */
import { createLanguageModel } from "../llm/factory";
import { ToolExecutor } from "../tools/tool-executor";
import { SimpleMemorySystem } from "../memory/simple-memory";
import { EventBus } from "../core/events";
import { LoggingMiddleware } from "../core/middleware";
import { AgentBuilder } from "../agent/agent-builder";
import { Agent } from "../agent/agent";
import { AgentEventType } from "../core/events";
import { ToolCall } from "../core/types";
import { calculatorTool } from "../tools/calculator-tool";
import { weatherTool } from "../tools/weather-tool";

/**
 * Example function to create an agent
 */
export async function createExampleAgent(): Promise<Agent> {
	// Create the language model
	const llm = createLanguageModel({
		provider: "openai",
		model: "gpt-4o",
		apiKey: process.env.OPENAI_API_KEY || "",
	});

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
		.withLanguageModel(llm)
		.withToolExecutor(toolExecutor)
		.withMemory(memory)
		.withEventBus(eventBus)
		.withMiddleware(loggingMiddleware)
		.build();

	// Subscribe to events
	agent.on(AgentEventType.TOOL_CALLED, (event) => {
		console.log(`Tool called: ${(event.payload as ToolCall).name}`);
	});

	agent.on(AgentEventType.TOOL_RESULT, (event) => {
		console.log(`Tool result received: ${JSON.stringify((event.payload as any).result)}`);
	});

	return agent;
}
