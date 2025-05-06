import { Controller } from "@nestjs/common";
import { UserService } from "../services/user.service";

@Controller("user")
export class UserController {
	constructor(private readonly userService: UserService) {}

	// @Get(":id")
	// async getUserProfileById(@Param("id") userId: string): Promise<UserProfileResponse> {
	// 	const userProfile = await this.profileService.findById(userId);
	// 	if (!userProfile) {
	// 		throw new NotFoundException(`User with ID ${userId} not found`);
	// 	}
	// 	return userProfile;
	// }

	// @Post("create-user")
	// async createUser(
	// 	@Body() createUserProfileDto: CreateUserProfileRequest,
	// ): Promise<UserProfileResponse> {
	// 	return this.profileService.createProfile(createUserProfileDto);
	// }
}
