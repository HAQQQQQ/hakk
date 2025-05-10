import { Injectable } from "@nestjs/common";
import { PsychologyPlanParams } from "../../types/agent-params.types";
import { PromptBuilder } from "../../../prompt-builder.interface";
import { psychologyPlanPromptTemplate } from "./psychology-plan-prompt.template";

@Injectable()
export class PsychologyPlanPromptBuilder implements PromptBuilder<PsychologyPlanParams> {
	build(params: PsychologyPlanParams): string {
		return psychologyPlanPromptTemplate(params.recentEntries);
	}
}
