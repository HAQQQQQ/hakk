import { MUSIC_GENRES_ADJACENCY_FILE_PATH } from "@/common/constants/file-names.constants";
import { EnvConfig } from "@/config/env.config";
import { Injectable, OnModuleInit } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";

interface Connection {
	genreA: string;
	genreB: string;
	weight: number;
}

interface FloydWarshallResult {
	distances: { [genre: string]: { [genre: string]: number } };
	next: { [genre: string]: { [genre: string]: string | null } };
}

interface ComputedConnection {
	distance: number;
	path: string[];
	weights: number[];
}

@Injectable()
export class PreComputeService implements OnModuleInit {
	// Direct adjacency graph: raw weights
	private adjacencyGraph: { [genre: string]: { [genre: string]: number } } = {};

	// Shortest distances computed by Floyd–Warshall (converted distance: 10 - weight)
	private distances: { [genre: string]: { [genre: string]: number } } = {};

	// Matrix for path reconstruction
	private nextMatrix: { [genre: string]: { [genre: string]: string | null } } = {};

	// Final computed connections: For each genreA, a mapping of genreB to an object with {distance, path, weights}
	private computedConnections: { [genre: string]: { [genre: string]: ComputedConnection } } = {};

	onModuleInit(): void {
		if (EnvConfig.preCompute) {
			console.info(
				"[PreComputeService] Pre-computation enabled. Starting computation of shortest distances for the genres adjacency graph...",
			);
			try {
				this.loadAndCompute();
				console.info("[PreComputeService] Pre-computation completed successfully.");
				this.buildComputedConnections();
				this.logAllComputedConnections();
			} catch (error) {
				console.error("[PreComputeService] Error during pre-computation:", error);
			}
		} else {
			console.info("[PreComputeService] Pre-computation disabled by configuration.");
		}
	}

	/**
	 * Logs every computed connection in a human-friendly format.
	 */
	logAllComputedConnections() {
		console.log("\nAll computed connections (excluding self-connections):\n");
		for (const genreA in this.computedConnections) {
			for (const genreB in this.computedConnections[genreA]) {
				const { distance, path, weights } = this.computedConnections[genreA][genreB];
				console.log(
					`${genreA} -> ${genreB}: distance = ${distance}, path = ${path.join(" -> ")}, weights = ${weights.join(" -> ")}`,
				);
			}
		}
	}

	// --- Public Methods to Access Data ---

	/**
	 * Returns the full computed connections data structure.
	 */
	getComputedConnections(): { [genre: string]: { [genre: string]: ComputedConnection } } {
		return this.computedConnections;
	}

	/**
	 * Returns the "distance" (inverse similarity) between two genres.
	 */
	getDistance(genreA: string, genreB: string): number {
		return this.distances?.[genreA]?.[genreB] ?? Infinity;
	}

	/**
	 * Returns the reconstructed path between two genres.
	 */
	getPath(genreA: string, genreB: string): string[] {
		return this.reconstructPath(genreA, genreB);
	}

	private loadAndCompute() {
		// 1) Read JSON file
		// const filePath = path.join(__dirname, MUSIC_GENRES_ADJACENCY_FILE);
		const filePath = path.join(process.cwd(), MUSIC_GENRES_ADJACENCY_FILE_PATH);
		const fileContent = fs.readFileSync(filePath, "utf8");
		const data = JSON.parse(fileContent);

		// 2) Extract the connections array
		const connections: Connection[] = data.connections;

		// 3) Build adjacencyGraph with raw weights (direct connections)
		this.adjacencyGraph = {};
		for (const { genreA, genreB, weight } of connections) {
			if (!this.adjacencyGraph[genreA]) {
				this.adjacencyGraph[genreA] = {};
			}
			if (!this.adjacencyGraph[genreB]) {
				this.adjacencyGraph[genreB] = {};
			}
			// Undirected graph: store both directions
			this.adjacencyGraph[genreA][genreB] = weight;
			this.adjacencyGraph[genreB][genreA] = weight;
		}

		// 4) Run Floyd–Warshall
		const { distances, next } = this.floydWarshall(connections);
		this.distances = distances;
		this.nextMatrix = next;
	}

	private similarityToDistance(weight: number): number {
		// Higher similarity weight yields lower "distance"
		return 10 - weight;
	}

	private floydWarshall(connections: Connection[]): FloydWarshallResult {
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

		// 3) Populate direct connections (convert similarity -> distance)
		for (const { genreA, genreB, weight } of connections) {
			const d = this.similarityToDistance(weight);
			if (d < distances[genreA][genreB]) {
				distances[genreA][genreB] = d;
				distances[genreB][genreA] = d;
				next[genreA][genreB] = genreB;
				next[genreB][genreA] = genreA;
			}
		}

		// 4) Run Floyd–Warshall
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
	 * For every genreA and genreB (excluding self-connections), it computes:
	 * - distance (from Floyd–Warshall),
	 * - path (reconstructed sequence of genres),
	 * - weights (raw similarity weights along the path).
	 */
	private buildComputedConnections() {
		this.computedConnections = {};
		const genres = Object.keys(this.distances);
		for (const genreA of genres) {
			this.computedConnections[genreA] = {};
			for (const genreB of genres) {
				if (genreA === genreB) continue;
				const distance = this.distances[genreA][genreB];
				if (distance === Infinity) continue; // Skip unreachable nodes
				const path = this.reconstructPath(genreA, genreB);
				const weights: number[] = [];
				// For each adjacent pair in the path, get the raw similarity weight from the adjacencyGraph.
				for (let i = 0; i < path.length - 1; i++) {
					const from = path[i];
					const to = path[i + 1];
					weights.push(this.adjacencyGraph[from][to]);
				}
				this.computedConnections[genreA][genreB] = { distance, path, weights };
			}
		}
	}
}
