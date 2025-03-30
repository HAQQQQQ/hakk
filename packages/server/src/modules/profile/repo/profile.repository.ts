import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../../supabase/supabase.service";
import { UserProfile } from "../models/profile.userprofile.model";
import { ProfileNotFoundError } from "./profile-errors";
import { ProfileMapperService } from "./profile.mapper.service";
import { CreateUserProfileRequest, Gender } from "@hakk/types";

@Injectable()
export class ProfileRepository {
	private readonly PROFILES_TABLE: string = "profiles";
	private readonly PROFILE_DETAILS_TABLE: string = "profile_details";

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

	async createUserProfile(createUserDto: CreateUserProfileRequest): Promise<UserProfile> {
		try {
			// 1. Create base profile
			const { data: profileData, error: profileError } = await this.supabaseService.client
				.from(this.PROFILES_TABLE)
				.insert({
					user_id: createUserDto.userId,
					first_name: createUserDto.info.firstName,
					last_name: createUserDto.info.lastName,
					middle_name: createUserDto.info.middleName,
					email: createUserDto.info.email,
					date_of_birth: createUserDto.info.dateOfBirth,
					gender: createUserDto.info.gender,
					phone_number: createUserDto.info.phoneNumber,
					avatar_url: createUserDto.info.avatarUrl,
				})
				.select()
				.single();

			if (profileError || !profileData) {
				throw new Error(`Failed to create profile: ${profileError?.message}`);
			}

			// 2. Optionally create profile details
			if (createUserDto.additionalDetails) {
				const { data: detailsData, error: detailsError } = await this.supabaseService.client
					.from("profile_details")
					.insert({
						profile_id: profileData.id,
						display_name: createUserDto.additionalDetails.displayName,
						about_me: createUserDto.additionalDetails.aboutMe,
						relationship_status: createUserDto.additionalDetails.relationshipStatus,
						location: createUserDto.additionalDetails.location,
						occupation: createUserDto.additionalDetails.occupation,
						has_children: createUserDto.additionalDetails.hasChildren,
						wants_children: createUserDto.additionalDetails.wantsChildren,
						education_level: createUserDto.additionalDetails.educationLevel,
						drinking_habit: createUserDto.additionalDetails.drinkingHabit,
						smoking_habit: createUserDto.additionalDetails.smokingHabit,
						religion: createUserDto.additionalDetails.religion,
						languages: createUserDto.additionalDetails.languages,
						height_value: createUserDto.additionalDetails.height?.height,
						height_unit: createUserDto.additionalDetails.height?.unitOfMeasure,
					})
					.select()
					.single();

				if (detailsError || !detailsData) {
					// Roll back the base profile if profile details fail
					await this.supabaseService.client
						.from(this.PROFILES_TABLE)
						.delete()
						.eq("id", profileData.id);

					throw new Error(`Failed to create profile details: ${detailsError?.message}`);
				}

				// 3. Optionally create user preferences
				if (createUserDto.userPreferences) {
					const { data: preferencesData, error: preferencesError } =
						await this.supabaseService.client
							.from("user_preferences")
							.insert({
								// The foreign key to profile_details is profile_id
								profile_id: detailsData.profile_id, // or simply use profileData.id

								preferred_min_age:
									createUserDto.userPreferences.preferredAgeRange.min,
								preferred_max_age:
									createUserDto.userPreferences.preferredAgeRange.max,
								preferred_genders: createUserDto.userPreferences.preferredGenders,

								desired_relationship_types:
									createUserDto.userPreferences.desiredRelationshipTypes,
								preferred_education_levels:
									createUserDto.userPreferences.preferredEducationLevels,
								preferred_occupations:
									createUserDto.userPreferences.preferredOccupations,

								partner_has_children_preference:
									createUserDto.userPreferences.partnerHasChildrenPreference,

								drinking_habit_preference:
									createUserDto.userPreferences.drinkingHabitPreference,
								smoking_habit_preference:
									createUserDto.userPreferences.smokingHabitPreference,

								max_distance: createUserDto.userPreferences.maxDistance?.value,
								max_distance_unit: createUserDto.userPreferences.maxDistance?.unit,
								preferred_locations:
									createUserDto.userPreferences.preferredLocations,

								preferred_languages:
									createUserDto.userPreferences.preferredLanguages,
								preferred_religions:
									createUserDto.userPreferences.preferredReligions,
							})
							.select()
							.single();

					if (preferencesError || !preferencesData) {
						// Roll back the entire profile if user preferences fail
						await this.supabaseService.client
							.from(this.PROFILES_TABLE)
							.delete()
							.eq("id", profileData.id);

						throw new Error(
							`Failed to create user preferences: ${preferencesError?.message}`,
						);
					}
				}

				// 4. Optionally create profile photos
				if (
					createUserDto.additionalDetails.photos &&
					createUserDto.additionalDetails.photos.length > 0
				) {
					const photoInserts = createUserDto.additionalDetails.photos.map((photo) => ({
						profile_details_id: detailsData.id,
						url: photo.url,
						is_primary: photo.isPrimary || false,
						is_verified: photo.isVerified || false,
					}));

					const { error: photosError } = await this.supabaseService.client
						.from("profile_photos")
						.insert(photoInserts);

					if (photosError) {
						// Roll back everything if photos fail
						await this.supabaseService.client
							.from(this.PROFILE_DETAILS_TABLE)
							.delete()
							.eq("id", detailsData.id);

						throw new Error(`Failed to create profile photos: ${photosError.message}`);
					}
				}
			}

			// 5. Finally, return the complete user profile
			return await this.fetchUserProfileByUserId(createUserDto.userId);
		} catch (error) {
			throw new Error(`Profile creation failed: ${error.message}`);
		}
	}
}
