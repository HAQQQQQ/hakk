import { OpenAIModel } from "./settings-base";

export interface OpenAiConfigRequests {
	/** Which OpenAI model to use for completions */
	model: OpenAIModel;

	/** Sampling temperature: 0 (deterministic) to 1 (more random) */
	temperature: number;

	/** How many times to retry a failed request */
	maxRetries: number;

	/** Delay between retries in milliseconds */
	retryDelay: number;

	/** Optional override for the system role message */
	systemMessage?: string;
}
