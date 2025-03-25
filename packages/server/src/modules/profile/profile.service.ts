import { Injectable } from "@nestjs/common";
import { OpenAIService } from "../openai/openai.service";

@Injectable()
export class ProfileService {
    constructor(private readonly openAIService: OpenAIService) { }

    getProfile(): string {
        return "Kevin Setayesh";
    }

    getSetayesh(): string {
        return "Kevin Setayesh";
    }
}
