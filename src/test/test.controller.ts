import { Body, Controller, Post } from "@nestjs/common";
import { TestService } from "./test.service";
import { Preference } from "../types/common.types";
import { SupabaseService } from "../supabase/supabase.service";

@Controller("test")
export class TestController {
	constructor(
		private readonly testService: TestService,
		private readonly supabaseService: SupabaseService,
	) {}

	@Post("add-preferences")
	async addPreferences(@Body() body: { userId: string; preference: Preference }): Promise<any> {
		const { userId, preference } = body;
		return await this.supabaseService.addPreference(userId, preference);
	}
}
