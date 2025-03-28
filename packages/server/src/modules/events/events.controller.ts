import { Controller, Post, Body } from "@nestjs/common";
import { EventsService } from "./events.service";
import type { Event } from "./events.types";

@Controller("events")
export class EventsController {
	constructor(private readonly eventsService: EventsService) {}

	@Post()
	createEvent(@Body() event: Event): Promise<String> {
		return this.eventsService.createEvent(event);
	}
}
