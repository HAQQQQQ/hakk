/**
 * Main entry point for the AI agent architecture
 */

// Re-export core modules
export * from "./core";
export * from "./agent";
export * from "./tools";
export * from "./memory";

// Export specific schemas
// export * from "./schemas";

// Example utilities
export * from "./examples/create-agent";
export * from "./examples/run-agent";

/**
 * Library version
 */
export const VERSION = "1.0.0";

/**
 * Simple self-test for the agent architecture
 */
export function testAgentArchitecture(): boolean {
	try {
		// Check if core components are exported correctly
		if (typeof Agent !== "function") {
			throw new Error("Agent class not exported correctly");
		}

		if (typeof AgentBuilder !== "function") {
			throw new Error("AgentBuilder class not exported correctly");
		}

		if (typeof ToolExecutor !== "function") {
			throw new Error("ToolExecutor class not exported correctly");
		}

		return true;
	} catch (error) {
		console.error("Agent architecture self-test failed:", error);
		return false;
	}
}

// Types needed for the test
import { Agent } from "./agent/agent";
import { AgentBuilder } from "./agent/agent-builder";
import { ToolExecutor } from "./tools/tool-executor";
