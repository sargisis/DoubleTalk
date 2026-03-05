'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { playSound } from '@/lib/audio';

interface HomeworkData {
    title: string;
    description: string;
    sentencePrefix: string;
    sentenceSuffix: string;
    translation: string;
    correctWord: string;
    wordBank: string[];
}

export default function HomeworkPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = React.use(params);
    const lessonId = parseInt(resolvedParams.id) || 103;

    const [data, setData] = useState<HomeworkData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        const fetchHomework = async () => {
            setIsLoading(true);
            try {
                const { getCookie } = require('cookies-next');
                const token = getCookie('token');

                const res = await fetch(`http://localhost:8080/api/v1/homework/${lessonId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const hwData = await res.json();
                    setData(hwData);
                }
            } catch (err) {
                console.error("Failed to fetch homework", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHomework();
    }, [lessonId]);

    const [selectedWord, setSelectedWord] = useState<string | null>(null);
    const [resultStatus, setResultStatus] = useState<'idle' | 'success' | 'fail'>('idle');
    const [phase, setPhase] = useState<'working' | 'done'>('working');

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-[#AF2024] rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="max-w-3xl mx-auto py-8 text-center h-[50vh] flex flex-col items-center justify-center">
                <Link href="/courses" className="text-gray-500 hover:text-[#AF2024] mb-8 font-bold flex items-center gap-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Back to Courses
                </Link>
                <div className="text-6xl mb-4">👻</div>
                <h2 className="text-3xl font-bold dark:text-white">Homework missing</h2>
            </div>
        );
    }

    const handleWordSelect = (word: string) => {
        if (resultStatus !== 'idle') return;
        if (selectedWord === word) {
            setSelectedWord(null);
        } else {
            setSelectedWord(word);
        }
    };

    const handleCheck = async () => {
        if (!selectedWord) return;

        if (selectedWord === data.correctWord) {
            setResultStatus('success');
            playSound('success');
            markLessonComplete();
        } else {
            setResultStatus('fail');
            playSound('fail');
        }
    };

    const markLessonComplete = async () => {
        try {
            const { getCookie } = require('cookies-next');
            const token = getCookie('token');
            if (token) {
                await fetch('http://localhost:8080/api/v1/course/status', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        lesson_id: lessonId,
                        status: 'completed'
                    })
                });
            }
        } catch (err) {
            console.error("Failed to update lesson status", err);
        }
    };

    const handleRetry = () => {
        setResultStatus('idle');
        setSelectedWord(null);
    };

    const handleContinueFinish = () => {
        setPhase('done');
    };

    if (phase === 'done') {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4 max-w-[600px] mx-auto animate-in zoom-in duration-500">
                <div className="text-[100px] mb-8 leading-none">🎯</div>
                <h2 className="text-4xl font-black text-[#af2024] dark:text-[#ff474d] mb-4">Target hit!</h2>
                <p className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-8">
                    Homework completed perfectly. The next lesson is unlocked.
                </p>

                <div className="flex items-center gap-2 bg-yellow-400/20 px-6 py-3 rounded-2xl mb-10 border border-yellow-400/30">
                    <span className="text-2xl">⚡</span>
                    <span className="text-xl font-bold text-yellow-600 dark:text-yellow-500">+10 XP Earned</span>
                </div>

                <div className="flex gap-4 w-full">
                    <Link href="/courses" className="flex-1 bg-[#58CC02] hover:bg-[#46A302] text-white font-bold text-lg py-5 px-8 rounded-2xl shadow-[0_5px_0_0_rgb(70,163,2)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center uppercase tracking-wider">
                        Continue
                    </Link>
                </div>
            </div>
        );
    }

    const progressPercent = selectedWord ? (resultStatus === 'success' ? 100 : 50) : 25;

    return (
        <div className="max-w-2xl mx-auto py-8 text-gray-900 dark:text-white pb-24 h-full flex flex-col">
            <header className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                    <Link href="/courses" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    </Link>
                    <div className="text-gray-500 font-bold tracking-widest uppercase text-sm">
                        Homework Exercise
                    </div>
                </div>
                <div className="flex-1 mx-8 bg-gray-200 dark:bg-gray-800 rounded-full h-3">
                    <div className="bg-[#AF2024] h-3 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
                </div>
            </header>

            <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-8 duration-300">

                <div className="mb-10 lg:pl-4">
                    <h1 className="text-3xl lg:text-4xl font-extrabold mb-3">{data.title}</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">{data.description}</p>
                </div>

                {/* Lesson interactive container */}
                <div className="flex flex-col flex-1">

                    {/* Sentence builder */}
                    <div className="bg-white dark:bg-[#0f172a] rounded-[2.5rem] p-6 lg:p-12 shadow-sm border-2 border-gray-100 dark:border-[#1e293b] mb-10">
                        <div className="flex items-start gap-6">
                            <div className="hidden sm:flex w-16 h-16 lg:w-20 lg:h-20 bg-indigo-100 rounded-3xl shrink-0 items-center justify-center text-3xl">
                                🧑‍🏫
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl rounded-tl-sm px-6 py-8 flex-1 shadow-inner relative text-center border-2 border-gray-100 dark:border-gray-800">
                                <div className="hidden sm:block absolute top-0 -left-2 w-0 h-0 border-t-[0px] border-l-[12px] border-b-[12px] border-transparent border-b-gray-100 dark:border-b-gray-800 rotate-180"></div>

                                <div className="text-2xl md:text-3xl font-bold leading-relaxed text-gray-800 dark:text-gray-100 mb-6 flex flex-wrap items-center justify-center gap-3">
                                    <span>{data.sentencePrefix}</span>
                                    <div className={`min-w-[140px] h-14 border-b-4 inline-flex items-center justify-center px-4 transition-all duration-300 bg-white dark:bg-gray-900 rounded-t-xl
                                        ${selectedWord ? 'border-[#AF2024] text-[#AF2024] dark:border-red-400 dark:text-red-400 shadow-sm' : 'border-gray-300 dark:border-gray-600 text-transparent'}`}
                                    >
                                        {selectedWord || '______'}
                                    </div>
                                    <span>{data.sentenceSuffix}</span>
                                </div>

                                <div className="text-lg text-gray-500 dark:text-gray-400 font-medium inline-block bg-white dark:bg-gray-900 px-4 py-1.5 rounded-full shadow-sm">
                                    {data.translation}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Word Bank */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {data.wordBank.map((word, idx) => {
                            const isSelected = selectedWord === word;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleWordSelect(word)}
                                    disabled={resultStatus !== 'idle'}
                                    className={`
                                        border-2 rounded-2xl px-6 py-5 text-xl font-bold transition-all shadow-[0_4px_0_0_rgb(229,231,235)] dark:shadow-[0_4px_0_0_rgb(30,41,59)] active:translate-y-1 active:shadow-none
                                        ${isSelected
                                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300'
                                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 dark:bg-[#151c2c] dark:border-gray-700 dark:text-gray-200 dark:hover:border-gray-500'
                                        }
                                        ${resultStatus !== 'idle' && !isSelected ? 'opacity-50 grayscale' : ''}
                                    `}
                                >
                                    {word}
                                </button>
                            );
                        })}
                    </div>

                    {/* Magic Bottom Bar */}
                    <div className={`mt-auto rounded-[1.5rem] p-6 lg:p-8 transition-colors ${resultStatus === 'success' ? 'bg-[#D7FFB8] dark:bg-green-900/40' : resultStatus === 'fail' ? 'bg-[#FFDFE0] dark:bg-red-900/40' : 'bg-transparent'}`}>
                        {resultStatus === 'idle' && (
                            <button
                                onClick={handleCheck}
                                disabled={!selectedWord}
                                className={`w-full py-4 rounded-2xl font-bold text-xl uppercase tracking-wider transition-all shadow-[0_4px_0_0_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none ${selectedWord ? 'bg-[#58CC02] text-white hover:bg-[#46A302] shadow-[0_5px_0_0_rgb(70,163,2)]' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none active:translate-y-0 dark:bg-gray-800 dark:text-gray-600'}`}
                            >
                                Check
                            </button>
                        )}

                        {resultStatus === 'success' && (
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="text-[#58CC02] dark:text-green-400 text-center sm:text-left">
                                    <h3 className="text-2xl font-black">Correct!</h3>
                                    <p className="font-bold opacity-90 text-[#46A302] dark:text-green-300">You built the sentence perfectly.</p>
                                </div>
                                <button onClick={handleContinueFinish} className="w-full sm:w-auto bg-[#58CC02] hover:bg-[#46A302] text-white px-10 py-4 rounded-2xl font-bold text-xl uppercase tracking-wider shadow-[0_5px_0_0_rgb(70,163,2)] active:translate-y-1 active:shadow-none transition-all">
                                    Continue
                                </button>
                            </div>
                        )}

                        {resultStatus === 'fail' && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-[#EA2B2B] dark:text-red-400 text-center sm:text-left">
                                    <h3 className="text-2xl font-black mb-1">Incorrect</h3>
                                    <div className="font-bold opacity-90 text-[#AF2024] dark:text-red-300 flex flex-col">
                                        <span className="text-xs uppercase tracking-wider opacity-80">Correct solution:</span>
                                        <span className="text-lg">{data.correctWord}</span>
                                    </div>
                                </div>
                                <button onClick={handleRetry} className="w-full sm:w-auto bg-[#EA2B2B] hover:bg-[#AF2024] text-white px-10 py-4 rounded-2xl font-bold text-xl uppercase tracking-wider shadow-[0_5px_0_0_rgb(175,32,36)] active:translate-y-1 active:shadow-none transition-all">
                                    Got It
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
