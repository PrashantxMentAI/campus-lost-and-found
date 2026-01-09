'use server';

/**
 * @fileOverview Automatically categorizes items based on their description using Genkit.
 *
 * - autoCategorizeItem - A function that categorizes an item based on its description.
 * - AutoCategorizeItemInput - The input type for the autoCategorizeItem function.
 * - AutoCategorizeItemOutput - The return type for the autoCategorizeItem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutoCategorizeItemInputSchema = z.object({
  description: z.string().describe('The description of the item to categorize.'),
});
export type AutoCategorizeItemInput = z.infer<typeof AutoCategorizeItemInputSchema>;

const AutoCategorizeItemOutputSchema = z.object({
  category: z
    .enum(['Mobile', 'Wallet', 'ID Card', 'Keys', 'Bag', 'Other'])
    .describe('The category the item belongs to.'),
});
export type AutoCategorizeItemOutput = z.infer<typeof AutoCategorizeItemOutputSchema>;

export async function autoCategorizeItem(input: AutoCategorizeItemInput): Promise<AutoCategorizeItemOutput> {
  return autoCategorizeItemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autoCategorizeItemPrompt',
  input: {schema: AutoCategorizeItemInputSchema},
  output: {schema: AutoCategorizeItemOutputSchema},
  prompt: `You are an expert at categorizing lost and found items based on their description.

  Given the following item description, determine the most appropriate category for the item.

  Description: {{{description}}}

  You must respond with one of the following categories and nothing else: Mobile, Wallet, ID Card, Keys, Bag, or Other.
  `,
});

const autoCategorizeItemFlow = ai.defineFlow(
  {
    name: 'autoCategorizeItemFlow',
    inputSchema: AutoCategorizeItemInputSchema,
    outputSchema: AutoCategorizeItemOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
