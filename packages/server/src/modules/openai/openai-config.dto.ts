import { IsEnum, IsNumber, IsString, Min, Max } from "class-validator";
import { OpenAIModel } from "./openai.types";

// Response DTO - used for returning data
export class OpenAIConfigResponseDto {
	@IsEnum(OpenAIModel)
	model: OpenAIModel;

	@IsNumber()
	@Min(0)
	@Max(1)
	temperature: number;

	@IsNumber()
	@Min(0)
	maxRetries: number;

	@IsNumber()
	@Min(0)
	retryDelay: number;

	@IsString()
	systemMessage: string;
}

// Request DTO - used for creating/updating with validation
export class UpdateOpenAIConfigRequestDto {
	@IsEnum(OpenAIModel)
	model?: OpenAIModel;

	@IsNumber()
	@Min(0)
	@Max(1)
	temperature?: number;

	@IsNumber()
	@Min(0)
	maxRetries?: number;

	@IsNumber()
	@Min(0)
	retryDelay?: number;

	@IsString()
	systemMessage?: string;
}
