// base.agent.ts
import { z } from "zod";
import { OpenAIClientService } from "../openai/openai-client.service";
import { OpenAIResponseStatus } from "@/modules/openai/openai.types";
import { Injectable } from "@nestjs/common";
// Use 'import type' syntax for interfaces used in decorated class signatures
import type { PromptBuilder } from "./prompt-builder.interface";
import { AgentName } from "./agent-name.enum";

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
 * Abstract base class for LLM agents using structured outputs
 */
export abstract class BaseAgent<TParams, TResult> {
	constructor(
		protected readonly openaiClient: OpenAIClientService,
		protected readonly promptBuilder: PromptBuilder<TParams>,
		public readonly name: AgentName,
		public readonly systemMessage: string,
		protected readonly schemaName: string,
		protected readonly toolDescription: string,
		protected readonly retryOptions: RetryOptions = DefaultRetryConfig,
	) {}

	/**
	 * Build prompt using the injected prompt builder
	 */
	buildPrompt(params: TParams): string {
		return this.promptBuilder.build(params);
	}

	/**
	 * Abstract method that must be implemented by subclasses
	 * Should return a Zod schema defining the expected output structure
	 */
	abstract getSchema(): z.ZodTypeAny;

	/**
	 * Execute the agent with the given prompt using structured outputs
	 * @param prompt - The user's input prompt
	 * @returns The structured response according to the agent's schema
	 */
	async _execute(prompt: string): Promise<TResult> {
		const response = await this.openaiClient.executeStructuredOutput(
			prompt,
			this.getSchema() as z.ZodSchema<TResult>,
			this.systemMessage,
			this.schemaName,
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

	/**
	 * Execute method for all agents - builds prompt and calls _execute
	 */
	async execute(params: TParams): Promise<TResult> {
		const prompt = this.buildPrompt(params);
		return this._execute(prompt);
	}

	/**
	 * Execute with exponential backoff retry
	 */
	async executeWithRetry(
		prompt: string,
		retryOptions: RetryOptions = this.retryOptions,
	): Promise<TResult> {
		return this.retry(() => this._execute(prompt), retryOptions);
	}

	/**
	 * Retries an operation with exponential backoff
	 * @param operation Function to retry
	 * @param options Retry configuration options
	 * @returns Result of the operation
	 */
	private async retry(
		operation: () => Promise<TResult>,
		options: RetryOptions = DefaultRetryConfig,
	): Promise<TResult> {
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
