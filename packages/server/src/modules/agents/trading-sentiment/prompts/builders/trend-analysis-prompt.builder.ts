import { Injectable } from "@nestjs/common";
import { PromptBuilder } from "../../../../core/interfaces/prompt-builder.interface";
import { TrendAnalysisParams } from "../../types/agent-params.types";
import { trendAnalysisPromptTemplate } from "../templates/trend-analysis.template";

@Injectable()
export class TrendAnalysisPromptBuilder implements PromptBuilder<TrendAnalysisParams> {
	build(params: TrendAnalysisParams): string {
		return trendAnalysisPromptTemplate(params.journalEntries);
	}
}
