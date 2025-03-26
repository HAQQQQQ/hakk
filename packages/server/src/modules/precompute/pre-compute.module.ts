import { Module } from "@nestjs/common";
import { PreComputeService } from "./pre-compute.service";
import { PrecomputedGraphArrayProvider } from "./pre-compute.provider";

@Module({
	providers: [PreComputeService, PrecomputedGraphArrayProvider],
	exports: [PreComputeService],
})
export class PreComputeModule {}
