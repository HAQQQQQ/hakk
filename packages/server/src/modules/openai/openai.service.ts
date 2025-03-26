// src/openai/openai.service.ts
import { Injectable, Inject } from "@nestjs/common";
import { OpenAI } from "openai";
import { z } from "zod";
import { OpenAIConfig } from "./openai.config";
import { OpenAIModel, OpenAIResponse, OpenAIResponseStatus } from "./openai.types";

@Injectable()
export class OpenAIService {
	constructor(
		@Inject("OPENAI_CLIENT") private readonly openai: OpenAI,
		@Inject("OPENAI_MODEL") private readonly model: OpenAIModel,
		@Inject("OPENAI_TEMPERATURE") private readonly temperature: number,
		@Inject("OPENAI_RETRY_CONFIG")
		private readonly retryConfig: {
			maxRetries: number;
			retryDelay: number;
		},
	) {}

	async executeValidatedPrompt<T>(
		prompt: string,
		schema: z.ZodSchema<T>,
		options: {
			maxRetries?: number;
			retryDelay?: number;
		} = {},
	): Promise<OpenAIResponse<T>> {
		const {
			maxRetries = this.retryConfig.maxRetries,
			retryDelay = this.retryConfig.retryDelay,
		} = options;

		let lastError: Error | null = null;

		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			try {
				const currentPrompt =
					attempt === 1 ? prompt : this.addErrorFeedbackToPrompt(prompt, lastError);
				const responseText = await this.sendOpenAIRequest(currentPrompt);
				const parsed = JSON.parse(responseText);
				const data = schema.parse(parsed);

				// Return success response with guaranteed data
				return {
					status: OpenAIResponseStatus.SUCCESS,
					data, // This will always be defined for SUCCESS status
					originalPrompt: prompt,
				};
			} catch (error) {
				lastError = error;

				let status = OpenAIResponseStatus.UNKNOWN_ERROR;
				if (error instanceof z.ZodError) {
					status = OpenAIResponseStatus.SCHEMA_VALIDATION_FAILED;
				} else if (error instanceof SyntaxError) {
					status = OpenAIResponseStatus.INVALID_JSON;
				} else if (error.name === "OpenAIError") {
					status = OpenAIResponseStatus.API_ERROR;
				}

				// Log the error
				this.logPromptError(attempt, maxRetries, error);

				if (attempt === maxRetries) {
					// Return error response after all retries
					return {
						status,
						error,
						originalPrompt: prompt,
						// No data field for error responses
					};
				}

				await new Promise((resolve) =>
					setTimeout(resolve, retryDelay * Math.pow(2, attempt - 1)),
				);
			}
		}

		// Should never reach here but TypeScript needs it
		return {
			status: OpenAIResponseStatus.UNKNOWN_ERROR,
			error: "Max retries exceeded with no result",
			originalPrompt: prompt,
			// No data field for error responses
		};
	}

	private addErrorFeedbackToPrompt(originalPrompt: string, error: Error | null): string {
		if (!error) return originalPrompt;

		let errorFeedback = "";

		if (error instanceof z.ZodError) {
			// Extract specific validation issues
			const issues = error.errors
				.map((e) => `- ${e.path.join(".")}: ${e.message}`)
				.join("\n");
			errorFeedback = `
                    Your previous response had these validation issues:
                    ${issues}
      
                    Please fix these issues and ensure your response exactly matches the requested format.
            `;
		} else if (error instanceof SyntaxError) {
			errorFeedback = `
                    Your previous response was not valid JSON. 
                    Please ensure you return a properly formatted JSON object.
            `;
		} else {
			errorFeedback = `
                    There was a problem with your previous response.
                    Please ensure you follow the instructions exactly.
            `;
		}

		return `
            ${originalPrompt}
    
            IMPORTANT: Previous attempt failed.
            ${errorFeedback}
    
            Return ONLY the JSON object in the exact format specified.
        `;
	}

	private logPromptError(attempt: number, maxRetries: number, error: Error): void {
		console.error(
			`Attempt ${attempt}/${maxRetries} failed:`,
			error instanceof z.ZodError ? JSON.stringify(error.errors, null, 2) : error.message,
		);
	}

	private async sendOpenAIRequest(prompt: string): Promise<string> {
		try {
			const response = await this.openai.chat.completions.create({
				model: this.model,
				messages: [
					{
						role: "system",
						content: "You are a helpful assistant that responds in valid JSON format.",
					},
					{ role: "user", content: prompt },
				],
				temperature: this.temperature,
				response_format: { type: "json_object" }, // If using a model that supports this
			});

			const messageContent = response.choices[0].message.content;

			if (!messageContent) {
				throw new Error("OpenAI returned empty response");
			}

			return messageContent;
		} catch (error) {
			console.error("Error calling OpenAI:", error.message);
			throw error; // Re-throw to be handled by the retry logic
		}
	}
}
