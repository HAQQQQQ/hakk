import { Injectable } from "@nestjs/common";
import { EventsRepository } from "./events.repository";
import type { Event } from "./events.types";

@Injectable()
export class EventsService {
	constructor(private readonly eventsRepository: EventsRepository) {}

	createEvent(event: Event): Promise<String> {
		return this.eventsRepository.createEvent(event);
	}
}
