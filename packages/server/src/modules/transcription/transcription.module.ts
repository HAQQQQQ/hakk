import { Module } from "@nestjs/common";
import { TranscriptionService } from "./transcription.service";
import { TranscriptionController } from "./transcription.controller";
import { TranscriptionRepository } from "./transcription.repository";
import { SupabaseModule } from "../supabase/supabase.module";
import { OpenAIModule } from "../openai/openai.module";

@Module({
	imports: [SupabaseModule, OpenAIModule],
	controllers: [TranscriptionController],
	providers: [TranscriptionService, TranscriptionRepository],
})
export class TranscriptionModule {}
