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

export interface TimeRange {
	minTime: Date;
	maxTime: Date;
}

export interface ImportResult {
	imported?: number;
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
			if (records.length === 0) {
				throw new Error("No records provided");
			}
		} catch (err) {
			if (err instanceof CsvParseError) {
				throw new BadRequestException(`Invalid CSV format: ${err.message}`);
			}
			throw err;
		}

		// 3) compute min/max timestamps
		const timeRange: TimeRange = this.getTimeRangeFromCsvRecords(records);

		// 4) persist & catch DB errors
		try {
			await this.dataRepository.insertTrades({
				user_id: userId,
				firm,
				records,
				min_time: timeRange.minTime,
				max_time: timeRange.maxTime,
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
			timeRange,
		};
	}

	/**
	 * Given an array of generic CSVRecord objects, find the earliest and
	 * latest instants among the `EnteredAt` and `ExitedAt` fields.
	 *
	 * @param rows       An array of records, each with `EnteredAt` and `ExitedAt` strings
	 * @param enterKey   The property name for entry time (default "EnteredAt")
	 * @param exitKey    The property name for exit time  (default "ExitedAt")
	 */
	getTimeRangeFromCsvRecords(
		rows: CSVRecord[],
		enterKey: string = "EnteredAt",
		exitKey: string = "ExitedAt",
	): TimeRange {
		const allMs: number[] = [];

		for (const row of rows) {
			const ent = row[enterKey];
			const ext = row[exitKey];

			if (typeof ent !== "string" || typeof ext !== "string") {
				throw new Error(
					`Missing or invalid timestamp fields on row: ${JSON.stringify(row)}`,
				);
			}

			const entMs = Date.parse(ent);
			const extMs = Date.parse(ext);

			if (isNaN(entMs) || isNaN(extMs)) {
				throw new Error(`Unable to parse timestamps: ${ent} / ${ext}`);
			}

			allMs.push(entMs, extMs);
		}

		const minMs = Math.min(...allMs);
		const maxMs = Math.max(...allMs);

		return { minTime: new Date(minMs), maxTime: new Date(maxMs) };
	}
}
