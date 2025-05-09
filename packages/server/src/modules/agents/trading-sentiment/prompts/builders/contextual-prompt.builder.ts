import { Injectable } from "@nestjs/common";
import { PromptBuilder } from "../../../../core/interfaces/prompt-builder.interface";
import { ContextualAnalysisParams } from "../../types/agent-params.types";
import { contextualPromptTemplate } from "../templates/contextual.template";

@Injectable()
export class ContextualPromptBuilder implements PromptBuilder<ContextualAnalysisParams> {
	build(params: ContextualAnalysisParams): string {
		return contextualPromptTemplate(params.journalEntry, params.context);
	}
}
