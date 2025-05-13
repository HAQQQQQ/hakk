/**
 * Updated Agent builder implementation with optimized code structure
 */
import { AgentConfig, Agent, AgentDependencies } from "./agent";
import { ToolExecutor, ToolDefinition } from "../tools/tool-executor";
import { MemorySystemInterface } from "../memory/interfaces";
import { SimpleMemorySystem } from "../memory/simple-memory";
import { EventBus } from "../core/events";
import { AgentMiddleware } from "../core/middleware";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";

/**
 * Builder pattern for creating agents
 */
export class AgentBuilder {
	private config: AgentConfig;
	private toolExecutor?: ToolExecutor;
	private memory?: MemorySystemInterface;
	private eventBus?: EventBus;
	private middlewares: AgentMiddleware[] = [];
	private openaiClient?: OpenAIClientService;

	/**
	 * Create a new agent builder
	 *
	 * @param name - Name of the agent
	 */
	constructor(name: string) {
		this.config = {
			name,
			description: "A helpful AI assistant",
		};
	}

	/**
	 * Set the agent description
	 *
	 * @param description - Description of the agent
	 */
	withDescription(description: string): AgentBuilder {
		this.config.description = description;
		return this;
	}

	/**
	 * Set a custom system prompt
	 *
	 * @param prompt - System prompt for the agent
	 */
	withSystemPrompt(prompt: string): AgentBuilder {
		this.config.systemPrompt = prompt;
		return this;
	}

	/**
	 * Set the tool executor
	 *
	 * @param toolExecutor - Tool executor to use
	 */
	withToolExecutor(toolExecutor: ToolExecutor): AgentBuilder {
		this.toolExecutor = toolExecutor;
		return this;
	}

	/**
	 * Add tools to the executor
	 *
	 * @param tools - Array of tool definitions to add
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
	 *
	 * @param memory - Memory system to use
	 */
	withMemory(memory: MemorySystemInterface): AgentBuilder {
		this.memory = memory;
		return this;
	}

	/**
	 * Set the event bus
	 *
	 * @param eventBus - Event bus to use
	 */
	withEventBus(eventBus: EventBus): AgentBuilder {
		this.eventBus = eventBus;
		return this;
	}

	/**
	 * Add middleware to the agent
	 *
	 * @param middleware - Middleware to add
	 */
	withMiddleware(middleware: AgentMiddleware): AgentBuilder {
		this.middlewares.push(middleware);
		return this;
	}

	/**
	 * Set the OpenAI client service
	 *
	 * @param client - OpenAI client service to use
	 */
	withOpenAIClient(client: OpenAIClientService): AgentBuilder {
		this.openaiClient = client;
		return this;
	}

	/**
	 * Validate that all required dependencies are provided
	 *
	 * @throws Error if any required dependencies are missing
	 */
	private validateDependencies(): void {
		if (!this.openaiClient) {
			throw new Error("OpenAI client is required. Use withOpenAIClient() before building.");
		}
	}

	/**
	 * Build the agent with all provided configuration
	 *
	 * @returns Fully configured Agent instance
	 */
	build(): Agent {
		// Validate dependencies
		this.validateDependencies();

		// Set defaults if not provided
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
			toolExecutor: this.toolExecutor,
			memory: this.memory,
			eventBus: this.eventBus,
			openaiClient: this.openaiClient!,
		});
	}
}
