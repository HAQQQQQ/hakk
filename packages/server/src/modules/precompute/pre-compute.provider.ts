import { Provider } from "@nestjs/common";
import { GraphToken, PrecomputedGraphTokens } from "./pre-compute.types";
import { precomputedGraphs } from "./pre-compute.config";

export const PrecomputedGraphArrayProvider: Provider = {
	provide: PrecomputedGraphTokens.GRAPH_CONFIGS,
	useFactory: (): GraphToken[] => precomputedGraphs,
};
