/**
 * Tool executor implementation
 */
import { ToolResult } from "../core/types";

/**
 * Interface for tool definitions
 */
export interface ToolDefinition {
	name: string;
	description: string;
	parameters: object; // JSON Schema
	execute: (args: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Class to manage tool registration and execution
 */
export class ToolExecutor {
	private tools: Map<string, ToolDefinition>;
	private validator: any; // Would be a proper JSON schema validator

	constructor(tools: ToolDefinition[] = []) {
		this.tools = new Map();
		this.validator = {}; // Initialize schema validator

		// Register initial tools
		tools.forEach((tool) => this.registerTool(tool));
	}

	/**
	 * Register a new tool
	 */
	registerTool(tool: ToolDefinition): void {
		this.tools.set(tool.name, tool);
	}

	/**
	 * Unregister a tool
	 */
	unregisterTool(name: string): boolean {
		return this.tools.delete(name);
	}

	/**
	 * Get list of available tools
	 */
	listTools(): ToolDefinition[] {
		return Array.from(this.tools.values());
	}

	/**
	 * Execute a tool with given arguments
	 */
	async executeTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
		const tool = this.tools.get(name);

		if (!tool) {
			return {
				result: null,
				error: `Tool "${name}" not found`,
			};
		}

		// Validate arguments against schema
		const isValid = this.validateArgs(tool.parameters, args);
		if (!isValid.valid) {
			return {
				result: null,
				error: `Invalid arguments: ${isValid.errors}`,
			};
		}

		try {
			const result = await tool.execute(args);
			return { result };
		} catch (error) {
			return {
				result: null,
				error: `Execution error: ${error.message}`,
			};
		}
	}

	/**
	 * Validate arguments against JSON schema
	 */
	private validateArgs(
		schema: object,
		args: Record<string, unknown>,
	): { valid: boolean; errors?: string } {
		// This would use a proper JSON schema validator
		// For now, we'll assume all args are valid
		return { valid: true };
	}
}
