import { Test, TestingModule } from "@nestjs/testing";
import { PreComputeService } from "./pre-compute.service.js";

describe("PreComputeService", () => {
	let service: PreComputeService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [PreComputeService],
		}).compile();

		service = module.get<PreComputeService>(PreComputeService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
