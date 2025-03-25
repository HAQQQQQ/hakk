import { Module } from "@nestjs/common";
import { PreferencesService } from "./preferences.service";
import { PreferencesController } from "./preferences.controller";
import { SupabaseService } from "@modules/supabase/supabase.service";
import { InterestsModule } from "../interests/interests.module";

@Module({
	imports: [InterestsModule],
	providers: [PreferencesService, SupabaseService],
	controllers: [PreferencesController],
})
export class PreferencesModule {}
