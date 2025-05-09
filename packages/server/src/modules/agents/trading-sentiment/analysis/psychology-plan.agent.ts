// psychology-plan-agent.ts
import { Injectable } from "@nestjs/common";
import { BaseTradingSentimentAgent } from "../trading-sentimental-analysis.agent";
import { PsychologyPlanParams } from "./agent-params.types";
import { TradingPsychologyPlan } from "../types/trading-sentiment.types";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { TradingPromptBuilderService } from "../services/prompt-builder.service";
import { AgentName } from "../../agent.factory";

@Injectable()
export class TradingPsychologyPlanAgent extends BaseTradingSentimentAgent<
	PsychologyPlanParams,
	TradingPsychologyPlan
> {
	constructor(openaiClient: OpenAIClientService, promptBuilder: TradingPromptBuilderService) {
		super(
			openaiClient,
			promptBuilder,
			AgentName.TRADING_PSYCHOLOGY_PLAN,
			"trading_psychology_plan",
			"You create a personalized trading psychology plan based on analysis of recent trading journal entries.",
		);
	}

	buildPrompt(params: PsychologyPlanParams): string {
		return this.promptBuilder.buildPsychologyPlanPrompt(params.recentEntries);
	}
}
