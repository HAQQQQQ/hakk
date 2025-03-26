import { Injectable, NotFoundException } from "@nestjs/common";
import { Preference } from "@hakk/types";
import { InterestsService } from "../interests/interests.service";
import { PreferenceRepository } from "./preferences.repository";
import { ProfileService } from "../profile/profile.service";

@Injectable()
export class PreferencesService {
	constructor(
		private readonly preferenceRepository: PreferenceRepository,
		private readonly profileService: ProfileService,
		private readonly interestsService: InterestsService,
	) {}

	async addPreference(userId: string, preference: Preference): Promise<any> {
		if (!(await this.profileService.validateUser(userId))) {
			throw new NotFoundException(`User with userId ${userId} not found`);
		}

		const addedPreference = await this.preferenceRepository.addPreference(userId, preference);
		const addedInterest = await this.interestsService.addInterest(userId, preference);
		return { message: "Preferences saved successfully!", addedInterest };
	}
}
