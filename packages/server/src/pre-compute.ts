import * as fs from "fs";
import * as path from "path";

interface Connection {
	genreA: string;
	genreB: string;
	weight: number;
}

// Convert similarity (weight) to distance: higher similarity means lower distance.
// For instance, if weight is 10 (most similar), then distance is 0.
function similarityToDistance(weight: number): number {
	return 10 - weight;
}

interface FloydWarshallResult {
	distances: { [genre: string]: { [genre: string]: number } };
	next: { [genre: string]: { [genre: string]: string | null } };
}

function floydWarshall(connections: Connection[]): FloydWarshallResult {
	// Extract all unique genres from the connections list.
	const genresSet = new Set<string>();
	connections.forEach((conn) => {
		genresSet.add(conn.genreA);
		genresSet.add(conn.genreB);
	});
	const genres = Array.from(genresSet);

	// Initialize distance and next matrices.
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

	// Populate direct connections.
	// Since the graph is undirected, update both directions.
	for (const conn of connections) {
		const { genreA, genreB, weight } = conn;
		const d = similarityToDistance(weight);
		if (d < distances[genreA][genreB]) {
			distances[genreA][genreB] = d;
			distances[genreB][genreA] = d;
			next[genreA][genreB] = genreB;
			next[genreB][genreA] = genreA;
		}
	}

	// Run the Floyd–Warshall algorithm.
	for (const k of genres) {
		for (const i of genres) {
			for (const j of genres) {
				if (distances[i][j] > distances[i][k] + distances[k][j]) {
					distances[i][j] = distances[i][k] + distances[k][j];
					next[i][j] = next[i][k]; // record the next hop for path reconstruction.
				}
			}
		}
	}

	return { distances, next };
}

// Helper function to reconstruct the path between two genres using the "next" matrix.
function reconstructPath(
	start: string,
	end: string,
	next: { [genre: string]: { [genre: string]: string | null } },
): string[] {
	if (next[start][end] === null) return [];
	const path = [start];
	while (start !== end) {
		start = next[start][end] as string;
		path.push(start);
	}
	return path;
}

// Read and parse the connections from the JSON file.
const filePath = path.join(__dirname, "music_genres_adjacency.json");
console.log("Reading JSON from:", filePath); // Debug: verify file path
const fileContent = fs.readFileSync(filePath, "utf8");
const data = JSON.parse(fileContent);
const connections: Connection[] = data.connections;

// Precompute shortest paths.
const { distances, next } = floydWarshall(connections);

// Log every computed connection.
console.log("All computed connections (excluding self-connections):\n");
for (const genreA in distances) {
	for (const genreB in distances[genreA]) {
		if (genreA !== genreB && distances[genreA][genreB] < Infinity) {
			const pathArray = reconstructPath(genreA, genreB, next);
			console.log(
				`${genreA} -> ${genreB}: distance = ${distances[genreA][genreB]}, path = ${pathArray.join(" -> ")}`,
			);
			console.log("\n");
		}
	}
}
