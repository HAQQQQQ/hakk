// src/common/csv/csv-parser.service.ts
import { Injectable } from "@nestjs/common";
import { parse, Parser, Options } from "csv-parse";
import { Readable } from "stream";
import { CsvParseError } from "./csv-parse-error";

/**
 * Strongly-typed options for CSV parsing
 */
export interface CSVParserOptions extends Options {
	columns: boolean;
	skip_empty_lines: boolean;
	trim: boolean;
}

/**
 * Generic type for CSV record with flexible schema
 * Can be extended with specific fields for type checking
 */
export type CSVRecord = Record<string, string | number | boolean | null>;

/**
 * A generic CSV parsing service that streams a buffer
 * through csv-parse and returns an array of records.
 */
@Injectable()
export class CsvParserService {
	/**
	 * Parse a CSV file buffer into an array of objects.
	 * @param buffer Raw file buffer
	 * @param options CSV parsing options
	 */
	async parseBuffer(buffer: Buffer, options: CSVParserOptions): Promise<CSVRecord[]> {
		try {
			return new Promise<CSVRecord[]>((resolve, reject) => {
				const records: CSVRecord[] = [];
				const stream = Readable.from(buffer);
				const parser: Parser = parse(options);

				parser.on("readable", () => {
					let record: CSVRecord | null;
					while ((record = parser.read() as CSVRecord | null) !== null) {
						records.push(record);
					}
				});

				parser.on("error", (err) => reject(err));
				parser.on("end", () => resolve(records));

				stream.pipe(parser);
			});
		} catch (err) {
			// wrap any underlying parser error in a custom error type
			throw new CsvParseError((err as Error).message);
		}
	}
}
