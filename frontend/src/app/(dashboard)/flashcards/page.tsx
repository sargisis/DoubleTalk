'use client';

import React, { useState, useEffect } from 'react';
import { getCookie } from 'cookies-next';
import Link from 'next/link';
import { playSound } from '@/lib/audio';

interface Card {
    id: number;
    text: string;
    translation: string;
    language_code: string;
}

type Phase = 'loading' | 'empty' | 'intro' | 'quiz' | 'done';

const FALLBACK_TRANSLATIONS = ["apple", "dog", "cat", "hello", "water", "book", "car", "house", "yes", "no", "please", "thank you"];

export default function FlashcardsPage() {
    const [phase, setPhase] = useState<Phase>('loading');
    const [cards, setCards] = useState<Card[]>([]);

    // Intro & Quiz indexing
    const [currentIndex, setCurrentIndex] = useState(0);

    // Quiz State
    const [quizOptions, setQuizOptions] = useState<string[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [quizResult, setQuizResult] = useState<'idle' | 'success' | 'fail'>('idle');
    const [hasFailedThisCard, setHasFailedThisCard] = useState(false);

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        setPhase('loading');
        try {
            const token = getCookie('token');
            const res = await fetch('http://localhost:8080/api/v1/cards/next', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const sessionCards = (data || []).slice(0, 5); // Take max 5 for a session

                if (sessionCards.length > 0) {
                    setCards(sessionCards);
                    setPhase('intro');
                    setCurrentIndex(0);
                    setHasFailedThisCard(false);
                } else {
                    setPhase('empty');
                }
            } else {
                setPhase('empty');
            }
        } catch (err) {
            console.error(err);
            setPhase('empty');
        }
    };

    const playAudio = (text: string, lang = 'pl-PL') => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    };

    // INTRO LOGIC
    const handleNextIntro = () => {
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            // Move to quiz
            startQuiz();
        }
    };

    // QUIZ LOGIC
    const startQuiz = () => {
        setPhase('quiz');
        setCurrentIndex(0);
        setHasFailedThisCard(false);
        generateOptions(0);
    };

    const generateOptions = (index: number) => {
        const correct = cards[index].translation;
        let others = cards.map(c => c.translation).filter(t => t !== correct);
        others = [...others, ...FALLBACK_TRANSLATIONS].filter(t => t !== correct);

        const shuffled = others.sort(() => 0.5 - Math.random());
        const distractors = Array.from(new Set(shuffled)).slice(0, 3);
        const options = [correct, ...distractors].sort(() => 0.5 - Math.random());
        setQuizOptions(options);
        setSelectedOption(null);
        setQuizResult('idle');
    };

    const handleOptionSelect = (opt: string) => {
        if (quizResult !== 'idle') return;
        setSelectedOption(opt);
    };

    const handleCheckQuiz = async () => {
        if (!selectedOption) return;
        const currentCard = cards[currentIndex];
        const token = getCookie('token');

        if (selectedOption === currentCard.translation) {
            setQuizResult('success');
            playSound('success');

            // Mark as learned ONLY if it wasn't failed already
            if (!hasFailedThisCard) {
                try {
                    await fetch(`http://localhost:8080/api/v1/cards/${currentCard.id}/review`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ score: 4 }) // Good score
                    });
                } catch (err) {
                    console.error("Failed to mark card reviewed", err);
                }
            }

        } else {
            setQuizResult('fail');
            playSound('fail');

            if (!hasFailedThisCard) {
                setHasFailedThisCard(true);
                try {
                    await fetch(`http://localhost:8080/api/v1/cards/${currentCard.id}/review`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ score: 1 }) // Fail score
                    });
                } catch (err) {
                    console.error("Failed to mark card reviewed", err);
                }
            }
        }
    };

    const handleNextQuiz = () => {
        if (currentIndex < cards.length - 1) {
            const nextIdx = currentIndex + 1;
            setCurrentIndex(nextIdx);
            generateOptions(nextIdx);
        } else {
            // Session complete
            setPhase('done');
            playSound('success'); // overall success!
        }
    };

    const handleRetryQuiz = () => {
        setQuizResult('idle');
        setSelectedOption(null);
    };


    // === RENDER HELPERS ===

    if (phase === 'loading') {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-[#AF2024] rounded-full animate-spin"></div>
            </div>
        );
    }

    if (phase === 'empty') {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <span className="text-6xl mb-6">🎉</span>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">You&apos;re all caught up!</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
                    There are no words scheduled for review right now. Go learn some new words from the Courses section!
                </p>
                <Link href="/courses" className="bg-[#AF2024] text-white font-bold py-3 px-8 rounded-xl hover:-translate-y-1 transition-transform shadow-lg shadow-[#AF2024]/30">
                    Go to Courses
                </Link>
            </div>
        );
    }

    if (phase === 'done') {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4 max-w-[600px] mx-auto animate-in zoom-in duration-500">
                <div className="text-[100px] mb-8 leading-none">🏆</div>
                <h2 className="text-4xl font-black text-[#af2024] dark:text-[#ff474d] mb-4">Session Complete!</h2>
                <p className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-8">
                    You crushed {cards.length} words! Keep the momentum going.
                </p>

                <div className="flex items-center gap-2 bg-yellow-400/20 px-6 py-3 rounded-2xl mb-10 border border-yellow-400/30">
                    <span className="text-2xl">⚡</span>
                    <span className="text-xl font-bold text-yellow-600 dark:text-yellow-500">+15 XP Earned</span>
                </div>

                <div className="flex gap-4 w-full">
                    <button onClick={fetchCards} className="flex-1 bg-[#AF2024] hover:bg-[#8e191d] text-white font-bold text-lg py-5 px-8 rounded-2xl shadow-[0_5px_0_0_rgb(117,20,24)] active:translate-y-1 active:shadow-none transition-all">
                        Review More
                    </button>
                    <Link href="/dashboard" className="flex-1 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-white border-2 border-gray-200 dark:border-gray-700 font-bold text-lg py-5 px-8 rounded-2xl shadow-[0_5px_0_0_rgb(229,231,235)] dark:shadow-[0_5px_0_0_rgb(55,65,81)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    const currentCard = cards[currentIndex];

    // Progress
    const totalSteps = phase === 'intro' ? cards.length : cards.length;
    const progressPercent = ((currentIndex) / totalSteps) * 100;

    return (
        <div className="max-w-2xl mx-auto py-8 text-gray-900 dark:text-white pb-24 h-full flex flex-col">
            <header className="flex justify-between items-center mb-10">
                <div className="text-gray-500 font-bold tracking-widest uppercase text-sm">
                    {phase === 'intro' ? 'Learn Mode' : 'Quiz Mode'}
                </div>
                <div className="flex-1 mx-8 bg-gray-200 dark:bg-gray-800 rounded-full h-3">
                    <div className="bg-[#AF2024] h-3 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <div className="font-bold text-gray-500">
                    {currentIndex + 1} / {cards.length}
                </div>
            </header>

            {/* --- INTRO MODE --- */}
            {phase === 'intro' && (
                <div className="flex-1 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="mb-4 text-center">
                        <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 text-xs font-bold px-3 py-1 uppercase tracking-wider rounded-full">New Word</span>
                    </div>

                    <div className="bg-white dark:bg-[#151c2c] border-2 border-gray-100 dark:border-[#1e293b] w-full aspect-video md:aspect-[4/3] rounded-[2.5rem] flex flex-col items-center justify-center p-8 shadow-sm mb-12 relative overflow-hidden group">

                        <div className="absolute top-4 right-4">
                            <button
                                onClick={() => playAudio(currentCard.text)}
                                className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-[#AF2024] hover:text-white hover:scale-105 active:scale-95 text-gray-500 dark:text-gray-400 flex items-center justify-center transition-all shadow-sm"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
                            </button>
                        </div>

                        <h2 className="text-5xl md:text-6xl font-black text-center mb-6">{currentCard.text}</h2>

                        <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mb-6"></div>

                        <p className="text-2xl md:text-3xl text-gray-500 dark:text-gray-400 font-medium text-center">{currentCard.translation}</p>
                    </div>

                    <button
                        onClick={handleNextIntro}
                        className="w-full bg-[#AF2024] hover:bg-[#8e191d] text-white font-bold text-xl py-5 rounded-2xl shadow-[0_5px_0_0_rgb(117,20,24)] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider"
                    >
                        Got it
                    </button>
                </div>
            )}

            {/* --- QUIZ MODE --- */}
            {phase === 'quiz' && (
                <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-8 duration-300">
                    <div className="mb-10 lg:pl-4 text-center">
                        <h1 className="text-3xl font-extrabold mb-3">What does this mean?</h1>
                    </div>

                    <div className="bg-white dark:bg-[#0f172a] rounded-[2.5rem] p-6 shadow-sm border-2 border-gray-100 dark:border-[#1e293b] flex flex-col items-center justify-center py-12 mb-8">
                        <button
                            onClick={() => playAudio(currentCard.text)}
                            className="text-[#AF2024] dark:text-red-400 mb-4 hover:scale-110 transition-transform"
                        >
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
                        </button>
                        <h2 className="text-4xl font-black text-center">{currentCard.text}</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        {quizOptions.map((opt, idx) => {
                            const isSelected = selectedOption === opt;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionSelect(opt)}
                                    disabled={quizResult !== 'idle'}
                                    className={`
                                        border-2 rounded-2xl p-5 text-xl font-bold transition-all text-center
                                        ${isSelected ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 dark:bg-[#151c2c] dark:border-gray-700 dark:text-gray-200 dark:hover:border-gray-500'}
                                        ${quizResult !== 'idle' && !isSelected ? 'opacity-50 grayscale' : ''}
                                        shadow-[0_4px_0_0_rgb(229,231,235)] dark:shadow-[0_4px_0_0_rgb(30,41,59)] active:translate-y-1 active:shadow-none
                                    `}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>

                    <div className={`mt-auto rounded-[1.5rem] p-6 lg:p-8 transition-colors ${quizResult === 'success' ? 'bg-[#D7FFB8] dark:bg-green-900/40' : quizResult === 'fail' ? 'bg-[#FFDFE0] dark:bg-red-900/40' : 'bg-transparent'}`}>
                        {quizResult === 'idle' && (
                            <button
                                onClick={handleCheckQuiz}
                                disabled={!selectedOption}
                                className={`w-full py-4 rounded-2xl font-bold text-xl uppercase tracking-wider transition-all shadow-[0_4px_0_0_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none ${selectedOption ? 'bg-[#58CC02] text-white hover:bg-[#46A302] shadow-[0_5px_0_0_rgb(70,163,2)]' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none active:translate-y-0 dark:bg-gray-800 dark:text-gray-600'}`}
                            >
                                Check
                            </button>
                        )}

                        {quizResult === 'success' && (
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="text-[#58CC02] dark:text-green-400 text-center sm:text-left">
                                    <h3 className="text-2xl font-black">Correct!</h3>
                                </div>
                                <button onClick={handleNextQuiz} className="w-full sm:w-auto bg-[#58CC02] hover:bg-[#46A302] text-white px-10 py-4 rounded-2xl font-bold text-xl uppercase tracking-wider shadow-[0_5px_0_0_rgb(70,163,2)] active:translate-y-1 active:shadow-none transition-all">
                                    Continue
                                </button>
                            </div>
                        )}

                        {quizResult === 'fail' && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-[#EA2B2B] dark:text-red-400 text-center sm:text-left">
                                    <h3 className="text-2xl font-black mb-1">Incorrect</h3>
                                    <div className="font-bold opacity-90 text-[#AF2024] dark:text-red-300 flex flex-col">
                                        <span className="text-xs uppercase tracking-wider opacity-80">Correct solution:</span>
                                        <span className="text-lg">{currentCard.translation}</span>
                                    </div>
                                </div>
                                <button onClick={handleRetryQuiz} className="w-full sm:w-auto bg-[#EA2B2B] hover:bg-[#AF2024] text-white px-10 py-4 rounded-2xl font-bold text-xl uppercase tracking-wider shadow-[0_5px_0_0_rgb(175,32,36)] active:translate-y-1 active:shadow-none transition-all">
                                    Got It
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
