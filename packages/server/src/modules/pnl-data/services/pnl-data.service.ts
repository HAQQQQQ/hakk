// src/data/services/data.service.ts
import {
	Injectable,
	NotFoundException,
	BadRequestException,
	InternalServerErrorException,
} from "@nestjs/common";
import { BrokerageFirm } from "../types/brokerage-firm.enum";
import { PnlDataRepository } from "../repo/pnl-data.repository";
import { UserService } from "@/modules/user/services/user.service";
import {
	CSVParserOptions,
	CsvParserService,
	CSVRecord,
} from "@/modules/csv-parser/csv-parser.service";
import { CsvParseError } from "@/modules/csv-parser/csv-parse-error";

export interface ImportResult {
	imported?: number;
	records: CSVRecord[];
	userId: string;
	firm: BrokerageFirm;
}

@Injectable()
export class PnlDataService {
	constructor(
		private readonly csvParser: CsvParserService,
		private readonly dataRepository: PnlDataRepository,
		private readonly usersService: UserService,
	) {}

	async importCsv(
		userId: string,
		firm: BrokerageFirm,
		file: Express.Multer.File,
	): Promise<ImportResult> {
		// 1) ensure user exists
		const exists = await this.usersService.validateUser(userId);
		if (!exists) {
			throw new NotFoundException(`User with ID "${userId}" not found`);
		}

		// 2) parse CSV, catching parse errors explicitly
		let records: CSVRecord[];
		const options: CSVParserOptions = {
			columns: true,
			skip_empty_lines: true,
			trim: true,
		};
		try {
			records = await this.csvParser.parseBuffer(file.buffer, options);
		} catch (err) {
			if (err instanceof CsvParseError) {
				throw new BadRequestException(`Invalid CSV format: ${err.message}`);
			}
			throw err;
		}

		// 3) persist & catch DB errors
		try {
			await this.dataRepository.insertTrades({
				userId,
				firm,
				records,
			});
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			throw new InternalServerErrorException(`Failed to save CSV records: ${msg}`);
		}

		// 4) return summary
		return {
			imported: records.length,
			records,
			userId,
			firm,
		};
	}
}
