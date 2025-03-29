import { Injectable, NotFoundException } from "@nestjs/common";
import { UsersRepository } from "./users.repository";
import { UserDto, UserWithProfileDto } from "@hakk/types";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UserFactory } from "./user.factory";
import { CreateUserProfileDto } from "./dtos/create-user-profile.dto";

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

	async createUserProfile(
		createUserProfileDto: CreateUserProfileDto,
	): Promise<UserWithProfileDto> {
		// Check if a profile already exists for this user
		const existingProfile = await this.userProfileRepository.fetchByUserId(
			createUserProfileDto.userId,
		);

		if (existingProfile) {
			throw new Error(`Profile for user ${createUserProfileDto.userId} already exists`);
		}

		// Create and insert the new profile
		const newProfile = await this.userProfileRepository.insertUserProfile(
			this.userProfileFactory.createEntity(createUserProfileDto),
		);

		// Get the user to build the complete response
		const user = await this.usersRepository.fetchById(createUserProfileDto.userId);

		// Return the user with their profile
		return {
			user: user.toDTO(),
			profile: newProfile.toDTO(),
		};
	}

	async updateUserProfile(updateProfileDto: CreateUserProfileDto): Promise<UserWithProfileDto> {
		// Check if the profile exists
		const existingProfile = await this.userProfileRepository.fetchByUserId(
			updateProfileDto.userId,
		);

		if (!existingProfile) {
			// If no profile exists, create a new one instead
			return this.createUserProfile(updateProfileDto);
		}

		// Update the existing profile
		const updatedProfile = await this.userProfileRepository.updateUserProfile(
			this.userProfileFactory.updateEntity(existingProfile, updateProfileDto),
		);

		// Get the user to build the complete response
		const user = await this.usersRepository.fetchById(updateProfileDto.userId);

		// Return the user with their updated profile
		return {
			user: user.toDTO(),
			profile: updatedProfile.toDTO(),
		};
	}
}
