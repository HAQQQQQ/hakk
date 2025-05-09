// 6. PsychologyPlanAgent
import { Injectable } from "@nestjs/common";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { TradingSentimentBaseAgent } from "../trading-sentiment-base.agent";
import { PsychologyPlanParams } from "../../__trading-sentiment/analysis/agent-params.types";
import { TradingPsychologyPlan } from "../../__trading-sentiment/types/trading-sentiment.types";
import { AgentName } from "../../agent.factory";
import { PsychologyPlanPromptBuilder } from "./psychology-plan-prompt.builder";

@Injectable()
export class PsychologyPlanAgent extends TradingSentimentBaseAgent<
	PsychologyPlanParams,
	TradingPsychologyPlan
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
}
