// openai-models.enum.ts
export enum OpenAIModel {
	GPT_3_5_TURBO = "gpt-3.5-turbo",
	GPT_3_5_TURBO_16K = "gpt-3.5-turbo-16k",
	GPT_4 = "gpt-4",
	GPT_4_TURBO = "gpt-4-turbo",
	GPT_4_32K = "gpt-4-32k",
	GPT_4_VISION = "gpt-4-vision-preview",
}

// openai.tokens.ts
export const OpenAITokens = {
	CLIENT: "OPENAI_CLIENT",
	MODEL: "OPENAI_MODEL",
	TEMPERATURE: "OPENAI_TEMPERATURE",
	RETRY_CONFIG: "OPENAI_RETRY_CONFIG",
	SYSTEM_MESSAGE: "SYSTEM_MESSAGE",
	DEFAULT_CONFIG: "OPENAI_DEFAULT_CONFIG",
} as const;

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
 * Status values representing error cases (excluding SUCCESS)
 */
export type OpenAIErrorStatus = Exclude<OpenAIResponseStatus, OpenAIResponseStatus.SUCCESS>;

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
	status: OpenAIErrorStatus;
	error: Error | string;
	originalPrompt?: string;
}

export type ToolSchemaParams = {
	type: "object";
	properties: Record<string, any>;
	required?: string[];
};

// openai-tool.types.ts
export type ToolSchema = {
	name: string;
	description?: string;
	parameters: ToolSchemaParams;
};

// Defines the shape expected by the OpenAI client for tool calling
export type ChatCompletionToolDefinition = {
	type: "function";
	function: ToolSchema;
};

export interface OpenAIConfigSettings {
	model: OpenAIModel;
	temperature: number;
	maxRetries: number;
	retryDelay: number;
	systemMessage: string;
}
