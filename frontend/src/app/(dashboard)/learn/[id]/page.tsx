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

type Phase = 'intro' | 'quiz' | 'done';

const LessonWords = {
    101: [
        { id: 1001, text: "Dzień dobry", translation: "Good morning / Good day", language_code: "pl" },
        { id: 1002, text: "Cześć", translation: "Hello / Bye (informal)", language_code: "pl" },
        { id: 1003, text: "Dobry wieczór", translation: "Good evening", language_code: "pl" },
        { id: 1004, text: "Do widzenia", translation: "Goodbye (formal)", language_code: "pl" },
        { id: 1005, text: "Jak się masz?", translation: "How are you?", language_code: "pl" }
    ],
    201: [
        { id: 2001, text: "Tak", translation: "Yes", language_code: "pl" },
        { id: 2002, text: "Nie", translation: "No", language_code: "pl" },
        { id: 2003, text: "Proszę", translation: "Please / Here you go", language_code: "pl" },
        { id: 2004, text: "Dziękuję", translation: "Thank you", language_code: "pl" },
        { id: 2005, text: "Przepraszam", translation: "Excuse me / I'm sorry", language_code: "pl" }
    ]
};

const FALLBACK_TRANSLATIONS = ["apple", "dog", "cat", "water", "book", "car", "house"];

export default function LearnLessonPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = React.use(params);
    const lessonId = parseInt(resolvedParams.id) || 101;

    // Fallback to 101 if lesson not found in mock data
    const cards: Card[] = LessonWords[lessonId as keyof typeof LessonWords] || LessonWords[101];

    const [phase, setPhase] = useState<Phase>('intro');
    const [currentIndex, setCurrentIndex] = useState(0);

    // Quiz State
    const [quizOptions, setQuizOptions] = useState<string[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [quizResult, setQuizResult] = useState<'idle' | 'success' | 'fail'>('idle');

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

        if (selectedOption === currentCard.translation) {
            setQuizResult('success');
            playSound('success');

        } else {
            setQuizResult('fail');
            playSound('fail');
        }
    };

    const markLessonComplete = async () => {
        try {
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
            console.error("Failed to unlock next lesson", err);
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
            markLessonComplete();
        }
    };

    const handleRetryQuiz = () => {
        setQuizResult('idle');
        setSelectedOption(null);
    };


    // === RENDER HELPERS ===

    if (phase === 'done') {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4 max-w-[600px] mx-auto animate-in zoom-in duration-500">
                <div className="text-[100px] mb-8 leading-none">🎖️</div>
                <h2 className="text-4xl font-black text-[#af2024] dark:text-[#ff474d] mb-4">You did it!</h2>
                <p className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-8">
                    You've successfully learned {cards.length} new words.
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

    const currentCard = cards[currentIndex];

    // Progress
    const progressPercent = ((currentIndex) / cards.length) * 100;

    return (
        <div className="max-w-2xl mx-auto py-8 text-gray-900 dark:text-white pb-24 h-full flex flex-col">
            <header className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                    <Link href="/courses" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    </Link>
                    <div className="text-gray-500 font-bold tracking-widest uppercase text-sm">
                        {phase === 'intro' ? 'Learn New Words' : 'Quiz Mode'}
                    </div>
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
                        <span className="bg-[#AF2024]/10 text-[#AF2024] dark:bg-red-900/40 dark:text-red-300 text-xs font-bold px-3 py-1 uppercase tracking-wider rounded-full flex items-center gap-2">
                            <span>✨</span> New Unit Word
                        </span>
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
