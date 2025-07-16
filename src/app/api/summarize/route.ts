// app/api/summarize/route.ts

import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { genAI } from '@/lib/gemini';
import prisma from '@/lib/prisma';
import mongoClientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || !url.startsWith('http')) {
      return NextResponse.json({ error: 'Please provide a valid URL.' }, { status: 400 });
    }

    // 1. Check if the summary for this URL already exists in the database.
    const existingSummary = await prisma.summary.findUnique({
      where: {
        originalUrl: url,
      },
    });

    // 2. If it exists, return the cached data immediately.
    if (existingSummary) {
      console.log('Found existing summary in DB. Returning cached data.');
      return NextResponse.json({
        summary: existingSummary.summaryText,
        translation: existingSummary.translationText,
      });
    }

    console.log('No existing summary found. Processing new URL.');

    // Scrape the URL
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(html);
    const article = $('article');
    if (article.length === 0) {
        return NextResponse.json({ error: 'Could not find the main article content.' }, { status: 400 });
    }
    const title = article.find('h1').first().text();
    const paragraphs = article.find('p').map((i, el) => $(el).text()).get();
    const fullText = [title, ...paragraphs].join('\n\n');
    if (!fullText.trim()) {
      return NextResponse.json({ error: 'Extracted text was empty.' }, { status: 400 });
    }

    // --- GENERATE SUMMARY WITH GEMINI ---
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    
    const summaryPrompt = `Summarize this article concisely in English:\n\n${fullText.substring(0, 30000)}`;
    const summaryResult = await model.generateContent(summaryPrompt);
    const summary = summaryResult.response.text();

    if (!summary) {
      return NextResponse.json({ error: 'Failed to generate summary.' }, { status: 500 });
    }

    const translationPrompt = `Translate this English text to Urdu (write in Urdu script, not Roman Urdu):\n\n${summary}`;
    const translationResult = await model.generateContent(translationPrompt);
    const translation = translationResult.response.text();

    // --- SAVE TO DATABASES ---
    const mongoClient = await mongoClientPromise;
    const db = mongoClient.db(process.env.MONGO_DB_NAME);
    const articlesCollection = db.collection('articles');
    const mongoResult = await articlesCollection.insertOne({ url, fullText, createdAt: new Date() });
    
    await prisma.summary.create({
      data: {
        originalUrl: url,
        summaryText: summary,
        translationText: translation,
        fullTextMongoId: mongoResult.insertedId.toString(),
      }
    });

    return NextResponse.json({ summary, translation });

  } catch (error: unknown) { // Use 'unknown' for better type safety
    console.error('API Error:', error);
    let errorMessage = 'An unexpected error occurred.';

    // Check for Prisma's unique constraint error (P2002)
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: unknown }).code === 'P2002') {
        const prismaError = error as { meta?: { target?: string[] } };
        if (prismaError.meta?.target?.includes('originalUrl')) {
            errorMessage = 'This URL has already been summarized.';
            return NextResponse.json({ error: errorMessage }, { status: 409 }); // 409 Conflict status
        }
    }
    
    // Check for Axios-specific errors
    if (axios.isAxiosError(error) && error.response?.status === 403) {
        errorMessage = 'Failed to scrape the URL. The website is blocking automated requests.';
    } 
    // Check for generic Error objects to get the message
    else if (error instanceof Error) {
        errorMessage = error.message;
    }
    
    // Fallback for any other type of error
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}