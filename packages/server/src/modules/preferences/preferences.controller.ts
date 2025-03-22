import { Body, Controller, Post } from "@nestjs/common";
import { Preference } from "@hakk/types";
import { SupabaseService } from "@modules/supabase/supabase.service";

@Controller("preferences")
export class PreferencesController {
	constructor(private readonly supabaseService: SupabaseService) {}

	@Post()
	async savePreferences(
		@Body() body: { userId: string; preference: Preference },
	): Promise<{ message: string }> {
		await this.supabaseService.addPreference(body.userId, body.preference);
		return { message: "Preferences saved successfully" };
	}
}
