// openai-models.enum.ts
export enum OpenAIModel {
	GPT_3_5_TURBO = "gpt-3.5-turbo",
	GPT_3_5_TURBO_16K = "gpt-3.5-turbo-16k",
	GPT_4 = "gpt-4",
	GPT_4_TURBO = "gpt-4-turbo",
	GPT_4_32K = "gpt-4-32k",
	GPT_4_VISION = "gpt-4-vision-preview",
}

/**
 * Represents possible states for OpenAI API responses
 */
export enum OpenAIResponseStatus {
	/**
	 * Success - response was valid and matched expected schema
	 */
	SUCCESS = "SUCCESS",

	/**
	 * JSON parsing error - response was not valid JSON
	 */
	INVALID_JSON = "INVALID_JSON",

	/**
	 * Schema validation error - JSON was valid but didn't match expected structure
	 */
	SCHEMA_VALIDATION_FAILED = "SCHEMA_VALIDATION_FAILED",

	/**
	 * API error - OpenAI API returned an error
	 */
	API_ERROR = "API_ERROR",

	/**
	 * Unknown error occurred
	 */
	UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Unified response type for OpenAI API operations
 */
export type OpenAIResponse<T> = OpenAISuccessResponse<T> | OpenAIErrorResponse;

/**
 * Successful API response with data
 */
export interface OpenAISuccessResponse<T> {
	status: OpenAIResponseStatus.SUCCESS;
	data: T;
	originalPrompt?: string;
}

/**
 * Failed API response with error information
 */
export interface OpenAIErrorResponse {
	status: Exclude<OpenAIResponseStatus, OpenAIResponseStatus.SUCCESS>;
	error: Error | string;
	originalPrompt?: string;
}
