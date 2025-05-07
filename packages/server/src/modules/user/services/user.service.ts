import { Injectable, NotFoundException } from "@nestjs/common";
import { UserRepository } from "../repo/user.repository";
import { BrokerageFirm } from "@/modules/pnl-data/types/brokerage-firm.enum";
import { UserFirmsRepository } from "../repo/user-firms.repository";

@Injectable()
export class UserService {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly userFirmsRepository: UserFirmsRepository,
	) {}

	async validateUser(userId: string): Promise<boolean> {
		return this.userRepository.checkUserExists(userId);
	}

	/**
	 * Look up the PK of the user_firms row for this user + firm
	 * Throws NotFoundException if no match.
	 */
	async findUserFirmId(userId: string, firm: BrokerageFirm): Promise<number> {
		// First, ensure the user exists at all
		const foundUser = await this.validateUser(userId);
		if (!foundUser) {
			throw new NotFoundException(`User with ID "${userId}" not found`);
		}

		// Then delegate to the user_firms repo
		return this.userFirmsRepository.findUserFirmId(userId, firm);
	}
}
