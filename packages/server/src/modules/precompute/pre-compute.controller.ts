import type { NewTopicRequest } from "@hakk/types";
import { Body, Controller, Post } from "@nestjs/common";
import { PreComputeService } from "./pre-compute.service";
import { Topic } from "./pre-compute.types";

@Controller("pre-compute")
export class PreComputeController {
	constructor(private readonly preComputeService: PreComputeService) {}

	@Post("topic")
	async createTopic(@Body() body: NewTopicRequest): Promise<Topic> {
		console.log("📥 Received new topic:", body);

		const createdTopic: Topic = await this.preComputeService.createTopic({
			name: body.name,
			concepts: body.concepts,
		} as Topic);

		return createdTopic;
	}
}
