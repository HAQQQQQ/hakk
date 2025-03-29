import { Body, Controller, Get, NotFoundException, Param, Post, Put } from "@nestjs/common";
import { UsersService } from "./users.service";
import type { UserDto, UserWithProfileDto } from "@hakk/types";
import { CreateUserDto } from "./dtos/create-user.dto";
import { CreateUserProfileDto } from "./dtos/create-user-profile.dto";

@Controller("users")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get(":id")
	async getUserById(@Param("userId") userId: string): Promise<UserDto> {
		const user = await this.usersService.findById(userId);
		if (!user) {
			throw new NotFoundException(`User with ID ${userId} not found`);
		}
		return user;
	}

	@Post("create-user")
	async createNewUser(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
		return this.usersService.createUser(createUserDto);
	}

	@Post("create-user-profile")
	async createUserProfile(
		@Body() createUserProfileDto: CreateUserProfileDto,
	): Promise<UserWithProfileDto> {
		// Check if user exists before creating profile
		const userId = createUserProfileDto.userId;
		const existingUser = await this.usersService.findById(userId);
		if (!existingUser) {
			throw new NotFoundException(`User with ID ${userId} not found`);
		}

		return this.usersService.createUserProfile(createUserProfileDto);
	}

	@Post("update-user-profile")
	async updateUserProfile(
		@Body() updateProfileDto: CreateUserProfileDto,
	): Promise<UserWithProfileDto> {
		// Check if user exists before updating profile
		const userId = updateProfileDto.userId;
		const existingUser = await this.usersService.findById(userId);
		if (!existingUser) {
			throw new NotFoundException(`User with ID ${userId} not found`);
		}

		return this.usersService.updateUserProfile(updateProfileDto);
	}
}
