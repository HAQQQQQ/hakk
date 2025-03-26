import { Injectable } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
@Injectable()
export class SupabaseService {
	private supabase: SupabaseClient;

	constructor() {
		const SUPABASE_URL = process.env.SUPABASE_URL;
		const SUPABASE_KEY = process.env.SUPABASE_KEY;

		if (!SUPABASE_URL || !SUPABASE_KEY) {
			throw new Error("Supabase credentials are missing. Check your environment variables.");
		}

		this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
	}

	get client(): SupabaseClient {
		return this.supabase;
	}
}
