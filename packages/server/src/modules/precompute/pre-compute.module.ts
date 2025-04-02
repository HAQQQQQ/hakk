import { Module } from "@nestjs/common";
import { PreComputeService } from "./pre-compute.service.js";
import { PrecomputedGraphArrayProvider } from "./pre-compute.provider.js";
import { PreComputeController } from "./pre-compute.controller.js";
import { PrecomputeRepository } from "./pre-compute.repository.js";
import { SupabaseService } from "../supabase/supabase.service.js";
import { PreComputeApiService } from "./pre-compute.api.js";

@Module({
	providers: [
		SupabaseService,
		PreComputeService,
		PrecomputedGraphArrayProvider,
		PrecomputeRepository,
		PreComputeApiService,
	],
	exports: [PreComputeService],
	controllers: [PreComputeController],
})
export class PreComputeModule {}
