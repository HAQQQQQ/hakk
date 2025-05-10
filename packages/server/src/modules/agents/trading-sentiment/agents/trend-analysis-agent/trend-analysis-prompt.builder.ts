import { Injectable } from "@nestjs/common";
import { TrendAnalysisParams } from "../../types/agent-params.types";
import { PromptBuilder } from "../../../prompt-builder.interface";
import { trendAnalysisPromptTemplate } from "./sentiment-analysis-prompt.template";

@Injectable()
export class TrendAnalysisPromptBuilder implements PromptBuilder<TrendAnalysisParams> {
	build(params: TrendAnalysisParams): string {
		return trendAnalysisPromptTemplate(params.journalEntries);
	}
}
