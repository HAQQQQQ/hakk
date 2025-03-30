import { UserAdditionalDetailsBase, UserInfoBase, UserPreferencesBase } from "./profile-base";

export type CreateUserInfoRequest = UserInfoBase;
export type CreateUserAdditionalDetailsRequest = UserAdditionalDetailsBase;
export type UserPreferencesRequest = UserPreferencesBase;

// Combined request for creating user with profile
export interface CreateUserProfileRequest {
	userId: string; // from Clerk or other auth provider
	info: CreateUserInfoRequest;
	additionalDetails?: CreateUserAdditionalDetailsRequest; // Optional since profile might be created later
	userPreferences?: UserPreferencesRequest;
}
