import { Injectable } from "@nestjs/common";
import {
	AgeRange,
	Distance,
	DistanceUnit,
	FrequencyHabit,
	Gender,
	Height,
	MeasurementUnit,
	Photo,
	RelationshipStatus,
	Religion,
	UserType,
} from "@hakk/types";
import { UserProfile } from "../models/profile.userprofile.model.js";
import { UserInfo } from "../models/profile.userinfo.model.js";
import { AdditionalDetails } from "../models/profile.details.model.js";
import { UserPreferences } from "../models/profile.preferences.model.js";

@Injectable()
export class ProfileMapperService {
	createUserProfile(userId: string, data: any): UserProfile {
		return new UserProfile(
			userId,
			this.createUserInfo(data),
			this.createAdditionalDetails(data),
			this.createUserPreferences(data),
		);
	}

	private createUserInfo(data: any): UserInfo {
		return new UserInfo(
			data.first_name,
			data.last_name,
			data.email,
			new Date(data.date_of_birth),
			UserType.REGULAR,
			data.gender as Gender,
			data.middle_name,
			data.phone_number,
			data.avatar_url,
			new Date(data.created_at),
			new Date(data.updated_at),
		);
	}

	private createAdditionalDetails(data: any): AdditionalDetails {
		const createPhotos = (data: any): Photo[] => {
			return (data.profile_details.profile_photos || []).map((photo) => ({
				id: photo.id.toString(),
				url: photo.url,
				isPrimary: photo.is_primary,
				isVerified: photo.is_verified,
			}));
		};

		const getHeight = (data: any): Height | undefined => {
			if (data.profile_details.height_value && data.profile_details.height_unit) {
				return {
					height: data.profile_details.height_value,
					unitOfMeasure: data.profile_details.height_unit as MeasurementUnit,
				};
			}
			return undefined;
		};

		return new AdditionalDetails(
			data.profile_details.display_name,
			data.profile_details.about_me,
			createPhotos(data),
			data.profile_details.relationship_status as RelationshipStatus,
			data.profile_details.occupation,
			data.profile_details.education_level,
			data.profile_details.languages,
			data.profile_details.religion as Religion,
			data.profile_details.has_children,
			data.profile_details.wants_children,
			data.profile_details.drinking_habit as FrequencyHabit,
			data.profile_details.smoking_habit as FrequencyHabit,
			getHeight(data),
			data.profile_details.location,
		);
	}

	private createUserPreferences(data: any): UserPreferences {
		const createAgeRange = (data: any): AgeRange => {
			return {
				min: data.profile_details.preferred_min_age,
				max: data.profile_details.preferred_max_age,
			};
		};

		const getMaxDistance = (data: any): Distance | undefined => {
			if (data.profile_details.max_distance_value && data.profile_details.max_distance_unit) {
				return {
					value: data.profile_details.max_distance_value,
					unit: data.profile_details.max_distance_unit as DistanceUnit,
				};
			}
			return undefined;
		};

		return new UserPreferences(
			createAgeRange(data), // preferredAgeRange: AgeRange
			data.user_preferences.preferred_genders, // preferredGenders: Gender[]
			data.user_preferences.desired_relationship_types, // desiredRelationshipTypes: RelationshipGoal[]
			data.user_preferences.preferred_education_levels, // preferredEducationLevels?: Education[]
			data.user_preferences.preferred_occupations, // preferredOccupations?: string[]
			data.user_preferences.partner_has_children_preference, // partnerHasChildrenPreference?: PartnerChildrenPreference
			data.user_preferences.drinking_habit_preference, // drinkingHabitPreference?: FrequencyHabit
			data.user_preferences.smoking_habit_preference, // smokingHabitPreference?: FrequencyHabit
			getMaxDistance(data), // maxDistance?: Distance
			data.user_preferences.preferred_locations, // preferredLocations?: string[]
			data.user_preferences.preferred_languages, // preferredLanguages?: string[]
			data.user_preferences.preferred_religions, // preferredReligions?: Religion[]
		);
	}
}
