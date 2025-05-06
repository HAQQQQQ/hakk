// a custom error
export class CsvParseError extends Error {
	constructor(msg: string) {
		super(msg);
		this.name = "CsvParseError";
	}
}
