/**
 * Common schemas for agent architecture
 */
import { z } from "zod";

/**
 * Basic response schema
 */
export const basicResponseSchema = z.object({
	message: z.string().describe("Main response message"),
	details: z.any().optional().describe("Additional details or data"),
	success: z.boolean().default(true).describe("Whether the operation was successful"),
});

/**
 * Type for basic response
 */
export type BasicResponse = z.infer<typeof basicResponseSchema>;

/**
 * Error response schema
 */
export const errorResponseSchema = z.object({
	error: z.string().describe("Error message"),
	code: z.string().optional().describe("Error code"),
	success: z.literal(false).describe("Always false for error responses"),
	details: z.any().optional().describe("Additional error details"),
});

/**
 * Type for error response
 */
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

/**
 * Generic list response schema
 */
export const listResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
	z.object({
		items: z.array(itemSchema).describe("List of items"),
		count: z.number().int().describe("Total number of items"),
		page: z.number().int().optional().describe("Current page number"),
		totalPages: z.number().int().optional().describe("Total number of pages"),
		success: z.boolean().default(true).describe("Whether the operation was successful"),
	});

/**
 * Search query schema
 */
export const searchQuerySchema = z.object({
	query: z.string().describe("Search query string"),
	filters: z.record(z.string(), z.any()).optional().describe("Search filters"),
	sort: z.string().optional().describe("Sort field"),
	order: z.enum(["asc", "desc"]).optional().describe("Sort order"),
	limit: z.number().int().min(1).max(100).optional().describe("Maximum number of results"),
	offset: z.number().int().min(0).optional().describe("Result offset for pagination"),
});

/**
 * Type for search query
 */
export type SearchQuery = z.infer<typeof searchQuerySchema>;

/**
 * Question answering schema
 */
export const qaResponseSchema = z.object({
	answer: z.string().describe("The answer to the question"),
	confidence: z.number().min(0).max(1).describe("Confidence level in the answer"),
	sources: z.array(z.string()).optional().describe("Sources of information used"),
	relatedQuestions: z.array(z.string()).optional().describe("Related questions"),
});

/**
 * Type for QA response
 */
export type QAResponse = z.infer<typeof qaResponseSchema>;

/**
 * Tool response schema
 */
export const toolResponseSchema = z.object({
	toolName: z.string().describe("Name of the tool used"),
	result: z.any().describe("Result of the tool execution"),
	executionTime: z.number().optional().describe("Execution time in milliseconds"),
	success: z.boolean().describe("Whether the tool execution was successful"),
	error: z.string().optional().describe("Error message if execution failed"),
});

/**
 * Type for tool response
 */
export type ToolResponse = z.infer<typeof toolResponseSchema>;
