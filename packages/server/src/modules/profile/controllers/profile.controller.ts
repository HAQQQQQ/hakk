import { Body, Controller, Get, NotFoundException, Param, Post } from "@nestjs/common";
import type { CreateUserProfileRequest, UserProfileResponse } from "@hakk/types";
import { ProfileService } from "../services/profile.service.js";

@Controller("profile")
export class ProfileController {
	constructor(private readonly profileService: ProfileService) {}

	@Get(":id")
	async getUserProfileById(@Param("id") userId: string): Promise<UserProfileResponse> {
		const userProfile = await this.profileService.findById(userId);
		if (!userProfile) {
			throw new NotFoundException(`User with ID ${userId} not found`);
		}
		return userProfile;
	}

	@Post("create-profile")
	async createProfile(
		@Body() createUserProfileDto: CreateUserProfileRequest,
	): Promise<UserProfileResponse> {
		return this.profileService.createProfile(createUserProfileDto);
	}

	// @Post('update-profile')
	// async updateProfile(
	//     @Body() updateUserProfile
	// )
}
