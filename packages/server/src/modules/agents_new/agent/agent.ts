/**
 * Updated Agent implementation with optimized code structure
 */
import { Message } from "../core/types";
import { EventBus, AgentEventType } from "../core/events";
import { AgentMiddleware } from "../core/middleware";
import { ToolExecutor } from "../tools/tool-executor";
import { MemorySystemInterface } from "../memory/interfaces";

import { ZodSchema } from "zod";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { OpenAIResponse, OpenAIResponseStatus, TokenUsage } from "@/modules/openai/openai.types";

/**
 * Standard response format for all agent responses
 */
export interface AgentResponse<T> {
	// Core response data
	response: T | null;
	status: "success" | "partial" | "error";

	// Timing and performance metrics
	startTime: number; // UNIX timestamp when processing started
	completionTime: number; // UNIX timestamp when processing completed
	executionTimeMs: number; // Total execution time in milliseconds

	// Model information
	modelUsed: string; // The specific LLM model used
	modelVersion: string; // Version of the model

	// Request/response metadata
	requestId: string; // Unique ID for this request
	tokenUsage?: TokenUsage;

	// Error information (if applicable)
	error?: {
		message: string;
		code?: string;
		details?: unknown;
	};

	// Caching information
	// cached: boolean;           // Whether this response was retrieved from cache
	// cachedAt?: number;         // When the response was originally cached
}

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
 * Main Agent class - Responsible for orchestrating interactions between
 * the language model, tools, and memory system
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
	private responseCache: Map<string, OpenAIResponse<any>> = new Map();

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
	 *
	 * @param query - User query to process
	 * @param schema - Zod schema for validating and structuring the response
	 * @param onMessage - Callback function to handle messages during processing
	 * @returns Structured response data with metadata
	 */
	async processQueryWithSchema<T>(
		query: string,
		schema: ZodSchema<T>,
		onMessage: MessageCallback,
	): Promise<AgentResponse<T>> {
		const startTime = Date.now();
		const requestId = this.createRequestId();

		try {
			// Step 1: Prepare the query context
			await this.prepareQueryContext(query, onMessage);

			// Step 2: Execute the LLM request with schema
			const response = await this.executeLLMRequest(query, schema);

			// Step 3: Process the response
			const result = await this.processLLMResponse(response, onMessage);

			// Step 4: Prepare the agent response
			return this.createSuccessResponse(result, startTime, requestId, response);
		} catch (error) {
			// Step 4: Handle any errors that occur during processing
			await this.handleProcessingError(error, onMessage);

			// Create and return error response
			return this.createErrorResponse(error, startTime, requestId);
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

	private createRequestId(): string {
		return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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
	 * Prepare the query context before sending to LLM
	 *
	 * @param query - User query to process
	 * @param onMessage - Callback for message handling
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
	 * Execute the LLM request with schema validation
	 *
	 * @param query - Query to send to the LLM
	 * @param schema - Schema for validating the response
	 * @returns OpenAI response object
	 */
	private async executeLLMRequest<T>(
		query: string,
		schema: ZodSchema<T>,
	): Promise<OpenAIResponse<T>> {
		// Check cache first (for development and testing purposes)
		const cacheKey = this.getCacheKey(query, schema.description);
		if (this.responseCache.has(cacheKey)) {
			return this.responseCache.get(cacheKey) as OpenAIResponse<T>;
		}

		// Generate response from the OpenAI client with the specified schema
		const response = await this.openaiClient.executeStructuredOutput(
			query,
			schema,
			this.systemPrompt,
			"response_schema", // Schema name parameter
		);

		// Cache successful responses
		if (response.status === OpenAIResponseStatus.SUCCESS) {
			this.responseCache.set(cacheKey, response);
		}

		return response;
	}

	private getCacheKey(query: string, description?: string): string {
		return `${query}_${description || "schema"}`;
	}

	/**
	 * Process the LLM response and handle success/failure
	 *
	 * @param response - OpenAI response to process
	 * @param onMessage - Callback for message handling
	 * @returns Structured data from the response or null
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
	 * Create a success response object
	 *
	 * @param data - The processed data
	 * @param startTime - When processing began
	 * @param requestId - Unique request ID
	 * @param openAIResponse - Original OpenAI response
	 * @returns Formatted agent response
	 */
	private createSuccessResponse<T>(
		data: T | null,
		startTime: number,
		requestId: string,
		openAIResponse: OpenAIResponse<T>,
	): AgentResponse<T> {
		const completionTime = Date.now();

		return {
			response: data,
			status: data !== null ? "success" : "partial",
			startTime,
			completionTime,
			executionTimeMs: completionTime - startTime,
			modelUsed: this.openaiClient.getModelName() || "unknown",
			modelVersion: this.openaiClient.getModelVersion() || "unknown",
			requestId,
			tokenUsage: openAIResponse.tokenUsage,
		};
	}

	/**
	 * Create an error response object
	 *
	 * @param error - The error that occurred
	 * @param startTime - When processing began
	 * @param requestId - Unique request ID
	 * @returns Formatted agent response with error details
	 */
	private createErrorResponse<T>(
		error: unknown,
		startTime: number,
		requestId: string,
		openAIResponse?: OpenAIResponse<any>, // Optional OpenAI response
	): AgentResponse<T> {
		const completionTime = Date.now();
		const errorMessage = error instanceof Error ? error.message : String(error);

		return {
			response: null,
			status: "error",
			startTime,
			completionTime,
			executionTimeMs: completionTime - startTime,
			modelUsed: this.openaiClient.getModelName() || "unknown",
			modelVersion: this.openaiClient.getModelVersion() || "unknown",
			requestId,
			tokenUsage: openAIResponse?.tokenUsage, // Conditionally include token usage if available
			error: {
				message: errorMessage,
				details: error,
			},
		};
	}

	/**
	 * Handle a successful LLM response
	 *
	 * @param data - Structured data from the response
	 * @param onMessage - Callback for message handling
	 * @returns The structured data
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
	 * Handle an error response from the LLM
	 *
	 * @param response - Error response from OpenAI
	 * @param onMessage - Callback for message handling
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
	 * Handle processing errors
	 *
	 * @param error - Error that occurred during processing
	 * @param onMessage - Callback for message handling
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
	 * Extract error message from an OpenAI response
	 *
	 * @param response - OpenAI response object
	 * @returns Formatted error message
	 */
	private extractErrorMessage(response: OpenAIResponse<any>): string {
		return "error" in response && response.error instanceof Error
			? response.error.message
			: "error" in response
				? String(response.error || "Unknown error")
				: "Unknown error";
	}

	/**
	 * Publish an error event to the event bus
	 *
	 * @param message - Error message
	 * @param error - Error object or details
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
	 *
	 * @param message - Message to process with middleware
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
	 *
	 * @param middleware - Middleware to add
	 */
	addMiddleware(middleware: AgentMiddleware): void {
		this.middlewares.push(middleware);
		// Re-sort by priority
		this.middlewares.sort((a, b) => b.priority - a.priority);
	}

	/**
	 * Remove a middleware by name
	 *
	 * @param name - Name of the middleware to remove
	 * @returns True if middleware was removed, false otherwise
	 */
	removeMiddleware(name: string): boolean {
		const initialLength = this.middlewares.length;
		this.middlewares = this.middlewares.filter((m) => m.name !== name);
		return initialLength !== this.middlewares.length;
	}

	/**
	 * Subscribe to agent events
	 *
	 * @param eventType - Type of event to subscribe to
	 * @param handler - Handler function for the event
	 * @returns Subscription object with unsubscribe method
	 */
	on<T>(
		eventType: AgentEventType,
		handler: (event: { payload: T }) => void,
	): { unsubscribe: () => void } {
		return this.eventBus.subscribe(eventType, handler as any);
	}

	/**
	 * Clear agent memory and cache
	 */
	clearMemory(): void {
		this.memory.clear();
		this.responseCache.clear();

		// Reinitialize with system prompt
		const systemMessage: Message = {
			role: "system",
			content: this.systemPrompt,
		};

		this.memory.addMessage(systemMessage);
	}
}
