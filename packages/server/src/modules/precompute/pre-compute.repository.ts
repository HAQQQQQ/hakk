import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { Connection, GraphToken } from "./pre-compute.types";

type RawConnectionRow = {
	node_a: string;
	node_b: string;
	weight: number;
	graphs: { graph_type: string }[];
};

@Injectable()
export class PrecomputeRepository {
	private readonly GRAPHS_TABLE = "graphs";
	private readonly GRAPH_CONNECTIONS_TABLE = "graph_connections";

	constructor(private readonly supabaseService: SupabaseService) {}

	async fetchConnectionsForGraph(graphToken: GraphToken): Promise<Connection[]> {
		const { data, error } = await this.supabaseService.client
			.from(this.GRAPH_CONNECTIONS_TABLE)
			.select(`node_a, node_b, weight, ${this.GRAPHS_TABLE}!inner(graph_type)`)
			.eq(`${this.GRAPHS_TABLE}.graph_type`, graphToken);

		if (error || !data) {
			throw new Error(
				`Failed to fetch connections for graph "${graphToken}": ${error?.message}`,
			);
		}

		const connections: Connection[] = (data as RawConnectionRow[]).map((row) => ({
			genreA: row.node_a,
			genreB: row.node_b,
			weight: row.weight,
		}));

		return connections;
	}
}
