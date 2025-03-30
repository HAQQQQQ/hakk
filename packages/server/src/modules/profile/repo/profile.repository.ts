import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../../supabase/supabase.service";
import { UserProfile } from "../models/profile.userprofile.model";
import { ProfileNotFoundError } from "./profile-errors";
import { ProfileMapperService } from "./profile.mapper.service";
import { CreateUserProfileRequest, Gender } from "@hakk/types";

@Injectable()
export class ProfileRepository {
	private readonly PROFILES_TABLE: string = "profiles";

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
				.from(`${this.PROFILES_TABLE}`)
				.select(
					`
                *,
                profile_details(*),
                profile_photos(*)
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
			// Start a transaction
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

			// Only create profile details if additional details are provided
			if (createUserDto.additionalDetails) {
				console.log("arr0:", createUserDto.additionalDetails.interestedIn);
				console.log(
					"arr:",
					createUserDto.additionalDetails.interestedIn
						?.map((gender) => gender.toLowerCase())
						.filter((gender) => Object.values(Gender).includes(gender as Gender))
						.join(","),
				);

				const { data: detailsData, error: detailsError } = await this.supabaseService.client
					.from("profile_details")
					.insert({
						profile_id: profileData.id,
						display_name: createUserDto.additionalDetails.displayName,
						about_me: createUserDto.additionalDetails.aboutMe,
						relationship_status: createUserDto.additionalDetails.relationshipStatus,
						looking_for: createUserDto.additionalDetails.lookingFor,
						interested_in: createUserDto.additionalDetails.interestedIn,
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
						max_distance_value: createUserDto.additionalDetails.maxDistance?.value,
						max_distance_unit: createUserDto.additionalDetails.maxDistance?.unit,
					})
					.select()
					.single();

				if (detailsError || !detailsData) {
					// Rollback profile creation if details insertion fails
					await this.supabaseService.client
						.from(this.PROFILES_TABLE)
						.delete()
						.eq("id", profileData.id);

					throw new Error(`Failed to create profile details: ${detailsError?.message}`);
				}

				// Create profile photos if provided
				if (
					createUserDto.additionalDetails.photos &&
					createUserDto.additionalDetails.photos.length > 0
				) {
					const photoInserts = createUserDto.additionalDetails.photos.map((photo) => ({
						profile_id: profileData.id,
						url: photo.url,
						is_primary: photo.isPrimary || false,
						is_verified: photo.isVerified || false,
					}));

					const { error: photosError } = await this.supabaseService.client
						.from("profile_photos")
						.insert(photoInserts);

					if (photosError) {
						// Rollback previous insertions
						await this.supabaseService.client
							.from(this.PROFILES_TABLE)
							.delete()
							.eq("id", profileData.id);

						throw new Error(`Failed to create profile photos: ${photosError.message}`);
					}
				}
			}

			// Use existing method to fetch and return the full user profile
			return await this.fetchUserProfileByUserId(createUserDto.userId);
		} catch (error) {
			// Handle any unexpected errors
			throw new Error(`Profile creation failed: ${error.message}`);
		}
	}
}
