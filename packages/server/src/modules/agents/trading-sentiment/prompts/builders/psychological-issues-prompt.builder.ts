import { Injectable } from "@nestjs/common";
import { PsychologicalIssuesParams } from "../../analysis/agent-params.types";
import { PromptBuilder } from "@/modules/agents/prompt-builder.interface";
import { issuesPromptTemplate } from "../templates/base.template";

@Injectable()
export class PsychologicalIssuesPromptBuilder implements PromptBuilder<PsychologicalIssuesParams> {
	build(params: PsychologicalIssuesParams): string {
		return issuesPromptTemplate(params.journalEntry);
	}
}
