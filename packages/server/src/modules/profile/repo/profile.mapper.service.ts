import { Injectable } from "@nestjs/common";
import {
	AgeRange,
	Distance,
	DistanceUnit,
	Gender,
	Height,
	MeasurementUnit,
	Photo,
	RelationshipGoal,
	RelationshipStatus,
	Religion,
	UserType,
} from "@hakk/types";
import { UserProfile } from "../models/profile.userprofile.model";
import { UserInfo } from "../models/profile.userinfo.model";
import { AdditionalDetails } from "../models/profile.details.model";

@Injectable()
export class ProfileMapperService {
	createUserProfile(userId: string, data: any): UserProfile {
		return new UserProfile(
			userId,
			this.createUserInfo(data),
			this.createAdditionalDetails(data),
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
		return new AdditionalDetails(
			data.profile_details.display_name,
			data.profile_details.about_me,
			data.profile_details.relationship_status as RelationshipStatus,
			data.profile_details.looking_for as RelationshipGoal,
			data.profile_details.interested_in,
			this.createPhotos(data),
			this.createAgeRange(data),
			data.profile_details.location,
			this.getHeight(data),
			data.profile_details.occupation,
			data.profile_details.has_children,
			data.profile_details.wants_children,
			data.profile_details.education_level,
			data.profile_details.drinking_habit,
			data.profile_details.smoking_habit,
			data.profile_details.religion as Religion,
			data.profile_details.languages,
			this.getDistance(data),
		);
	}

	private getHeight(data: any): Height | undefined {
		if (data.profile_details.height_value && data.profile_details.height_unit) {
			return {
				height: data.profile_details.height_value,
				unitOfMeasure: data.profile_details.height_unit as MeasurementUnit,
			};
		}
		return undefined;
	}

	private getDistance(data: any): Distance | undefined {
		if (data.profile_details.max_distance_value && data.profile_details.max_distance_unit) {
			return {
				value: data.profile_details.max_distance_value,
				unit: data.profile_details.max_distance_unit as DistanceUnit,
			};
		}
		return undefined;
	}

	private createPhotos(data: any): Photo[] {
		return (data.profile_photos || []).map((photo) => ({
			id: photo.id.toString(),
			url: photo.url,
			isPrimary: photo.is_primary,
			isVerified: photo.is_verified,
		}));
	}

	private createAgeRange(data: any): AgeRange {
		const ageRange = data.profile_details.age_range;

		return {
			min: ageRange[0],
			max: ageRange[1],
		};
	}
}
