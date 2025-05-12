/**
 * Vector-based memory system for semantic search
 */
import { Message } from "../core/types";
import { BaseMemorySystem } from "./base-memory";

/**
 * Vector-based memory system implementation
 */
export class VectorMemorySystem extends BaseMemorySystem {
	private vectorStore: any; // Would be a proper vector DB client
	private embedder: any; // Would handle creating embeddings

	constructor(vectorStore: any, embedder: any) {
		super();
		this.vectorStore = vectorStore;
		this.embedder = embedder;
	}

	protected async onMessageAdded(message: Message): Promise<void> {
		// Create embedding for the message
		const embedding = await this.embedder.embed(message.content);

		// Store in vector DB with metadata
		await this.vectorStore.insert({
			id: `msg-${Date.now()}`,
			text: message.content,
			embedding,
			metadata: {
				role: message.role,
				timestamp: Date.now(),
			},
		});
	}

	async getRelevantContext(query: string, limit: number = 5): Promise<Message[]> {
		// Create embedding for the query
		const embedding = await this.embedder.embed(query);

		// Search vector DB
		const results = await this.vectorStore.search({
			embedding,
			limit,
		});

		// Convert results to messages
		return results.map((result) => ({
			role: result.metadata.role as any,
			content: result.text,
			metadata: { score: result.score },
		}));
	}

	getContext(): string {
		// For vector memory, we rely on semantic search rather than sequential history
		return this.messages
			.slice(-10) // Just return recent messages as context
			.map((m) => `${m.role.toUpperCase()}: ${m.content}`)
			.join("\n");
	}

	async clear(): Promise<void> {
		super.clear();
		// Also clear vector store
		await this.vectorStore.clear();
	}
}
