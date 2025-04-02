import { Module } from "@nestjs/common";
import { ProfileService } from "./services/profile.service.js";
import { ProfileRepository } from "./repo/profile.repository.js";
import { SupabaseService } from "../supabase/supabase.service.js";
import { ProfileMapperService } from "./repo/profile.mapper.service.js";
import { ProfileController } from "./controllers/profile.controller.js";

@Module({
	controllers: [ProfileController],
	providers: [ProfileService, SupabaseService, ProfileRepository, ProfileMapperService],
	exports: [ProfileService],
})
export class ProfileModule {}
