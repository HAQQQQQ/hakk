import { Module } from "@nestjs/common";
import { AgentRegistryService } from "./agent-registry.service";
import { OpenAIClientService } from "../openai/openai-client.service";

@Module({
	providers: [AgentRegistryService, OpenAIClientService],
	exports: [AgentRegistryService],
})
export class AgentModule {}
