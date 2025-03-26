export const PrecomputedGraphTokens = {
	GRAPH_CONFIGS: "PRECOMPUTED_GRAPH_CONFIGS",
} as const;

export enum GraphTokens {
	GENRES,
}

export type PrecomputedDataSource = {
	graphToken: GraphTokens;
	filePath: string;
};
