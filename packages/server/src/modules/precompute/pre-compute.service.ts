import { EnvConfig } from "@/config/env.config";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { GraphTokens, PrecomputedDataSource, PrecomputedGraphTokens } from "./pre-compute.types";

interface Connection {
	genreA: string;
	genreB: string;
	weight: number;
}

interface ShortestPathsResult {
	distances: { [genre: string]: { [genre: string]: number } };
	next: { [genre: string]: { [genre: string]: string | null } };
}

// New data structure: each step contains a node and optionally a weight (for the first node, weight is undefined)
interface PathStep {
	node: string;
	weight?: number;
}

interface ComputedConnection {
	distance: number;
	steps: PathStep[];
}

@Injectable()
export class PreComputeService implements OnModuleInit {
	// TODO:
	// ----- adjacencyGraph, distances, nextMatrix, computedConnections currently only acts as a singleton (any data after first array will be over written (update this later) -----

	// Direct adjacency graph: raw weights
	private adjacencyGraph: { [genre: string]: { [genre: string]: number } } = {};

	// Shortest distances (converted: distance = 10 - weight)
	private distances: { [genre: string]: { [genre: string]: number } } = {};

	// Matrix for path reconstruction
	private nextMatrix: { [genre: string]: { [genre: string]: string | null } } = {};

	// Final computed connections using the new structure
	private computedConnections: { [genre: string]: { [genre: string]: ComputedConnection } } = {};

	constructor(
		@Inject(PrecomputedGraphTokens.GRAPH_CONFIGS)
		private readonly graphConfigs: PrecomputedDataSource[],
	) {}

	onModuleInit(): void {
		if (!EnvConfig.preCompute) {
			console.log("[PreComputeService] Pre-computation disabled by configuration.");
			return;
		}

		console.log("[PreComputeService] Pre-computation enabled.");

		for (const config of this.graphConfigs) {
			const { graphToken, filePath } = config;
			console.log(`[PreComputeService] Starting computation for graph: ${graphToken}`);

			try {
				this.loadAndCompute(filePath);
				console.log(`[PreComputeService] Successfully computed graph: ${graphToken}`);
				this.buildComputedConnections();
				this.logAllComputedConnections();
			} catch (error) {
				console.error(`[PreComputeService] Failed to compute graph ${graphToken}:`, error);
			}
		}
	}

	/**
	 * Logs every computed connection in a human-friendly format.
	 */
	logAllComputedConnections() {
		console.log("\nAll computed connections (excluding self-connections):\n");
		for (const genreA in this.computedConnections) {
			for (const genreB in this.computedConnections[genreA]) {
				const { distance, steps } = this.computedConnections[genreA][genreB];
				// Build path string: join all node names
				const pathNodes = steps.map((step) => step.node);
				// Build weights string: for display, skip the first step which has no weight
				const weightValues = steps.slice(1).map((step) => step.weight);
				console.log(
					`${genreA} -> ${genreB}: distance = ${distance}, path = ${pathNodes.join(" -> ")}, weights = ${weightValues.join(" -> ")}`,
				);
			}
		}
	}

	// --- Public Methods to Access Data ---
	getComputedConnections(): { [genre: string]: { [genre: string]: ComputedConnection } } {
		return this.computedConnections;
	}

	getDistance(genreA: string, genreB: string): number {
		return this.distances?.[genreA]?.[genreB] ?? Infinity;
	}

	getPath(genreA: string, genreB: string): string[] {
		return this.reconstructPath(genreA, genreB);
	}

	private loadAndCompute(filePath: string) {
		// 1) Read JSON file from the project root using process.cwd()
		const fullFilePath = path.join(process.cwd(), filePath); //this.genreFilePath);
		const fileContent = fs.readFileSync(fullFilePath, "utf8");
		const data = JSON.parse(fileContent);

		// 2) Extract the connections array
		const connections: Connection[] = data.connections;

		// 3) Build the raw adjacencyGraph from connections (undirected)
		this.adjacencyGraph = {};
		for (const { genreA, genreB, weight } of connections) {
			if (!this.adjacencyGraph[genreA]) {
				this.adjacencyGraph[genreA] = {};
			}
			if (!this.adjacencyGraph[genreB]) {
				this.adjacencyGraph[genreB] = {};
			}
			this.adjacencyGraph[genreA][genreB] = weight;
			this.adjacencyGraph[genreB][genreA] = weight;
		}

		// 4) Run to compute distances and nextMatrix
		const { distances, next } = this.computeShortestPaths(connections);
		this.distances = distances;
		this.nextMatrix = next;
	}

	private similarityToDistance(weight: number): number {
		// Convert similarity weight into a "distance" (higher similarity means lower distance)
		return 10 - weight;
	}

	private computeShortestPaths(connections: Connection[]): ShortestPathsResult {
		// 1) Collect all unique genres
		const genresSet = new Set<string>();
		for (const conn of connections) {
			genresSet.add(conn.genreA);
			genresSet.add(conn.genreB);
		}
		const genres = Array.from(genresSet);

		// 2) Initialize distance & next matrices
		const distances: { [i: string]: { [j: string]: number } } = {};
		const next: { [i: string]: { [j: string]: string | null } } = {};
		for (const i of genres) {
			distances[i] = {};
			next[i] = {};
			for (const j of genres) {
				distances[i][j] = i === j ? 0 : Infinity;
				next[i][j] = null;
			}
		}

		// 3) Populate direct connections (using converted distance)
		for (const { genreA, genreB, weight } of connections) {
			const d = this.similarityToDistance(weight);
			if (d < distances[genreA][genreB]) {
				distances[genreA][genreB] = d;
				distances[genreB][genreA] = d;
				next[genreA][genreB] = genreB;
				next[genreB][genreA] = genreA;
			}
		}

		// 4) Run algorithm
		for (const k of genres) {
			for (const i of genres) {
				for (const j of genres) {
					if (distances[i][j] > distances[i][k] + distances[k][j]) {
						distances[i][j] = distances[i][k] + distances[k][j];
						next[i][j] = next[i][k];
					}
				}
			}
		}

		return { distances, next };
	}

	/**
	 * Reconstructs the path between two genres using the nextMatrix.
	 */
	private reconstructPath(start: string, end: string): string[] {
		if (this.nextMatrix[start][end] === null) return [];
		const path = [start];
		while (start !== end) {
			start = this.nextMatrix[start][end] as string;
			path.push(start);
		}
		return path;
	}

	/**
	 * Builds the computedConnections data structure.
	 * For every pair of genres (excluding self-connections)
	 */
	private buildComputedConnections() {
		this.computedConnections = {};
		const genres = Object.keys(this.distances);
		for (const genreA of genres) {
			this.computedConnections[genreA] = {};
			for (const genreB of genres) {
				if (genreA === genreB) continue;
				const distance = this.distances[genreA][genreB];
				if (distance === Infinity) continue; // skip unreachable nodes
				const path = this.reconstructPath(genreA, genreB);
				const steps: PathStep[] = [];
				if (path.length > 0) {
					// First node (starting point) has no weight.
					steps.push({ node: path[0] });
				}
				// For every subsequent node, record the node and the raw weight from the adjacencyGraph.
				for (let i = 0; i < path.length - 1; i++) {
					const from = path[i];
					const to = path[i + 1];
					const weight = this.adjacencyGraph[from][to];
					steps.push({ node: to, weight });
				}
				this.computedConnections[genreA][genreB] = { distance, steps };
			}
		}
	}
}
