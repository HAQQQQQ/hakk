import { Injectable } from "@nestjs/common";

@Injectable()
export class ProfileService {
	getProfile(): string {
		return "User profile data";
	}

	getSetayesh(): string {
		return "Kevin Setayesh";
	}
}
