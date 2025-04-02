import { UserAdditionalDetailsBase, UserInfoBase, UserPreferencesBase } from "./profile-base.js";

export interface UserInfoDto extends UserInfoBase {
	fullName: string;
	age: number;
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
}

export type UserAdditionalDetailsDto = UserAdditionalDetailsBase;
export type UserPreferencesDto = UserPreferencesBase;

export interface UserProfileResponse {
	userId: string;
	info: UserInfoDto;
	additionalDetails?: UserAdditionalDetailsDto;
	userPreference?: UserPreferencesDto;
}
