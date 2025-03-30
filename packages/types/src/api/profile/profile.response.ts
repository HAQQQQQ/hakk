import { UserAdditionalDetailsBase, UserInfoBase } from "./profile-base";

export interface UserInfoDto extends UserInfoBase {
	fullName: string;
	age: number;
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
}

export type UserAdditionalDetailsDto = UserAdditionalDetailsBase;

// Combined request for creating user with profile
export interface UserProfileResponse {
	userId: string; // from Clerk or other auth provider
	info: UserInfoDto;
	additionalDetails?: UserAdditionalDetailsDto; // Optional since profile might be created later
}
