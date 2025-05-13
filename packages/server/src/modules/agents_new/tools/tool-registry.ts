/**
 * Tool registry and factory for creating tools
 */
import { ToolDefinition } from "./tool-executor";

/**
 * Tool category types
 */
export enum ToolCategory {
	UTILITY = "utility",
	DATA_PROCESSING = "data_processing",
	EXTERNAL_API = "external_api",
	FILE_OPERATIONS = "file_operations",
	COMMUNICATION = "communication",
}

/**
 * Extended tool definition with metadata
 */
export interface ExtendedToolDefinition extends ToolDefinition {
	category: ToolCategory;
	version: string;
	requiresAuth?: boolean;
	rateLimited?: boolean;
	timeout?: number;
}

/**
 * Tool registry for managing available tools
 */
export class ToolRegistry {
	private static instance: ToolRegistry;
	private tools: Map<string, ExtendedToolDefinition> = new Map();
	private categories: Set<ToolCategory> = new Set(Object.values(ToolCategory));

	/**
	 * Get the singleton instance
	 */
	public static getInstance(): ToolRegistry {
		if (!ToolRegistry.instance) {
			ToolRegistry.instance = new ToolRegistry();
		}
		return ToolRegistry.instance;
	}

	/**
	 * Private constructor for singleton pattern
	 */
	private constructor() {
		// Initialize with core categories
		Object.values(ToolCategory).forEach((category) => {
			this.categories.add(category);
		});
	}

	/**
	 * Register a tool
	 *
	 * @param tool - Tool definition to register
	 * @returns The registered tool
	 */
	public registerTool(tool: ExtendedToolDefinition): ExtendedToolDefinition {
		// Validate the tool
		this.validateTool(tool);

		// Register the tool
		this.tools.set(tool.name, tool);

		return tool;
	}

	/**
	 * Unregister a tool
	 *
	 * @param name - Name of the tool to unregister
	 * @returns Whether the tool was unregistered
	 */
	public unregisterTool(name: string): boolean {
		return this.tools.delete(name);
	}

	/**
	 * Get a tool by name
	 *
	 * @param name - Name of the tool to get
	 * @returns The tool definition or undefined if not found
	 */
	public getTool(name: string): ExtendedToolDefinition | undefined {
		return this.tools.get(name);
	}

	/**
	 * Get all tools
	 *
	 * @returns Array of all registered tools
	 */
	public getAllTools(): ExtendedToolDefinition[] {
		return Array.from(this.tools.values());
	}

	/**
	 * Get tools by category
	 *
	 * @param category - Category to filter by
	 * @returns Array of tools in the category
	 */
	public getToolsByCategory(category: ToolCategory): ExtendedToolDefinition[] {
		return this.getAllTools().filter((tool) => tool.category === category);
	}

	/**
	 * Add a custom category
	 *
	 * @param category - Category to add
	 */
	public addCategory(category: string): void {
		this.categories.add(category as ToolCategory);
	}

	/**
	 * Get all categories
	 *
	 * @returns Array of all categories
	 */
	public getAllCategories(): string[] {
		return Array.from(this.categories);
	}

	/**
	 * Validate a tool definition
	 *
	 * @param tool - Tool to validate
	 * @throws Error if the tool is invalid
	 */
	private validateTool(tool: ExtendedToolDefinition): void {
		// Check required fields
		if (!tool.name) {
			throw new Error("Tool name is required");
		}

		if (!tool.description) {
			throw new Error(`Tool "${tool.name}" requires a description`);
		}

		if (!tool.parameters) {
			throw new Error(`Tool "${tool.name}" requires parameters schema`);
		}

		if (!tool.execute || typeof tool.execute !== "function") {
			throw new Error(`Tool "${tool.name}" requires an execute function`);
		}

		// Validate parameters
		if (typeof tool.parameters !== "object") {
			throw new Error(`Tool "${tool.name}" parameters should be a JSON schema object`);
		}

		// Check for duplicate tool
		if (this.tools.has(tool.name)) {
			throw new Error(`Tool "${tool.name}" is already registered`);
		}

		// Validate category
		if (!tool.category || !this.categories.has(tool.category)) {
			throw new Error(`Tool "${tool.name}" has an invalid category: ${tool.category}`);
		}

		// Validate version format
		if (!tool.version || !/^\d+\.\d+\.\d+$/.test(tool.version)) {
			throw new Error(`Tool "${tool.name}" has an invalid version format (should be x.y.z)`);
		}
	}
}

/**
 * Tool factory for creating standard tool definitions
 */
export class ToolFactory {
	/**
	 * Create a utility tool
	 *
	 * @param config - Tool configuration
	 * @returns Extended tool definition
	 */
	static createUtilityTool(config: {
		name: string;
		description: string;
		parameters: object;
		execute: (args: Record<string, unknown>) => Promise<unknown>;
		version?: string;
	}): ExtendedToolDefinition {
		return {
			name: config.name,
			description: config.description,
			parameters: config.parameters,
			execute: config.execute,
			category: ToolCategory.UTILITY,
			version: config.version || "1.0.0",
		};
	}

	/**
	 * Create an API tool
	 *
	 * @param config - Tool configuration
	 * @returns Extended tool definition
	 */
	static createApiTool(config: {
		name: string;
		description: string;
		parameters: object;
		execute: (args: Record<string, unknown>) => Promise<unknown>;
		version?: string;
		requiresAuth?: boolean;
		rateLimited?: boolean;
		timeout?: number;
	}): ExtendedToolDefinition {
		return {
			name: config.name,
			description: config.description,
			parameters: config.parameters,
			execute: config.execute,
			category: ToolCategory.EXTERNAL_API,
			version: config.version || "1.0.0",
			requiresAuth: config.requiresAuth || false,
			rateLimited: config.rateLimited || false,
			timeout: config.timeout || 30000,
		};
	}

	/**
	 * Create a data processing tool
	 *
	 * @param config - Tool configuration
	 * @returns Extended tool definition
	 */
	static createDataProcessingTool(config: {
		name: string;
		description: string;
		parameters: object;
		execute: (args: Record<string, unknown>) => Promise<unknown>;
		version?: string;
	}): ExtendedToolDefinition {
		return {
			name: config.name,
			description: config.description,
			parameters: config.parameters,
			execute: config.execute,
			category: ToolCategory.DATA_PROCESSING,
			version: config.version || "1.0.0",
		};
	}
}
