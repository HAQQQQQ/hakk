import { Injectable } from "@nestjs/common";
import { JournalEntryParams } from "../../types/agent-params.types";
import { PromptBuilder } from "../../../prompt-builder.interface";
import { sentimentAnalysisPromptTemplate } from "./sentiment-analysis-prompt.template";

@Injectable()
export class SentimentAnalysisPromptBuilder implements PromptBuilder<JournalEntryParams> {
	build(params: JournalEntryParams): string {
		return sentimentAnalysisPromptTemplate(params.journalEntry);
	}
}
