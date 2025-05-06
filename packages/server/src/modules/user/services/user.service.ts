import { Injectable } from "@nestjs/common";
import { UserRepository } from "../repo/user.repository";

@Injectable()
export class UserService {
	constructor(private readonly userRepository: UserRepository) {}

	async validateUser(userId: string): Promise<boolean> {
		return this.userRepository.checkUserExists(userId);
	}
}
