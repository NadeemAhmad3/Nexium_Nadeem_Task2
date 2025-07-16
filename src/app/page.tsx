"use client";

import { useState } from 'react';
import HeroSection from '@/components/HeroSection';
import WorkflowSection from '@/components/WorkflowSection';
import OutputSection from '@/components/OutputSection';

// Define the structure for our final data, can be exported and shared
export interface SummaryData {
  summary: string;
  translation: string;
}

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);

  const handleSummarize = async (url: string) => {
    if (!url) return;
    
    // Reset state for a new request
    setSummaryData(null);
    setError(null);
    setIsFinished(false);
    setIsProcessing(true);
    setProcessingSteps(['Scraping Content...']);

    // Scroll to the area where the output will appear
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight / 4,
        behavior: 'smooth'
      });
    }, 100);

    try {
      // Simulate frontend awareness of backend progress
      setTimeout(() => setProcessingSteps(prev => [...prev, 'Generating AI Summary...']), 1500);
      setTimeout(() => setProcessingSteps(prev => [...prev, 'Translating to Urdu...']), 3500);
      setTimeout(() => setProcessingSteps(prev => [...prev, 'Saving to Database...']), 4000);

      const response = await fetch('/api/summarize', {
        method: 'POST',
        // THE FIX: Removed the extra curly braces around the headers object
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      const data: SummaryData = await response.json();
      setSummaryData(data);
      setIsFinished(true);

    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred. Please try again.");
      }
      setIsFinished(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="bg-slate-950">
      <HeroSection onSummarize={handleSummarize} />

      {/* Conditionally render the Output Section in-flow */}
      {(isProcessing || isFinished) && (
        <OutputSection
          isProcessing={isProcessing}
          isFinished={isFinished}
          summaryData={summaryData}
          processingSteps={processingSteps}
          error={error}
        />
      )}

      <WorkflowSection />
    </main>
  );
}