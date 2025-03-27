import { Body, Controller, Post } from "@nestjs/common";

@Controller("pre-compute")
export class PreComputeController {
	// // graph.controller.ts
	// @Post("/graph-updated")
	// handleGraphUpdate(@Body() payload: any) {
	// 	console.log("Graph was updated by Postgres:", payload);
	// 	// You can now trigger recomputation, cache updates, etc.
	// }
}
