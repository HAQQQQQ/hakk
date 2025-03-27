// Tokens for injecting graph configuration and computed data
export const PrecomputedGraphTokens = {
	GRAPH_CONFIGS: "PRECOMPUTED_GRAPH_CONFIGS",
} as const;

// Enum for identifying individual graphs
export enum GraphToken {
	Genres = "Genres",
}

// --- Data Source Configuration ---

// export interface PrecomputedDataSource {
// 	graphToken: GraphToken;
// 	filePath: string;
// }

// --- Generic 2D Matrix Type ---

export type Matrix<T> = Record<string, Record<string, T>>;

// --- Specialized Matrices ---

export type AdjacencyGraph = Matrix<number>;
export type DistanceMatrix = Matrix<number>;
export type NextMatrix = Matrix<string | null>;

// --- Graph State ---

export interface GraphComputationState {
	adjacencyGraph: AdjacencyGraph;
	distances: DistanceMatrix;
	nextMatrix: NextMatrix;
	computedConnections: ComputedConnections;
}

// --- Computed Connections ---

export type ComputedConnections = Record<string, Record<string, ComputedConnection>>;

export interface ComputedConnection {
	distance: number;
	steps: PathStep[];
}

export interface PathStep {
	node: string;
	weight?: number; // undefined for the starting node
}

// --- Raw Input ---

export interface Connection {
	genreA: string;
	genreB: string;
	weight: number;
}

// --- Algorithm Result ---

export interface ShortestPathsResult {
	distances: DistanceMatrix;
	next: NextMatrix;
}
