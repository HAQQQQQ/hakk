// psychological-issues-agent.ts
import { Injectable } from "@nestjs/common";
import { BaseTradingSentimentAgent } from "../trading-sentimental-analysis.agent";
import { PsychologicalIssuesParams } from "./agent-params.types";
import { PsychologicalIssuesAnalysis } from "../types/trading-sentiment.types";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { TradingPromptBuilderService } from "../services/prompt-builder.service";
import { AgentName } from "../../agent.factory";

@Injectable()
export class PsychologicalIssuesAgent extends BaseTradingSentimentAgent<
	PsychologicalIssuesParams,
	PsychologicalIssuesAnalysis
> {
	constructor(openaiClient: OpenAIClientService, promptBuilder: TradingPromptBuilderService) {
		super(
			openaiClient,
			promptBuilder,
			AgentName.TRADING_PSYCHOLOGICAL_ISSUES,
			"psychological_issues_analysis",
			"You identify and prioritize potential psychological issues affecting a trader based on their journal entries.",
		);
	}

	buildPrompt(params: PsychologicalIssuesParams): string {
		return this.promptBuilder.buildIssuesPrompt(params.journalEntry);
	}
}
