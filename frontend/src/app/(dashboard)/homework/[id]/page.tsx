'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { playSound } from '../../../../lib/audio';

// Mock data for homework questions
const MockHomeworkData = {
    103: {
        title: "Saying Hello",
        description: "Translate the following sentence into Polish.",
        question: "Good morning, how are you?",
        correctOrder: ["Dzień", "dobry,", "jak", "się", "masz?"],
        wordBank: ["dobry,", "masz?", "Dzień", "jak", "proszę", "się", "dziękuję"],
    },
    202: {
        title: "Manners Quiz",
        description: "Translate into Polish.",
        question: "Please and thank you.",
        correctOrder: ["Proszę", "i", "dziękuję."],
        wordBank: ["dziękuję.", "Proszę", "i", "nie", "tak", "dobry"],
    }
};

export default function HomeworkPage({ params }: { params: { id: string } }) {
    const defaultId = parseInt(params.id) || 103;
    const data = MockHomeworkData[defaultId as keyof typeof MockHomeworkData] || null;

    const [selectedWords, setSelectedWords] = useState<string[]>([]);
    const [availableWords, setAvailableWords] = useState<string[]>([]);
    const [resultStatus, setResultStatus] = useState<'idle' | 'success' | 'fail'>('idle');

    useEffect(() => {
        if (data) {
            // Shuffle word bank for better experience could be added here
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setAvailableWords([...data.wordBank]);
        }
    }, [data]);

    if (!data) {
        return (
            <div className="max-w-3xl mx-auto py-8">
                <Link href="/courses" className="text-gray-500 hover:text-gray-900 mb-8 inline-block font-medium">
                    &larr; Back to Courses
                </Link>
                <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-2xl">
                    <h2 className="text-2xl font-bold">Homework missing</h2>
                </div>
            </div>
        );
    }

    const handleWordSelect = (word: string) => {
        if (resultStatus !== 'idle') return; // prevent interaction after check
        // Remove exactly one instance of this word from availableWords if duplicates exist
        const idx = availableWords.indexOf(word);
        if (idx !== -1) {
            const newAvailable = [...availableWords];
            newAvailable.splice(idx, 1);
            setAvailableWords(newAvailable);
        }
        setSelectedWords([...selectedWords, word]);
    };

    const handleWordDeselect = (word: string) => {
        if (resultStatus !== 'idle') return;
        const idx = selectedWords.indexOf(word);
        if (idx !== -1) {
            const newSelected = [...selectedWords];
            newSelected.splice(idx, 1);
            setSelectedWords(newSelected);
        }
        setAvailableWords([...availableWords, word]);
    };

    const handleCheck = () => {
        const currentAnswer = selectedWords.join(' ');
        const correctAnswer = data.correctOrder.join(' ');

        if (currentAnswer === correctAnswer) {
            setResultStatus('success');
            playSound('success');
        } else {
            setResultStatus('fail');
            playSound('fail');
        }
    };

    const handleRetry = () => {
        setResultStatus('idle');
        setSelectedWords([]);
        setAvailableWords([...data.wordBank]);
    };

    // Calculate completion progress
    const progressPercent = Math.min(100, (selectedWords.length / data.correctOrder.length) * 100);

    return (
        <div className="max-w-3xl mx-auto py-8 text-gray-900 dark:text-white pb-24">
            <header className="flex justify-between items-center mb-8">
                <Link href="/courses" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Back to Courses
                </Link>
                <div className="w-1/3 bg-gray-200 dark:bg-gray-800 rounded-full h-3 max-w-[200px] overflow-hidden">
                    <div className="bg-[#AF2024] h-3 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
                </div>
            </header>

            <div className="mb-10 lg:pl-4">
                <h1 className="text-3xl lg:text-4xl font-extrabold mb-3">{data.title}</h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">{data.description}</p>
            </div>

            <div className="bg-white dark:bg-[#0f172a] rounded-[2.5rem] p-6 lg:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border-2 border-gray-100 dark:border-[#1e293b]">
                {/* Character/Avatar placeholder */}
                <div className="flex items-start gap-6 mb-8">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-[#FCD34D] rounded-3xl shrink-0 shadow-inner flex items-center justify-center text-3xl">
                        🦉
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-6 py-4 flex-1 shadow-sm relative">
                        {/* Little chat bubble tail */}
                        <div className="absolute top-0 -left-2 w-0 h-0 border-t-[0px] border-l-[12px] border-b-[12px] border-transparent border-b-gray-100 dark:border-b-gray-800 rotate-180"></div>
                        <h2 className="text-xl font-bold leading-snug">&quot;{data.question}&quot;</h2>
                    </div>
                </div>

                {/* Answer Area */}
                <div className="min-h-[100px] border-b-2 border-gray-200 dark:border-gray-700 pb-4 mb-10 flex flex-wrap gap-3 items-end">
                    {selectedWords.length === 0 && (
                        <span className="text-gray-400 font-medium mb-2 ml-2">Empty... Select words below</span>
                    )}
                    {selectedWords.map((word, idx) => (
                        <button
                            key={`sel-${idx}`}
                            onClick={() => handleWordDeselect(word)}
                            className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-2xl px-5 py-3 text-lg font-bold shadow-[0_4px_0_0_rgb(229,231,235)] dark:shadow-[0_4px_0_0_rgb(75,85,99)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all dark:text-white"
                        >
                            {word}
                        </button>
                    ))}
                </div>

                {/* Word Bank */}
                <div className="flex flex-wrap gap-4 justify-center mb-12 min-h-[140px]">
                    {availableWords.map((word, idx) => (
                        <button
                            key={`avail-${idx}`}
                            onClick={() => handleWordSelect(word)}
                            className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-2xl px-5 py-3 text-lg font-bold shadow-[0_4px_0_0_rgb(229,231,235)] dark:shadow-[0_4px_0_0_rgb(75,85,99)] hover:border-gray-300 dark:hover:border-gray-500 active:translate-y-1 active:shadow-none transition-all dark:text-white"
                        >
                            {word}
                        </button>
                    ))}
                </div>

                {/* Status & Action Area */}
                <div className={`rounded-[1.5rem] p-6 lg:p-8 transition-colors ${resultStatus === 'success' ? 'bg-[#D7FFB8] dark:bg-green-900/40' : resultStatus === 'fail' ? 'bg-[#FFDFE0] dark:bg-red-900/40' : 'bg-transparent'}`}>
                    {resultStatus === 'idle' && (
                        <button
                            onClick={handleCheck}
                            disabled={selectedWords.length === 0}
                            className={`w-full py-4 rounded-2xl font-bold text-xl uppercase tracking-wider transition-all shadow-[0_4px_0_0_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none ${selectedWords.length > 0 ? 'bg-[#58CC02] text-white hover:bg-[#46A302]' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none active:translate-y-0'}`}
                        >
                            Check
                        </button>
                    )}

                    {resultStatus === 'success' && (
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="text-[#58CC02] dark:text-green-400 text-center md:text-left">
                                <h3 className="text-2xl font-black mb-1">
                                    Excellent!
                                </h3>
                                <p className="font-bold opacity-90 text-[#46A302] dark:text-green-300">You built the sentence correctly.</p>
                            </div>
                            <Link href="/courses" className="w-full md:w-auto bg-[#58CC02] hover:bg-[#46A302] text-white px-10 py-4 rounded-2xl font-bold text-xl uppercase tracking-wider shadow-[0_4px_0_0_rgb(70,163,2)] active:translate-y-1 active:shadow-none transition-all text-center">
                                Continue
                            </Link>
                        </div>
                    )}

                    {resultStatus === 'fail' && (
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-[#EA2B2B] dark:text-red-400 text-center md:text-left">
                                <h3 className="text-2xl font-black mb-1">
                                    Incorrect
                                </h3>
                                <div className="font-bold opacity-90 text-[#AF2024] dark:text-red-300 flex flex-col mt-2">
                                    <span className="text-xs uppercase tracking-wider opacity-80">Correct solution:</span>
                                    <span className="text-lg mt-0.5">{data.correctOrder.join(' ')}</span>
                                </div>
                            </div>
                            <button onClick={handleRetry} className="w-full md:w-auto bg-[#EA2B2B] hover:bg-[#AF2024] text-white px-10 py-4 rounded-2xl font-bold text-xl uppercase tracking-wider shadow-[0_4px_0_0_rgb(175,32,36)] active:translate-y-1 active:shadow-none transition-all">
                                Got It
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
