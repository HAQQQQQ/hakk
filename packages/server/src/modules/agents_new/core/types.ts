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
	cached?: boolean; // Indicates whether the result was retrieved from the cache
	cachedAt?: string; // Optional timestamp for when the result was cached
}

/**
 * Type guard to check if a response is a tool call
 */
export function isToolCall(response: unknown): response is ToolCall {
	return (
		typeof response !== "string" &&
		response !== null &&
		typeof response === "object" &&
		"name" in response &&
		"id" in response
	);
}

/**
 * Response formatter for consistent message formatting
 */
export class ResponseFormatter {
	/**
	 * Format a response object as a JSON string with pretty printing
	 */
	static formatJson(data: unknown): string {
		return JSON.stringify(data, null, 2);
	}

	/**
	 * Extract plain text from a potentially JSON string
	 */
	static extractText(content: string): string {
		try {
			const parsed = JSON.parse(content);
			if (typeof parsed === "object" && parsed !== null) {
				// Try to find a main message field
				if ("message" in parsed) return String(parsed.message);
				if ("content" in parsed) return String(parsed.content);
				if ("text" in parsed) return String(parsed.text);

				// Fallback to simple stringification
				return JSON.stringify(parsed);
			}
			return String(parsed);
		} catch {
			// If not JSON, return as is
			return content;
		}
	}
}
