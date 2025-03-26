import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { Preference } from "@hakk/types";
import { InterestsService } from "../interests/interests.service";

@Injectable()
export class PreferencesService {
	constructor(
		private readonly supabaseService: SupabaseService,
		private readonly interestsService: InterestsService,
	) {}

	async addPreference(userId: string, preference: Preference): Promise<any> {
		console.log("In addPreference");
		const addedPreference = await this.supabaseService.addPreference(userId, preference);
		console.log("Prefernce added");
		const addedInterest = await this.interestsService.addInterest(userId, preference);
		return { message: "Preferences saved successfully!", addedInterest };
	}
}
