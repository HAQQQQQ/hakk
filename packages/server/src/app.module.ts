import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ProfileModule } from "./modules/profile/profile.module";
import { OpenAIModule } from "./modules/openai/openai.module";
import { UsersController } from "./modules/users/users.controller";
import { SupabaseService } from "./modules/supabase/supabase.service";
import { TestModule } from "../test/test.module";
import { InterestsModule } from "./modules/interests/interests.module";
import { PreferencesModule } from '@modules/preferences/preferences.module';

@Module({
	imports: [ProfileModule, TestModule, OpenAIModule, InterestsModule, PreferencesModule],
	controllers: [AppController, UsersController],
	providers: [AppService, SupabaseService],
	exports: [SupabaseService],
})
export class AppModule {}
