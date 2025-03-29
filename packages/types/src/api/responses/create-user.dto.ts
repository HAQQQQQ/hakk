import {
	Education,
	FrequencyHabit,
	Gender,
	RelationshipGoal,
	RelationshipStatus,
	Religion,
	UserType,
} from "../../models";

export interface UserDto {
	userId: string;
	firstName: string;
	lastName: string;
	middleName?: string;
	fullName: string;
	email: string;
	dateOfBirth: string; // ISO format date string for API transport
	age: number;
	phoneNumber?: string;
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
	gender: string;
	avatarUrl?: string;
	userType: UserType;
}

export interface UserProfileDto {
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

// Combined response for endpoints that return both user and profile data
export interface UserWithProfileDto {
	user: UserDto;
	profile: UserProfileDto;
}
