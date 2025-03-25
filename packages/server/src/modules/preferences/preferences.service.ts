import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { Preference } from "@hakk/types";
import { InterestsService } from "../interests/interests.service";

@Injectable()
export class PreferencesService {
	constructor(private readonly supabaseService: SupabaseService, private readonly interestsService: InterestsService) {}

	async addPreference(userId: string, preference: Preference): Promise<any> {
        console.log("reached inside addpreference");
		const saveResponse = await this.supabaseService.addPreference(userId, preference);
        
        const interests = await this.interestsService.addInterest(userId, preference);
        console.log("reached add preference after interests ", interests);
        return { message: "Preferences saved successfully!", interests };

	}
}
