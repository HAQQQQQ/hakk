// openai-client.service.ts
import { Inject, Injectable, Logger } from "@nestjs/common";
import OpenAI from "openai";
import {
	OpenAIErrorStatus,
	OpenAIModel,
	OpenAIResponse,
	OpenAIResponseStatus,
	OpenAITokens,
} from "./openai.types";
import { ZodError, ZodSchema } from "zod";
import type { ChatCompletion } from "openai/resources.mjs";
import { OpenAIConfigService } from "./openai-config.service";
import { zodResponseFormat } from "openai/helpers/zod";

// type StructuredCompletionResponse<T> = OpenAI.Chat.Completions.ChatCompletion & {
//     choices: Array<{
//         message: OpenAI.Chat.Completions.ChatCompletionMessage & {
//             parsed: T;
//         };
//     }>;
// };

@Injectable()
export class OpenAIClientService {
	private readonly logger = new Logger(OpenAIClientService.name);

	constructor(
		@Inject(OpenAITokens.CLIENT) private readonly openai: OpenAI,
		private readonly configService: OpenAIConfigService,
	) {}

	/**
	 * Call OpenAI with structured outputs using zod schema
	 */
	async executeStructuredOutput<T>(
		prompt: string,
		schema: ZodSchema<T>,
		overrideSystemMessage?: string,
		schemaName: string = "response_schema",
	): Promise<OpenAIResponse<T>> {
		const cfg = this.configService.settings;
		console.log(`ai model: ${cfg.model}`);
		const systemMessage = overrideSystemMessage ?? cfg.systemMessage;

		try {
			const response = await this.callOpenAIWithStructuredOutput(
				prompt,
				systemMessage,
				schema,
				schemaName,
				cfg,
			);

			// With structured outputs, the response is already validated
			// const typedResponse = response as StructuredCompletionResponse<T>;
			// const data = typedResponse.choices[0].message.parsed;

			// Extract the content and parse it
			const content = response.choices[0].message.content;

			if (!content) {
				throw new Error("No content in response");
			}

			// Parse the response with the schema
			const data = schema.parse(JSON.parse(content));

			if (!data) {
				throw new Error("No parsed data in response");
			}

			return this.successResponse(data, prompt, schemaName);
		} catch (err) {
			const status = this.getErrorStatus(err);
			this.logger.error(
				`Structured output call failed (${status}): ${(err as Error).message}`,
			);
			return this.errorResponse(err as Error, status, prompt);
		}
	}

	/**
	 * Call OpenAI with function-calling (deprecated in favor of structured outputs)
	 * Maintained for backward compatibility
	 */
	// async executeToolCall<T>(
	//     prompt: string,
	//     tool: ToolSchema,
	//     validator: ZodSchema<T>,
	//     overrideSystemMessage?: string,
	// ): Promise<OpenAIResponse<T>> {
	//     // For backward compatibility, you can route this to structured outputs
	//     if (this.configService.settings.useStructuredOutput !== false) {
	//         this.logger.warn("Routing tool call to structured output. Consider using executeStructuredOutput directly.");
	//         return this.executeStructuredOutput(prompt, validator, overrideSystemMessage, tool.name);
	//     }

	//     // Keep original implementation for when structured outputs are disabled
	//     const cfg = this.configService.settings;
	//     const systemMessage = overrideSystemMessage ?? cfg.systemMessage;
	//     const toolDef = this.buildToolDefinition(tool);

	//     try {
	//         const response = await this.callOpenAI(prompt, systemMessage, toolDef, cfg);
	//         const data = this.parseAndValidate(response, validator);
	//         return this.successResponse(data, prompt, tool.name);
	//     } catch (err) {
	//         const status = this.getErrorStatus(err);
	//         this.logger.error(`Tool call failed (${status}): ${(err as Error).message}`);
	//         return this.errorResponse(err as Error, status, prompt);
	//     }
	// }

	private async callOpenAIWithStructuredOutput<T>(
		prompt: string,
		systemMessage: string,
		schema: ZodSchema<T>,
		schemaName: string,
		cfg: { model: string; temperature: number },
	): Promise<ChatCompletion> {
		const start = Date.now();

		// Create the structured response format using zod schema
		const responseFormat = zodResponseFormat(schema, schemaName);

		const response = await this.openai.chat.completions.create({
			model: cfg.model,
			messages: [
				{ role: "system", content: systemMessage },
				{ role: "user", content: prompt },
			],
			response_format: responseFormat,
			temperature: cfg.temperature,
		});

		this.logger.debug(`Structured output API call took ${Date.now() - start}ms`);
		return response as ChatCompletion;
	}

	// ... rest of the methods remain the same ...

	// private buildToolDefinition(tool: ToolSchema): ChatCompletionToolDefinition {
	//     return { type: "function", function: tool };
	// }

	// private async callOpenAI(
	//     prompt: string,
	//     systemMessage: string,
	//     toolDef: ChatCompletionToolDefinition,
	//     cfg: { model: string; temperature: number },
	// ): Promise<ChatCompletion> {
	//     const start = Date.now();
	//     const response = await this.openai.chat.completions.create({
	//         model: cfg.model,
	//         messages: [
	//             { role: "system", content: systemMessage },
	//             { role: "user", content: prompt },
	//         ],
	//         tools: [toolDef],
	//         tool_choice: "auto",
	//         temperature: cfg.temperature,
	//     });
	//     this.logger.debug(`API call took ${Date.now() - start}ms`);
	//     return response as ChatCompletion;
	// }

	// private parseAndValidate<T>(response: ChatCompletion, validator: ZodSchema<T>): T {
	//     const call = response.choices[0].message.tool_calls?.[0];
	//     if (!call) throw new Error("No function call in response");
	//     const args = JSON.parse(call.function.arguments);
	//     try {
	//         return validator.parse(args);
	//     } catch (e) {
	//         if (e instanceof ZodError) throw e;
	//         throw new Error(`Validation error: ${(e as Error).message}`);
	//     }
	// }

	private successResponse<T>(data: T, prompt: string, operationName: string): OpenAIResponse<T> {
		this.logger.debug(`Operation ${operationName} succeeded`);
		return {
			status: OpenAIResponseStatus.SUCCESS,
			data,
			originalPrompt: prompt,
			model: this.getModelUsed(),
		};
	}

	private errorResponse<T>(
		error: Error,
		status: OpenAIErrorStatus,
		prompt: string,
	): OpenAIResponse<T> {
		return { status, error, originalPrompt: prompt, model: this.getModelUsed() };
	}

	private getErrorStatus(err: unknown): OpenAIErrorStatus {
		if (err instanceof SyntaxError) return OpenAIResponseStatus.INVALID_JSON;
		if (err instanceof ZodError) return OpenAIResponseStatus.SCHEMA_VALIDATION_FAILED;
		if ((err as any).name === "OpenAIError") return OpenAIResponseStatus.API_ERROR;
		return OpenAIResponseStatus.UNKNOWN_ERROR;
	}

	private getModelUsed(): OpenAIModel {
		return this.configService.getConfig().model;
	}
}
