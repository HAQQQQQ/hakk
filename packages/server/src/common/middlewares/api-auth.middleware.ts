import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class ApiAuthMiddleware implements NestMiddleware {
	private readonly HEADER_NAME = "x-nginx-secure-key";
	private readonly EXPECTED_KEY = "secure-nginx-key";

	use(req: Request, res: Response, next: NextFunction) {
		const secureKey = req.headers[this.HEADER_NAME];

		if (secureKey !== this.EXPECTED_KEY) {
			console.error("🚫 Unauthorized access attempt!");
			throw new UnauthorizedException("Unauthorized Access");
		}

		next();
	}
}
