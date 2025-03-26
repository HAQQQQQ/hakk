import { Injectable } from "@nestjs/common";
import { ProfileRepository } from "./profile.repository";

@Injectable()
export class ProfileService {
	constructor(private readonly profileRepository: ProfileRepository) {}

	async validateUser(userId: string): Promise<boolean> {
		return this.profileRepository.checkUserExists(userId);
	}
}
