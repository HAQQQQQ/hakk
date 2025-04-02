import { Test, TestingModule } from "@nestjs/testing";
import { PreComputeController } from "./pre-compute.controller.js";

describe("PreComputeController", () => {
	let controller: PreComputeController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [PreComputeController],
		}).compile();

		controller = module.get<PreComputeController>(PreComputeController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
