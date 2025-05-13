/**
 * Updated Agent implementation with refactored processQueryWithSchema function
 */
import { Message } from "../core/types";
import { EventBus, AgentEventType } from "../core/events";
import { AgentMiddleware } from "../core/middleware";
import { ToolExecutor } from "../tools/tool-executor";
import { MemorySystemInterface } from "../memory/interfaces";

import { ZodSchema } from "zod";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { OpenAIResponse, OpenAIResponseStatus } from "@/modules/openai/openai.types";

/**
 * Configuration for the agent
 */
export interface AgentConfig {
	name: string;
	description?: string;
	systemPrompt?: string;
	middlewares?: AgentMiddleware[];
}

/**
 * Dependencies required by the agent
 */
export interface AgentDependencies {
	toolExecutor: ToolExecutor;
	memory: MemorySystemInterface;
	eventBus: EventBus;
	openaiClient: OpenAIClientService;
}

/**
 * Callback type for message handling
 */
export type MessageCallback = (message: Message) => void | Promise<void>;

/**
 * Error handling result
 */
interface ErrorHandlingResult {
	message: Message;
}

/**
 * Main Agent class
 */
export class Agent {
	private name: string;
	private description: string;
	private systemPrompt: string;
	private toolExecutor: ToolExecutor;
	private memory: MemorySystemInterface;
	private eventBus: EventBus;
	private middlewares: AgentMiddleware[];
	private openaiClient: OpenAIClientService;

	constructor(config: AgentConfig, dependencies: AgentDependencies) {
		this.name = config.name;
		this.description = config.description || "An AI assistant agent";
		this.systemPrompt = config.systemPrompt || this.createDefaultSystemPrompt();
		this.toolExecutor = dependencies.toolExecutor;
		this.memory = dependencies.memory;
		this.eventBus = dependencies.eventBus;
		this.middlewares = [...(config.middlewares || [])].sort((a, b) => b.priority - a.priority);
		this.openaiClient = dependencies.openaiClient;

		// Initialize the agent
		this.initialize();
	}

	/**
	 * Process a query using a specific schema
	 */
	async processQueryWithSchema<T>(
		query: string,
		schema: ZodSchema<T>,
		onMessage: MessageCallback,
	): Promise<T | null> {
		try {
			// Step 1: Prepare the query context
			await this.prepareQueryContext(query, onMessage);

			// Step 2: Execute the LLM request with schema
			const response = await this.executeLLMRequest(query, schema);

			// Step 3: Process the response
			return await this.processLLMResponse(response, onMessage);
		} catch (error) {
			// Step 4: Handle any errors that occur during processing
			await this.handleProcessingError(error, onMessage);
			return null;
		}
	}

	/**
	 * Initialize the agent
	 */
	private initialize(): void {
		// Add the system prompt to memory
		const systemMessage: Message = {
			role: "system",
			content: this.systemPrompt,
		};

		this.memory.addMessage(systemMessage);

		// Publish initialization event
		this.eventBus.publish({
			type: AgentEventType.MESSAGE_SENT,
			payload: { message: "Agent initialized with system prompt" },
			timestamp: Date.now(),
		});
	}

	/**
	 * Create the default system prompt
	 */
	private createDefaultSystemPrompt(): string {
		const tools = this.toolExecutor.listTools();

		return `You are ${this.name}, ${this.description}.
When you need to use a tool, respond with a tool call.
Available tools:
${tools.map((tool) => `- ${tool.name}: ${tool.description}`).join("\n")}`;
	}

	/**
	 * Prepare the query context
	 */
	private async prepareQueryContext(query: string, onMessage: MessageCallback): Promise<void> {
		// Create user message
		const userMessage: Message = { role: "user", content: query };

		// Apply middleware
		await this.applyMiddleware(userMessage);

		// Add to memory
		this.memory.addMessage(userMessage);

		// Notify that we received the message
		await onMessage(userMessage);
	}

	/**
	 * Execute the LLM request with schema
	 */
	private async executeLLMRequest<T>(
		query: string,
		schema: ZodSchema<T>,
	): Promise<OpenAIResponse<T>> {
		// Generate response from the OpenAI client with the specified schema
		return await this.openaiClient.executeStructuredOutput(
			query,
			schema,
			this.systemPrompt,
			"response_schema", // Schema name parameter
		);
	}

	/**
	 * Process the LLM response
	 */
	private async processLLMResponse<T>(
		response: OpenAIResponse<T>,
		onMessage: MessageCallback,
	): Promise<T | null> {
		if (response.status === OpenAIResponseStatus.SUCCESS && response.data) {
			// Handle successful response
			return await this.handleSuccessfulResponse(response.data, onMessage);
		} else {
			// Handle error response
			await this.handleErrorResponse(response, onMessage);
			return null;
		}
	}

	/**
	 * Handle a successful response
	 */
	private async handleSuccessfulResponse<T>(data: T, onMessage: MessageCallback): Promise<T> {
		// Create assistant message with the response
		const assistantMessage: Message = {
			role: "assistant",
			content: JSON.stringify(data, null, 2),
		};

		// Send the message to the callback
		await onMessage(assistantMessage);

		// Add to memory
		this.memory.addMessage(assistantMessage);

		// Return the structured data
		return data;
	}

	/**
	 * Handle an error response
	 */
	private async handleErrorResponse(
		response: OpenAIResponse<any>,
		onMessage: MessageCallback,
	): Promise<void> {
		// Extract error message from response
		const errorMsg = this.extractErrorMessage(response);

		// Create error message
		const errorResponseMessage: Message = {
			role: "assistant",
			content: `Error: ${errorMsg}`,
		};

		// Send the message to the callback
		await onMessage(errorResponseMessage);

		// Add to memory
		this.memory.addMessage(errorResponseMessage);

		// Publish error event
		this.publishErrorEvent("Error in LLM response", response);
	}

	/**
	 * Handle processing error
	 */
	private async handleProcessingError(error: unknown, onMessage: MessageCallback): Promise<void> {
		// Format error message
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error("Error processing query with schema:", errorMessage);

		// Create error response message
		const errorResponseMessage: Message = {
			role: "assistant",
			content: `Error processing query with schema: ${errorMessage}`,
		};

		// Send the message to the callback
		await onMessage(errorResponseMessage);

		// Publish error event
		this.publishErrorEvent("Error processing query", error);
	}

	/**
	 * Extract error message from response
	 */
	private extractErrorMessage(response: OpenAIResponse<any>): string {
		return "error" in response && response.error instanceof Error
			? response.error.message
			: "error" in response
				? String(response.error || "Unknown error")
				: "Unknown error";
	}

	/**
	 * Publish error event
	 */
	private publishErrorEvent(message: string, error: unknown): void {
		this.eventBus.publish({
			type: AgentEventType.ERROR,
			payload: { message, error },
			timestamp: Date.now(),
		});
	}

	/**
	 * Apply middleware chain to a message
	 */
	private async applyMiddleware(message: Message): Promise<void> {
		let index = 0;

		const executeNext = async (): Promise<void> => {
			if (index < this.middlewares.length) {
				const middleware = this.middlewares[index++];
				await middleware.process(message, executeNext);
			}
		};

		await executeNext();
	}

	/**
	 * Add a middleware to the agent
	 */
	addMiddleware(middleware: AgentMiddleware): void {
		this.middlewares.push(middleware);
		// Re-sort by priority
		this.middlewares.sort((a, b) => b.priority - a.priority);
	}

	/**
	 * Remove a middleware by name
	 */
	removeMiddleware(name: string): boolean {
		const initialLength = this.middlewares.length;
		this.middlewares = this.middlewares.filter((m) => m.name !== name);
		return initialLength !== this.middlewares.length;
	}

	/**
	 * Subscribe to agent events
	 */
	on<T>(
		eventType: AgentEventType,
		handler: (event: { payload: T }) => void,
	): { unsubscribe: () => void } {
		return this.eventBus.subscribe(eventType, handler as any);
	}

	/**
	 * Clear agent memory
	 */
	clearMemory(): void {
		this.memory.clear();

		// Reinitialize with system prompt
		const systemMessage: Message = {
			role: "system",
			content: this.systemPrompt,
		};

		this.memory.addMessage(systemMessage);
	}
}
