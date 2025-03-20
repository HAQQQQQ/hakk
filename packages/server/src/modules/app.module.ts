import { Module } from "@nestjs/common";
import { ProfileModule } from "./profile/profile.module";
import { SupabaseService } from "./supabase/supabase.service";
import { UsersController } from "./users/users.controller";

@Module({
    imports: [ProfileModule],
    controllers: [UsersController],
    providers: [SupabaseService],
    exports: [SupabaseService],
})
export class AppModule { }
