import { UserProfileResponse, IDTOConvertible } from "@hakk/types";
import { UserInfo } from "./profile.userinfo.model";
import { AdditionalDetails } from "./profile.details.model";

export class UserProfile implements IDTOConvertible<UserProfileResponse> {
	private userId: string;
	private info: UserInfo;
	private additionalDetails: AdditionalDetails;

	constructor(userId: string, info: UserInfo, additionalDetails: AdditionalDetails) {
		this.userId = userId;
		this.info = info;
		this.additionalDetails = additionalDetails;
	}

	toDTO(): UserProfileResponse {
		return {
			userId: this.userId,
			info: this.info.toDTO(),
			additionalDetails: this.additionalDetails.toDTO(),
		};
	}
}
