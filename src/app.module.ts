import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ProfileModule } from "./profile/profile.module";
import { SupabaseService } from "./supabase/supabase.service";
import { UsersController } from "./users/users.controller";
import { TestModule } from './test/test.module';

@Module({
	imports: [ProfileModule, TestModule],
	controllers: [AppController, UsersController],
	providers: [AppService, SupabaseService],
	exports: [SupabaseService],
})
export class AppModule {}
