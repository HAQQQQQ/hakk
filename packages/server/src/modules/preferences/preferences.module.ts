import { Module } from "@nestjs/common";
import { PreferencesService } from "./preferences.service";
import { PreferencesController } from "./preferences.controller";
import { SupabaseService } from "@modules/supabase/supabase.service";
import { InterestsModule } from "../interests/interests.module";
import { PreferenceRepository } from "./preferences.repository";
import { ProfileModule } from "../profile/profile.module";

@Module({
	imports: [InterestsModule, ProfileModule],
	providers: [PreferencesService, SupabaseService, PreferenceRepository],
	controllers: [PreferencesController],
})
export class PreferencesModule {}
