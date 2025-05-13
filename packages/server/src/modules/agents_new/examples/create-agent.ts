/**
 * Example of creating an agent with schema support (optimized)
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

/**
 * Configuration for creating an agent
 */
export interface AgentCreationConfig {
	openaiClient: OpenAIClientService;
	name?: string;
	description?: string;
	systemPrompt?: string;
	tools?: any[];
	maxMessagesInMemory?: number;
	loggingEnabled?: boolean;
}

/**
 * Create an OpenAI client (implementation depends on your setup)
 */
const createOpenAIClient = (): OpenAIClientService => {
	// In a real implementation, you would initialize your OpenAI client properly
	// For example:
	// const openaiConfigService = new OpenAIConfigService();
	// const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
	// return new OpenAIClientService(openaiClient, openaiConfigService);

	// Mock implementation - replace with your actual code
	return {} as OpenAIClientService;
};

/**
 * Factory function to create an agent with standard configuration
 */
export async function createAgent(config: AgentCreationConfig): Promise<Agent> {
	// Create the OpenAI client if not provided
	const openaiClient = config.openaiClient || createOpenAIClient();

	// Create the tool executor with tools
	const tools = config.tools || [calculatorTool, weatherTool];
	const toolExecutor = new ToolExecutor(tools);

	// Create the memory system
	const memory = new SimpleMemorySystem(config.maxMessagesInMemory || 100);

	// Create the event bus
	const eventBus = new EventBus();

	// Create agent builder
	const builder = new AgentBuilder(config.name || "Assistant")
		.withDescription(config.description || "An AI assistant that can perform various tasks")
		.withToolExecutor(toolExecutor)
		.withMemory(memory)
		.withEventBus(eventBus)
		.withOpenAIClient(openaiClient);

	// Add system prompt if provided
	if (config.systemPrompt) {
		builder.withSystemPrompt(config.systemPrompt);
	}

	// Add logging middleware if enabled
	if (config.loggingEnabled !== false) {
		builder.withMiddleware(new LoggingMiddleware());
	}

	// Build the agent
	const agent = builder.build();

	// Set up event listeners
	setupAgentEventListeners(agent);

	return agent;
}

/**
 * Setup standard event listeners for an agent
 */
function setupAgentEventListeners(agent: Agent): void {
	// Tool call events
	agent.on<ToolCall>(AgentEventType.TOOL_CALLED, (event) => {
		console.log(`Tool called: ${event.payload.name}`);
	});

	// Tool result events
	agent.on(AgentEventType.TOOL_RESULT, (event) => {
		console.log(`Tool result received: ${JSON.stringify((event.payload as any).result)}`);
	});

	// Error events
	agent.on(AgentEventType.ERROR, (event) => {
		console.error(`Error in agent: ${(event.payload as any).message}`);
	});
}

/**
 * Create a default example agent for testing
 */
export async function createExampleAgent(): Promise<Agent> {
	// In a real implementation, you would provide your actual OpenAI client
	const openaiClient = createOpenAIClient();

	return createAgent({
		openaiClient,
		name: "MathWeatherAssistant",
		description: "An assistant that can perform calculations and check the weather",
		tools: [calculatorTool, weatherTool],
		loggingEnabled: true,
	});
}
