import { Injectable, NotFoundException } from "@nestjs/common";
import { Preference } from "@hakk/types";
import { InterestsService } from "../interests/interests.service.js";
import { PreferenceRepository } from "./preferences.repository.js";
import { ProfileService } from "../profile/services/profile.service.js";

@Injectable()
export class PreferencesService {
	constructor(
		private readonly preferenceRepository: PreferenceRepository,
		private readonly profileService: ProfileService,
		private readonly interestsService: InterestsService,
	) {}

	async addPreference(userId: string, preference: Preference): Promise<any> {
		const userExists = await this.profileService.validateUser(userId);
		if (!userExists) {
			throw new NotFoundException(`User with userId ${userId} not found`);
		}

		const addedPreference = await this.preferenceRepository.addPreference(userId, preference);
		const addedInterest = await this.interestsService.addInterest(userId, preference);
		return { message: "Preferences saved successfully!", addedInterest };
	}
}
