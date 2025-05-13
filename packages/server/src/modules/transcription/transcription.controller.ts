import { BadRequestException, Body, Controller, Post } from "@nestjs/common";
import { TranscriptionService } from "./transcription.service";
import { CoreSentimentAnalysis } from "../agents/trading-sentiment/agents/sentiment-analysis-agent/core-sentiment.schema";
import { AgentResponse } from "../agents/base.agent";
import { GeneralTradingAnalysis } from "../agents_new/trading-sentiment/general-analysis.agent";

@Controller("transcription")
export class TranscriptionController {
	constructor(private readonly transcriptionService: TranscriptionService) {}

	@Post("transcribe_old")
	async transcribe(@Body("logs") logs: string): Promise<AgentResponse<GeneralTradingAnalysis>> {
		//Promise<{ reflection: JournalReflection }> {
		console.log("In transcribe endpoint");
		console.log("logs are:", logs);
		if (!logs?.trim()) {
			throw new BadRequestException("Entry text is required");
		}
		return this.transcriptionService.generalAnalysisOld(logs);
	}

	@Post("transcribe")
	async transcribe_new(@Body("logs") logs: string): Promise<GeneralTradingAnalysis | null> {
		//Promise<{ reflection: JournalReflection }> {
		console.log("In transcribe endpoint");
		console.log("logs are:", logs);
		if (!logs?.trim()) {
			throw new BadRequestException("Entry text is required");
		}
		return this.transcriptionService.generalAnalysis(logs);
	}
}
