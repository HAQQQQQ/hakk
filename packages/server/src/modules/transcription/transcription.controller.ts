import { BadRequestException, Body, Controller, Post } from "@nestjs/common";
import { TranscriptionService } from "./transcription.service";
import { GeneralTradingAnalysis } from "../agents_new/trading-sentiment/general-analysis.agent";
import { AgentResponse } from "../agents_new";

@Controller("transcription")
export class TranscriptionController {
	constructor(private readonly transcriptionService: TranscriptionService) {}

	// @Post("transcribe_old")
	// async transcribe(@Body("logs") logs: string): Promise<AgentResponseOld<GeneralTradingAnalysis>> {
	//     //Promise<{ reflection: JournalReflection }> {
	//     console.log("In transcribe endpoint");
	//     console.log("logs are:", logs);
	//     if (!logs?.trim()) {
	//         throw new BadRequestException("Entry text is required");
	//     }
	//     return this.transcriptionService.generalAnalysisOld(logs);
	// }

	@Post("transcribe")
	async transcribe_new(
		@Body("logs") logs: string,
	): Promise<AgentResponse<GeneralTradingAnalysis> | null> {
		//Promise<{ reflection: JournalReflection }> {
		console.log("In transcribe endpoint");
		console.log("logs are:", logs);
		if (!logs?.trim()) {
			throw new BadRequestException("Entry text is required");
		}
		return this.transcriptionService.generalAnalysis(logs);
	}
}
