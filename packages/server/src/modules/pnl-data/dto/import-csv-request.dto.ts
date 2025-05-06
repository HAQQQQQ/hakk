// src/data/dto/import-csv-request.dto.ts
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { BrokerageFirm } from "../types/brokerage-firm.enum";

export class ImportCsvRequestDto {
	@IsString()
	@IsNotEmpty()
	userId!: string;

	@IsEnum(BrokerageFirm, {
		message: `firm must be one of: ${Object.values(BrokerageFirm).join(", ")}`,
	})
	@IsNotEmpty()
	firm!: BrokerageFirm;
}
