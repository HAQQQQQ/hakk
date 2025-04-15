import { Module } from "@nestjs/common";
import { TranscriptionsController } from "./transcriptions.controller";
import { TranscriptionsService } from "./transcriptions.service";
import { TranscriptionsRepository } from "./transcriptions.repository";
import { SupabaseService } from "../supabase/supabase.service";

@Module({
	controllers: [TranscriptionsController],
	providers: [SupabaseService, TranscriptionsService, TranscriptionsRepository],
})
export class TranscriptionsModule {}
