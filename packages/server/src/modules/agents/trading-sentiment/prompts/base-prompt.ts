import { Injectable } from "@nestjs/common";
import { PromptBuilder } from "../prompt-builder.interface";

@Injectable()
export class BasePromptBuilder implements PromptBuilder<string> {
	build(journalEntry: string): string {
		return `Trading Journal Entry: "${journalEntry}"
    
    Please analyze this trading journal entry for psychological patterns, emotions, 
    cognitive biases, and provide actionable recommendations.`;
	}
}
