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

	constructor(tools: ToolDefinition[] = []) {
		this.tools = new Map();

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
}
