import { Module } from "@nestjs/common";
import { PreferencesService } from "./preferences.service";
import { PreferencesController } from "./preferences.controller";
import { SupabaseService } from "@modules/supabase/supabase.service";
import { InterestsModule } from "../interests/interests.module";
import { PreferenceRepository } from "./preferences.repository";

@Module({
	imports: [InterestsModule],
	providers: [PreferencesService, SupabaseService, PreferenceRepository],
	controllers: [PreferencesController],
})
export class PreferencesModule {}
