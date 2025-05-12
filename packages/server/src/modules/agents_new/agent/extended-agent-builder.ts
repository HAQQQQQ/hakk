// /**
//  * Extended Agent Builder with OpenAI client support
//  */
// import { AgentBuilder } from './agent-builder';
// import { Agent, AgentConfig, AgentDependencies } from './agent';

// /**
//  * Extended Agent Builder with OpenAI integration
//  */
// export class ExtendedAgentBuilder extends AgentBuilder {
//     private openaiClient?: OpenAIClientService;

//     /**
//      * Set the OpenAI client
//      */
//     withOpenAIClient(client: OpenAIClientService): ExtendedAgentBuilder {
//         this.openaiClient = client;
//         return this;
//     }

//     /**
//      * Build the agent with OpenAI client
//      */
//     buildWithOpenAI(): Agent {
//         if (!this.openaiClient) {
//             throw new Error("OpenAI client is required. Use withOpenAIClient() before building.");
//         }

//         // Build dependencies using parent class logic plus OpenAI client
//         const dependencies = this.buildDependencies();

//         // Add OpenAI client to dependencies
//         const extendedDependencies: AgentDependencies = {
//             ...dependencies,
//             openaiClient: this.openaiClient
//         };

//         // Create the agent configuration
//         const config: AgentConfig = {
//             name: this.name,
//             description: this.description,
//             systemPrompt: this.systemPrompt,
//             middlewares: this.middlewares,
//         };

//         // Create and return the agent
//         return new Agent(config, extendedDependencies);
//     }

//     /**
//      * Build the standard dependencies
//      */
//     private buildDependencies(): Omit<AgentDependencies, 'openaiClient'> {
//         // Set defaults if not provided
//         if (!this.llm) {
//             throw new Error("Language model is required");
//         }

//         if (!this.toolExecutor) {
//             this.toolExecutor = new ToolExecutor();
//         }

//         if (!this.memory) {
//             this.memory = new SimpleMemorySystem();
//         }

//         if (!this.eventBus) {
//             this.eventBus = new EventBus();
//         }

//         return {
//             llm: this.llm,
//             toolExecutor: this.toolExecutor,
//             memory: this.memory,
//             eventBus: this.eventBus,
//         };
//     }
// }

// // Extend the original AgentBuilder with the OpenAI method
// declare module './agent-builder' {
//     interface AgentBuilder {
//         buildWithOpenAI(openaiClient: OpenAIClientService): Agent;
//     }
// }

// // Add the method to the prototype
// AgentBuilder.prototype.buildWithOpenAI = function (openaiClient: OpenAIClientService): Agent {
//     // Create the agent configuration
//     const config: AgentConfig = {
//         name: this.name,
//         description: this.description,
//         systemPrompt: this.systemPrompt,
//         middlewares: this.middlewares,
//     };

//     // Set defaults if not provided
//     if (!this.llm) {
//         throw new Error("Language model is required");
//     }

//     if (!this.toolExecutor) {
//         this.toolExecutor = new ToolExecutor();
//     }

//     if (!this.memory) {
//         this.memory = new SimpleMemorySystem();
//     }

//     if (!this.eventBus) {
//         this.eventBus = new EventBus();
//     }

//     // Create the agent dependencies
//     const dependencies: AgentDependencies = {
//         llm: this.llm,
//         toolExecutor: this.toolExecutor,
//         memory: this.memory,
//         eventBus: this.eventBus,
//         openaiClient: openaiClient
//     };

//     // Create and return the agent
//     return new Agent(config, dependencies);
// };

// // Import required types and classes to make the extension work
// import { ToolExecutor } from '../tools/tool-executor';
// import { SimpleMemorySystem } from '../memory/simple-memory';
// import { EventBus } from '../core/events';
// import { OpenAIClientService } from '@/modules/openai/openai-client.service';
