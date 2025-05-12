/**
 * Event system for the agent architecture
 */

/**
 * Event types for the agent system
 */
export enum AgentEventType {
	MESSAGE_RECEIVED = "message_received",
	MESSAGE_SENT = "message_sent",
	TOOL_CALLED = "tool_called",
	TOOL_RESULT = "tool_result",
	ERROR = "error",
	THINKING = "thinking",
}

export interface AgentEvent {
	type: AgentEventType;
	payload: unknown;
	timestamp: number;
}

/**
 * Event subscription interface
 */
export interface EventSubscription {
	unsubscribe(): void;
}

/**
 * Event handler type
 */
export type EventHandler = (event: AgentEvent) => void;

/**
 * Event bus for the agent system
 */
export class EventBus {
	private subscribers: Map<AgentEventType, Set<EventHandler>> = new Map();

	/**
	 * Subscribe to an event type
	 */
	subscribe(eventType: AgentEventType, handler: EventHandler): EventSubscription {
		if (!this.subscribers.has(eventType)) {
			this.subscribers.set(eventType, new Set());
		}

		this.subscribers.get(eventType)!.add(handler);

		return {
			unsubscribe: () => {
				const handlers = this.subscribers.get(eventType);
				if (handlers) {
					handlers.delete(handler);
				}
			},
		};
	}

	/**
	 * Publish an event
	 */
	publish(event: AgentEvent): void {
		const handlers = this.subscribers.get(event.type);

		if (handlers) {
			for (const handler of handlers) {
				try {
					handler(event);
				} catch (error) {
					console.error(`Error in event handler for ${event.type}:`, error);
				}
			}
		}
	}

	/**
	 * Clear all subscribers
	 */
	clear(): void {
		this.subscribers.clear();
	}
}
