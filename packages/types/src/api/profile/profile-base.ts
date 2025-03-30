import {
	AgeRange,
	Distance,
	DistanceUnit,
	Education,
	FrequencyHabit,
	Gender,
	Height,
	Photo,
	RelationshipGoal,
	RelationshipStatus,
	Religion,
	UserType,
} from "../../common";

export interface UserInfoBase {
	firstName: string;
	lastName: string;
	middleName?: string;
	email: string;
	phoneNumber?: string;
	avatarUrl?: string;
	userType: UserType;
	dateOfBirth: string;
	gender: Gender;
}

export interface UserAdditionalDetailsBase {
	// Required fields
	displayName: string;
	aboutMe: string;
	relationshipStatus: RelationshipStatus;
	lookingFor: RelationshipGoal;
	interestedIn: Gender[];
	photos: Photo[];
	ageRange: AgeRange;

	// Optional fields
	location?: string;
	height?: Height;
	occupation?: string;
	hasChildren?: boolean;
	wantsChildren?: boolean;
	interests?: string[];
	educationLevel?: Education;
	drinkingHabit?: FrequencyHabit;
	smokingHabit?: FrequencyHabit;
	religion?: Religion;
	languages?: string;
	maxDistance?: Distance;
}
