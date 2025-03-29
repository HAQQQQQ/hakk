import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { SupabaseService } from "../supabase/supabase.service";
import { UsersRepository } from "./users.repository";
import { UserFactory } from "./user.factory";

@Module({
	controllers: [UsersController],
	providers: [UsersService, SupabaseService, UsersRepository, UserFactory],
	exports: [UsersService],
})
export class UsersModule {}
