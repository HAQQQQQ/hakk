import { EnvConfig } from "@/config/env.config";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import {
	AdjacencyGraph,
	Connection,
	DistanceMatrix,
	GraphComputationState,
	GraphToken,
	NextMatrix,
	PathStep,
	// PrecomputedDataSource,
	PrecomputedGraphTokens,
	ShortestPathsResult,
	ComputedConnections,
} from "./pre-compute.types";
import { PrecomputeRepository } from "./pre-compute.repository";

@Injectable()
export class PreComputeService implements OnModuleInit {
	private graphMap: Map<GraphToken, GraphComputationState> = new Map();

	constructor(
		private readonly preComputeRepository: PrecomputeRepository,
		@Inject(PrecomputedGraphTokens.GRAPH_CONFIGS)
		private readonly graphTokens: GraphToken[],
	) {}

	async onModuleInit(): Promise<void> {
		if (!EnvConfig.preCompute) {
			console.log("[PreComputeService] Pre-computation disabled by configuration.");
			return;
		}

		console.log("[PreComputeService] Pre-computation enabled.");

		for (const graphToken of this.graphTokens) {
			console.log(`[PreComputeService] Starting computation for graph: ${graphToken}`);

			try {
				const { adjacencyGraph, distances, nextMatrix } =
					await this.loadAndCompute(graphToken); //(filePath);
				const computedConnections = this.buildComputedConnections(
					adjacencyGraph,
					distances,
					nextMatrix,
				);

				this.graphMap.set(graphToken, {
					adjacencyGraph,
					distances,
					nextMatrix,
					computedConnections,
				});

				console.log(`[PreComputeService] Successfully computed graph: ${graphToken}`);
				this.logAllComputedConnections(graphToken);
			} catch (error) {
				console.error(`[PreComputeService] Failed to compute graph ${graphToken}:`, error);
			}
		}
	}

	getGraphConfig(graphToken: GraphToken): GraphComputationState | null {
		return this.graphMap.get(graphToken) ?? null;
	}

	logAllComputedConnections(graphToken: GraphToken): void {
		const graph = this.graphMap.get(graphToken);
		if (!graph) return;

		const { computedConnections } = graph;

		console.log(`\n[${graphToken}] All computed connections (excluding self-connections):\n`);
		for (const genreA in computedConnections) {
			for (const genreB in computedConnections[genreA]) {
				const { distance, steps } = computedConnections[genreA][genreB];
				const pathNodes = steps.map((step) => step.node);
				const weightValues = steps.slice(1).map((step) => step.weight);
				console.log(
					`${genreA} -> ${genreB}: distance = ${distance}, path = ${pathNodes.join(" -> ")}, weights = ${weightValues.join(" -> ")}`,
				);
			}
		}
	}

	private async loadAndCompute(graphToken: GraphToken): Promise<{
		//(filePath: string): {
		adjacencyGraph: AdjacencyGraph;
		distances: DistanceMatrix;
		nextMatrix: NextMatrix;
	}> {
		// const fullFilePath = path.join(process.cwd(), filePath);
		// const fileContent = fs.readFileSync(fullFilePath, "utf8");
		// const data = JSON.parse(fileContent);
		// const connections: Connection[] = data.connections;
		const connections: Connection[] =
			await this.preComputeRepository.fetchConnectionsForGraph(graphToken);

		const adjacencyGraph: AdjacencyGraph = {};
		for (const { genreA, genreB, weight } of connections) {
			if (!adjacencyGraph[genreA]) adjacencyGraph[genreA] = {};
			if (!adjacencyGraph[genreB]) adjacencyGraph[genreB] = {};
			adjacencyGraph[genreA][genreB] = weight;
			adjacencyGraph[genreB][genreA] = weight;
		}

		const { distances, next } = this.computeShortestPaths(connections);
		return { adjacencyGraph, distances, nextMatrix: next };
	}

	private similarityToDistance(weight: number): number {
		return 10 - weight;
	}

	private computeShortestPaths(connections: Connection[]): ShortestPathsResult {
		const genresSet = new Set<string>();
		for (const conn of connections) {
			genresSet.add(conn.genreA);
			genresSet.add(conn.genreB);
		}
		const genres = Array.from(genresSet);

		const distances: DistanceMatrix = {};
		const next: NextMatrix = {};

		for (const i of genres) {
			distances[i] = {};
			next[i] = {};
			for (const j of genres) {
				distances[i][j] = i === j ? 0 : Infinity;
				next[i][j] = null;
			}
		}

		for (const { genreA, genreB, weight } of connections) {
			const d = this.similarityToDistance(weight);
			if (d < distances[genreA][genreB]) {
				distances[genreA][genreB] = d;
				distances[genreB][genreA] = d;
				next[genreA][genreB] = genreB;
				next[genreB][genreA] = genreA;
			}
		}

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

	private buildComputedConnections(
		adjacencyGraph: AdjacencyGraph,
		distances: DistanceMatrix,
		nextMatrix: NextMatrix,
	): ComputedConnections {
		const computedConnections: ComputedConnections = {};
		const genres = Object.keys(distances);

		for (const genreA of genres) {
			computedConnections[genreA] = {};
			for (const genreB of genres) {
				if (genreA === genreB) continue;

				const distance = distances[genreA][genreB];
				if (distance === Infinity) continue;

				const path = this.reconstructPath(genreA, genreB, nextMatrix);
				const steps: PathStep[] = [];

				if (path.length > 0) steps.push({ node: path[0] });

				for (let i = 0; i < path.length - 1; i++) {
					const from = path[i];
					const to = path[i + 1];
					const weight = adjacencyGraph[from][to];
					steps.push({ node: to, weight });
				}

				computedConnections[genreA][genreB] = { distance, steps };
			}
		}

		return computedConnections;
	}

	private reconstructPath(start: string, end: string, nextMatrix: NextMatrix): string[] {
		if (nextMatrix[start][end] === null) return [];
		const path = [start];
		while (start !== end) {
			start = nextMatrix[start][end] as string;
			path.push(start);
		}
		return path;
	}
}
