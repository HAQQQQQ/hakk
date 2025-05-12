/**
 * Middleware system for the agent architecture
 */
import { Message } from "./types";

/**
 * Middleware interface for processing messages
 */
export interface AgentMiddleware {
	name: string;
	priority: number;
	process(message: Message, next: () => Promise<void>): Promise<void>;
}

/**
 * Middleware for logging messages
 */
export class LoggingMiddleware implements AgentMiddleware {
	name = "logging";
	priority = 100; // Higher priority, runs earlier

	async process(message: Message, next: () => Promise<void>): Promise<void> {
		console.log(
			`[${new Date().toISOString()}] ${message.role}: ${message.content.substring(0, 50)}...`,
		);
		await next();
	}
}

/**
 * Middleware for content moderation
 */
export class ModerationMiddleware implements AgentMiddleware {
	name = "moderation";
	priority = 200;
	private moderationService: any; // Would be a service for content moderation

	constructor(moderationService: any) {
		this.moderationService = moderationService;
	}

	async process(message: Message, next: () => Promise<void>): Promise<void> {
		if (message.role === "user") {
			const { isSafe, reason } = await this.moderationService.check(message.content);

			if (!isSafe) {
				throw new Error(`Content moderation failed: ${reason}`);
			}
		}

		await next();
	}
}
