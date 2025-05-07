import { Injectable } from "@nestjs/common";
import { PromptBuilder } from "../prompt-builder.interface";

@Injectable()
export class PsychologyPlanPromptBuilder implements PromptBuilder<string[]> {
	build(recentEntries: string[]): string {
		// Format entries for the prompt
		const entriesFormatted = recentEntries
			.map((entry, index) => `Entry ${index + 1}:\n"${entry}"`)
			.join("\n\n");

		return `
    Review the following recent trading journal entries and create a personalized trading 
    psychology plan to improve the trader's performance:
    
    ${entriesFormatted}
    
    Please create:
    1. A psychological profile identifying strengths, vulnerabilities, emotional triggers, and cognitive patterns
    2. A structured trading psychology plan including:
       - Daily practices for mental preparation
       - Trading session structure recommendations
       - Specific strategies for managing emotional triggers
       - Psychological metrics to track
       - A review process for ongoing improvement
       - Progress milestones to measure psychological development
    3. Implementation steps divided into immediate, short-term, and long-term actions
    `;
	}
}
