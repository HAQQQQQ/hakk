import { Injectable, NotFoundException } from "@nestjs/common";
import { ProfileRepository } from "../repo/profile.repository.js";
import { CreateUserProfileRequest, UserProfileResponse } from "@hakk/types";

@Injectable()
export class ProfileService {
	constructor(private readonly profileRepository: ProfileRepository) {}

	async validateUser(userId: string): Promise<boolean> {
		return this.profileRepository.checkUserExists(userId);
	}

	async findById(userId: string): Promise<UserProfileResponse> {
		const user = await this.profileRepository.fetchUserProfileByUserId(userId);

		if (!user) {
			throw new NotFoundException(`User with user_id ${userId} not found`);
		}

		return user.toDTO();
	}

	async createProfile(
		createUserProfileDto: CreateUserProfileRequest,
	): Promise<UserProfileResponse> {
		// Create profile in the repository
		const createdProfile = await this.profileRepository.createUserProfile(createUserProfileDto);

		// Convert to DTO and return
		return createdProfile.toDTO();
	}
}
