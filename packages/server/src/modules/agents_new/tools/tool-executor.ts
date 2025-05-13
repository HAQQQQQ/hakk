/**
 * Enhanced tool executor with validation and error handling
 */
import { z } from "zod";
import { ToolResult } from "../core";

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
 * Tool execution error class
 */
export class ToolExecutionError extends Error {
	constructor(
		message: string,
		public readonly toolName: string,
		public readonly cause?: unknown,
	) {
		super(message);
		this.name = "ToolExecutionError";
	}
}

/**
 * Tool validation error class
 */
export class ToolValidationError extends Error {
	constructor(
		message: string,
		public readonly toolName: string,
		public readonly validationErrors: string[],
	) {
		super(message);
		this.name = "ToolValidationError";
	}
}

/**
 * Options for tool execution
 */
export interface ToolExecutionOptions {
	cacheResults?: boolean;
	timeoutMs?: number;
	skipValidation?: boolean;
}

/**
 * Cache entry type
 */
interface CacheEntry {
	result: unknown;
	timestamp: number;
}

/**
 * Class to manage tool registration and execution
 */
export class ToolExecutor {
	private tools: Map<string, ToolDefinition>;
	private validator: typeof z;
	private executionCache: Map<string, CacheEntry> = new Map();
	private readonly cacheDuration = 5 * 60 * 1000; // 5 minutes

	/**
	 * Create a new tool executor
	 *
	 * @param tools - Initial tools to register
	 */
	constructor(tools: ToolDefinition[] = []) {
		this.tools = new Map();
		this.validator = z;

		// Register initial tools
		tools.forEach((tool) => this.registerTool(tool));

		// Set up cache cleanup
		this.setupCacheCleanup();
	}

	/**
	 * Set up periodic cache cleanup
	 */
	private setupCacheCleanup(): void {
		setInterval(() => this.cleanupCache(), this.cacheDuration);
	}

	/**
	 * Register a new tool
	 *
	 * @param tool - Tool definition to register
	 * @throws Error if tool name already exists
	 */
	registerTool(tool: ToolDefinition): void {
		this.checkToolNameConflict(tool.name);
		this.validateToolDefinition(tool);
		this.tools.set(tool.name, tool);
	}

	/**
	 * Check if a tool name already exists
	 *
	 * @param name - Tool name to check
	 * @throws Error if tool name already exists
	 */
	private checkToolNameConflict(name: string): void {
		if (this.tools.has(name)) {
			throw new Error(`Tool with name "${name}" is already registered`);
		}
	}

	/**
	 * Unregister a tool
	 *
	 * @param name - Name of the tool to unregister
	 * @returns Whether the tool was successfully unregistered
	 */
	unregisterTool(name: string): boolean {
		return this.tools.delete(name);
	}

	/**
	 * Get list of available tools
	 *
	 * @returns Array of registered tools
	 */
	listTools(): ToolDefinition[] {
		return Array.from(this.tools.values());
	}

	/**
	 * Execute a tool with given arguments
	 *
	 * @param name - Name of the tool to execute
	 * @param args - Arguments to pass to the tool
	 * @param options - Execution options
	 * @returns Tool execution result
	 */
	async executeTool(
		name: string,
		args: Record<string, unknown>,
		options: ToolExecutionOptions = { cacheResults: true, skipValidation: false },
	): Promise<ToolResult> {
		const tool = this.findTool(name);

		if (!tool) {
			return this.createErrorResult(`Tool "${name}" not found`);
		}

		const cacheKey = this.getCacheKey(name, args, options.cacheResults);

		// Check cache if enabled
		const cachedResult = this.checkCache(cacheKey);
		if (cachedResult) {
			return cachedResult;
		}

		// Validate arguments if not skipped
		if (!options.skipValidation) {
			const validationResult = this.tryValidateArguments(tool, args);
			if (validationResult && validationResult.error) {
				return validationResult;
			}
		}

		return this.performToolExecution(tool, args, options, cacheKey);
	}

	/**
	 * Find a tool by name
	 *
	 * @param name - Name of the tool to find
	 * @returns Tool definition or undefined if not found
	 */
	private findTool(name: string): ToolDefinition | undefined {
		return this.tools.get(name);
	}

	/**
	 * Create an error result
	 *
	 * @param errorMessage - Error message
	 * @returns Tool result with error
	 */
	private createErrorResult(errorMessage: string): ToolResult {
		return {
			result: null,
			error: errorMessage,
		};
	}

	/**
	 * Get cache key for tool execution
	 *
	 * @param toolName - Name of the tool
	 * @param args - Arguments for the tool
	 * @param enableCaching - Whether caching is enabled
	 * @returns Cache key or null if caching is disabled
	 */
	private getCacheKey(
		toolName: string,
		args: Record<string, unknown>,
		enableCaching?: boolean,
	): string | null {
		if (!enableCaching) {
			return null;
		}
		return this.generateCacheKey(toolName, args);
	}

	/**
	 * Check cache for existing result
	 *
	 * @param cacheKey - Cache key to check
	 * @returns Cached result or null if not found
	 */
	private checkCache(cacheKey: string | null): ToolResult | null {
		if (!cacheKey) {
			return null;
		}

		const cached = this.executionCache.get(cacheKey);
		if (cached && this.isCacheEntryValid(cached)) {
			return {
				result: cached.result,
				cached: true,
				cachedAt: new Date(cached.timestamp).toISOString(),
			};
		}

		return null;
	}

	/**
	 * Check if a cache entry is still valid
	 *
	 * @param entry - Cache entry to check
	 * @returns Whether the cache entry is valid
	 */
	private isCacheEntryValid(entry: CacheEntry): boolean {
		return Date.now() - entry.timestamp < this.cacheDuration;
	}

	/**
	 * Try to validate arguments, returning any validation errors
	 *
	 * @param tool - Tool definition
	 * @param args - Arguments to validate
	 * @returns Error result if validation fails, null if successful
	 */
	private tryValidateArguments(
		tool: ToolDefinition,
		args: Record<string, unknown>,
	): ToolResult | null {
		try {
			this.validateArguments(tool, args);
			return null;
		} catch (error) {
			if (error instanceof ToolValidationError) {
				return {
					result: null,
					error: `Invalid arguments: ${error.validationErrors.join(", ")}`,
				};
			}

			return {
				result: null,
				error: `Validation error: ${error instanceof Error ? error.message : String(error)}`,
			};
		}
	}

	/**
	 * Perform the actual tool execution
	 *
	 * @param tool - Tool definition
	 * @param args - Arguments for the tool
	 * @param options - Execution options
	 * @param cacheKey - Cache key for result
	 * @returns Tool execution result
	 */
	private async performToolExecution(
		tool: ToolDefinition,
		args: Record<string, unknown>,
		options: ToolExecutionOptions,
		cacheKey: string | null,
	): Promise<ToolResult> {
		try {
			const result = await this.executeToolWithPossibleTimeout(tool, args, options.timeoutMs);

			// Cache result if enabled
			this.cacheResultIfNeeded(cacheKey, result);

			return { result };
		} catch (error) {
			return {
				result: null,
				error: error instanceof Error ? error.message : String(error),
			};
		}
	}

	/**
	 * Execute a tool with timeout if specified
	 *
	 * @param tool - Tool definition
	 * @param args - Arguments for the tool
	 * @param timeoutMs - Optional timeout in milliseconds
	 * @returns Tool execution result
	 */
	private async executeToolWithPossibleTimeout(
		tool: ToolDefinition,
		args: Record<string, unknown>,
		timeoutMs?: number,
	): Promise<unknown> {
		if (timeoutMs) {
			return this.executeWithTimeout(() => tool.execute(args), timeoutMs, tool.name);
		} else {
			return tool.execute(args);
		}
	}

	/**
	 * Cache a result if caching is enabled
	 *
	 * @param cacheKey - Cache key
	 * @param result - Result to cache
	 */
	private cacheResultIfNeeded(cacheKey: string | null, result: unknown): void {
		if (cacheKey) {
			this.executionCache.set(cacheKey, {
				result,
				timestamp: Date.now(),
			});
		}
	}

	/**
	 * Validate a tool definition
	 *
	 * @param tool - Tool definition to validate
	 * @throws Error if tool definition is invalid
	 */
	private validateToolDefinition(tool: ToolDefinition): void {
		this.validateToolName(tool);
		this.validateToolDescription(tool);
		this.validateToolParameters(tool);
		this.validateToolExecuteFunction(tool);
	}

	/**
	 * Validate tool name
	 *
	 * @param tool - Tool definition
	 * @throws Error if tool name is invalid
	 */
	private validateToolName(tool: ToolDefinition): void {
		if (!tool.name || typeof tool.name !== "string") {
			throw new Error("Tool must have a valid name");
		}
	}

	/**
	 * Validate tool description
	 *
	 * @param tool - Tool definition
	 * @throws Error if tool description is invalid
	 */
	private validateToolDescription(tool: ToolDefinition): void {
		if (!tool.description || typeof tool.description !== "string") {
			throw new Error(`Tool "${tool.name}" must have a valid description`);
		}
	}

	/**
	 * Validate tool parameters
	 *
	 * @param tool - Tool definition
	 * @throws Error if tool parameters are invalid
	 */
	private validateToolParameters(tool: ToolDefinition): void {
		if (!tool.parameters || typeof tool.parameters !== "object") {
			throw new Error(`Tool "${tool.name}" must have valid parameters schema`);
		}
	}

	/**
	 * Validate tool execute function
	 *
	 * @param tool - Tool definition
	 * @throws Error if tool execute function is invalid
	 */
	private validateToolExecuteFunction(tool: ToolDefinition): void {
		if (!tool.execute || typeof tool.execute !== "function") {
			throw new Error(`Tool "${tool.name}" must have an execute function`);
		}
	}

	/**
	 * Validate arguments against tool parameters
	 *
	 * @param tool - Tool definition
	 * @param args - Arguments to validate
	 * @throws ToolValidationError if arguments are invalid
	 */
	private validateArguments(tool: ToolDefinition, args: Record<string, unknown>): void {
		const schema = tool.parameters as any;
		const errors: string[] = [];

		this.validateRequiredParameters(schema, args, errors);
		this.validateParameterTypes(schema, args, errors);

		if (errors.length > 0) {
			throw new ToolValidationError(
				`Invalid arguments for tool "${tool.name}"`,
				tool.name,
				errors,
			);
		}
	}

	/**
	 * Validate required parameters are present
	 *
	 * @param schema - Parameter schema
	 * @param args - Arguments to validate
	 * @param errors - Array to collect validation errors
	 */
	private validateRequiredParameters(
		schema: any,
		args: Record<string, unknown>,
		errors: string[],
	): void {
		if (schema.required && Array.isArray(schema.required)) {
			const missingParams = schema.required.filter(
				(param: string) => args[param] === undefined,
			);

			if (missingParams.length > 0) {
				missingParams.forEach((param) => {
					errors.push(`${param} is required`);
				});
			}
		}
	}

	/**
	 * Validate parameter types
	 *
	 * @param schema - Parameter schema
	 * @param args - Arguments to validate
	 * @param errors - Array to collect validation errors
	 */
	private validateParameterTypes(
		schema: any,
		args: Record<string, unknown>,
		errors: string[],
	): void {
		if (schema.properties && typeof schema.properties === "object") {
			Object.entries(schema.properties).forEach(([paramName, propSchema]: [string, any]) => {
				const value = args[paramName];

				// Skip if parameter is not provided and not required
				if (value === undefined) {
					return;
				}

				this.validateSingleParameter(paramName, value, propSchema, errors);
			});
		}
	}

	/**
	 * Validate a single parameter
	 *
	 * @param paramName - Parameter name
	 * @param value - Parameter value
	 * @param propSchema - Parameter schema
	 * @param errors - Array to collect validation errors
	 */
	private validateSingleParameter(
		paramName: string,
		value: unknown,
		propSchema: any,
		errors: string[],
	): void {
		switch (propSchema.type) {
			case "string":
				this.validateStringParameter(paramName, value, propSchema, errors);
				break;
			case "number":
				this.validateNumberParameter(paramName, value, errors);
				break;
			case "boolean":
				this.validateBooleanParameter(paramName, value, errors);
				break;
			case "array":
				this.validateArrayParameter(paramName, value, errors);
				break;
			case "object":
				this.validateObjectParameter(paramName, value, errors);
				break;
		}
	}

	/**
	 * Validate string parameter
	 *
	 * @param paramName - Parameter name
	 * @param value - Parameter value
	 * @param propSchema - Parameter schema
	 * @param errors - Array to collect validation errors
	 */
	private validateStringParameter(
		paramName: string,
		value: unknown,
		propSchema: any,
		errors: string[],
	): void {
		if (typeof value !== "string") {
			errors.push(`${paramName} must be a string`);
		} else if (propSchema.enum && !propSchema.enum.includes(value)) {
			errors.push(`${paramName} must be one of: ${propSchema.enum.join(", ")}`);
		}
	}

	/**
	 * Validate number parameter
	 *
	 * @param paramName - Parameter name
	 * @param value - Parameter value
	 * @param errors - Array to collect validation errors
	 */
	private validateNumberParameter(paramName: string, value: unknown, errors: string[]): void {
		if (typeof value !== "number") {
			errors.push(`${paramName} must be a number`);
		}
	}

	/**
	 * Validate boolean parameter
	 *
	 * @param paramName - Parameter name
	 * @param value - Parameter value
	 * @param errors - Array to collect validation errors
	 */
	private validateBooleanParameter(paramName: string, value: unknown, errors: string[]): void {
		if (typeof value !== "boolean") {
			errors.push(`${paramName} must be a boolean`);
		}
	}

	/**
	 * Validate array parameter
	 *
	 * @param paramName - Parameter name
	 * @param value - Parameter value
	 * @param errors - Array to collect validation errors
	 */
	private validateArrayParameter(paramName: string, value: unknown, errors: string[]): void {
		if (!Array.isArray(value)) {
			errors.push(`${paramName} must be an array`);
		}
	}

	/**
	 * Validate object parameter
	 *
	 * @param paramName - Parameter name
	 * @param value - Parameter value
	 * @param errors - Array to collect validation errors
	 */
	private validateObjectParameter(paramName: string, value: unknown, errors: string[]): void {
		if (typeof value !== "object" || value === null || Array.isArray(value)) {
			errors.push(`${paramName} must be an object`);
		}
	}

	/**
	 * Execute a function with a timeout
	 *
	 * @param fn - Function to execute
	 * @param timeoutMs - Timeout in milliseconds
	 * @param toolName - Name of the tool being executed
	 * @returns Result of the function
	 * @throws ToolExecutionError if timeout is reached
	 */
	private async executeWithTimeout<T>(
		fn: () => Promise<T>,
		timeoutMs: number,
		toolName: string,
	): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			let timeoutId: NodeJS.Timeout;

			// Create timeout promise
			const timeoutPromise = new Promise<never>((_, timeoutReject) => {
				timeoutId = setTimeout(() => {
					timeoutReject(
						new ToolExecutionError(
							`Tool execution timed out after ${timeoutMs}ms`,
							toolName,
						),
					);
				}, timeoutMs);
			});

			// Handle successful execution
			const handleSuccess = (result: T) => {
				clearTimeout(timeoutId);
				resolve(result);
			};

			// Handle execution failure
			const handleFailure = (error: unknown) => {
				clearTimeout(timeoutId);
				reject(
					new ToolExecutionError(
						`Tool execution failed: ${error instanceof Error ? error.message : String(error)}`,
						toolName,
						error,
					),
				);
			};

			// Execute function
			fn().then(handleSuccess).catch(handleFailure);

			// Race between function execution and timeout
			Promise.race([fn(), timeoutPromise]).then(resolve).catch(reject);
		});
	}

	/**
	 * Generate a cache key for tool execution
	 *
	 * @param toolName - Name of the tool
	 * @param args - Arguments for the tool
	 * @returns Cache key
	 */
	private generateCacheKey(toolName: string, args: Record<string, unknown>): string {
		try {
			return `${toolName}:${JSON.stringify(args)}`;
		} catch {
			// If arguments can't be stringified, don't cache
			return "";
		}
	}

	/**
	 * Clean up expired cache entries
	 */
	private cleanupCache(): void {
		const now = Date.now();
		const expiredKeys = this.findExpiredCacheKeys(now);
		this.removeExpiredCacheEntries(expiredKeys);
	}

	/**
	 * Find expired cache keys
	 *
	 * @param currentTime - Current timestamp
	 * @returns Array of expired cache keys
	 */
	private findExpiredCacheKeys(currentTime: number): string[] {
		const expiredKeys: string[] = [];

		this.executionCache.forEach((value, key) => {
			if (currentTime - value.timestamp > this.cacheDuration) {
				expiredKeys.push(key);
			}
		});

		return expiredKeys;
	}

	/**
	 * Remove expired cache entries
	 *
	 * @param keys - Keys to remove
	 */
	private removeExpiredCacheEntries(keys: string[]): void {
		keys.forEach((key) => this.executionCache.delete(key));
	}
}
