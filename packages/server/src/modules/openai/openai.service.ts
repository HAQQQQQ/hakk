import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import {
	ChatCompletionToolDefinition,
	OpenAIErrorStatus,
	OpenAIResponse,
	OpenAIResponseStatus,
	OpenAITokens,
	ToolSchema,
} from "./openai.types";
import type { OpenAIConfigSettings } from "./openai.types";
import { OpenAIConfigResponseDto, UpdateOpenAIConfigRequestDto } from "./openai-config.dto";
import OpenAI from "openai";
import { ZodError, ZodSchema } from "zod";
import { ChatCompletion } from "openai/resources.mjs";
import { OpenAIConfigRepository } from "./openai-config.repository";
import { OpenAIConfigMapper } from "./openai-config.mapper";

@Injectable()
export class OpenAIService implements OnModuleInit {
	private readonly logger = new Logger(OpenAIService.name);

	// In-memory configuration cache
	private configSettings: OpenAIConfigSettings;

	constructor(
		@Inject(OpenAITokens.CLIENT) private readonly openai: OpenAI,
		@Inject(OpenAITokens.DEFAULT_CONFIG) private readonly defaultConfig: OpenAIConfigSettings,
		private readonly configRepository: OpenAIConfigRepository,
		private readonly configMapper: OpenAIConfigMapper,
	) {
		// Initialize with injected defaults
		this.configSettings = { ...defaultConfig };
	}

	/**
	 * On module initialization, load configuration from the database
	 */
	async onModuleInit() {
		try {
			// Try to load configuration from database
			const storedConfig = await this.configRepository.getConfig();

			if (storedConfig) {
				this.logger.log("Loaded OpenAI configuration from database");
				this.configSettings = storedConfig;
			} else {
				this.logger.log("No stored configuration found, using defaults");
			}
		} catch (error) {
			this.logger.error(`Failed to load configuration: ${error.message}`);
			this.logger.log("Using default configuration");
		}
	}

	/**
	 * Update the configuration settings and persist to database
	 */
	async updateConfiguration(
		newConfig: UpdateOpenAIConfigRequestDto,
	): Promise<OpenAIConfigResponseDto> {
		try {
			// Use mapper to merge configurations
			const updatedConfig = this.configMapper.toEntityForUpdate(
				newConfig,
				this.configSettings,
			);

			// Save to database
			const savedConfig = await this.configRepository.saveConfig(updatedConfig);

			// Update in-memory cache
			this.configSettings = savedConfig;

			this.logger.log("OpenAI service configuration updated and persisted");
			return this.configMapper.toResponseDto(this.configSettings);
		} catch (error) {
			this.logger.error(`Failed to update configuration: ${error.message}`);
			throw error;
		}
	}

	/**
	 * Reset configuration to system defaults and persist to database
	 */
	async resetConfiguration(): Promise<OpenAIConfigResponseDto> {
		try {
			// Reset in database
			const defaults = await this.configRepository.resetToDefaults();

			// Update in-memory cache
			this.configSettings = defaults;

			this.logger.log("OpenAI service configuration reset to defaults");
			return this.configMapper.toResponseDto(this.configSettings);
		} catch (error) {
			this.logger.error(`Failed to reset configuration: ${error.message}`);
			throw error;
		}
	}

	/**
	 * Get the current configuration settings
	 */
	getConfiguration(): OpenAIConfigResponseDto {
		return this.configMapper.toResponseDto(this.configSettings);
	}

	async executeToolCall<T>(
		prompt: string,
		tool: ToolSchema,
		validator: ZodSchema<T>,
		systemMessage?: string,
	): Promise<OpenAIResponse<T>> {
		// Use provided systemMessage or the current configSettings.systemMessage
		const effectiveSystemMessage = systemMessage || this.configSettings.systemMessage;

		const toolDef = this.buildToolDefinition(tool);
		let lastError: unknown;

		// Use the current config settings for retries
		for (let attempt = 1; attempt <= this.configSettings.maxRetries; attempt++) {
			this.logAttempt(attempt, tool.name);
			try {
				const response = await this.callOpenAI(prompt, effectiveSystemMessage, toolDef);
				const data = this.parseAndValidate(response, validator);
				return this.successResponse(data, prompt, tool.name);
			} catch (err) {
				lastError = err;
				const status = this.getErrorStatus(err);
				this.logger.error(
					`Attempt ${attempt} for ${tool.name} failed: ${status} - ${(err as Error).message}`,
				);
				if (attempt < this.configSettings.maxRetries) {
					await this.backoff(attempt);
				} else {
					return this.errorResponse(err as Error, status, prompt);
				}
			}
		}

		return this.errorResponse(lastError as Error, OpenAIResponseStatus.UNKNOWN_ERROR, prompt);
	}

	private buildToolDefinition(tool: ToolSchema): ChatCompletionToolDefinition {
		return { type: "function", function: tool };
	}

	private async callOpenAI(
		prompt: string,
		systemMessage: string,
		toolDef: ChatCompletionToolDefinition,
	): Promise<ChatCompletion> {
		const start = Date.now();
		// Use current config settings
		const response = await this.openai.chat.completions.create({
			model: this.configSettings.model,
			messages: [
				{ role: "system", content: systemMessage },
				{ role: "user", content: prompt },
			],
			tools: [toolDef],
			tool_choice: "auto",
			temperature: this.configSettings.temperature,
		});
		this.logger.debug(`API call duration: ${Date.now() - start}ms`);
		return response;
	}

	private parseAndValidate<T>(response: ChatCompletion, validator: ZodSchema<T>): T {
		const call = response.choices[0].message.tool_calls?.[0];
		if (!call) {
			throw new Error("No function call in response");
		}
		const args = JSON.parse(call.function.arguments);
		try {
			return validator.parse(args);
		} catch (e) {
			throw e;
		}
	}

	private async backoff(attempt: number) {
		// Use current config settings
		const delay = this.configSettings.retryDelay * 2 ** (attempt - 1);
		this.logger.debug(`Waiting ${delay}ms before retry`);
		await new Promise((res) => setTimeout(res, delay));
	}

	private logAttempt(attempt: number, toolName: string) {
		this.logger.debug(
			`Attempt ${attempt}/${this.configSettings.maxRetries} - tool: ${toolName}`,
		);
	}

	private successResponse<T>(data: T, prompt: string, toolName: string): OpenAIResponse<T> {
		this.logger.debug(`Tool ${toolName} succeeded`);
		return { status: OpenAIResponseStatus.SUCCESS, data, originalPrompt: prompt };
	}

	private errorResponse<T>(
		error: Error,
		status: OpenAIErrorStatus,
		prompt: string,
	): OpenAIResponse<T> {
		return { status, error, originalPrompt: prompt };
	}

	private getErrorStatus(err: unknown): OpenAIErrorStatus {
		if (err instanceof SyntaxError) return OpenAIResponseStatus.INVALID_JSON;
		if (err instanceof ZodError) return OpenAIResponseStatus.SCHEMA_VALIDATION_FAILED;
		if ((err as any).name === "OpenAIError") return OpenAIResponseStatus.API_ERROR;
		return OpenAIResponseStatus.UNKNOWN_ERROR;
	}
}
