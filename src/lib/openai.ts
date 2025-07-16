// lib/openai.ts
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Please define the OPENAI_API_KEY environment variable inside .env.local');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});