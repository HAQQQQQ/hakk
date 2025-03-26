// src/modules/openai/openai.config.ts

/**
 * Configuration values for OpenAI API client operations
 */
export const OpenAIConfig = {
	/**
	 * Default number of retry attempts for API calls
	 */
	DEFAULT_MAX_RETRIES: 3,

	/**
	 * Default delay between retry attempts in milliseconds
	 * This will be multiplied by 2^(attempt-1) for exponential backoff
	 */
	DEFAULT_RETRY_DELAY: 500,
};
