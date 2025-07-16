// app/components/WorkflowSection.tsx
"use client";

import { motion, useInView, Variants } from "framer-motion";
import { useRef, FC, ElementType } from "react";
import { Cpu, Database, Languages, Link as LinkIcon } from 'lucide-react';

// Define the type for a single workflow step
interface WorkflowStepData {
  icon: ElementType;
  title: string;
  description: string;
}

// Data for each step in the workflow, typed for safety
const workflowSteps: WorkflowStepData[] = [
  {
    icon: LinkIcon,
    title: "Step 1: Scrape Content",
    description: "Provide a blog URL, and our system intelligently extracts the core article text, ignoring ads and clutter.",
  },
  {
    icon: Cpu,
    title: "Step 2: AI Summarization",
    description: "Our advanced AI processes the text, identifying key points to generate a concise and accurate summary.",
  },
  {
    icon: Languages,
    title: "Step 3: Urdu Translation",
    description: "The generated summary is instantly translated into fluent Urdu, making the content accessible to a wider audience.",
  },
  {
    icon: Database,
    title: "Step 4: Secure Storage",
    description: "Your summary is saved in a high-performance Supabase database, with the full text archived in MongoDB for reference.",
  },
];

// Reusable component for each step "node", now typed
const WorkflowStep: FC<WorkflowStepData> = ({ icon: Icon, title, description }) => {
  return (
    <div className="relative z-10 flex flex-col items-center text-center">
      <div className="flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-gradient-to-br from-blue-800 to-slate-900 border-2 border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
        <Icon className="w-10 h-10 text-cyan-400" />
      </div>
      <h3 className="mb-2 text-xl font-bold text-gray-100">{title}</h3>
      <p className="max-w-xs text-gray-400">{description}</p>
    </div>
  );
};

// Reusable component for the animated connector lines
const Connector: FC = () => {
  const ref = useRef<SVGSVGElement>(null); // Typed the ref for SVG elements
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  const draw: Variants = { // Typed the variants object
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { type: "spring", duration: 2, bounce: 0 },
        opacity: { duration: 0.01 }
      }
    }
  };

  return (
    <svg 
      ref={ref}
      width="200" 
      height="100" 
      viewBox="0 0 200 100" 
      className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      preserveAspectRatio="none"
    >
      <motion.path
        d="M 0 50 C 50 50, 150 50, 200 50"
        fill="transparent"
        strokeWidth="2"
        stroke="url(#gradient)"
        variants={draw}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      />
      <defs>
        <linearGradient id="gradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="200" y2="0">
          <stop stopColor="#06b6d4" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default function WorkflowSection() {
  const ref = useRef<HTMLElement>(null); // Typed the ref for semantic HTML elements
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const containerVariants: Variants = { // Typed the variants object
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.3,
      }
    }
  };

  const itemVariants: Variants = { // Typed the variants object
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <section ref={ref} className="py-20 sm:py-32 bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2 
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-blue-400 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          How It Works: A Seamless Flow
        </motion.h2>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-16 lg:gap-x-8 lg:gap-y-0"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {workflowSteps.map((step, index) => (
            <motion.div key={step.title} variants={itemVariants} className="relative flex justify-center">
              <WorkflowStep {...step} />
              {index < workflowSteps.length - 1 && (
                <div className="absolute top-[38px] left-[calc(50%+100px)] w-[calc(100%-200px)] h-px hidden lg:block">
                  <Connector />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}