import { Module } from "@nestjs/common";
import { PreComputeService } from "./pre-compute.service";

@Module({
	providers: [PreComputeService],
	exports: [PreComputeService],
})
export class PreComputeModule {}
