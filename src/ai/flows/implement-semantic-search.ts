'use server';

/**
 * @fileOverview Implements a semantic search flow for lost and found items.
 *
 * - semanticSearch - A function that performs a semantic search for items.
 * - SemanticSearchInput - The input type for the semanticSearch function.
 * - SemanticSearchOutput - The return type for the semanticSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SemanticSearchInputSchema = z.object({
  query: z.string().describe('The search query.'),
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      location: z.string(),
      description: z.string(),
    })
  ).describe('The list of items to search through.'),
});
export type SemanticSearchInput = z.infer<typeof SemanticSearchInputSchema>;

const SemanticSearchOutputSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    location: z.string(),
    description: z.string(),
  })
);
export type SemanticSearchOutput = z.infer<typeof SemanticSearchOutputSchema>;

export async function semanticSearch(input: SemanticSearchInput): Promise<SemanticSearchOutput> {
  return semanticSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'semanticSearchPrompt',
  input: {schema: SemanticSearchInputSchema},
  output: {schema: SemanticSearchOutputSchema},
  prompt: `You are a search assistant helping users find lost or found items. Given a search query and a list of items, return only the items that are semantically relevant to the query. The relevance should be based on the meaning of the item description, not just exact word matches.

Search Query: {{{query}}}

Items:
{{#each items}}
  - ID: {{id}}, Name: {{name}}, Location: {{location}}, Description: {{description}}
{{/each}}

Return only the semantically relevant items in the same format as the input. Exclude items that are not relevant to the search query. Return an empty array if no items are relevant.

Output:
`,
});

const semanticSearchFlow = ai.defineFlow(
  {
    name: 'semanticSearchFlow',
    inputSchema: SemanticSearchInputSchema,
    outputSchema: SemanticSearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
