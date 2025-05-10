// 6. PsychologyPlanAgent
import { Injectable } from "@nestjs/common";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { TradingSentimentBaseAgent } from "../trading-sentiment-base.agent";
import { PsychologyPlanPromptBuilder } from "./psychology-plan-prompt.builder";
import {
	PsychologyPlanResponse,
	psychologyPlanResponseSchema,
} from "./psychology-plan-response.schema";
import { PsychologyPlanParams } from "../../types/agent-params.types";
import { z, ZodTypeAny } from "zod";
import { AgentName } from "@/modules/agents/agent-name.enum";

@Injectable()
export class PsychologyPlanAgent extends TradingSentimentBaseAgent<
	PsychologyPlanParams,
	PsychologyPlanResponse
> {
	constructor(openaiClient: OpenAIClientService, promptBuilder: PsychologyPlanPromptBuilder) {
		super(
			openaiClient,
			promptBuilder,
			AgentName.PSYCHOLOGY_PLAN, // Updated
			"psychology_plan_tool", // Updated
			"You create a personalized trading psychology plan based on analysis of recent trading journal entries.",
		);
	}

	getSchema(): z.ZodSchema<PsychologyPlanResponse> {
		return psychologyPlanResponseSchema;
	}
}
