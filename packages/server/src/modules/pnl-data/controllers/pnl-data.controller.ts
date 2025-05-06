import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { PnlDataService, ImportResult } from "../services/pnl-data.service";
import { ImportCsvRequestDto } from "../dto/import-csv-request.dto";

@Controller("pnldata")
export class PnlDataController {
	constructor(private readonly dataService: PnlDataService) {}

	@Post("import")
	@UseInterceptors(FileInterceptor("dataFile")) // 'dataFile' matches form.append key
	async importCsv(
		@Body() importRequest: ImportCsvRequestDto,
		@UploadedFile() file: Express.Multer.File,
	): Promise<ImportResult> {
		const { userId, firm } = importRequest;

		// Pass additional parameters to the service
		return this.dataService.importCsv(userId, firm, file);
	}
}
