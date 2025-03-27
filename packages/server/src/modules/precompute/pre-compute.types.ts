export type Concept = {
	id: number;
	name: string;
	description: string;
};

export type Topic = {
	name: string;
	concepts: Concept[];
};

export const PrecomputedGraphTokens = {
	GRAPH_CONFIGS: "PRECOMPUTED_GRAPH_CONFIGS",
} as const;

export enum GraphToken {
	MUSIC_GENRES = "music_genre",
}

export type ConceptPair = {
	conceptA: Concept;
	conceptB: Concept;
	similarityScore?: number;
};

// Result I get from FlaskAPi
export type ConceptPairResult = {
	conceptA_id: number;
	conceptB_id: number;
	similarity: number;
};
