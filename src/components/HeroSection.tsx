// app/components/HeroSection.tsx
"use client";

import { useState, FC } from 'react'; // THE FIX: Added useState for the input
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, Variants } from "framer-motion";
import { ArrowRight } from 'lucide-react';
import InteractiveNexusBackground from './InteractiveNexusBackground';

// THE FIX: The props interface to accept the onSummarize function
interface HeroSectionProps {
  onSummarize: (url: string) => void;
}

// Your original itemVariants, now correctly typed
const itemVariants: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// THE FIX: The component now correctly accepts props
export default function HeroSection({ onSummarize }: HeroSectionProps) {
  const [url, setUrl] = useState(''); // THE FIX: State to manage the input URL

  return (
    <div className="relative h-screen w-full bg-slate-950 overflow-hidden">
      <InteractiveNexusBackground />
      <div className="absolute bottom-0 left-0 right-0 h-40 z-10 
                   bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent">
        <div className="absolute bottom-0 left-0 right-0 h-[2px] w-full 
                      bg-gradient-to-r from-transparent via-cyan-500 to-transparent 
                      animate-pulse"
        />
      </div>

      <section className="relative h-full flex items-center justify-center z-20">
        <motion.div
          className="text-center max-w-4xl mx-auto px-4"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
        >
          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-transparent bg-clip-text pb-2 
                       bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500"
            variants={itemVariants}
          >
            AI Blog Summarizer
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-gray-400 mt-5 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Transform lengthy articles into concise summaries. Paste a URL to distill knowledge with the power of AI.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10"
            variants={itemVariants}
          >
            <Input
              type="url"
              placeholder="https://your-blog-url.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-14 max-w-md w-full text-lg bg-slate-900/70 border-2 border-blue-900/60 text-gray-200 placeholder:text-gray-500 rounded-lg 
                         backdrop-blur-sm transition-all duration-300
                         hover:border-sky-500/80
                         focus-visible:border-cyan-400 focus-visible:shadow-[0_0_0_2px_rgba(34,211,238,0.4)]
                         focus-visible:outline-none focus-visible:ring-0"
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="lg" 
                onClick={() => onSummarize(url)} // THE FIX: Correctly calls the function passed via props
                className="h-14 w-full sm:w-auto text-white font-bold text-lg px-8 rounded-lg transition-all duration-500
                           bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 bg-[length:200%_auto]
                           hover:bg-[right_center] hover:shadow-2xl hover:shadow-cyan-500/30"
              >
                Summarize
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};