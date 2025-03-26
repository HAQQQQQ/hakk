import { Module } from "@nestjs/common";
import { InterestsController } from "./interests.controller";
import { InterestsService } from "./interests.service";
import { SupabaseService } from "../supabase/supabase.service";
import { OpenAIModule } from "../openai/openai.module";
import { InterestsRepository } from "./interests.repository";
import { ProfileModule } from "../profile/profile.module";
@Module({
	imports: [OpenAIModule, ProfileModule],
	providers: [InterestsService, SupabaseService, InterestsRepository],
	controllers: [InterestsController],
	exports: [InterestsService],
})
export class InterestsModule {}
