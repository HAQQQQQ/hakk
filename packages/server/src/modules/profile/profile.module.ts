import { Module } from "@nestjs/common";
import { ProfileService } from "./services/profile.service";
import { ProfileRepository } from "./repo/profile.repository";
import { SupabaseService } from "../supabase/supabase.service";
import { ProfileMapperService } from "./repo/profile.mapper.service";
import { ProfileController } from "./controllers/profile.controller";

@Module({
	controllers: [ProfileController],
	providers: [ProfileService, SupabaseService, ProfileRepository, ProfileMapperService],
	exports: [ProfileService],
})
export class ProfileModule {}
