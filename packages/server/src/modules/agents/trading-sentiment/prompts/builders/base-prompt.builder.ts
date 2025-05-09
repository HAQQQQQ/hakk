@Injectable()
export class BasePromptBuilder implements PromptBuilder<JournalEntryParams> {
	build(params: JournalEntryParams): string {
		return basePromptTemplate(params.journalEntry);
	}
}
