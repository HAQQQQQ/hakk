import { BadRequestException, Body, Controller, Post } from "@nestjs/common";
import { TranscriptionService } from "./transcription.service";
import { TradingSentimentAnalysis } from "../agents/trading-sentiment/types/trading-sentiment.types";

@Controller("transcription")
export class TranscriptionController {
	constructor(private readonly transcriptionService: TranscriptionService) {}

	@Post("transcribe")
	async transcribe(@Body("logs") logs: string): Promise<TradingSentimentAnalysis> {
		//Promise<{ reflection: JournalReflection }> {
		if (!logs?.trim()) {
			throw new BadRequestException("Entry text is required");
		}
		return this.transcriptionService.analyzeTradingJournal(logs);
	}
}
