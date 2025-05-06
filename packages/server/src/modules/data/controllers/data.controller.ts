import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { DataService } from "../services/data.service";
import { ImportCsvRequestDto } from "../dto/import-csv-request.dto";

@Controller("data")
export class DataController {
	constructor(private readonly dataService: DataService) {}

	@Post("import")
	@UseInterceptors(FileInterceptor("dataFile")) // 'dataFile' matches form.append key
	async importCsv(
		@Body() importRequest: ImportCsvRequestDto,
		@UploadedFile() file: Express.Multer.File,
	): Promise<{ imported: number }> {
		const { userId, firm } = importRequest;

		// Pass additional parameters to the service
		return this.dataService.importCsv(userId, firm, file);
	}

	@Get("all")
	async getAllInterests(): Promise<any> {
		console.log("Was hitttt");
		return "hello there world";
	}
}
