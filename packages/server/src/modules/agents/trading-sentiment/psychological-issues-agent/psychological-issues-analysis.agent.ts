// 5. PsychologicalAnalysisAgent
import { Injectable } from "@nestjs/common";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { AgentName } from "../../agent.factory";
import { BaseTradingSentimentAgent } from "../../__trading-sentiment/trading-sentimental-analysis.agent";
import { PsychologicalIssuesParams } from "../../__trading-sentiment/analysis/agent-params.types";
import { PsychologicalIssuesAnalysis } from "../../__trading-sentiment/types/trading-sentiment.types";
import { PsychologicalAnalysisPromptBuilder } from "./psychological-analysis-prompt.builder";

@Injectable()
export class PsychologicalAnalysisAgent extends BaseTradingSentimentAgent<
	PsychologicalIssuesParams,
	PsychologicalIssuesAnalysis
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
}
