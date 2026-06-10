
'use server';
/**
 * @fileOverview A Genkit flow for generating optimized server configuration settings and launch parameters.
 *
 * - generateOptimizedServerConfigs - A function that handles the generation of optimized server configurations.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateOptimizedServerConfigsInputSchema = z.object({
  gameName: z.string().describe('The name of the application or game for which to generate server configurations.'),
  playerCount: z.number().int().min(1).describe('The target traffic or number of players the server should support.'),
  resourceUsage: z.enum(['low', 'medium', 'high']).describe('Desired resource usage level.'),
  performanceGoals: z.string().describe('Specific performance goals, e.g., "low latency", "high throughput".'),
  nodeVersion: z.string().optional().describe('The Node.js version being used (if applicable).'),
});
export type GenerateOptimizedServerConfigsInput = z.infer<typeof GenerateOptimizedServerConfigsInputSchema>;

const GenerateOptimizedServerConfigsOutputSchema = z.object({
  optimizedSettings: z.string().describe('Recommended optimized server configuration settings (environment variables, config files).'),
  launchParameters: z.string().describe('Recommended command-line launch parameters or script snippets.'),
});
export type GenerateOptimizedServerConfigsOutput = z.infer<typeof GenerateOptimizedServerConfigsOutputSchema>;

export async function generateOptimizedServerConfigs(
  input: GenerateOptimizedServerConfigsInput
): Promise<GenerateOptimizedServerConfigsOutput> {
  return generateOptimizedServerConfigsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateOptimizedServerConfigsPrompt',
  input: { schema: GenerateOptimizedServerConfigsInputSchema },
  output: { schema: GenerateOptimizedServerConfigsOutputSchema },
  prompt: `You are an expert infrastructure administrator and performance optimization specialist. Your task is to analyze the provided application requirements and performance goals, then recommend optimized configuration settings and launch parameters.

Application/App: {{{gameName}}}
Target Traffic/Users: {{{playerCount}}}
Desired Resource Usage: {{{resourceUsage}}}
Performance Goals: {{{performanceGoals}}}
{{#if nodeVersion}}Node.js Version: {{{nodeVersion}}}{{/if}}

Based on these inputs, provide:

1.  **Optimized Configuration Settings:** Detail specific settings (environment variables, YAML/JSON configs) and their recommended values. Focus on memory management, caching, and worker counts appropriate for the Node.js version if provided.
2.  **Launch Parameters:** Provide command-line arguments (e.g., --max-old-space-size for Node.js) necessary to launch the application with optimal performance.

Ensure your recommendations are practical for a containerized cloud environment and consider the specific Node.js version (versions 15-22 supported).
`,
});

const generateOptimizedServerConfigsFlow = ai.defineFlow(
  {
    name: 'generateOptimizedServerConfigsFlow',
    inputSchema: GenerateOptimizedServerConfigsInputSchema,
    outputSchema: GenerateOptimizedServerConfigsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
