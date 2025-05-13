/**
 * Simple in-memory implementation
 */
import { Message } from "../core";
import { BaseMemorySystem } from "./base-memory";

/**
 * Simple in-memory implementation of the memory system
 */
export class SimpleMemorySystem extends BaseMemorySystem {
	private maxMessages: number;

	constructor(maxMessages: number = 100) {
		super();
		this.maxMessages = maxMessages;
	}

	addMessage(message: Message): void {
		super.addMessage(message);

		// Trim if we exceed the maximum
		if (this.messages.length > this.maxMessages) {
			// Keep system messages and remove oldest user/assistant messages
			const systemMessages = this.messages.filter((m) => m.role === "system");
			const otherMessages = this.messages
				.filter((m) => m.role !== "system")
				.slice(-this.maxMessages + systemMessages.length);

			this.messages = [...systemMessages, ...otherMessages];
		}
	}

	getContext(): string {
		// Simple concatenation of messages
		return this.messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
	}
}
