import { Module } from "@nestjs/common";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";
import { ProfileRepository } from "./profile.repository";
import { SupabaseService } from "../supabase/supabase.service";

@Module({
	controllers: [ProfileController],
	providers: [ProfileService, SupabaseService, ProfileRepository],
	exports: [ProfileService],
})
export class ProfileModule {}
