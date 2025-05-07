// src/modules/agents/agent-registry.service.ts
import { Injectable } from "@nestjs/common";
import { OpenAIClientService } from "../openai/openai-client.service";
import { AgentNode } from "./agent-node";
import {
	JournalReflection,
	JournalReflectionSchema,
	JournalReflectionTool,
} from "../transcription/transcription-tool.schema";
import { agentDefinitions, AgentName } from "./agent.config";
import { ToolSchema, ToolSchemaParams } from "../openai/openai.types";
import zodToJsonSchema from "zod-to-json-schema";

@Injectable()
export class AgentRegistryService {
	private agents: Map<string, AgentNode<unknown>> = new Map();

	constructor(private readonly openaiClient: OpenAIClientService) {
		this.registerAgentsFromConfig();
	}

	private registerAgentsFromConfig() {
		for (const def of agentDefinitions) {
			const tool: ToolSchema = {
				name: def.toolName,
				description: def.toolDescription,
				parameters: zodToJsonSchema(def.schema) as ToolSchemaParams,
			};

			const agent = new AgentNode(this.openaiClient, {
				name: def.name,
				description: def.description,
				tool,
				schema: def.schema,
				systemMessage: def.systemMessage,
			});

			this.agents.set(def.name, agent);
		}
	}

	get<T>(name: string): AgentNode<T> {
		const agent = this.agents.get(name);
		if (!agent) throw new Error(`Agent "${name}" not found`);
		return agent as AgentNode<T>;
	}

	getJournalReflectionAgent(): AgentNode<JournalReflection> {
		return this.get<JournalReflection>(AgentName.JOURNAL_REFLECTION);
	}
}
