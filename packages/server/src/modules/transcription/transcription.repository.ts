import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";

// In interests module
@Injectable()
export class TranscriptionRepository {
	// private readonly PREFERENCES_TABLE: string = "";

	constructor(private readonly supabaseService: SupabaseService) {}

	async fetchLogs(userId: string): Promise<string> {
		return "hii my name is Patel brother and im making a trade today. Dopeeeee, just lost my life savings :(";
	}
}
