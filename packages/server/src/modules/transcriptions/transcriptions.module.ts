import { Module } from "@nestjs/common";
import { TranscriptionsController } from "./transcriptions.controller";
import { TranscriptionsService } from "./transcriptions.service";
import { TranscriptionsRepository } from "./transcriptions.repository";

@Module({
	controllers: [TranscriptionsController],
	providers: [TranscriptionsService, TranscriptionsRepository],
})
export class TranscriptionsModule {}
