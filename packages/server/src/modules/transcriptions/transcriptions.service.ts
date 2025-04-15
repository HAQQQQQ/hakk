import { Injectable } from "@nestjs/common";
import { TranscriptionsRepository } from "./transcriptions.repository";

@Injectable()
export class TranscriptionsService {
	constructor(private transcriptionsRepository: TranscriptionsRepository) {}

	async create(text: string): Promise<any> {
		return this.transcriptionsRepository.create(text);
	}
}
