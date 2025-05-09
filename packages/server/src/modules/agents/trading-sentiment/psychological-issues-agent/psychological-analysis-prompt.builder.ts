import { Injectable } from "@nestjs/common";
import { PsychologicalIssuesParams } from "../../__trading-sentiment/analysis/agent-params.types";
import { PromptBuilder } from "../../prompt-builder.interface";

@Injectable()
export class PsychologicalAnalysisPromptBuilder
	implements PromptBuilder<PsychologicalIssuesParams>
{
	build(params: PsychologicalIssuesParams): string {
		return psychologicalAnalysisPromptTemplate(params.journalEntry);
	}
}

export const psychologicalAnalysisPromptTemplate = (journalEntry: string): string => {
	return `
    Trading Journal Entry: "${journalEntry}"
    
    Please identify potential trading psychology issues in this journal entry:
    1. Name specific trading psychology issues with confidence levels
    2. Provide evidence from the text for each issue
    3. Assess the potential impact of each issue on trading performance
    4. Recommend specific interventions for each issue
    5. Suggest resources to help address each issue (books, techniques, exercises)
    6. Identify the single highest priority action item
    7. Provide an overall risk assessment of how these psychological factors may affect trading
    `;
};
