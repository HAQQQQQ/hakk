// 5. PsychologicalAnalysisAgent
import { Injectable } from "@nestjs/common";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { TradingSentimentBaseAgent } from "../trading-sentiment-base.agent";
import { PsychologicalAnalysisPromptBuilder } from "./psychological-analysis-prompt.builder";
import { z, ZodTypeAny } from "zod";
import {
	PsychologicalIssuesResponse,
	psychologicalIssuesResponseSchema,
} from "./psychological-issues.schema";
import { PsychologicalIssuesParams } from "../../types/agent-params.types";
import { AgentName } from "@/modules/agents/agent-name.enum";

@Injectable()
export class PsychologicalAnalysisAgent extends TradingSentimentBaseAgent<
	PsychologicalIssuesParams,
	PsychologicalIssuesResponse
> {
	constructor(
		openaiClient: OpenAIClientService,
		promptBuilder: PsychologicalAnalysisPromptBuilder,
	) {
		super(
			openaiClient,
			promptBuilder,
			AgentName.PSYCHOLOGICAL_ANALYSIS, // Updated
			"psychological_analysis_tool", // Updated
			"You identify and prioritize potential psychological issues affecting a trader based on their journal entries.",
		);
	}

	getSchema(): z.ZodSchema<PsychologicalIssuesResponse> {
		return psychologicalIssuesResponseSchema;
	}
}
