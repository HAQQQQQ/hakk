import { Inject, Injectable, Logger } from "@nestjs/common";
import OpenAI from "openai";
import {
	ChatCompletionToolDefinition,
	OpenAIErrorStatus,
	OpenAIResponse,
	OpenAIResponseStatus,
	OpenAITokens,
	ToolSchema,
} from "./openai.types";
import { ZodError, ZodSchema } from "zod";
import type { ChatCompletion } from "openai/resources.mjs";
import { OpenAIConfigService } from "./openai-config.service";

@Injectable()
export class OpenAIClientService {
	private readonly logger = new Logger(OpenAIClientService.name);

	constructor(
		@Inject(OpenAITokens.CLIENT) private readonly openai: OpenAI,
		private readonly configService: OpenAIConfigService,
	) {}

	/**
	 * Call OpenAI with function‐calling. Parses according to current config.
	 */
	async executeToolCall<T>(
		prompt: string,
		tool: ToolSchema,
		validator: ZodSchema<T>,
		overrideSystemMessage?: string,
	): Promise<OpenAIResponse<T>> {
		const cfg = this.configService.settings;
		const systemMessage = overrideSystemMessage ?? cfg.systemMessage;
		const toolDef = this.buildToolDefinition(tool);

		try {
			const response = await this.callOpenAI(prompt, systemMessage, toolDef, cfg);
			const data = this.parseAndValidate(response, validator);
			return this.successResponse(data, prompt, tool.name);
		} catch (err) {
			const status = this.getErrorStatus(err);
			this.logger.error(`Tool call failed (${status}): ${(err as Error).message}`);
			return this.errorResponse(err as Error, status, prompt);
		}
	}

	private buildToolDefinition(tool: ToolSchema): ChatCompletionToolDefinition {
		return { type: "function", function: tool };
	}

	private async callOpenAI(
		prompt: string,
		systemMessage: string,
		toolDef: ChatCompletionToolDefinition,
		cfg: { model: string; temperature: number },
	): Promise<ChatCompletion> {
		const start = Date.now();
		const response = await this.openai.chat.completions.create({
			model: cfg.model,
			messages: [
				{ role: "system", content: systemMessage },
				{ role: "user", content: prompt },
			],
			tools: [toolDef],
			tool_choice: "auto",
			temperature: cfg.temperature,
		});
		this.logger.debug(`API call took ${Date.now() - start}ms`);
		return response as ChatCompletion;
	}

	private parseAndValidate<T>(response: ChatCompletion, validator: ZodSchema<T>): T {
		const call = response.choices[0].message.tool_calls?.[0];
		if (!call) throw new Error("No function call in response");
		const args = JSON.parse(call.function.arguments);
		try {
			return validator.parse(args);
		} catch (e) {
			if (e instanceof ZodError) throw e;
			throw new Error(`Validation error: ${(e as Error).message}`);
		}
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
