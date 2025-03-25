import { Controller, Get } from "@nestjs/common";
import { ProfileService } from "./profile.service";

@Controller("profile")
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    @Get()
    async getProfile(): Promise<string> {
        return this.profileService.getProfile();
    }
}
