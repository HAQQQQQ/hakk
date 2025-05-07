// src/data/services/data.service.ts
import { Injectable, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { BrokerageFirm } from "../types/brokerage-firm.enum";
import { PnlDataRepository } from "../repo/pnl-data.repository";
import { UserService } from "@/modules/user/services/user.service";
import {
	CSVParserOptions,
	CsvParserService,
	CSVRecord,
} from "@/modules/csv-parser/csv-parser.service";
import { CsvParseError } from "@/modules/csv-parser/csv-parse-error";

export interface TimeRange {
	minTime: Date;
	maxTime: Date;
}

export interface ImportResult {
	numberOfRows?: number;
	records: CSVRecord[];
	userId: string;
	firm: BrokerageFirm;
	timeRange: TimeRange;
}

@Injectable()
export class PnlDataService {
	constructor(
		private readonly csvParser: CsvParserService,
		private readonly dataRepository: PnlDataRepository,
		private readonly userService: UserService,
	) {}

	async importCsv(
		userId: string,
		firm: BrokerageFirm,
		file: Express.Multer.File,
	): Promise<ImportResult> {
		// 1) Validate + resolve user_firm_id
		const userFirmId = await this.validateAndGetUserFirmId(userId, firm);

		// 2) Parse CSV into records
		const records = await this.parseCsv(file.buffer);

		// 3) Compute the time range
		const timeRange = this.computeTimeRange(records);

		// 4) Persist
		await this.saveRecords(userFirmId, records, timeRange);

		// 5) Build and return the result
		return this.buildResult(userId, firm, records, timeRange);
	}

	private async validateAndGetUserFirmId(userId: string, firm: BrokerageFirm): Promise<number> {
		// throws NotFoundException if user or firm not found
		return this.userService.findUserFirmId(userId, firm);
	}

	private async parseCsv(buffer: Buffer): Promise<CSVRecord[]> {
		try {
			const options: CSVParserOptions = {
				columns: true,
				skip_empty_lines: true,
				trim: true,
			};
			const records = await this.csvParser.parseBuffer(buffer, options);
			if (records.length === 0) {
				throw new BadRequestException("CSV contained no records");
			}
			return records;
		} catch (err) {
			if (err instanceof CsvParseError) {
				throw new BadRequestException(`Invalid CSV format: ${err.message}`);
			}
			throw err;
		}
	}

	private computeTimeRange(records: CSVRecord[]): TimeRange {
		// reuse your existing logic
		const allMs: number[] = [];
		for (const record of records) {
			const enteredAt = record["EnteredAt"];
			const exitedAt = record["ExitedAt"];
			if (typeof enteredAt !== "string" || typeof exitedAt !== "string") {
				throw new BadRequestException("Missing EnteredAt/ExitedAt fields");
			}
			const enteredAtMs = Date.parse(enteredAt);
			const exitedAtMs = Date.parse(exitedAt);
			if (isNaN(enteredAtMs) || isNaN(exitedAtMs)) {
				throw new BadRequestException("Unparseable timestamps");
			}
			allMs.push(enteredAtMs, exitedAtMs);
		}
		return {
			minTime: new Date(Math.min(...allMs)),
			maxTime: new Date(Math.max(...allMs)),
		};
	}

	private async saveRecords(
		userFirmId: number,
		records: CSVRecord[],
		{ minTime, maxTime }: TimeRange,
	) {
		try {
			await this.dataRepository.insertTrades({
				user_firm_id: userFirmId,
				records,
				min_time: minTime,
				max_time: maxTime,
			});
		} catch (err) {
			throw new InternalServerErrorException(
				`Failed to save CSV records: ${err instanceof Error ? err.message : err}`,
			);
		}
	}

	private buildResult(
		userId: string,
		firm: BrokerageFirm,
		records: CSVRecord[],
		timeRange: TimeRange,
	): ImportResult {
		return {
			numberOfRows: records.length,
			records,
			userId,
			firm,
			timeRange,
		};
	}
}
