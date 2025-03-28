import { Module } from "@nestjs/common";
import { PreComputeService } from "./pre-compute.service";
import { PrecomputedGraphArrayProvider } from "./pre-compute.provider";
import { PreComputeController } from "./pre-compute.controller";
import { PrecomputeRepository } from "./pre-compute.repository";
import { SupabaseService } from "../supabase/supabase.service";
import { PreComputeApiService } from "./pre-compute.api";

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
