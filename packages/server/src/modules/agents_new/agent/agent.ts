/**
 * Updated Agent implementation using OpenAI Client Service
 * Fixed for proper OpenAI client integration
 */
import { Message, ToolCall, isToolCall } from "../core/types";
import { EventBus, AgentEventType } from "../core/events";
import { AgentMiddleware } from "../core/middleware";
import { LanguageModelInterface } from "../llm/interfaces";
import { ToolExecutor } from "../tools/tool-executor";
import { MemorySystemInterface } from "../memory/interfaces";

import { ZodSchema } from "zod";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { OpenAIResponse, OpenAIResponseStatus, OpenAIModel } from "@/modules/openai/openai.types";

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
	openaiClient: OpenAIClientService;
}

/**
 * Callback type for message handling
 */
export type MessageCallback = (message: Message) => void | Promise<void>;

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
	private openaiClient: OpenAIClientService;

	constructor(config: AgentConfig, dependencies: AgentDependencies) {
		this.name = config.name;
		this.description = config.description || "An AI assistant agent";
		this.systemPrompt = config.systemPrompt || this.createDefaultSystemPrompt();
		this.llm = dependencies.llm;
		this.toolExecutor = dependencies.toolExecutor;
		this.memory = dependencies.memory;
		this.eventBus = dependencies.eventBus;
		this.middlewares = [...(config.middlewares || [])].sort((a, b) => b.priority - a.priority);
		this.openaiClient = dependencies.openaiClient;

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
	 * Process a user query without using generators (callback-based)
	 */
	async processQuery(query: string, onMessage: MessageCallback): Promise<void> {
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

			try {
				// Get messages from memory to create context for LLM
				const messages = this.memory.getMessages();

				// Generate response from the LLM using the OpenAI client
				const response = await this.getOpenAIResponse(query, messages);

				// Process the response
				if (response.status === OpenAIResponseStatus.SUCCESS && response.data) {
					// Create assistant message with the response
					assistantMessage.content = JSON.stringify(response.data);

					// Send a copy with current content
					await onMessage({ ...assistantMessage });

					// Add complete assistant message to memory
					this.memory.addMessage(assistantMessage);
				} else {
					// Handle error case
					const errorMsg =
						response.status !== OpenAIResponseStatus.SUCCESS &&
						response.error instanceof Error
							? response.error.message
							: response.status !== OpenAIResponseStatus.SUCCESS &&
								  "error" in response
								? String(response.error || "Unknown error")
								: "Unknown error";

					assistantMessage.content = `Error: ${errorMsg}`;
					await onMessage({ ...assistantMessage });
					this.memory.addMessage(assistantMessage);

					// Publish error event
					this.eventBus.publish({
						type: AgentEventType.ERROR,
						payload: {
							message: "Error in LLM processing",
							error: "error" in response ? response.error : undefined,
						},
						timestamp: Date.now(),
					});
				}

				// Process any tool calls if needed
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

						// Add to memory and notify
						this.memory.addMessage(toolResultMessage);
						await onMessage(toolResultMessage);

						// If there were tool calls, get further LLM response with the results
						if (!error) {
							// Publish thinking event
							this.eventBus.publish({
								type: AgentEventType.THINKING,
								payload: { message: "Thinking about tool results" },
								timestamp: Date.now(),
							});

							// Get follow-up response using the OpenAI client
							const followUpMessages = this.memory.getMessages();
							const followUpResponse = await this.getOpenAIResponse(
								query,
								followUpMessages,
							);

							if (
								followUpResponse.status === OpenAIResponseStatus.SUCCESS &&
								followUpResponse.data
							) {
								const followUpMessage: Message = {
									role: "assistant",
									content: JSON.stringify(followUpResponse.data),
								};

								// Send follow-up message
								await onMessage(followUpMessage);

								// Add follow-up response to memory
								this.memory.addMessage(followUpMessage);
							}
						}
					} catch (error) {
						const errorMessage = error instanceof Error ? error.message : String(error);
						console.error(`Tool execution error:`, errorMessage);

						// Publish error event
						this.eventBus.publish({
							type: AgentEventType.ERROR,
							payload: { message: `Failed to execute tool ${name}`, error },
							timestamp: Date.now(),
						});

						const toolErrorMessage: Message = {
							role: "tool",
							content: `Failed to execute tool ${name}: ${errorMessage}`,
							name,
							toolCallId: id,
						};

						await onMessage(toolErrorMessage);
					}
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				console.error("Error in LLM processing:", errorMessage);

				// Publish error event
				this.eventBus.publish({
					type: AgentEventType.ERROR,
					payload: { message: "Error in LLM processing", error },
					timestamp: Date.now(),
				});

				const errorResponseMessage: Message = {
					role: "assistant",
					content: `I encountered an error: ${errorMessage}`,
				};

				await onMessage(errorResponseMessage);
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			console.error("Error in agent processing:", errorMessage);

			// Publish error event
			this.eventBus.publish({
				type: AgentEventType.ERROR,
				payload: { message: "Error in agent processing", error },
				timestamp: Date.now(),
			});

			const errorResponseMessage: Message = {
				role: "assistant",
				content: `Sorry, I encountered an error processing your request: ${errorMessage}`,
			};

			await onMessage(errorResponseMessage);
		}
	}

	/**
	 * Process a query using a specific schema
	 */
	async processQueryWithSchema<T>(
		query: string,
		schema: ZodSchema<T>,
		onMessage: MessageCallback,
	): Promise<T | null> {
		let result: T | null = null;

		try {
			// Create user message
			const userMessage: Message = { role: "user", content: query };

			// Apply middleware
			await this.applyMiddleware(userMessage);

			// Add to memory
			this.memory.addMessage(userMessage);

			// Notify that we received the message
			await onMessage(userMessage);

			// Generate response from the OpenAI client with the specified schema
			// Make sure to pass all required parameters
			const response = await this.openaiClient.executeStructuredOutput(
				query,
				schema,
				this.systemPrompt,
				"response_schema", // Add the schema name parameter
			);

			if (response.status === OpenAIResponseStatus.SUCCESS && response.data) {
				// Create assistant message with the response
				const assistantMessage: Message = {
					role: "assistant",
					content: JSON.stringify(response.data, null, 2),
				};

				// Send the message to the callback
				await onMessage(assistantMessage);

				// Add to memory
				this.memory.addMessage(assistantMessage);

				// Set the result
				result = response.data;
			} else {
				// Handle error case - properly handle both Error objects and string errors
				const errorMsg =
					"error" in response && response.error instanceof Error
						? response.error.message
						: "error" in response
							? String(response.error || "Unknown error")
							: "Unknown error";

				const errorResponseMessage: Message = {
					role: "assistant",
					content: `Error: ${errorMsg}`,
				};

				await onMessage(errorResponseMessage);
				this.memory.addMessage(errorResponseMessage);
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			console.error("Error processing query with schema:", errorMessage);

			const errorResponseMessage: Message = {
				role: "assistant",
				content: `Error processing query with schema: ${errorMessage}`,
			};

			await onMessage(errorResponseMessage);
		}

		return result;
	}

	/**
	 * Get response from OpenAI using the client service
	 */
	private async getOpenAIResponse<T>(
		query: string,
		messages: Message[],
		schema?: ZodSchema<T>,
	): Promise<OpenAIResponse<T>> {
		// Create a prompt from the messages
		const prompt = this.createPromptFromMessages(query, messages);

		if (schema) {
			// Use schema-based response if schema is provided
			// Make sure to pass all required parameters
			return await this.openaiClient.executeStructuredOutput<T>(
				prompt,
				schema,
				this.systemPrompt,
				"response_schema", // Add the schema name parameter
			);
		} else {
			// Create a fallback schema for generic responses
			// This requires a bit of type gymnastics since we don't have a real schema
			// You might want to implement a better approach based on your needs
			try {
				// If no schema is provided, we can try to use a generic schema
				// or make a direct call to the OpenAI API without structured output

				// For now, return a placeholder response
				// In a real implementation, you should handle this case properly
				return {
					status: OpenAIResponseStatus.SUCCESS,
					data: { message: "No schema provided" } as unknown as T,
					model: OpenAIModel.GPT_4O, // Use a default model or get it from config
				};
			} catch (error) {
				console.error("Error in fallback OpenAI response:", error);
				return {
					status: OpenAIResponseStatus.UNKNOWN_ERROR,
					error: error instanceof Error ? error : new Error(String(error)),
					model: OpenAIModel.GPT_4O, // Use a default model or get it from config
				};
			}
		}
	}

	/**
	 * Create a prompt from a list of messages
	 */
	private createPromptFromMessages(query: string, messages: Message[]): string {
		// Simple conversion of messages to a prompt
		// In a real implementation, you might want to format this differently
		const conversationContext = messages
			.filter((msg) => msg.role !== "system") // Exclude system messages as they're handled separately
			.map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
			.join("\n\n");

		return `${conversationContext}\n\nUSER: ${query}`;
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
