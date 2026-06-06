'use server';
/**
 * @fileOverview A Genkit flow for generating optimized game server configuration settings and launch parameters.
 *
 * - generateOptimizedServerConfigs - A function that handles the generation of optimized server configurations.
 * - GenerateOptimizedServerConfigsInput - The input type for the generateOptimizedServerConfigs function.
 * - GenerateOptimizedServerConfigsOutput - The return type for the generateOptimizedServerConfigs function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateOptimizedServerConfigsInputSchema = z.object({
  gameName: z.string().describe('The name of the game for which to generate server configurations.'),
  playerCount: z.number().int().min(1).describe('The target number of players the server should support.'),
  resourceUsage: z.enum(['low', 'medium', 'high']).describe('Desired resource usage level (e.g., CPU, RAM).'),
  performanceGoals: z.string().describe('Specific performance goals, e.g., "high FPS", "minimal latency", "stable connection".'),
});
export type GenerateOptimizedServerConfigsInput = z.infer<typeof GenerateOptimizedServerConfigsInputSchema>;

const GenerateOptimizedServerConfigsOutputSchema = z.object({
  optimizedSettings: z.string().describe('Recommended optimized server configuration settings in a key-value or similar format.'),
  launchParameters: z.string().describe('Recommended command-line launch parameters or script snippets for the server.'),
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
  prompt: `You are an expert game server administrator and performance optimization specialist. Your task is to analyze the provided game server requirements and performance goals, then recommend optimized server configuration settings and launch parameters.

Game Name: {{{gameName}}}
Target Player Count: {{{playerCount}}}
Desired Resource Usage: {{{resourceUsage}}}
Performance Goals: {{{performanceGoals}}}

Based on these inputs, provide:

1.  **Optimized Server Configuration Settings:** Detail specific settings and their recommended values. Use a clear, structured format (e.g., key-value pairs, JSON-like structure, or sections with bullet points) that a server administrator can easily implement. Focus on settings relevant to the game that impact performance, stability, and resource efficiency.
2.  **Launch Parameters:** Provide command-line arguments or script snippets necessary to launch the server with optimal performance. Include any specific flags or values that align with the performance goals.

Ensure your recommendations are practical and consider the trade-offs between performance and resource usage for the specified player count.
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
