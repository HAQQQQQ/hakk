import { Photo } from "../../common";
import { UserAdditionalDetailsBase, UserInfoBase, UserPreferencesBase } from "./profile-base";

export type CreateUserInfoRequest = UserInfoBase;
// export interface CreateUserAdditionalDetailsRequest extends UserAdditionalDetailsBase {
//     photos: Photo[];
// };

export type UserPreferencesRequest = UserPreferencesBase;

// Combined request for creating user with profile
export interface CreateUserProfileRequest {
	userId: string; // from Clerk or other auth provider
	info: CreateUserInfoRequest;
	additionalDetails?: UserAdditionalDetailsBase; // Optional since profile might be created later
	userPreferences?: UserPreferencesRequest;
}

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// export interface UpdateUserPhotosRequest {
//     userId: string;
//     addPhotos?: Photo[];
//     removePhotoIds?: string[];
//     reorderPhotos?: {
//         photoId: string;
//         newOrder: number;
//     }[];
//     setMainPhotoId?: string;
// };

// Derive update types by making all fields optional
// export type UpdateUserInfoRequest = Partial<CreateUserInfoRequest>;
// export interface UpdateUserAdditionalDetailsRequest extends UserAdditionalDetailsBase {
//     updateUserPhotos: UpdateUserPhotosRequest;
// };

// export type UpdateUserPreferencesRequest = Partial<UserPreferencesRequest>;

// export interface UpdateUserProfileRequest {
//     userId: string; // from Clerk or other auth provider
//     updatedInfo?: UpdateUserInfoRequest;
//     updatedAdditionalDetails?: UpdateUserAdditionalDetailsRequest; // Optional since profile might be created later
//     updatedUserPreferences?: UpdateUserPreferencesRequest;
// };
