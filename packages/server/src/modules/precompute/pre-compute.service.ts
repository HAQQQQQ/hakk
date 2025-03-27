import { EnvConfig } from "@/config/env.config";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import {
	AdjacencyGraph,
	Connection,
	DistanceMatrix,
	GraphComputationState,
	GraphToken,
	NextMatrix,
	PathStep,
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
		await this.loadAndComputeAllGraphTokens();
	}

	async loadAndComputeAllGraphTokens(): Promise<void> {
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
		for (const topicA in computedConnections) {
			for (const topicB in computedConnections[topicA]) {
				const { distance, steps } = computedConnections[topicA][topicB];
				const pathNodes = steps.map((step) => step.node);
				const weightValues = steps.slice(1).map((step) => step.weight);
				console.log(
					`${topicA} -> ${topicB}: distance = ${distance}, path = ${pathNodes.join(" -> ")}, weights = ${weightValues.join(" -> ")}`,
				);
			}
		}
	}

	private async loadAndCompute(graphToken: GraphToken): Promise<{
		adjacencyGraph: AdjacencyGraph;
		distances: DistanceMatrix;
		nextMatrix: NextMatrix;
	}> {
		const connections: Connection[] =
			await this.preComputeRepository.fetchConnectionsForGraph(graphToken);

		const adjacencyGraph: AdjacencyGraph = {};
		for (const { topicA, topicB, weight } of connections) {
			if (!adjacencyGraph[topicA]) adjacencyGraph[topicA] = {};
			if (!adjacencyGraph[topicB]) adjacencyGraph[topicB] = {};
			adjacencyGraph[topicA][topicB] = weight;
			adjacencyGraph[topicB][topicA] = weight;
		}

		const { distances, next } = this.computeShortestPaths(connections);
		return { adjacencyGraph, distances, nextMatrix: next };
	}

	private similarityToDistance(weight: number): number {
		return 10 - weight;
	}

	private computeShortestPaths(connections: Connection[]): ShortestPathsResult {
		const topicsSet = new Set<string>();
		for (const conn of connections) {
			topicsSet.add(conn.topicA);
			topicsSet.add(conn.topicB);
		}
		const topics = Array.from(topicsSet);

		const distances: DistanceMatrix = {};
		const next: NextMatrix = {};

		for (const i of topics) {
			distances[i] = {};
			next[i] = {};
			for (const j of topics) {
				distances[i][j] = i === j ? 0 : Infinity;
				next[i][j] = null;
			}
		}

		for (const { topicA, topicB, weight } of connections) {
			const d = this.similarityToDistance(weight);
			if (d < distances[topicA][topicB]) {
				distances[topicA][topicB] = d;
				distances[topicB][topicA] = d;
				next[topicA][topicB] = topicB;
				next[topicB][topicA] = topicA;
			}
		}

		for (const k of topics) {
			for (const i of topics) {
				for (const j of topics) {
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
		const topics = Object.keys(distances);

		for (const topicA of topics) {
			computedConnections[topicA] = {};
			for (const topicB of topics) {
				if (topicA === topicB) continue;

				const distance = distances[topicA][topicB];
				if (distance === Infinity) continue;

				const path = this.reconstructPath(topicA, topicB, nextMatrix);
				const steps: PathStep[] = [];

				if (path.length > 0) steps.push({ node: path[0] });

				for (let i = 0; i < path.length - 1; i++) {
					const from = path[i];
					const to = path[i + 1];
					const weight = adjacencyGraph[from][to];
					steps.push({ node: to, weight });
				}

				computedConnections[topicA][topicB] = { distance, steps };
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
