import { Injectable } from "@nestjs/common";
import { ContextualAnalysisParams } from "../../types/agent-params.types";
import { PromptBuilder } from "../../../prompt-builder.interface";
import { contextualSentimentPromptTemplate } from "./contextual-sentiment-prompt.template";

@Injectable()
export class ContextualSentimentPromptBuilder implements PromptBuilder<ContextualAnalysisParams> {
	build(params: ContextualAnalysisParams): string {
		return contextualSentimentPromptTemplate(params.journalEntry, params.context);
	}
}
