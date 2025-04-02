import {
	AgeRange,
	Distance,
	Education,
	FrequencyHabit,
	Gender,
	Height,
	PartnerChildrenPreference,
	Photo,
	RelationshipGoal,
	RelationshipStatus,
	Religion,
	UserType,
} from "../../common.js";

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
	displayName: string; // maps to display_name, required
	aboutMe: string; // maps to about_me
	photos: Photo[];

	// Optional fields
	relationshipStatus?: RelationshipStatus;
	occupation?: string;
	educationLevel?: Education;
	languages?: string[];
	religion?: Religion;
	hasChildren?: boolean;
	wantsChildren?: boolean;
	drinkingHabit?: FrequencyHabit;
	smokingHabit?: FrequencyHabit;
	height?: Height;
	location?: string;
}

export interface UserPreferencesBase {
	preferredAgeRange: AgeRange;
	preferredGenders: Gender[];

	// Relationship Preferences
	desiredRelationshipTypes: RelationshipGoal[];

	// Lifestyle Preferences
	preferredEducationLevels?: Education[];
	preferredOccupations?: string[];

	// Family Preferences
	partnerHasChildrenPreference?: PartnerChildrenPreference;

	// Habits Preferences
	drinkingHabitPreference?: FrequencyHabit;
	smokingHabitPreference?: FrequencyHabit;

	maxDistance?: Distance;
	preferredLocations?: string[];

	// Additional Preferences
	preferredLanguages?: string[];
	preferredReligions?: Religion[];
}
