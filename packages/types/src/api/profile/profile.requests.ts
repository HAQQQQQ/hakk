import { UserAdditionalDetailsBase, UserInfoBase } from "./profile-base";

export type CreateUserInfoRequest = UserInfoBase;

export type CreateUserAdditionalDetailsRequest = UserAdditionalDetailsBase;

// Combined request for creating user with profile
export interface CreateUserProfileRequest {
	userId: string; // from Clerk or other auth provider
	info: CreateUserInfoRequest;
	additionalDetails?: CreateUserAdditionalDetailsRequest; // Optional since profile might be created later
}
