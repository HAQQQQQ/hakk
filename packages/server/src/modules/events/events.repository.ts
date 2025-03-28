import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import type { Event } from "./events.types";

@Injectable()
export class EventsRepository {
	private readonly EVENTS_TABLE: string = "events";

	constructor(private readonly supabaseService: SupabaseService) {}

	async createEvent(event: Event): Promise<any> {
		const { data, error } = await this.supabaseService.client
			.from(this.EVENTS_TABLE)
			.insert([event]);
		if (error) throw error;
		return data;
	}
}
