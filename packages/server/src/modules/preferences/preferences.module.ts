import { Module } from "@nestjs/common";
import { PreferencesService } from "./preferences.service.js";
import { PreferencesController } from "./preferences.controller.js";
import { SupabaseService } from "@modules/supabase/supabase.service.js";
import { InterestsModule } from "../interests/interests.module.js";
import { PreferenceRepository } from "./preferences.repository.js";
import { ProfileModule } from "../profile/profile.module.js";

@Module({
	imports: [InterestsModule, ProfileModule],
	providers: [PreferencesService, SupabaseService, PreferenceRepository],
	controllers: [PreferencesController],
})
export class PreferencesModule {}
