import { Provider } from "@nestjs/common";
import { GraphToken, PrecomputedGraphTokens } from "./pre-compute.types.js";
import { precomputedGraphs } from "./pre-compute.config.js";

export const PrecomputedGraphArrayProvider: Provider = {
	provide: PrecomputedGraphTokens.GRAPH_CONFIGS,
	useFactory: (): GraphToken[] => precomputedGraphs,
};
