import { Injectable, NotFoundException } from "@nestjs/common";
import { UsersRepository } from "./users.repository";
import { UserDto } from "@hakk/types";
import { CreateUserDto } from "./create-user.dto";
import { UserFactory } from "./user.factory";

@Injectable()
export class UsersService {
	constructor(
		private readonly usersRepository: UsersRepository,
		private readonly userFactory: UserFactory,
	) {}

	async findById(userId: string): Promise<UserDto> {
		const user = await this.usersRepository.fetchById(userId);

		if (!user) {
			throw new NotFoundException(`User with user_id ${userId} not found`);
		}

		return user.toDTO();
	}

	async createUser(createUserDto: CreateUserDto): Promise<UserDto> {
		const newUser = await this.usersRepository.insertUser(
			this.userFactory.createEntity(createUserDto),
		);
		return newUser.toDTO();
	}
}
