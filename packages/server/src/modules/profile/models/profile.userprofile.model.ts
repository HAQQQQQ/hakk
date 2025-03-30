import { UserProfileResponse, IDTOConvertible } from "@hakk/types";
import { UserInfo } from "./profile.userinfo.model";
import { AdditionalDetails } from "./profile.details.model";
import { UserPreferences } from "./profile.preferences.model";

export class UserProfile implements IDTOConvertible<UserProfileResponse> {
	private readonly userId: string;
	private readonly info: UserInfo;
	private readonly additionalDetails?: AdditionalDetails;
	private readonly userPreferences?: UserPreferences;

	constructor(
		userId: string,
		info: UserInfo,
		additionalDetails: AdditionalDetails,
		userPreferences: UserPreferences,
	) {
		this.userId = userId;
		this.info = info;
		this.additionalDetails = additionalDetails;
		this.userPreferences = userPreferences;
	}

	toDTO(): UserProfileResponse {
		return {
			userId: this.userId,
			info: this.info.toDTO(),
			additionalDetails: this.additionalDetails?.toDTO(),
			userPreference: this.userPreferences?.toDTO(),
		};
	}
}
