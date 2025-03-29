import { Body, Controller, Get, NotFoundException, Param, Post } from "@nestjs/common";
import { UsersService } from "./users.service";
import type { UserDto, CreateUserRequest } from "@hakk/types";
import { CreateUserDto } from "./create-user.dto";

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

	@Post()
	async createNewUser(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
		return this.usersService.createUser(createUserDto);
	}
}
