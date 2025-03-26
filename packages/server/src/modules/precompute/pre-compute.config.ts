import { MUSIC_GENRES_ADJACENCY_PATH } from "@/common/constants/file-names.constants";
import { GraphTokens, PrecomputedDataSource } from "./pre-compute.types";

export const precomputedGraphs: PrecomputedDataSource[] = [
	{
		graphToken: GraphTokens.GENRES,
		filePath: MUSIC_GENRES_ADJACENCY_PATH,
	},
	// Other Graphs you want to create
];
