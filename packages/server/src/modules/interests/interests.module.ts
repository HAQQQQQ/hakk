import { Module } from "@nestjs/common";
import { InterestsController } from "./interests.controller";
import { InterestsService } from "./interests.service";
import { SupabaseService } from "../supabase/supabase.service";
import { OpenAIModule } from "../openai/openai.module";
@Module({
	imports: [OpenAIModule],
	providers: [InterestsService, SupabaseService],
	controllers: [InterestsController],
	exports: [InterestsService],
})
export class InterestsModule {}
