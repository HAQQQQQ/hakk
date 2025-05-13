import { Agent } from "../agent";
import { AgentEventType, Message } from "../core";

export abstract class AgentImpl {
	/**
	 * The underlying core agent
	 */
	protected abstract agent: Agent;

	// /**
	// * Abstract analyze method that all agent implementations must implement
	// * This provides a consistent interface for analyzing content
	// *
	// * @param input - Input data to analyze (generic to allow different input types)
	// * @param onMessage - Optional callback for messages during processing
	// * @returns Analysis result or null if processing failed
	// */
	// abstract analyze<InputType, OutputType>(
	//     input: InputType,
	//     onMessage?: (message: Message) => void | Promise<void>
	// ): Promise<OutputType | null>;

	/**
	 * Subscribe to events from the agent
	 *
	 * @param eventType - Type of event to subscribe to
	 * @param handler - Handler function for the event
	 * @returns Subscription object with unsubscribe method
	 */
	onEvent<T>(
		eventType: AgentEventType,
		handler: (event: { payload: T }) => void,
	): { unsubscribe: () => void } {
		return this.agent.on(eventType, handler);
	}

	/**
	 * Clear the agent's memory
	 */
	clearMemory(): void {
		this.agent.clearMemory();
	}

	/**
	 * Get the agent instance
	 *
	 * @returns The core agent instance
	 */
	getAgent(): Agent {
		return this.agent;
	}

	/**
	 * Create a default message handler if none is provided
	 *
	 * @returns A default message handler
	 */
	protected createDefaultMessageHandler(): (message: Message) => Promise<void> {
		return async (message: Message) => {
			console.log(`[${message.role}]: ${message.content.substring(0, 50)}...`);
		};
	}
}
