import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { Preference } from "@hakk/types";

@Injectable()
export class PreferencesService {
	constructor(private readonly supabaseService: SupabaseService) {}

	async addPreference(userId: string, preference: Preference): Promise<string> {
		return this.supabaseService.addPreference(userId, preference);
	}
}
