import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
	OpenAIResponseStatus,
	type ToolSchema,
	type ToolSchemaParams,
} from "@/modules/openai/openai.types";
import { OpenAIClientService } from "../openai/openai-client.service";
import { Injectable } from "@nestjs/common";
import { AgentName } from "./agent.factory";

/**
 * Interface for LLM tool agents
 * Provides a consistent structure for creating agent classes
 */
export interface LLMToolAgent {
	readonly name: AgentName;
	readonly systemMessage: string;
	getTool(): ToolSchema;
	getSchema(): z.ZodTypeAny;
	execute<T>(prompt: string): Promise<T>;
}

export interface RetryOptions {
	maxRetries: number;
	initialDelayMs: number;
	maxDelayMs: number;
	backoffFactor: number;
	jitter: boolean;
	shouldRetry: (error: any) => boolean;
}

const DefaultRetryConfig: RetryOptions = {
	maxRetries: 3,
	initialDelayMs: 200,
	maxDelayMs: 30000,
	backoffFactor: 3,
	jitter: true,
	shouldRetry: (error) => error.status === 429 || error.status >= 500,
};

/**
 * Abstract base class for LLM tool agents
 * Provides common functionality and execution capabilities
 */
@Injectable()
export abstract class BaseAgent implements LLMToolAgent {
	/**
	 * @param openaiClient - OpenAI client service for making API calls
	 * @param name - Unique identifier for this agent
	 * @param systemMessage - System message to provide context to the LLM
	 * @param toolName - Name of the tool for OpenAI API
	 * @param toolDescription - Description of what the tool does
	 */
	constructor(
		protected readonly openaiClient: OpenAIClientService,
		public readonly name: AgentName,
		public readonly systemMessage: string,
		protected readonly toolName: string,
		protected readonly toolDescription: string,
		protected readonly retryOptions: RetryOptions = DefaultRetryConfig,
	) {}

	/**
	 * Abstract method that must be implemented by subclasses
	 * Should return a static Zod schema defining the expected output structure
	 */
	abstract getSchema(): z.ZodTypeAny;

	/**
	 * Creates and returns the OpenAI tool definition
	 * Uses the schema from getSchema() to generate JSON schema
	 */
	getTool(): ToolSchema {
		return {
			name: this.toolName,
			description: this.toolDescription,
			parameters: zodToJsonSchema(this.getSchema()) as ToolSchemaParams,
		};
	}

	abstract execute<T>(prompt: string): Promise<T>;

	/**
	 * Execute the agent with the given prompt
	 * @param prompt - The user's input prompt
	 * @returns The structured response according to the agent's schema
	 */
	async _execute<T>(prompt: string): Promise<T> {
		const response = await this.openaiClient.executeToolCall<T>(
			prompt,
			this.getTool(),
			this.getSchema(),
			this.systemMessage,
		);

		if (response.status === OpenAIResponseStatus.SUCCESS) {
			return response.data;
		} else {
			throw new Error(
				`Agent "${this.name}" failed: ${
					typeof response.error === "string" ? response.error : response.error?.message
				}`,
			);
		}
	}

	async executeWithRetry<T>(
		prompt: string,
		retryOptions: RetryOptions = this.retryOptions,
	): Promise<T> {
		return this.retry(() => this.execute<T>(prompt), retryOptions);
	}

	/**
	 * Retries an operation with exponential backoff
	 * @param operation Function to retry
	 * @param options Retry configuration options
	 * @returns Result of the operation
	 */
	private async retry<T>(
		operation: () => Promise<T>,
		options: RetryOptions = {
			maxRetries: 3,
			initialDelayMs: 100,
			maxDelayMs: 10000,
			backoffFactor: 2,
			jitter: true,
			shouldRetry: () => true,
		},
	): Promise<T> {
		let attempt = 0;
		let delay = options.initialDelayMs;

		while (attempt < options.maxRetries) {
			try {
				return await operation();
			} catch (error) {
				attempt++;

				// Check if we should retry
				if (attempt >= options.maxRetries || !options.shouldRetry(error)) {
					throw error; // Rethrow if max retries reached or retry condition not met
				}

				// Calculate exponential backoff with optional jitter
				if (options.jitter) {
					// Add random jitter between 0-30% of the current delay
					const jitterAmount = delay * 0.3 * Math.random();
					delay = Math.min(
						options.maxDelayMs,
						delay * options.backoffFactor + jitterAmount,
					);
				} else {
					delay = Math.min(options.maxDelayMs, delay * options.backoffFactor);
				}

				// Log retry attempt (optional)
				console.log(
					`Retry attempt ${attempt}/${options.maxRetries}. Waiting ${delay}ms before next attempt.`,
				);

				// Wait for the calculated delay
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}

		throw new Error("Retry failed after maximum attempts");
	}
}
