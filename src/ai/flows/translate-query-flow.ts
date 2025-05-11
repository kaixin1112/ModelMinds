'use server';
/**
 * @fileOverview A query translation AI agent.
 *
 * - translateQuery - A function that handles the query translation process.
 * - TranslateQueryInput - The input type for the translateQuery function.
 * - TranslateQueryOutput - The return type for the translateQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateQueryInputSchema = z.object({
  queryText: z.string().describe('The query in its original language (e.g., Malaysian, Chinese, Tamil, Hokkien, Cantonese, or English).'),
});
export type TranslateQueryInput = z.infer<typeof TranslateQueryInputSchema>;

const TranslateQueryOutputSchema = z.object({
  englishQuery: z.string().describe('The translated query in English. If the input was already English, it should be returned as is.'),
  originalQuery: z.string().describe('The original query text as entered by the user. If the input was already English, this should be the same as englishQuery.'),
  isTranslated: z.boolean().describe('True if the original query was translated to English (i.e., originalQuery and englishQuery are different, ignoring case and spacing). False if the original query was already in English.'),
});
export type TranslateQueryOutput = z.infer<typeof TranslateQueryOutputSchema>;

export async function translateQuery(input: TranslateQueryInput): Promise<TranslateQueryOutput> {
  const result = await translateQueryFlow(input);
  // Fallback logic in case LLM doesn't perfectly set isTranslated or originalQuery
  if (result.englishQuery.trim().toLowerCase() === input.queryText.trim().toLowerCase()) {
    return {
      englishQuery: input.queryText,
      originalQuery: input.queryText,
      isTranslated: false,
    };
  }
  return {
    ...result,
    originalQuery: input.queryText, // Ensure originalQuery is always the input queryText
    isTranslated: result.englishQuery.trim().toLowerCase() !== input.queryText.trim().toLowerCase(),
  };
}

const prompt = ai.definePrompt({
  name: 'translateQueryPrompt',
  input: {schema: TranslateQueryInputSchema},
  output: {schema: TranslateQueryOutputSchema},
  prompt: `Translate the following query to English. The query could be in Malaysian, Chinese (Simplified or Traditional), Tamil, or common Malaysian dialects like Hokkien or Cantonese.

Original Query:
"{{queryText}}"

Response Format:
- englishQuery: If the original query is not in English, provide the English translation here. If the original query is already in English, return the original query as is.
- originalQuery: Return the exact "Original Query" text here.
- isTranslated: Set to true if a translation to English was performed. Set to false if the "Original Query" was already in English.

Example (Non-English input):
Original Query: "Apa khabar?"
Output: { "englishQuery": "How are you?", "originalQuery": "Apa khabar?", "isTranslated": true }

Example (English input):
Original Query: "Hello there"
Output: { "englishQuery": "Hello there", "originalQuery": "Hello there", "isTranslated": false }
`,
});

const translateQueryFlow = ai.defineFlow(
  {
    name: 'translateQueryFlow',
    inputSchema: TranslateQueryInputSchema,
    outputSchema: TranslateQueryOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      // Fallback in case the LLM returns no output
      const alreadyEnglish = input.queryText.match(/^[a-zA-Z0-9\s.,?!'"()&$#@%-]*$/) !== null;
      return { 
        englishQuery: input.queryText,
        originalQuery: input.queryText,
        isTranslated: !alreadyEnglish, // Best guess if LLM fails
       };
    }
     // Ensure originalQuery is always the input.queryText, LLM might hallucinate it otherwise
    output.originalQuery = input.queryText;
    // Recalculate isTranslated based on actual input and LLM's englishQuery
    output.isTranslated = output.englishQuery.trim().toLowerCase() !== input.queryText.trim().toLowerCase();
    return output;
  }
);
