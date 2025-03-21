import { Controller, Get } from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { OpenAIService } from "../openai/openai.service";
import { generatePrompt } from "../openai/openai.constants";

@Controller("profile")
export class ProfileController {
    constructor(
        private readonly profileService: ProfileService,
    ) { }

    @Get()
    getProfile(): Promise<string> {
        return this.profileService.getProfile();
    }
}
