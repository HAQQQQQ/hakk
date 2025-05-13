// /**
//  * Interfaces for language model providers
//  */

// import { LLMResponse } from "../core/types";
// import { Message } from "../core/types";

// /**
//  * Configuration for different LLM providers
//  */
// export interface LLMConfig {
//     provider: "openai" | "anthropic" | "other";
//     model: string;
//     apiKey: string;
//     endpoint?: string;
//     // Other provider-specific settings
//     [key: string]: unknown;
// }

// /**
//  * Options for generating responses
//  */
// export interface GenerateOptions {
//     temperature?: number;
//     maxTokens?: number;
//     toolChoice?: "auto" | "none" | { name: string };
//     streamingCallback?: (chunk: string) => void;
// }

// /**
//  * Abstract base class for language model providers
//  */
// export abstract class LanguageModelInterface {
//     protected config: LLMConfig;

//     constructor(config: LLMConfig) {
//         this.config = config;
//     }

//     /**
//      * Generate a response from the language model
//      */
//     abstract generateResponse(
//         messages: Message[],
//         options?: GenerateOptions,
//     ): AsyncGenerator<LLMResponse>;

//     /**
//      * Format messages for the specific provider
//      */
//     protected abstract formatMessages(messages: Message[]): unknown;

//     /**
//      * Parse provider response into our standard format
//      */
//     protected abstract parseResponse(response: unknown): LLMResponse;
// }
