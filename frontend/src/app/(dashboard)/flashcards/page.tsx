'use client';

import React, { useState, useEffect } from 'react';
import { getCookie } from 'cookies-next';
import { useRouter, useSearchParams } from 'next/navigation';
import { playSound } from '@/lib/audio';

interface Card {
    id: number;
    text: string;           // e.g. Polish word
    translation: string;    // e.g. English translation
    language_code: string;
}

export default function CoursesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const lessonIdParam = searchParams.get('lessonId');
    const lessonId = lessonIdParam ? parseInt(lessonIdParam) : null;

    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCompleting, setIsCompleting] = useState(false);

    // Flashcard state
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    // Animation & Progress states
    const [sessionTotal, setSessionTotal] = useState(0);
    const [slideDirection, setSlideDirection] = useState<'none' | 'left' | 'right'>('none');

    // Speech state
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);

    // New word form state
    const [newWord, setNewWord] = useState('');
    const [newTranslation, setNewTranslation] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const currentCard = cards[currentIndex];

    useEffect(() => {
        fetchCards();
    }, []);

    const getHeaders = () => {
        const token = getCookie('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const fetchCards = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8080/api/v1/cards/next', {
                headers: getHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                const loadedCards = data || [];
                setCards(loadedCards);
                // Only set session total on the first load of the session
                if (sessionTotal === 0 && loadedCards.length > 0) {
                    setSessionTotal(loadedCards.length);
                }

                // Optional: Play audio of first card (but browsers often block auto-play without user interaction first)
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const playAudio = (text: string, lang = 'pl-PL') => {
        if (!window.speechSynthesis) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9; // Slightly slower for language learners

        utterance.onstart = () => setIsPlayingAudio(true);
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);

        window.speechSynthesis.speak(utterance);
    };

    // Auto-play audio when card is flipped
    useEffect(() => {
        if (isFlipped && currentCard) {
            playAudio(currentCard.text, currentCard.language_code || 'pl-PL');
        }
    }, [isFlipped, currentCard]);


    const handleReview = async (score: number) => {
        if (!cards[currentIndex]) return;
        const cardId = cards[currentIndex].id;

        // Play appropriate sound
        playSound(score >= 3 ? 'success' : 'fail');

        try {
            await fetch(`http://localhost:8080/api/v1/cards/${cardId}/review`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ score })
            });

            // Slide out animation
            setSlideDirection(score < 3 ? 'left' : 'right');

            setTimeout(() => {
                // Move to next card
                setIsFlipped(false);
                setSlideDirection('none');
                setCurrentIndex((prev) => prev + 1);
            }, 300); // match standard tailwind duration-300
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddWord = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAdding(true);
        try {
            await fetch('http://localhost:8080/api/v1/words', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    text: newWord,
                    translation: newTranslation,
                    language_code: 'pl'
                })
            });
            setNewWord('');
            setNewTranslation('');
            // Reload cards to see the new one
            setCurrentIndex(0);
            fetchCards();
        } catch (err) {
            console.error(err);
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentCard) return;
        if (!confirm('Are you sure you want to delete this flashcard?')) return;

        const cardId = currentCard.id;
        try {
            const res = await fetch(`http://localhost:8080/api/v1/words/${cardId}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            if (res.ok) {
                // Remove from current cards
                const newCards = cards.filter(c => c.id !== cardId);
                setCards(newCards);
                // Adjust index if we deleted the last card
                if (currentIndex >= newCards.length) {
                    setCurrentIndex(Math.max(0, newCards.length - 1));
                }
                setIsFlipped(false);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCompleteLesson = async () => {
        if (!lessonId) return;
        setIsCompleting(true);
        try {
            const token = getCookie('token');
            const res = await fetch('http://localhost:8080/api/v1/course/status', {
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

            if (res.ok) {
                playSound('success'); // Play a nice sound for finishing the lesson
                router.push('/courses'); // Go back to roadmap
            } else {
                console.error("Failed to complete lesson");
                setIsCompleting(false);
            }
        } catch (err) {
            console.error(err);
            setIsCompleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#AF2024] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[800px] mx-auto flex flex-col gap-8 transition-colors duration-300">
            {/* Header */}
            <header>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Polish Learning Deck 🇵🇱</h1>
                <p className="text-[15px] text-gray-500 dark:text-gray-400 font-medium mb-6">
                    Powered by Spaced Repetition (SM-2 Algorithm). Learn efficiently.
                </p>

                {/* Progress Bar */}
                {sessionTotal > 0 && cards.length > 0 && (
                    <div className="w-full max-w-[500px] mx-auto h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
                        <div
                            className="h-full bg-[#AF2024] dark:bg-red-500 transition-all duration-500 rounded-full"
                            style={{ width: `${(currentIndex / sessionTotal) * 100}%` }}
                        ></div>
                    </div>
                )}
            </header>

            {/* Main Learning Section */}
            {currentCard ? (
                <div className="flex flex-col items-center">
                    <div className="mb-4 text-sm font-bold text-gray-400 dark:text-gray-500">
                        Card {currentIndex + 1} of {cards.length}
                    </div>

                    {/* Flashcard Container for perspective */}
                    <div className="w-full max-w-[500px] relative perspective-1000">
                        {/* Flashcard */}
                        <div
                            className={`w-full min-h-[300px] bg-white dark:bg-[#0f172a] rounded-[2rem] shadow-[0_10px_40px_rgba(175,32,36,0.1)] dark:shadow-none p-10 flex flex-col justify-center items-center text-center cursor-pointer transition-all duration-300 transform border dark:border-[#1e293b] 
                            ${isFlipped ? 'border-2 border-[#AF2024]/20 bg-[#FCF4F4] dark:bg-gray-800/80 dark:border-red-900/30' : 'hover:-translate-y-1'}
                            ${slideDirection === 'left' ? '-translate-x-[120%] opacity-0 rotate-[-10deg]' : slideDirection === 'right' ? 'translate-x-[120%] opacity-0 rotate-[10deg]' : ''}
                            `}
                            onClick={() => {
                                if (!isFlipped) {
                                    setIsFlipped(true);
                                    playSound('flip');
                                }
                            }}
                        >
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <h2 className="text-4xl font-bold text-gray-900 dark:text-white">{currentCard.text}</h2>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // prevent flipping the card
                                        playAudio(currentCard.text, currentCard.language_code || 'pl-PL');
                                    }}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isPlayingAudio ? 'bg-[#AF2024] text-white' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'}`}
                                    aria-label="Listen to pronunciation"
                                >
                                    {isPlayingAudio ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
                                    )}
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-gray-100 hover:bg-red-100 dark:bg-gray-800 dark:hover:bg-red-900/40 text-gray-400 hover:text-red-500"
                                    aria-label="Delete flashcard"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </div>

                            {isFlipped ? (
                                <div className="animate-fade-in flex flex-col items-center">
                                    <div className="w-16 h-1 bg-[#AF2024]/20 dark:bg-red-900/40 rounded-full mb-6"></div>
                                    <h3 className="text-2xl font-medium text-[#AF2024] dark:text-red-400">{currentCard.translation}</h3>
                                </div>
                            ) : (
                                <div className="mt-8 text-gray-400 dark:text-gray-500 font-medium">Click to reveal translation</div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {isFlipped && (
                        <div className="mt-8 flex flex-wrap justify-center gap-4 animate-fade-in w-full max-w-[500px]">
                            <button onClick={() => handleReview(0)} className="flex-1 min-w-[100px] py-3.5 px-4 rounded-xl border-2 border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-500/50 transition-colors">
                                Again (0)
                            </button>
                            <button onClick={() => handleReview(2)} className="flex-1 min-w-[100px] py-3.5 px-4 rounded-xl border-2 border-orange-200 dark:border-orange-900/40 text-orange-600 dark:text-orange-400 font-bold hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-500/50 transition-colors">
                                Hard (2)
                            </button>
                            <button onClick={() => handleReview(4)} className="flex-1 min-w-[100px] py-3.5 px-4 rounded-xl border-2 border-green-200 dark:border-green-900/40 text-green-600 dark:text-green-400 font-bold hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-500/50 transition-colors">
                                Good (4)
                            </button>
                            <button onClick={() => handleReview(5)} className="flex-1 min-w-[100px] py-3.5 px-4 rounded-xl border-2 border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors">
                                Easy (5)
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="w-full bg-white dark:bg-[#0f172a] rounded-[2rem] shadow-sm p-10 text-center border border-gray-100 dark:border-[#1e293b] transition-colors">
                    <div className="w-20 h-20 bg-[#E8F5E9] dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                        🎉
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">You&apos;re all caught up!</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">No more Polish words to review right now. Great job!</p>

                    {lessonId ? (
                        <div className="max-w-[400px] mx-auto mb-8">
                            <button
                                onClick={handleCompleteLesson}
                                disabled={isCompleting}
                                className="w-full bg-[#AF2024] text-white font-bold py-4 rounded-xl hover:bg-[#99151A] dark:hover:bg-red-700 transition-colors shadow-lg hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {isCompleting ? 'Completing...' : 'Complete Lesson'}
                                {!isCompleting && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                            </button>
                        </div>
                    ) : null}

                    <div className="max-w-[400px] mx-auto text-left bg-[#FCF4F4] dark:bg-gray-800/50 p-6 rounded-[1.5rem] border border-[#AF2024]/10 dark:border-gray-700/50">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Add new flashcard:</h3>
                        <form onSubmit={handleAddWord} className="flex flex-col gap-4">
                            <input
                                type="text"
                                value={newWord}
                                onChange={(e) => setNewWord(e.target.value)}
                                placeholder="Polish word (e.g. Dzień dobry)"
                                required
                                className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-[#AF2024] dark:focus:border-red-500 transition-colors"
                            />
                            <input
                                type="text"
                                value={newTranslation}
                                onChange={(e) => setNewTranslation(e.target.value)}
                                placeholder="Translation (e.g. Good morning)"
                                required
                                className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-[#AF2024] dark:focus:border-red-500 transition-colors"
                            />
                            <button disabled={isAdding} className="w-full bg-[#AF2024] text-white font-bold py-3 rounded-xl hover:bg-[#99151A] dark:hover:bg-red-700 transition-colors disabled:opacity-70">
                                {isAdding ? 'Adding...' : 'Add to Deck'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
