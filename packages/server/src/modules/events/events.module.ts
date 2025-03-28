import { Module } from "@nestjs/common";
import { EventsService } from "./events.service";
import { EventsController } from "./events.controller";
import { EventsRepository } from "./events.repository";
import { SupabaseService } from "../supabase/supabase.service";

@Module({
	controllers: [EventsController],
	providers: [EventsService, EventsRepository, SupabaseService],
})
export class EventsModule {}
