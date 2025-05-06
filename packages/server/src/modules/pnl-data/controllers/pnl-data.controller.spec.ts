import { Test, TestingModule } from "@nestjs/testing";
import { PnlDataController } from "./pnl-data.controller";

describe("DataController", () => {
	let controller: PnlDataController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [PnlDataController],
		}).compile();

		controller = module.get<PnlDataController>(PnlDataController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
