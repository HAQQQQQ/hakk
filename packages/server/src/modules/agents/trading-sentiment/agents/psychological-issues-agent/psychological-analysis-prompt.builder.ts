import { Injectable } from "@nestjs/common";
import { PsychologicalIssuesParams } from "../../types/agent-params.types";
import { PromptBuilder } from "../../../prompt-builder.interface";
import { psychologicalAnalysisPromptTemplate } from "./psychological-analysis-prompt.template";

@Injectable()
export class PsychologicalAnalysisPromptBuilder
	implements PromptBuilder<PsychologicalIssuesParams>
{
	build(params: PsychologicalIssuesParams): string {
		return psychologicalAnalysisPromptTemplate(params.journalEntry);
	}
}
