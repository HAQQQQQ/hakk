@Injectable()
export class ResultsAnalysisPromptBuilder implements PromptBuilder<PerformanceAnalysisParams> {
	build(params: PerformanceAnalysisParams): string {
		return resultsAnalysisPromptTemplate(params.journalEntry, params.results);
	}
}
