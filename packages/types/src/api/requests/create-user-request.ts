import {
	Education,
	FrequencyHabit,
	Gender,
	RelationshipGoal,
	RelationshipStatus,
	Religion,
	UserType,
} from "../../models";

export interface CreateUserRequest {
	userId: string;
	firstName: string;
	lastName: string;
	middleName?: string;
	email: string;
	dateOfBirth: string;
	phoneNumber?: string;
	gender: Gender;
	avatarUrl?: string;
	userType: UserType;
}

export interface CreateUserProfileRequest {
	// Required fields
	userId: string;
	displayName: string;
	aboutMe: string;
	relationshipStatus: RelationshipStatus;
	lookingFor: RelationshipGoal;
	interestedIn: Gender[];
	photos: string[];

	// Optional fields
	location?: string;
	height?: number;
	occupation?: string;
	hasChildren?: boolean;
	wantsChildren?: boolean;
	interests?: string[];
	educationLevel?: Education;
	drinkingHabit?: FrequencyHabit;
	smokingHabit?: FrequencyHabit;
	religion?: Religion;
	languages?: string;
	maxDistance?: number;
}
