import { Module } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { UserRepository } from "./repo/user.repository";
import { UserService } from "./services/user.service";
import { UserController } from "./controllers/user.controller";
import { UserFirmsRepository } from "./repo/user-firms.repository";

@Module({
	controllers: [UserController],
	providers: [UserService, SupabaseService, UserRepository, UserFirmsRepository],
	exports: [UserService],
})
export class UserModule {}
