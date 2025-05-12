/**
 * Enhanced AI Agent Architecture
 *
 * A class-based implementation of AI agents inspired by the article:
 * https://apeatling.com/articles/architecting-ai-agents-with-typescript/
 *
 * This architecture enhances the original design with:
 * - Full class-based implementation for better encapsulation
 * - Abstract classes and interfaces for cleaner extension
 * - Dependency injection for testing and flexibility
 * - Event-driven communication between components
 * - TypeGuards for improved type safety
 * - Middleware support for cross-cutting concerns
 */

// ====================== CORE TYPES ====================== //

/**
 * Basic message types that can be exchanged within the system
 */
export type Role = "system" | "user" | "assistant" | "tool";

export interface Message {
	role: Role;
	content: string;
	name?: string; // For tool messages, identifies the tool
	toolCallId?: string; // Links tool responses to their requests
	metadata?: Record<string, unknown>; // Additional information
}

/**
 * Types related to tool definitions and execution
 */
export interface ToolCall {
	id: string;
	name: string;
	arguments: Record<string, unknown>;
}

export interface ToolResult {
	result: unknown;
	error?: string;
}

/**
 * Possible response types from the LLM
 */
export type LLMResponse = string | ToolCall;

/**
 * Type guard to check if a response is a tool call
 */
export function isToolCall(response: LLMResponse): response is ToolCall {
	return typeof response !== "string" && "name" in response && "id" in response;
}

/**
 * Event types for the agent system
 */
export enum AgentEventType {
	MESSAGE_RECEIVED = "message_received",
	MESSAGE_SENT = "message_sent",
	TOOL_CALLED = "tool_called",
	TOOL_RESULT = "tool_result",
	ERROR = "error",
	THINKING = "thinking",
}

export interface AgentEvent {
	type: AgentEventType;
	payload: unknown;
	timestamp: number;
}

// ================== LANGUAGE MODEL INTERFACE ================== //

/**
 * Configuration for different LLM providers
 */
export interface LLMConfig {
	provider: "openai" | "anthropic" | "other";
	model: string;
	apiKey: string;
	endpoint?: string;
	// Other provider-specific settings
	[key: string]: unknown;
}

/**
 * Options for generating responses
 */
export interface GenerateOptions {
	temperature?: number;
	maxTokens?: number;
	toolChoice?: "auto" | "none" | { name: string };
	streamingCallback?: (chunk: string) => void;
}

/**
 * Abstract base class for language model providers
 */
export abstract class LanguageModelInterface {
	protected config: LLMConfig;

	constructor(config: LLMConfig) {
		this.config = config;
	}

	/**
	 * Generate a response from the language model
	 */
	abstract generateResponse(
		messages: Message[],
		options?: GenerateOptions,
	): AsyncGenerator<LLMResponse>;

	/**
	 * Format messages for the specific provider
	 */
	protected abstract formatMessages(messages: Message[]): unknown;

	/**
	 * Parse provider response into our standard format
	 */
	protected abstract parseResponse(response: unknown): LLMResponse;
}

/**
 * OpenAI implementation of the language model interface
 */
export class OpenAIModelProvider extends LanguageModelInterface {
	constructor(config: LLMConfig) {
		super(config);
		// Initialize OpenAI-specific client
	}

	async *generateResponse(
		messages: Message[],
		options?: GenerateOptions,
	): AsyncGenerator<LLMResponse> {
		const formattedMessages = this.formatMessages(messages);

		// Implementation would use the OpenAI SDK with proper streaming
		// This is a simplified placeholder
		try {
			// Simulated OpenAI API call here
			yield "I'm processing your request...";

			// If tools are requested, possibly yield a tool call
			if (options?.toolChoice !== "none") {
				// Check if any system message requests tools
				const needsTools = messages.some(
					(m) => m.role === "system" && m.content.includes("tools"),
				);

				if (needsTools) {
					// Simulated tool call for demonstration
					yield {
						id: `call-${Date.now()}`,
						name: "example_tool",
						arguments: { param1: "value1" },
					};
				}
			}

			yield "Here's my complete response.";
		} catch (error) {
			console.error("Error generating response from OpenAI:", error);
			throw error;
		}
	}

	protected formatMessages(messages: Message[]): unknown {
		// Convert our messages to OpenAI format
		return messages.map((msg) => ({
			role: msg.role,
			content: msg.content,
			...(msg.name && { name: msg.name }),
			...(msg.toolCallId && { tool_call_id: msg.toolCallId }),
		}));
	}

	protected parseResponse(response: unknown): LLMResponse {
		// Parse OpenAI response into our format
		// Implementation would handle both text and tool calls
		return "Parsed response"; // Placeholder
	}
}

/**
 * Anthropic implementation of the language model interface
 */
export class AnthropicModelProvider extends LanguageModelInterface {
	constructor(config: LLMConfig) {
		super(config);
		// Initialize Anthropic-specific client
	}

	async *generateResponse(
		messages: Message[],
		options?: GenerateOptions,
	): AsyncGenerator<LLMResponse> {
		const formattedMessages = this.formatMessages(messages);

		// Implementation would use the Anthropic SDK with proper streaming
		try {
			yield "I'm thinking about your question...";
			yield "Here's my answer based on what I know.";
		} catch (error) {
			console.error("Error generating response from Anthropic:", error);
			throw error;
		}
	}

	protected formatMessages(messages: Message[]): unknown {
		// Convert our messages to Anthropic format
		return {
			messages: messages.map((msg) => ({
				role:
					msg.role === "assistant"
						? "assistant"
						: msg.role === "user"
							? "user"
							: msg.role === "system"
								? "system"
								: "tool",
				content: msg.content,
			})),
		};
	}

	protected parseResponse(response: unknown): LLMResponse {
		// Parse Anthropic response into our format
		return "Parsed response"; // Placeholder
	}
}

/**
 * Factory function to create the appropriate provider
 */
export function createLanguageModel(config: LLMConfig): LanguageModelInterface {
	switch (config.provider) {
		case "openai":
			return new OpenAIModelProvider(config);
		case "anthropic":
			return new AnthropicModelProvider(config);
		default:
			throw new Error(`Unsupported provider: ${config.provider}`);
	}
}

// ===================== TOOL EXECUTOR ===================== //

/**
 * Interface for tool definitions
 */
export interface ToolDefinition {
	name: string;
	description: string;
	parameters: object; // JSON Schema
	execute: (args: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Class to manage tool registration and execution
 */
export class ToolExecutor {
	private tools: Map<string, ToolDefinition>;
	private validator: any; // Would be a proper JSON schema validator

	constructor(tools: ToolDefinition[] = []) {
		this.tools = new Map();
		this.validator = {}; // Initialize schema validator

		// Register initial tools
		tools.forEach((tool) => this.registerTool(tool));
	}

	/**
	 * Register a new tool
	 */
	registerTool(tool: ToolDefinition): void {
		this.tools.set(tool.name, tool);
	}

	/**
	 * Unregister a tool
	 */
	unregisterTool(name: string): boolean {
		return this.tools.delete(name);
	}

	/**
	 * Get list of available tools
	 */
	listTools(): ToolDefinition[] {
		return Array.from(this.tools.values());
	}

	/**
	 * Execute a tool with given arguments
	 */
	async executeTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
		const tool = this.tools.get(name);

		if (!tool) {
			return {
				result: null,
				error: `Tool "${name}" not found`,
			};
		}

		// Validate arguments against schema
		const isValid = this.validateArgs(tool.parameters, args);
		if (!isValid.valid) {
			return {
				result: null,
				error: `Invalid arguments: ${isValid.errors}`,
			};
		}

		try {
			const result = await tool.execute(args);
			return { result };
		} catch (error) {
			return {
				result: null,
				error: `Execution error: ${error.message}`,
			};
		}
	}

	/**
	 * Validate arguments against JSON schema
	 */
	private validateArgs(
		schema: object,
		args: Record<string, unknown>,
	): { valid: boolean; errors?: string } {
		// This would use a proper JSON schema validator
		// For now, we'll assume all args are valid
		return { valid: true };
	}
}

// ===================== MEMORY SYSTEM ===================== //

/**
 * Interface for memory system implementations
 */
export interface MemorySystemInterface {
	getMessages(): Message[];
	addMessage(message: Message): void;
	getContext(): string;
	clear(): void;
}

/**
 * Base abstract class for memory systems
 */
export abstract class BaseMemorySystem implements MemorySystemInterface {
	protected messages: Message[] = [];

	getMessages(): Message[] {
		return [...this.messages]; // Return a copy to prevent mutation
	}

	addMessage(message: Message): void {
		this.messages.push(message);
		this.onMessageAdded(message);
	}

	abstract getContext(): string;

	clear(): void {
		this.messages = [];
		this.onMemoryCleared();
	}

	protected onMessageAdded(message: Message): void {
		// Hook for subclasses to override
	}

	protected onMemoryCleared(): void {
		// Hook for subclasses to override
	}
}

/**
 * Simple in-memory implementation
 */
export class SimpleMemorySystem extends BaseMemorySystem {
	private maxMessages: number;

	constructor(maxMessages: number = 100) {
		super();
		this.maxMessages = maxMessages;
	}

	addMessage(message: Message): void {
		super.addMessage(message);

		// Trim if we exceed the maximum
		if (this.messages.length > this.maxMessages) {
			// Keep system messages and remove oldest user/assistant messages
			const systemMessages = this.messages.filter((m) => m.role === "system");
			const otherMessages = this.messages
				.filter((m) => m.role !== "system")
				.slice(-this.maxMessages + systemMessages.length);

			this.messages = [...systemMessages, ...otherMessages];
		}
	}

	getContext(): string {
		// Simple concatenation of messages
		return this.messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
	}
}

/**
 * Vector-based memory system for semantic search
 */
export class VectorMemorySystem extends BaseMemorySystem {
	private vectorStore: any; // Would be a proper vector DB client
	private embedder: any; // Would handle creating embeddings

	constructor(vectorStore: any, embedder: any) {
		super();
		this.vectorStore = vectorStore;
		this.embedder = embedder;
	}

	protected async onMessageAdded(message: Message): Promise<void> {
		// Create embedding for the message
		const embedding = await this.embedder.embed(message.content);

		// Store in vector DB with metadata
		await this.vectorStore.insert({
			id: `msg-${Date.now()}`,
			text: message.content,
			embedding,
			metadata: {
				role: message.role,
				timestamp: Date.now(),
			},
		});
	}

	async getRelevantContext(query: string, limit: number = 5): Promise<Message[]> {
		// Create embedding for the query
		const embedding = await this.embedder.embed(query);

		// Search vector DB
		const results = await this.vectorStore.search({
			embedding,
			limit,
		});

		// Convert results to messages
		return results.map((result) => ({
			role: result.metadata.role as Role,
			content: result.text,
			metadata: { score: result.score },
		}));
	}

	getContext(): string {
		// For vector memory, we rely on semantic search rather than sequential history
		return this.messages
			.slice(-10) // Just return recent messages as context
			.map((m) => `${m.role.toUpperCase()}: ${m.content}`)
			.join("\n");
	}

	async clear(): Promise<void> {
		super.clear();
		// Also clear vector store
		await this.vectorStore.clear();
	}
}

// =================== MIDDLEWARE SYSTEM =================== //

/**
 * Middleware interface for processing messages
 */
export interface AgentMiddleware {
	name: string;
	priority: number;
	process(message: Message, next: () => Promise<void>): Promise<void>;
}

/**
 * Middleware for logging
 */
export class LoggingMiddleware implements AgentMiddleware {
	name = "logging";
	priority = 100; // Higher priority, runs earlier

	async process(message: Message, next: () => Promise<void>): Promise<void> {
		console.log(
			`[${new Date().toISOString()}] ${message.role}: ${message.content.substring(0, 50)}...`,
		);
		await next();
	}
}

/**
 * Middleware for content moderation
 */
export class ModerationMiddleware implements AgentMiddleware {
	name = "moderation";
	priority = 200;
	private moderationService: any; // Would be a service for content moderation

	constructor(moderationService: any) {
		this.moderationService = moderationService;
	}

	async process(message: Message, next: () => Promise<void>): Promise<void> {
		if (message.role === "user") {
			const { isSafe, reason } = await this.moderationService.check(message.content);

			if (!isSafe) {
				throw new Error(`Content moderation failed: ${reason}`);
			}
		}

		await next();
	}
}

// ===================== EVENT SYSTEM ===================== //

/**
 * Event subscription interface
 */
export interface EventSubscription {
	unsubscribe(): void;
}

/**
 * Event handler type
 */
export type EventHandler = (event: AgentEvent) => void;

/**
 * Event bus for the agent system
 */
export class EventBus {
	private subscribers: Map<AgentEventType, Set<EventHandler>> = new Map();

	/**
	 * Subscribe to an event type
	 */
	subscribe(eventType: AgentEventType, handler: EventHandler): EventSubscription {
		if (!this.subscribers.has(eventType)) {
			this.subscribers.set(eventType, new Set());
		}

		this.subscribers.get(eventType)!.add(handler);

		return {
			unsubscribe: () => {
				const handlers = this.subscribers.get(eventType);
				if (handlers) {
					handlers.delete(handler);
				}
			},
		};
	}

	/**
	 * Publish an event
	 */
	publish(event: AgentEvent): void {
		const handlers = this.subscribers.get(event.type);

		if (handlers) {
			for (const handler of handlers) {
				try {
					handler(event);
				} catch (error) {
					console.error(`Error in event handler for ${event.type}:`, error);
				}
			}
		}
	}

	/**
	 * Clear all subscribers
	 */
	clear(): void {
		this.subscribers.clear();
	}
}

// ===================== AGENT SYSTEM ===================== //

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
	llm: LanguageModelInterface;
	toolExecutor: ToolExecutor;
	memory: MemorySystemInterface;
	eventBus: EventBus;
}

/**
 * Main Agent class
 */
export class Agent {
	private name: string;
	private description: string;
	private systemPrompt: string;
	private llm: LanguageModelInterface;
	private toolExecutor: ToolExecutor;
	private memory: MemorySystemInterface;
	private eventBus: EventBus;
	private middlewares: AgentMiddleware[];

	constructor(config: AgentConfig, dependencies: AgentDependencies) {
		this.name = config.name;
		this.description = config.description || "An AI assistant agent";
		this.systemPrompt = config.systemPrompt || this.createDefaultSystemPrompt();
		this.llm = dependencies.llm;
		this.toolExecutor = dependencies.toolExecutor;
		this.memory = dependencies.memory;
		this.eventBus = dependencies.eventBus;
		this.middlewares = [...(config.middlewares || [])].sort((a, b) => b.priority - a.priority);

		// Initialize the agent
		this.initialize();
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
	 * Process a user query asynchronously
	 */
	async *processQuery(query: string): AsyncGenerator<Message> {
		try {
			// Create user message
			const userMessage: Message = { role: "user", content: query };

			// Apply middleware
			await this.applyMiddleware(userMessage);

			// Add to memory
			this.memory.addMessage(userMessage);

			// Publish event
			this.eventBus.publish({
				type: AgentEventType.MESSAGE_RECEIVED,
				payload: userMessage,
				timestamp: Date.now(),
			});

			// Initialize assistant message
			let assistantMessage: Message = { role: "assistant", content: "" };

			// Track pending tool calls
			const pendingToolCalls: ToolCall[] = [];

			// Get response from LLM
			const generator = this.llm.generateResponse(this.memory.getMessages());

			try {
				for await (const chunk of generator) {
					if (typeof chunk === "string") {
						// Text response - append to assistant message
						assistantMessage.content += chunk;

						// Yield a copy with current content
						yield { ...assistantMessage };
					} else {
						// Tool call - add to pending list
						pendingToolCalls.push(chunk);

						// Publish tool call event
						this.eventBus.publish({
							type: AgentEventType.TOOL_CALLED,
							payload: chunk,
							timestamp: Date.now(),
						});

						// Yield a message indicating tool use
						yield {
							role: "assistant",
							content: `Using tool: ${chunk.name} with arguments: ${JSON.stringify(chunk.arguments)}`,
						};
					}
				}

				// Add complete assistant message to memory
				this.memory.addMessage(assistantMessage);

				// Process any tool calls
				for (const toolCall of pendingToolCalls) {
					const { id, name, arguments: args } = toolCall;

					try {
						// Execute the tool
						const { result, error } = await this.toolExecutor.executeTool(name, args);

						// Create tool response message
						const content = error ? `Error: ${error}` : JSON.stringify(result);
						const toolResultMessage: Message = {
							role: "tool",
							content,
							name,
							toolCallId: id,
						};

						// Publish tool result event
						this.eventBus.publish({
							type: AgentEventType.TOOL_RESULT,
							payload: { toolCall, result },
							timestamp: Date.now(),
						});

						// Add to memory and yield
						this.memory.addMessage(toolResultMessage);
						yield toolResultMessage;

						// If there were tool calls, get further LLM response with the results
						if (!error) {
							// Publish thinking event
							this.eventBus.publish({
								type: AgentEventType.THINKING,
								payload: { message: "Thinking about tool results" },
								timestamp: Date.now(),
							});

							const followUpGenerator = this.llm.generateResponse(
								this.memory.getMessages(),
							);
							let followUpMessage: Message = { role: "assistant", content: "" };

							for await (const chunk of followUpGenerator) {
								if (typeof chunk === "string") {
									followUpMessage.content += chunk;
									yield { ...followUpMessage };
								} else {
									// Handle nested tool calls if needed
									// This would need a recursive approach or more complex handling
								}
							}

							// Add follow-up response to memory
							this.memory.addMessage(followUpMessage);
						}
					} catch (error) {
						console.error(`Tool execution error:`, error);

						// Publish error event
						this.eventBus.publish({
							type: AgentEventType.ERROR,
							payload: { message: `Failed to execute tool ${name}`, error },
							timestamp: Date.now(),
						});

						yield {
							role: "tool",
							content: `Failed to execute tool ${name}: ${error.message}`,
							name,
							toolCallId: id,
						};
					}
				}
			} catch (error) {
				console.error("Error in LLM processing:", error);

				// Publish error event
				this.eventBus.publish({
					type: AgentEventType.ERROR,
					payload: { message: "Error in LLM processing", error },
					timestamp: Date.now(),
				});

				yield {
					role: "assistant",
					content: `I encountered an error: ${error.message}`,
				};
			}
		} catch (error) {
			console.error("Error in agent processing:", error);

			// Publish error event
			this.eventBus.publish({
				type: AgentEventType.ERROR,
				payload: { message: "Error in agent processing", error },
				timestamp: Date.now(),
			});

			yield {
				role: "assistant",
				content: `Sorry, I encountered an error processing your request: ${error.message}`,
			};
		}
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
	on(eventType: AgentEventType, handler: EventHandler): EventSubscription {
		return this.eventBus.subscribe(eventType, handler);
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

// ===================== AGENT BUILDER ===================== //

/**
 * Builder pattern for creating agents
 */
export class AgentBuilder {
	private config: AgentConfig;
	private llm?: LanguageModelInterface;
	private toolExecutor?: ToolExecutor;
	private memory?: MemorySystemInterface;
	private eventBus?: EventBus;
	private middlewares: AgentMiddleware[] = [];

	constructor(name: string) {
		this.config = {
			name,
			description: "A helpful AI assistant",
		};
	}

	/**
	 * Set the agent description
	 */
	withDescription(description: string): AgentBuilder {
		this.config.description = description;
		return this;
	}

	/**
	 * Set a custom system prompt
	 */
	withSystemPrompt(prompt: string): AgentBuilder {
		this.config.systemPrompt = prompt;
		return this;
	}

	/**
	 * Set the language model
	 */
	withLanguageModel(llm: LanguageModelInterface): AgentBuilder {
		this.llm = llm;
		return this;
	}

	/**
	 * Configure and create a language model
	 */
	withLanguageModelConfig(config: LLMConfig): AgentBuilder {
		this.llm = createLanguageModel(config);
		return this;
	}

	/**
	 * Set the tool executor
	 */
	withToolExecutor(toolExecutor: ToolExecutor): AgentBuilder {
		this.toolExecutor = toolExecutor;
		return this;
	}

	/**
	 * Add tools to the executor
	 */
	withTools(tools: ToolDefinition[]): AgentBuilder {
		if (!this.toolExecutor) {
			this.toolExecutor = new ToolExecutor(tools);
		} else {
			tools.forEach((tool) => this.toolExecutor!.registerTool(tool));
		}
		return this;
	}

	/**
	 * Set the memory system
	 */
	withMemory(memory: MemorySystemInterface): AgentBuilder {
		this.memory = memory;
		return this;
	}

	/**
	 * Set the event bus
	 */
	withEventBus(eventBus: EventBus): AgentBuilder {
		this.eventBus = eventBus;
		return this;
	}

	/**
	 * Add middleware to the agent
	 */
	withMiddleware(middleware: AgentMiddleware): AgentBuilder {
		this.middlewares.push(middleware);
		return this;
	}

	/**
	 * Build the agent
	 */
	build(): Agent {
		// Set defaults if not provided
		if (!this.llm) {
			throw new Error("Language model is required");
		}

		if (!this.toolExecutor) {
			this.toolExecutor = new ToolExecutor();
		}

		if (!this.memory) {
			this.memory = new SimpleMemorySystem();
		}

		if (!this.eventBus) {
			this.eventBus = new EventBus();
		}

		// Update config with middlewares
		this.config.middlewares = this.middlewares;

		// Create and return the agent
		return new Agent(this.config, {
			llm: this.llm,
			toolExecutor: this.toolExecutor,
			memory: this.memory,
			eventBus: this.eventBus,
		});
	}
}

// ===================== USAGE EXAMPLE ===================== //

/**
 * Example calculator tool
 */
const calculatorTool: ToolDefinition = {
	name: "calculator",
	description: "Perform arithmetic calculations",
	parameters: {
		type: "object",
		properties: {
			expression: {
				type: "string",
				description: 'The math expression to evaluate (e.g., "2 + 2")',
			},
		},
		required: ["expression"],
	},
	execute: async ({ expression }) => {
		// Simple evaluation (in a real app, use a safer method)
		try {
			// This is just an example - a real implementation would use a safer eval
			// return { result: eval(expression as string) };
			return { result: "Calculator result" };
		} catch (e) {
			throw new Error(`Could not evaluate expression: ${e.message}`);
		}
	},
};

/**
 * Example usage of the agent system
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
		for await (const message of agent.processQuery(query)) {
			if (message.role === "assistant") {
				console.log(`Assistant: ${message.content}`);
			} else if (message.role === "tool") {
				console.log(`[Tool ${message.name}]: ${message.content}`);
			}
		}

		console.log("Agent example completed!");
	} catch (error) {
		console.error("Error running agent example:", error);
	}
}

// ================= ADVANCED EXTENSIONS ================= //

/**
 * Advanced functionality that could be added to the system:
 *
 * 1. Multi-agent coordination system
 * 2. Learning system with feedback loop
 * 3. Planning capabilities with task decomposition
 * 4. Fine-tuning interfaces
 * 5. Security layer with user permissions
 */

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
		const results = new Map<string, Message[]>();
		const completedSteps = new Set<string>();
		const stepsById = new Map(workflowSteps.map((step) => [step.agentId, step]));

		// Process steps in order of dependencies
		while (completedSteps.size < workflowSteps.length) {
			const eligibleSteps = workflowSteps.filter(
				(step) =>
					!completedSteps.has(step.agentId) &&
					(!step.dependsOn || completedSteps.has(step.dependsOn)),
			);

			if (eligibleSteps.length === 0) {
				throw new Error("Circular dependency or missing steps in workflow");
			}

			// Execute eligible steps in parallel
			await Promise.all(
				eligibleSteps.map(async (step) => {
					const agent = this.agents.get(step.agentId);

					if (!agent) {
						throw new Error(`Agent "${step.agentId}" not found`);
					}

					// Get the query, possibly with substitution from previous steps
					let query = step.query;

					// If this step depends on another, substitute results
					if (step.dependsOn && results.has(step.dependsOn)) {
						const prevResponses = results.get(step.dependsOn)!;
						const lastResponse = prevResponses[prevResponses.length - 1];

						// Simple substitution, could be more sophisticated
						query = query.replace("${previousResult}", lastResponse.content);
					}

					// Execute the agent query
					const stepResults: Message[] = [];
					for await (const message of agent.processQuery(query)) {
						stepResults.push(message);
					}

					// Store results
					results.set(step.agentId, stepResults);
					completedSteps.add(step.agentId);
				}),
			);
		}

		return results;
	}
}

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

				// Execute the step
				const stepResults: Message[] = [];
				for await (const message of super.processQuery(query)) {
					stepResults.push(message);
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

/**
 * Feedback system for agent improvement
 */
export class FeedbackSystem {
	private feedbackStore: any; // Would be a database client

	constructor(feedbackStore: any) {
		this.feedbackStore = feedbackStore;
	}

	/**
	 * Record user feedback
	 */
	async recordFeedback(
		conversationId: string,
		messageId: string,
		rating: number,
		comment?: string,
	): Promise<void> {
		await this.feedbackStore.saveFeedback({
			conversationId,
			messageId,
			rating,
			comment,
			timestamp: Date.now(),
		});
	}

	/**
	 * Get feedback statistics
	 */
	async getFeedbackStats(conversationId?: string): Promise<{
		averageRating: number;
		totalFeedback: number;
		positiveFeedback: number;
		negativeFeedback: number;
	}> {
		// Retrieve feedback data
		const feedbackItems = await this.feedbackStore.getFeedback(conversationId);

		// Calculate statistics
		const totalFeedback = feedbackItems.length;
		const positiveFeedback = feedbackItems.filter((item) => item.rating >= 4).length;
		const negativeFeedback = feedbackItems.filter((item) => item.rating <= 2).length;
		const averageRating =
			totalFeedback > 0
				? feedbackItems.reduce((sum, item) => sum + item.rating, 0) / totalFeedback
				: 0;

		return {
			averageRating,
			totalFeedback,
			positiveFeedback,
			negativeFeedback,
		};
	}

	/**
	 * Generate improvement recommendations
	 */
	async generateImprovementRecommendations(
		llm: LanguageModelInterface,
		conversationId?: string,
	): Promise<string[]> {
		// Get recent negative feedback
		const feedbackItems = await this.feedbackStore.getFeedback(conversationId);
		const negativeFeedback = feedbackItems
			.filter((item) => item.rating <= 2 && item.comment)
			.slice(-10);

		if (negativeFeedback.length === 0) {
			return ["No negative feedback to analyze"];
		}

		// Prepare prompt for the LLM
		const prompt = `
Analyze the following user feedback on AI assistant responses and generate 
specific, actionable recommendations for improvement:

${negativeFeedback
	.map(
		(item) => `
Rating: ${item.rating}/5
Comment: ${item.comment}
`,
	)
	.join("\n")}

Provide 3-5 concrete recommendations for improvement based on the patterns in 
this feedback. Focus on actionable changes to make responses better.
`;

		// Generate recommendations
		const messages: Message[] = [
			{
				role: "system",
				content:
					"You are an AI improvement analyst. Your job is to identify patterns in user feedback and recommend concrete improvements.",
			},
			{
				role: "user",
				content: prompt,
			},
		];

		let recommendations = "";
		const generator = llm.generateResponse(messages);

		for await (const chunk of generator) {
			if (typeof chunk === "string") {
				recommendations += chunk;
			}
		}

		// Parse recommendations into a list
		return recommendations
			.split("\n")
			.filter((line) => line.trim().startsWith("-") || line.trim().startsWith("•"))
			.map((line) => line.replace(/^[•-]\s*/, "").trim());
	}
}

/**
 * Security layer for agent interactions
 */
export class SecurityManager {
	// User permission levels
	public static readonly PERMISSION_LEVELS = {
		GUEST: 0,
		USER: 1,
		ADMIN: 2,
	};

	private permissionStore: any; // Would store user permissions

	constructor(permissionStore: any) {
		this.permissionStore = permissionStore;
	}

	/**
	 * Check if a user has permission to use a tool
	 */
	async canUseTools(userId: string, toolNames: string[]): Promise<boolean> {
		// Get user's permission level
		const userPermission = await this.permissionStore.getUserPermission(userId);

		// Admin can use all tools
		if (userPermission === SecurityManager.PERMISSION_LEVELS.ADMIN) {
			return true;
		}

		// Check tool permissions
		for (const toolName of toolNames) {
			const toolPermission = await this.permissionStore.getToolPermission(toolName);

			if (toolPermission > userPermission) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Create a security middleware
	 */
	createSecurityMiddleware(userId: string): AgentMiddleware {
		return {
			name: "security",
			priority: 300, // Highest priority, runs first

			process: async (message: Message, next: () => Promise<void>): Promise<void> => {
				// Only check security for tool messages
				if (message.role === "tool") {
					// Check if user can use this tool
					const canUse = await this.canUseTools(userId, [message.name!]);

					if (!canUse) {
						throw new Error(
							`User ${userId} does not have permission to use tool ${message.name}`,
						);
					}
				}

				// Proceed to next middleware
				await next();
			},
		};
	}
}

// ==================== END OF MODULE ==================== //

/**
 * Example weather tool
 */
const weatherTool: ToolDefinition = {
	name: "get_weather",
	description: "Get current weather for a location",
	parameters: {
		type: "object",
		properties: {
			location: {
				type: "string",
				description: 'City name, e.g., "New York" or "London, UK"',
			},
			unit: {
				type: "string",
				enum: ["celsius", "fahrenheit"],
				default: "celsius",
			},
		},
		required: ["location"],
	},
	execute: async ({ location, unit }) => {
		// In a real implementation, this would call a weather API
		return {
			temperature: 22,
			unit: unit || "celsius",
			condition: "Sunny",
			location,
		};
	},
};
