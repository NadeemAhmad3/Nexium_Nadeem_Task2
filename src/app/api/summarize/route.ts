// app/api/summarize/route.ts

import { NextResponse } from 'next/server';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { genAI } from '@/lib/gemini';
import prisma from '@/lib/prisma';
import mongoClientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || !url.startsWith('http')) {
      return NextResponse.json({ error: 'Please provide a valid URL.' }, { status: 400 });
    }

    // 1. Check for an existing summary in the database
    const existingSummary = await prisma.summary.findUnique({
      where: { originalUrl: url },
    });

    // 2. Return cached data if it exists
    if (existingSummary) {
      console.log('Found existing summary in DB. Returning cached data.');
      return NextResponse.json({
        summary: existingSummary.summaryText,
        translation: existingSummary.translationText,
      });
    }

    console.log('No existing summary found. Processing new URL.');

    // --- GENERIC CONTENT EXTRACTION ---
    // Fetch the HTML from the URL
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        'Accept': 'text/html',
      },
    });

    // Use JSDOM to create a DOM object from the HTML
    const dom = new JSDOM(html, { url });
    
    // Use Mozilla's Readability to parse the DOM and find the main article
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    // Check if Readability successfully found content
    if (!article || !article.textContent) {
      return NextResponse.json({ error: 'Could not extract the main article content from this URL.' }, { status: 400 });
    }
    
    // We now have the clean text content, title, and HTML content
    const fullText = article.textContent;
    const title = article.title;

    // --- GENERATE SUMMARY WITH GEMINI ---
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    
    const summaryPrompt = `Summarize this article concisely in English. The title of the article is "${title}".\n\n${fullText.substring(0, 30000)}`;
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

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        errorMessage = 'Failed to scrape the URL. The website is blocking automated requests.';
      } else if (error.response?.status === 404) {
        errorMessage = 'The requested URL could not be found.';
      }
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
