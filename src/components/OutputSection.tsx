"use client";

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Check, Copy, AlertTriangle, BookText, Languages, Cpu, Share2, Volume2, X } from 'lucide-react';
import { useState, FC, useEffect } from 'react';
import { SummaryData } from '@/app/page';

interface OutputSectionProps {
  isProcessing: boolean;
  isFinished: boolean;
  summaryData: SummaryData | null;
  processingSteps: string[];
  error: string | null;
}

// This is the component where all the fixes have been applied.
// This is the component where all the fixes have been applied.
// FINAL VERSION of the DataSynapseNode component

// FINAL, ROBUST VERSION of the DataSynapseNode component

// FINAL ROBUST VERSION of DataSynapseNode

const DataSynapseNode: FC<{
    icon: React.ElementType;
    title: string;
    text: string;
    isRtl?: boolean;
    lang: string;
    variants?: Variants;
}> = ({ icon: Icon, title, text, isRtl = false, lang, variants }) => {

    const [isCopied, setIsCopied] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    // --- FIX #1: Store the browser's voices in React State ---
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    // --- FIX #2: A dedicated useEffect to load voices safely ---
    useEffect(() => {
        // This function loads voices into our component's state.
        const loadVoices = () => {
            const availableVoices = speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
            }
        };

        // Load voices immediately and add an event listener for when they change.
        loadVoices();
        speechSynthesis.addEventListener('voiceschanged', loadVoices);

        // Cleanup function to remove listener and stop speech on unmount.
        return () => {
            speechSynthesis.removeEventListener('voiceschanged', loadVoices);
            speechSynthesis.cancel();
        };
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                const shareTitle = title === 'SUMMARY' ? 'Article Summary' : 'Translated Summary';
                await navigator.share({ title: shareTitle, text });
            } catch (error) { console.error("Sharing failed", error); }
        } else {
            alert("The Web Share API is not supported in your browser.");
        }
    };

    // --- FIX #3: The final, robust handleSpeak function ---
    const handleSpeak = () => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;

        if (isSpeaking) {
            speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        // If for some reason voices haven't loaded, don't even try.
        if (voices.length === 0) {
            alert("Text-to-speech voices are still loading. Please try again in a moment.");
            return;
        }

        speechSynthesis.cancel();

        // 1. Find the best available voice from our STABLE state.
        let selectedVoice: SpeechSynthesisVoice | null = null;
        if (lang === 'ur-PK') {
            selectedVoice = voices.find(voice => voice.lang === 'ur-PK' || voice.name.toLowerCase().includes('urdu')) || null;
        } else {
            selectedVoice = voices.find(voice => voice.lang === 'en-US' || voice.lang === 'en-GB' || voice.name.toLowerCase().includes('english')) || null;
        }
        
        // 2. Split text into chunks, including the Urdu full stop '۔'
        const chunks = text.match(/[^.!?۔]+[.!?۔]*|[^.!?۔]+$/g) || [];
        if (chunks.length === 0) return;

        // 3. Define the self-chaining speak function.
        const speakNext = (chunkIndex: number) => {
            if (chunkIndex >= chunks.length) {
                setIsSpeaking(false);
                return;
            }

            const utterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);
            utterance.lang = lang;
            utterance.rate = 1;
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }

            utterance.onend = () => {
                speakNext(chunkIndex + 1);
            };
            
            utterance.onerror = (event) => {
                console.error(`SpeechSynthesisUtterance.onerror:`, event);
                setIsSpeaking(false);
            };

            speechSynthesis.speak(utterance);
        };

        // 4. Start the speech chain directly inside the click handler.
        setIsSpeaking(true);
        speakNext(0);
    };
    
    // --- The rest of your JSX is unchanged ---
    const textLines = text.split('\n');
    const lineVariants: Variants = {
        hidden: { opacity: 0, x: isRtl ? 15 : -15 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.5, ease: 'easeOut' }
        }
    };
    const actionButton = "p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200";

    return (
        <motion.div
            variants={variants}
            className="group relative w-full h-full p-6 rounded-xl overflow-hidden bg-slate-900/50 backdrop-blur-md"
        >
            <div className="absolute inset-0 rounded-xl border-2 border-slate-700/60 transition-all duration-500 group-hover:border-cyan-400/80 group-hover:shadow-[0_0_25px_rgba(34,211,238,0.4)]" />
            <div className="relative z-10">
                <motion.div
                    dir={isRtl ? 'rtl' : 'ltr'}
                    className="flex justify-between items-center mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                >
                    <div className="flex items-center gap-3">
                        <Icon className="w-7 h-7 text-cyan-400" />
                        <h3 className="text-xl font-mono font-bold text-white">{title}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={handleSpeak} className={actionButton} title={isSpeaking ? "Stop Listening" : "Listen to Text"}>
                            {isSpeaking ? <X className="w-5 h-5 text-red-400 animate-pulse"/> : <Volume2 className="w-5 h-5" />}
                        </button>
                        <button onClick={handleShare} className={actionButton} title="Share">
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button onClick={handleCopy} className={actionButton} title="Copy">
                            {isCopied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>
                </motion.div>
                <motion.div
                    initial="hidden"
                    animate="visible"
                    transition={{ staggerChildren: 0.04, delayChildren: 0.8 }}
                    className={`border-t-2 pt-4 border-slate-700/80 group-hover:border-cyan-400/30 transition-colors duration-500 ${isRtl ? 'text-right' : 'text-left'}`}
                >
                    {textLines.map((line, index) => (
                        <motion.p
                            key={index}
                            variants={lineVariants}
                            className="text-gray-300 text-lg leading-relaxed mb-1"
                        >
                            {line || "\u00A0"}
                        </motion.p>
                    ))}
                </motion.div>
            </div>
        </motion.div>
    );
};

// No changes were needed in this main component. It remains the same.
export default function OutputSection({ isProcessing, isFinished, summaryData, processingSteps, error }: OutputSectionProps) {
    const [currentStepText, setCurrentStepText] = useState('');

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isProcessing && processingSteps.length > 0) {
            let stepIndex = 0;
            setCurrentStepText(processingSteps[0]);
            interval = setInterval(() => {
                stepIndex = (stepIndex + 1) % processingSteps.length;
                setCurrentStepText(processingSteps[stepIndex]);
            }, 1500);
        }
        return () => clearInterval(interval);
    }, [isProcessing, processingSteps]);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.3, delayChildren: 0.3 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95, y: 30 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
    };

    return (
        <section className="relative py-20 sm:py-32 bg-slate-950 min-h-[600px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(29,78,216,0.15),transparent_40%)]" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
                <AnimatePresence mode="wait">
                    {isProcessing && (
                         <motion.div key="processing" exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center justify-center text-center">
                            <div className="relative flex items-center justify-center w-32 h-32 mb-8">
                                <div className="absolute inset-0.5 bg-slate-950 rounded-full z-10" />
                                <div className="absolute inset-0 bg-cyan-400 rounded-full z-0 blur-xl" />
                                <div className="absolute h-full w-full border-4 border-slate-700 rounded-full animate-spin [animation-duration:3s]" />
                                <div className="absolute h-full w-full border-t-4 border-r-4 border-cyan-400 rounded-full animate-spin [animation-duration:2s]" />
                                <Cpu className="w-16 h-16 text-cyan-400 z-20" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-100 mb-4">Analyzing Content...</h2>
                            <div className="h-8 text-lg text-gray-400 font-mono">
                                <AnimatePresence mode="wait">
                                    <motion.p key={currentStepText} initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -15, opacity: 0 }} transition={{ duration: 0.3 }}>
                                        {currentStepText}
                                    </motion.p>
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}

                    {isFinished && (
                        <motion.div key="finished" initial="hidden" animate="visible" variants={containerVariants}>
                            <motion.h2
                                className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-blue-400 mb-16"
                                variants={itemVariants}
                            >
                                Analysis Complete
                            </motion.h2>
                            {error ? (
                                <motion.div variants={itemVariants}>
                                    <div className="max-w-2xl mx-auto p-8 rounded-xl bg-red-950/70 backdrop-blur-md border-2 border-red-500/60 text-center">
                                        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                                        <h2 className="text-2xl font-bold text-red-200 mb-3">Synthesis Failed</h2>
                                        <p className="text-red-200 bg-red-800/30 p-3 rounded-lg">{error}</p>
                                    </div>
                                </motion.div>
                            ) : summaryData && (
                                <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-stretch gap-x-6 gap-y-10">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.5, duration: 0.6, type: 'spring', stiffness: 100 }}
                                        className="hidden lg:flex absolute inset-0 items-center justify-center"
                                    >
                                        <div className="relative w-20 h-20 flex items-center justify-center">
                                            <div className="absolute w-full h-full bg-cyan-400/40 rounded-full blur-2xl animate-pulse" />
                                            <div className="absolute w-8 h-8 bg-slate-900 rounded-full border-2 border-slate-600" />
                                            <div className="absolute w-[30vw] max-w-sm h-[2px] bg-gradient-to-r from-cyan-400/50 via-cyan-400/20 to-transparent right-full" />
                                            <div className="absolute w-[30vw] max-w-sm h-[2px] bg-gradient-to-l from-cyan-400/50 via-cyan-400/20 to-transparent left-full" />
                                        </div>
                                    </motion.div>

                                    <DataSynapseNode
                                        variants={itemVariants}
                                        icon={BookText}
                                        title="SUMMARY"
                                        text={summaryData.summary}
                                        lang="en-US"
                                    />

                                    <div className="hidden lg:block" />

                                    <DataSynapseNode
                                        variants={itemVariants}
                                        icon={Languages}
                                        title="ترجمہ"
                                        text={summaryData.translation}
                                        isRtl={true}
                                        lang="ur-PK"
                                    />
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
