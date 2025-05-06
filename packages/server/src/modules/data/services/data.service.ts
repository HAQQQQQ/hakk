import { Injectable, NotFoundException } from "@nestjs/common";
import { parse, Parser, Options } from "csv-parse";
import { Readable } from "stream";
import { BrokerageFirm } from "../types/brokerage-firm.enum";
import { DataRepository } from "../repo/data.repository";
import { UserService } from "@/modules/user/services/user.service";

/**
 * Interface for CSV Parser options with strong typing
 */
interface CSVParserOptions extends Options {
	columns: boolean;
	skip_empty_lines: boolean;
	trim: boolean;
}

/**
 * Generic type for CSV record with flexible schema
 * Can be extended with specific fields for type checking
 */
export type CSVRecord<T = Record<string, string | number | boolean | null>> = T;

/**
 * Response type for import operations
 */
export interface ImportResult<T> {
	imported?: number;
	records: T[];
	userId: string;
	firm: BrokerageFirm;
}

@Injectable()
export class DataService<T extends CSVRecord = CSVRecord> {
	constructor(
		private readonly dataRepository: DataRepository,
		private readonly usersService: UserService,
	) {}

	/**
	 * Imports and parses a CSV file from a multipart form upload
	 * @param file - The uploaded file from Multer middleware
	 * @param userId - ID of the user performing the import
	 * @param firm - Type of firm from the FirmType enum
	 * @returns Object containing the number of records imported and the parsed records
	 */
	async importCsv(
		userId: string,
		firm: BrokerageFirm,
		file: Express.Multer.File,
	): Promise<ImportResult<T>> {
		const userExists = await this.usersService.validateUser(userId);
		// Move this to a nestjs guard in the future
		if (!userExists) {
			throw new NotFoundException(`User with ID "${userId}" not found`);
		}
		try {
			// Create parser with options
			const parserOptions: CSVParserOptions = {
				columns: true, // Use first row as headers
				skip_empty_lines: true,
				trim: true,
			};

			// Stream buffer through parser
			const records: T[] = await this.parseCSVStream(file.buffer, parserOptions);

			// Persist the records to database
			// Persist the records to database - fixed to pass individual parameters
			const insertedRecords = await this.dataRepository.insertTrades<T>({
				userId,
				firm,
				records,
			} as ImportResult<T>);

			// Here you could add additional processing:
			// - Data validation
			// - Transformation
			// - Database operations
			// - Log the userId and firm for audit purposes
			console.log(`Import by user ${userId} for firm type ${firm}`);

			return {
				imported: records.length,
				records,
				userId,
				firm,
			} as ImportResult<T>;
		} catch (error: unknown) {
			// Ensure type safety when handling errors
			const message = error instanceof Error ? error.message : String(error);
			throw new Error(`CSV import failed: ${message}`);
		}
	}

	/**
	 * Helper method to parse a buffer through csv-parse stream
	 * @param buffer - Raw file buffer
	 * @param options - Parser options
	 * @returns Parsed records as array of objects
	 */
	private async parseCSVStream(buffer: Buffer, options: CSVParserOptions): Promise<T[]> {
		return new Promise<T[]>((resolve, reject) => {
			const records: T[] = [];
			const stream = Readable.from(buffer);
			const parser: Parser = parse(options);

			parser.on("readable", () => {
				let record: T | null;
				while ((record = parser.read() as T | null) !== null) {
					if (record) {
						records.push(record);
					}
				}
			});

			parser.on("error", (err: Error) => reject(err));
			parser.on("end", () => resolve(records));

			stream.pipe(parser);
		});
	}
}
