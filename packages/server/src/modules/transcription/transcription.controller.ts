import { BadRequestException, Body, Controller, Post } from "@nestjs/common";
import { TranscriptionService } from "./transcription.service";
import { JournalReflection } from "../agents/journal-reflection.agent";

@Controller("transcription")
export class TranscriptionController {
	constructor(private readonly transcriptionService: TranscriptionService) {}

	@Post("transcribe")
	async transcribe(@Body("logs") logs: string): Promise<JournalReflection> {
		//Promise<{ reflection: JournalReflection }> {
		if (!logs?.trim()) {
			throw new BadRequestException("Entry text is required");
		}
		return this.transcriptionService.transcribeLogs(logs);
	}
}
