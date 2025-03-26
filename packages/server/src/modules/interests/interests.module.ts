import { Module } from "@nestjs/common";
import { InterestsController } from "./interests.controller";
import { InterestsService } from "./interests.service";
import { SupabaseService } from "../supabase/supabase.service";
import { OpenAIModule } from "../openai/openai.module";
import { InterestsRepository } from "./interests.repository";
@Module({
	imports: [OpenAIModule],
	providers: [InterestsService, SupabaseService, InterestsRepository],
	controllers: [InterestsController],
	exports: [InterestsService],
})
export class InterestsModule {}
