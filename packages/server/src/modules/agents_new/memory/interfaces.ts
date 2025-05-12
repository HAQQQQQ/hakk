/**
 * Memory system interfaces
 */

import { Message } from "../core/types";

/**
 * Interface for memory system implementations
 */
export interface MemorySystemInterface {
	getMessages(): Message[];
	addMessage(message: Message): void;
	getContext(): string;
	clear(): void;
}
