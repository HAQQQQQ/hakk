// /**
//  * Security manager for agent interactions
//  */
// import { AgentMiddleware } from "../core/middleware";
// import { Message } from "../core/types";

// /**
//  * Security layer for agent interactions
//  */
// export class SecurityManager {
// 	// User permission levels
// 	public static readonly PERMISSION_LEVELS = {
// 		GUEST: 0,
// 		USER: 1,
// 		ADMIN: 2,
// 	};

// 	private permissionStore: any; // Would store user permissions

// 	constructor(permissionStore: any) {
// 		this.permissionStore = permissionStore;
// 	}

// 	/**
// 	 * Check if a user has permission to use a tool
// 	 */
// 	async canUseTools(userId: string, toolNames: string[]): Promise<boolean> {
// 		// Get user's permission level
// 		const userPermission = await this.permissionStore.getUserPermission(userId);

// 		// Admin can use all tools
// 		if (userPermission === SecurityManager.PERMISSION_LEVELS.ADMIN) {
// 			return true;
// 		}

// 		// Check tool permissions
// 		for (const toolName of toolNames) {
// 			const toolPermission = await this.permissionStore.getToolPermission(toolName);

// 			if (toolPermission > userPermission) {
// 				return false;
// 			}
// 		}

// 		return true;
// 	}

// 	/**
// 	 * Create a security middleware
// 	 */
// 	createSecurityMiddleware(userId: string): AgentMiddleware {
// 		return {
// 			name: "security",
// 			priority: 300, // Highest priority, runs first

// 			process: async (message: Message, next: () => Promise<void>): Promise<void> => {
// 				// Only check security for tool messages
// 				if (message.role === "tool") {
// 					// Check if user can use this tool
// 					const canUse = await this.canUseTools(userId, [message.name!]);

// 					if (!canUse) {
// 						throw new Error(
// 							`User ${userId} does not have permission to use tool ${message.name}`,
// 						);
// 					}
// 				}

// 				// Proceed to next middleware
// 				await next();
// 			},
// 		};
// 	}
// }
