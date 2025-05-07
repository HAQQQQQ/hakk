// src/agents/AgentNode.ts
import { ZodSchema } from "zod";
import { OpenAIResponseStatus, ToolSchema } from "../openai/openai.types";
import { OpenAIClientService } from "../openai/openai-client.service";

export interface AgentNodeConfig<T> {
	name: string;
	description: string;
	tool: ToolSchema;
	schema: ZodSchema<T>;
	systemMessage?: string;
}

export class AgentNode<T> {
	constructor(
		private readonly client: OpenAIClientService,
		private readonly config: AgentNodeConfig<T>,
	) {}

	async run(prompt: string): Promise<T> {
		const response = await this.client.executeToolCall<T>(
			prompt,
			this.config.tool,
			this.config.schema,
			this.config.systemMessage,
		);

		if (response.status === OpenAIResponseStatus.SUCCESS) {
			return response.data;
		} else {
			throw new Error(
				`Agent "${this.config.name}" failed: ${
					typeof response.error === "string" ? response.error : response.error?.message
				}`,
			);
		}
	}
}
