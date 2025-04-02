import { Module } from "@nestjs/common";
import { InterestsController } from "./interests.controller.js";
import { InterestsService } from "./interests.service.js";
import { SupabaseService } from "../supabase/supabase.service.js";
import { OpenAIModule } from "../openai/openai.module.js";
import { InterestsRepository } from "./interests.repository.js";
import { ProfileModule } from "../profile/profile.module.js";
@Module({
	imports: [OpenAIModule, ProfileModule],
	providers: [InterestsService, SupabaseService, InterestsRepository],
	controllers: [InterestsController],
	exports: [InterestsService],
})
export class InterestsModule {}
