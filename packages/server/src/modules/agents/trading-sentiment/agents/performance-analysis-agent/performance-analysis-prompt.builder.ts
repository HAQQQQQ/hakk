import { Injectable } from "@nestjs/common";
import { PerformanceAnalysisParams } from "../../types/agent-params.types";
import { PromptBuilder } from "../../../prompt-builder.interface";
import { performanceAnalysisPromptTemplate } from "./performance-analysis-prompt.template";

@Injectable()
export class PerformanceAnalysisPromptBuilder implements PromptBuilder<PerformanceAnalysisParams> {
	build(params: PerformanceAnalysisParams): string {
		return performanceAnalysisPromptTemplate(params.journalEntry, params.results);
	}
}
