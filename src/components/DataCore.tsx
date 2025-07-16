// app/components/DataCore.tsx
"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import React, { FC } from "react";
import { Check, Copy, ChevronDown } from "lucide-react";

interface DataCoreProps {
  icon: React.ElementType;
  title: string;
  text: string;
  isOpen: boolean;
  onToggle: () => void;
  isRtl?: boolean;
  onCopy: () => void;
  isCopied: boolean;
  copyLabel: string;
  copiedLabel: string;
}

const lineVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export const DataCore: FC<DataCoreProps> = ({
  icon: Icon, title, text, isOpen, onToggle, isRtl = false, onCopy, isCopied, copyLabel, copiedLabel
}) => {
  const textLines = text.split('\n');

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.5, type: "spring", bounce: 0.3 } }}
      className={`relative w-full max-w-xl p-1 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden border ${isOpen ? 'border-cyan-400/50' : 'border-slate-700'}`}
      style={{
        boxShadow: isOpen ? '0 0 20px rgba(56, 189, 248, 0.15)' : 'none'
      }}
    >
      <div className="w-full h-full bg-slate-900/80 backdrop-blur-md rounded-[14px] p-6">
        {/* Always visible Header */}
        <motion.div layout="position" dir={isRtl ? "rtl" : "ltr"} className="flex justify-between items-center cursor-pointer" onClick={onToggle}>
          <div className="flex items-center gap-3">
            <Icon className="w-7 h-7 text-cyan-400" />
            <h3 className="text-xl font-mono font-bold text-white">{title}</h3>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <ChevronDown className="w-6 h-6 text-slate-400" />
          </motion.div>
        </motion.div>

        {/* Expandable Content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="overflow-hidden"
            >
              {/* Content is nested to allow height animation */}
              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="h-[320px] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#06b6d4_transparent] pr-2 -mr-4">
                    <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.03 }}>
                        {textLines.map((line, index) => (
                            <motion.p key={index} variants={lineVariants} className={`text-gray-300 text-lg leading-relaxed mb-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                                {line || "\u00A0"}
                            </motion.p>
                        ))}
                    </motion.div>
                </div>
                 {/* Footer / Copy Button */}
                <div dir={isRtl ? "rtl" : "ltr"} className="pt-4 mt-4 border-t border-slate-700">
                    <button onClick={onCopy} className="flex items-center gap-2 text-sm font-semibold text-sky-400 hover:text-white transition-colors">
                        {isCopied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                        {isCopied ? copiedLabel : copyLabel}
                    </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};