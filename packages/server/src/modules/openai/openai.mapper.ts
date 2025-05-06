// src/modules/openai/mappers/openai-config.mapper.ts
import { Injectable } from "@nestjs/common";
import { IMapper } from "@/common/interfaces/mapper.interface";
import { OpenAIConfigSettings } from "./openai.types";
import { OpenAIConfigResponseDto, UpdateOpenAIConfigRequestDto } from "./openai.dto";

@Injectable()
export class OpenAIConfigMapper
	implements IMapper<OpenAIConfigSettings, OpenAIConfigResponseDto, UpdateOpenAIConfigRequestDto>
{
	/**
	 * Maps from internal configuration model to response DTO
	 */
	toResponseDto(config: OpenAIConfigSettings): OpenAIConfigResponseDto {
		const responseDto = new OpenAIConfigResponseDto();
		responseDto.model = config.model;
		responseDto.temperature = config.temperature;
		responseDto.maxRetries = config.maxRetries;
		responseDto.retryDelay = config.retryDelay;
		responseDto.systemMessage = config.systemMessage;
		return responseDto;
	}

	/**
	 * Maps from request DTO to a new configuration
	 */
	toEntity(dto: UpdateOpenAIConfigRequestDto): OpenAIConfigSettings {
		return {
			model: dto.model!,
			temperature: dto.temperature!,
			maxRetries: dto.maxRetries!,
			retryDelay: dto.retryDelay!,
			systemMessage: dto.systemMessage!,
		};
	}

	/**
	 * Maps from request DTO to configuration update
	 */
	toEntityForUpdate(
		dto: Partial<UpdateOpenAIConfigRequestDto>,
		existingConfig: OpenAIConfigSettings,
	): OpenAIConfigSettings {
		return {
			...existingConfig,
			...(dto.model !== undefined && { model: dto.model }),
			...(dto.temperature !== undefined && { temperature: dto.temperature }),
			...(dto.maxRetries !== undefined && { maxRetries: dto.maxRetries }),
			...(dto.retryDelay !== undefined && { retryDelay: dto.retryDelay }),
			...(dto.systemMessage !== undefined && { systemMessage: dto.systemMessage }),
		};
	}
}
