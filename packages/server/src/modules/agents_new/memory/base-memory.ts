/**
 * Base memory system implementation
 */
import { Message } from "../core/types";
import { MemorySystemInterface } from "./interfaces";

/**
 * Base abstract class for memory systems
 */
export abstract class BaseMemorySystem implements MemorySystemInterface {
	protected messages: Message[] = [];

	getMessages(): Message[] {
		return [...this.messages]; // Return a copy to prevent mutation
	}

	addMessage(message: Message): void {
		this.messages.push(message);
		this.onMessageAdded(message);
	}

	abstract getContext(): string;

	clear(): void {
		this.messages = [];
		this.onMemoryCleared();
	}

	protected onMessageAdded(message: Message): void {
		// Hook for subclasses to override
	}

	protected onMemoryCleared(): void {
		// Hook for subclasses to override
	}
}
