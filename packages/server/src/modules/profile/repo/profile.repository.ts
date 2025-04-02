import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../../supabase/supabase.service.js";
import { UserProfile } from "../models/profile.userprofile.model.js";
import { ProfileNotFoundError } from "./profile-errors.js";
import { ProfileMapperService } from "./profile.mapper.service.js";
import {
	CreateUserProfileRequest,
	Photo,
	UserAdditionalDetailsBase,
	UserPreferencesRequest,
} from "@hakk/types";

@Injectable()
export class ProfileRepository {
	private readonly PROFILES_TABLE: string = "profiles";
	private readonly PROFILE_DETAILS_TABLE: string = "profile_details";
	private readonly USER_PREFERENCES = "user_preferences";
	private readonly PROFILE_PHOTOS = "profile_photos";
	private readonly PROFILE_DETAILS = "profile_details";

	constructor(
		private readonly supabaseService: SupabaseService,
		private readonly profileMapper: ProfileMapperService,
	) {}

	async checkUserExists(userId: string): Promise<boolean> {
		const { data: user, error } = await this.supabaseService.client
			.from(this.PROFILES_TABLE)
			.select("user_id")
			.eq("user_id", userId)
			.single();

		return !!user && !error;
	}

	async fetchUserProfileByUserId(userId: string): Promise<UserProfile> {
		try {
			console.log("Fetching profile for userId:", userId);

			// Perform a single query with joins
			const { data, error } = await this.supabaseService.client
				.from(this.PROFILES_TABLE)
				.select(
					`
                        *,
                        profile_details(
                        *,
                        profile_photos(*)
                        ),
                        user_preferences(*)
                    `,
				)
				.eq("user_id", userId)
				.single();

			console.log("Query Data:", data);
			console.log("Query Error:", error);

			if (error || !data) {
				throw new ProfileNotFoundError(`Profile not found for user ID: ${userId}`);
			}

			// Create and return UserProfile
			return this.profileMapper.createUserProfile(userId, data);
		} catch (error) {
			console.error("Full error in fetchUserProfileByUserId:", error);

			if (error instanceof ProfileNotFoundError) {
				throw error;
			}

			throw new Error("Unexpected error fetching user profile");
		}
	}

	async createUserProfile(createUserProfileDto: CreateUserProfileRequest): Promise<UserProfile> {
		try {
			const profileData = await this.createProfileInfo(createUserProfileDto);

			// 2. Optionally create profile details
			if (createUserProfileDto.additionalDetails) {
				const detailsData = await this.createProfifileDetails(
					profileData.id,
					createUserProfileDto.additionalDetails,
				);

				// 3. Optionally create profile photos
				if (
					createUserProfileDto.additionalDetails.photos &&
					createUserProfileDto.additionalDetails.photos.length > 0
				) {
					await this.createPhotos(
						detailsData.id,
						createUserProfileDto.additionalDetails.photos,
					);
				}
			}

			// 4. Optionally create user preferences
			if (createUserProfileDto.userPreferences) {
				// await this.createUserPreferences(detailsData.profile_id, createUserProfileDto.userPreferences);
				await this.createUserProfilePreferences(
					profileData.id,
					createUserProfileDto.userPreferences,
				);
			}

			// 5. Finally, return the complete user profile
			return await this.fetchUserProfileByUserId(createUserProfileDto.userId);
		} catch (error) {
			throw new Error(`Profile creation failed: ${error.message}`);
		}
	}

	private async createPhotos(additionalDetailsId: string, photos: Photo[]): Promise<any> {
		const photoInserts = photos.map((photo) => ({
			profile_details_id: additionalDetailsId,
			url: photo.url,
			is_primary: photo.isPrimary || false,
			is_verified: photo.isVerified || false,
		}));

		const { error: photosError } = await this.supabaseService.client
			.from(this.PROFILE_PHOTOS)
			.insert(photoInserts);

		if (photosError) {
			// Roll back everything if photos fail
			await this.supabaseService.client
				.from(this.PROFILE_DETAILS_TABLE)
				.delete()
				.eq("id", additionalDetailsId);

			throw new Error(`Failed to create profile photos: ${photosError.message}`);
		}

		return photoInserts;
	}

	private async createProfileInfo(createUserProfileDto: CreateUserProfileRequest): Promise<any> {
		const { data: profileData, error: profileError } = await this.supabaseService.client
			.from(this.PROFILES_TABLE)
			.insert({
				user_id: createUserProfileDto.userId,
				first_name: createUserProfileDto.info.firstName,
				last_name: createUserProfileDto.info.lastName,
				middle_name: createUserProfileDto.info.middleName,
				email: createUserProfileDto.info.email,
				date_of_birth: createUserProfileDto.info.dateOfBirth,
				gender: createUserProfileDto.info.gender,
				phone_number: createUserProfileDto.info.phoneNumber,
				avatar_url: createUserProfileDto.info.avatarUrl,
			})
			.select()
			.single();

		if (profileError || !profileData) {
			throw new Error(`Failed to create profile: ${profileError?.message}`);
		}
		return profileData;
	}

	private async createProfifileDetails(
		profileId: string,
		additionalDetails: UserAdditionalDetailsBase,
	): Promise<any> {
		const { data: detailsData, error: detailsError } = await this.supabaseService.client
			.from(this.PROFILE_DETAILS)
			.insert({
				profile_id: profileId,
				display_name: additionalDetails.displayName,
				about_me: additionalDetails.aboutMe,
				relationship_status: additionalDetails.relationshipStatus,
				location: additionalDetails.location,
				occupation: additionalDetails.occupation,
				has_children: additionalDetails.hasChildren,
				wants_children: additionalDetails.wantsChildren,
				education_level: additionalDetails.educationLevel,
				drinking_habit: additionalDetails.drinkingHabit,
				smoking_habit: additionalDetails.smokingHabit,
				religion: additionalDetails.religion,
				languages: additionalDetails.languages,
				height_value: additionalDetails.height?.height,
				height_unit: additionalDetails.height?.unitOfMeasure,
			})
			.select()
			.single();

		if (detailsError || !detailsData) {
			// Roll back the base profile if profile details fail
			await this.supabaseService.client
				.from(this.PROFILES_TABLE)
				.delete()
				.eq("id", profileId);

			throw new Error(`Failed to create profile details: ${detailsError?.message}`);
		}
		// Return the details data
		return detailsData;
	}

	private async createUserProfilePreferences(
		profileId: string,
		userPreferences: UserPreferencesRequest,
	): Promise<any> {
		const { data: preferencesData, error: preferencesError } = await this.supabaseService.client
			.from(`${this.USER_PREFERENCES}`)
			.insert({
				// The foreign key to profile_details is profile_id
				// profile_id: detailsData.profile_id, // or simply use profileData.id
				profile_id: profileId,
				preferred_min_age: userPreferences.preferredAgeRange.min,
				preferred_max_age: userPreferences.preferredAgeRange.max,
				preferred_genders: userPreferences.preferredGenders,
				desired_relationship_types: userPreferences.desiredRelationshipTypes,
				preferred_education_levels: userPreferences.preferredEducationLevels,
				preferred_occupations: userPreferences.preferredOccupations,
				partner_has_children_preference: userPreferences.partnerHasChildrenPreference,
				drinking_habit_preference: userPreferences.drinkingHabitPreference,
				smoking_habit_preference: userPreferences.smokingHabitPreference,
				max_distance: userPreferences.maxDistance?.value,
				max_distance_unit: userPreferences.maxDistance?.unit,
				preferred_locations: userPreferences.preferredLocations,
				preferred_languages: userPreferences.preferredLanguages,
				preferred_religions: userPreferences.preferredReligions,
			})
			.select()
			.single();

		if (preferencesError || !preferencesData) {
			// Roll back the entire profile if user preferences fail
			await this.supabaseService.client
				.from(this.PROFILES_TABLE)
				.delete()
				.eq("id", profileId);

			throw new Error(`Failed to create user preferences: ${preferencesError?.message}`);
		}

		return preferencesData;
	}
}
