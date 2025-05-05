import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";

// In interests module
@Injectable()
export class TranscriptionRepository {
	// private readonly PREFERENCES_TABLE: string = "";

	constructor(private readonly supabaseService: SupabaseService) {}
}
