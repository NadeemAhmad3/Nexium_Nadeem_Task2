// lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('Please define the GEMINI_API_KEY environment variable inside .env.local');
}

export const genAI = new GoogleGenerativeAI(apiKey);