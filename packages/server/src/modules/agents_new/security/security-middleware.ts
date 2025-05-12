/**
 * Security middleware implementation
 */
import { AgentMiddleware } from "../core/middleware";
import { Message } from "../core/types";
import { SecurityManager } from "./security-manager";

/**
 * Middleware for enforcing security policies
 */
export class SecurityMiddleware implements AgentMiddleware {
	name = "security";
	priority = 300; // Highest priority, runs first

	private securityManager: SecurityManager;
	private userId: string;

	constructor(securityManager: SecurityManager, userId: string) {
		this.securityManager = securityManager;
		this.userId = userId;
	}

	async process(message: Message, next: () => Promise<void>): Promise<void> {
		// Only check security for tool messages
		if (message.role === "tool" && message.name) {
			// Check if user can use this tool
			const canUse = await this.securityManager.canUseTools(this.userId, [message.name]);

			if (!canUse) {
				throw new Error(
					`User ${this.userId} does not have permission to use tool ${message.name}`,
				);
			}
		}

		// Also check for sensitive keywords in user messages
		if (message.role === "user") {
			const sensitivePatterns = [
				/password/i,
				/secret/i,
				/credentials/i,
				/\bssh\b/i,
				/token/i,
			];

			for (const pattern of sensitivePatterns) {
				if (pattern.test(message.content)) {
					throw new Error(
						"Message contains potentially sensitive information. Please avoid sharing passwords, secrets, or credentials with the agent.",
					);
				}
			}
		}

		// Proceed to next middleware
		await next();
	}
}
