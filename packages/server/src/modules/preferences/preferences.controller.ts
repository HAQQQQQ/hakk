import { Body, Controller, Post } from "@nestjs/common";
import { Preference } from "@hakk/types";
import { PreferencesService } from "./preferences.service.js";

@Controller("preferences")
export class PreferencesController {
	constructor(private readonly preferencesService: PreferencesService) {}

	@Post()
	async savePreferences(
		@Body() body: { userId: string; preference: Preference },
	): Promise<{ message: string; data: any }> {
		const data = this.preferencesService.addPreference(body.userId, body.preference);
		return { message: "Preferences saved successfully", data: data };
	}
}
