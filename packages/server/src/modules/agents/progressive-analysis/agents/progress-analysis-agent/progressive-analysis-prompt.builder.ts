// progressive-analysis/progressive-analysis-prompt.builder.ts
import { Injectable } from "@nestjs/common";
import { PromptBuilder } from "@/modules/agents/prompt-builder.interface";
import { ProgressiveAnalysisParams } from "./progressive-analysis.schema";
import { buildProgressivePrompt } from "./progressive-analysis-prompt.template";

@Injectable()
export class ProgressiveAnalysisPromptBuilder implements PromptBuilder<ProgressiveAnalysisParams> {
	build(params: ProgressiveAnalysisParams): string {
		return buildProgressivePrompt(
			params.basePrompt,
			params.previousResponses ?? [],
			params.iterationNumber ?? 1,
			params.analysisGoal ?? "comprehensive trading psychology analysis",
			params.targetAgentName ?? undefined,
		);
	}
}
