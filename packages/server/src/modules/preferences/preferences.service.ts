import { Injectable } from "@nestjs/common";
import { Preference } from "@hakk/types";
import { InterestsService } from "../interests/interests.service";
import { PreferenceRepository } from "./preferences.repository";

@Injectable()
export class PreferencesService {
	constructor(
		private readonly preferenceRepository: PreferenceRepository,
		private readonly interestsService: InterestsService,
	) {}

	async addPreference(userId: string, preference: Preference): Promise<any> {
		console.log("In addPreference");
		const addedPreference = await this.preferenceRepository.addPreference(userId, preference);
		console.log("Prefernce added");
		const addedInterest = await this.interestsService.addInterest(userId, preference);
		return { message: "Preferences saved successfully!", addedInterest };
	}
}
