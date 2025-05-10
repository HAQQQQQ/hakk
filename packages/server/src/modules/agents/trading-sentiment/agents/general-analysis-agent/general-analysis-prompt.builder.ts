import { Injectable } from "@nestjs/common";
import { JournalEntryParams } from "../../types/agent-params.types";
import { PromptBuilder } from "../../../prompt-builder.interface";
import { generalTradingAnalysisPromptTemplate } from "./general-analysis-prompt.template";

@Injectable()
export class GeneralTradingAnalysisPromptBuilder implements PromptBuilder<JournalEntryParams> {
	build(params: JournalEntryParams): string {
		return generalTradingAnalysisPromptTemplate(params.journalEntry);
	}
}
