import { Body, Controller, Post } from "@nestjs/common";
import { TranscriptionsService } from "./transcriptions.service";

@Controller("transcriptions")
export class TranscriptionsController {
	constructor(private readonly transcriptionsService: TranscriptionsService) {}

	@Post()
	async create(@Body() text: string): Promise<any> {
		return {
			success: true,
			data: await this.transcriptionsService.create(text),
		};
	}
}
