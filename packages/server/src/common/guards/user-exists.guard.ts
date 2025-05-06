// src/common/guards/clerk-and-exists.guard.ts
import {
	CanActivate,
	ExecutionContext,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { UserService } from "@/modules/user/services/user.service";

@Injectable()
export class ClerkAndExistsGuard implements CanActivate {
	constructor(private readonly userService: UserService) {}

	async canActivate(ctx: ExecutionContext): Promise<boolean> {
		const req = ctx.switchToHttp().getRequest<Request & { auth?: { userId?: string } }>();
		// 1) Make sure Clerk has already validated the JWT and attached req.auth.userId
		const userId = req.auth?.userId;
		if (!userId) {
			throw new UnauthorizedException("Authentication required");
		}

		// 2) Verify that user actually exists in your DB
		const user = await this.userService.validateUser(userId);
		if (!user) {
			throw new NotFoundException(`User ${userId} not found`);
		}

		// 3) Optionally stash the user on the request for downstream handlers
		// (req as any).user = user;
		return true;
	}
}
