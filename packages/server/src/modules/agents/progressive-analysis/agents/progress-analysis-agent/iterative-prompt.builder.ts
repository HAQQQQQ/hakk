// progressive-analysis/iterative-prompt.builder.ts
import { Injectable } from "@nestjs/common";
import { PromptBuilder } from "@/modules/agents/prompt-builder.interface";
import { IterativePromptParams } from "./iterative-prompt.schema";
import { buildIterativePrompt } from "./iterative-prompt.template";

@Injectable()
export class IterativePromptBuilder implements PromptBuilder<IterativePromptParams> {
	build(params: IterativePromptParams): string {
		return buildIterativePrompt(
			params.basePrompt,
			params.previousResponses ?? [],
			params.iterationNumber ?? 1,
			params.analysisGoal ?? "comprehensive trading psychology analysis",
		);
	}
}
