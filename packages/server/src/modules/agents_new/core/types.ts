/**
 * Core types used throughout the agent architecture
 */

// Basic message types that can be exchanged within the system
export type Role = "system" | "user" | "assistant" | "tool";

export interface Message {
	role: Role;
	content: string;
	name?: string; // For tool messages, identifies the tool
	toolCallId?: string; // Links tool responses to their requests
	metadata?: Record<string, unknown>; // Additional information
}

// Types related to tool definitions and execution
export interface ToolCall {
	id: string;
	name: string;
	arguments: Record<string, unknown>;
}

export interface ToolResult {
	result: unknown;
	error?: string;
}

// Possible response types from the LLM
export type LLMResponse = string | ToolCall;

/**
 * Type guard to check if a response is a tool call
 */
export function isToolCall(response: LLMResponse): response is ToolCall {
	return typeof response !== "string" && "name" in response && "id" in response;
}

/**
 * OpenAI types definition file
 */

/**
 * Represents possible model types
 */
export type OpenAIModel = string;

/**
 * OpenAI API token constants
 */
export enum OpenAITokens {
	CLIENT = "OPENAI_CLIENT",
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
	model: OpenAIModel;
}

/**
 * Error API response
 */
export interface OpenAIErrorResponse {
	status: OpenAIErrorStatus;
	error: Error;
	originalPrompt?: string;
	model?: OpenAIModel;
}
