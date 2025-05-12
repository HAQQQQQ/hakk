/**
 * Updated Agent builder implementation with OpenAI client support
 */
import { AgentConfig, Agent, AgentDependencies } from "./agent";
import { LanguageModelInterface, LLMConfig } from "../llm/interfaces";
import { createLanguageModel } from "../llm/factory";
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
	private llm?: LanguageModelInterface;
	private toolExecutor?: ToolExecutor;
	private memory?: MemorySystemInterface;
	private eventBus?: EventBus;
	private middlewares: AgentMiddleware[] = [];
	private openaiClient?: OpenAIClientService;

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
	 * Set the OpenAI client service
	 */
	withOpenAIClient(client: OpenAIClientService): AgentBuilder {
		this.openaiClient = client;
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

		if (!this.openaiClient) {
			throw new Error("OpenAI client is required. Use withOpenAIClient() before building.");
		}

		// Update config with middlewares
		this.config.middlewares = this.middlewares;

		// Create and return the agent
		return new Agent(this.config, {
			llm: this.llm,
			toolExecutor: this.toolExecutor,
			memory: this.memory,
			eventBus: this.eventBus,
			openaiClient: this.openaiClient,
		});
	}
}
