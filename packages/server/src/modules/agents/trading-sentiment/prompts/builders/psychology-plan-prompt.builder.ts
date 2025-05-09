import { Injectable } from "@nestjs/common";
import { PromptBuilder } from "../../../../core/interfaces/prompt-builder.interface";
import { PsychologyPlanParams } from "../../types/agent-params.types";
import { psychologyPlanPromptTemplate } from "../templates/psychology-plan.template";

@Injectable()
export class PsychologyPlanPromptBuilder implements PromptBuilder<PsychologyPlanParams> {
	build(params: PsychologyPlanParams): string {
		return psychologyPlanPromptTemplate(params.recentEntries);
	}
}
