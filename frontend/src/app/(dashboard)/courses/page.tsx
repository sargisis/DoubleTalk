'use client';

import React, { useState, useEffect } from 'react';
import { getCookie } from 'cookies-next';

interface Card {
    ID: number;
    text: string;           // e.g. Polish word
    translation: string;    // e.g. English translation
    language_code: string;
}

export default function CoursesPage() {
    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState(true);

    // Flashcard state
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    // New word form state
    const [newWord, setNewWord] = useState('');
    const [newTranslation, setNewTranslation] = useState('');
    const [isAdding, setIsAdding] = useState(false);

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
                setCards(data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (score: number) => {
        if (!cards[currentIndex]) return;
        const cardId = cards[currentIndex].ID;

        try {
            await fetch(`http://localhost:8080/api/v1/cards/${cardId}/review`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ score })
            });

            // Move to next card
            setIsFlipped(false);
            setCurrentIndex((prev) => prev + 1);
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

    const currentCard = cards[currentIndex];

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#AF2024] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[800px] mx-auto flex flex-col gap-8">
            {/* Header */}
            <header>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Polish Learning Deck 🇵🇱</h1>
                <p className="text-[15px] text-gray-500 font-medium">
                    Powered by Spaced Repetition (SM-2 Algorithm). Learn efficiently.
                </p>
            </header>

            {/* Main Learning Section */}
            {currentCard ? (
                <div className="flex flex-col items-center">
                    <div className="mb-4 text-sm font-bold text-gray-400">
                        Card {currentIndex + 1} of {cards.length}
                    </div>

                    {/* Flashcard */}
                    <div
                        className={`w-full max-w-[500px] min-h-[300px] bg-white rounded-[2rem] shadow-[0_10px_40px_rgba(175,32,36,0.1)] p-10 flex flex-col justify-center items-center text-center cursor-pointer transition-all duration-300 transform ${isFlipped ? 'border-2 border-[#AF2024]/20 bg-[#FCF4F4]' : 'hover:-translate-y-1'}`}
                        onClick={() => !isFlipped && setIsFlipped(true)}
                    >
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">{currentCard.text}</h2>

                        {isFlipped ? (
                            <div className="animate-fade-in flex flex-col items-center">
                                <div className="w-16 h-1 bg-[#AF2024]/20 rounded-full mb-6"></div>
                                <h3 className="text-2xl font-medium text-[#AF2024]">{currentCard.translation}</h3>
                            </div>
                        ) : (
                            <div className="mt-8 text-gray-400 font-medium">Click to reveal translation</div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    {isFlipped && (
                        <div className="mt-8 flex flex-wrap justify-center gap-4 animate-fade-in w-full max-w-[500px]">
                            <button onClick={() => handleReview(0)} className="flex-1 min-w-[100px] py-3.5 px-4 rounded-xl border-2 border-red-200 text-red-600 font-bold hover:bg-red-50 hover:border-red-300 transition-colors">
                                Again (0)
                            </button>
                            <button onClick={() => handleReview(2)} className="flex-1 min-w-[100px] py-3.5 px-4 rounded-xl border-2 border-orange-200 text-orange-600 font-bold hover:bg-orange-50 hover:border-orange-300 transition-colors">
                                Hard (2)
                            </button>
                            <button onClick={() => handleReview(4)} className="flex-1 min-w-[100px] py-3.5 px-4 rounded-xl border-2 border-green-200 text-green-600 font-bold hover:bg-green-50 hover:border-green-300 transition-colors">
                                Good (4)
                            </button>
                            <button onClick={() => handleReview(5)} className="flex-1 min-w-[100px] py-3.5 px-4 rounded-xl border-2 border-blue-200 text-blue-600 font-bold hover:bg-blue-50 hover:border-blue-300 transition-colors">
                                Easy (5)
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="w-full bg-white rounded-[2rem] shadow-sm p-10 text-center border border-gray-100">
                    <div className="w-20 h-20 bg-[#E8F5E9] text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                        🎉
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all caught up!</h2>
                    <p className="text-gray-500 mb-8 font-medium">No more Polish words to review right now. Great job!</p>

                    <div className="max-w-[400px] mx-auto text-left bg-[#FCF4F4] p-6 rounded-[1.5rem] border border-[#AF2024]/10">
                        <h3 className="font-bold text-gray-900 mb-4">Add new flashcard:</h3>
                        <form onSubmit={handleAddWord} className="flex flex-col gap-4">
                            <input
                                type="text"
                                value={newWord}
                                onChange={(e) => setNewWord(e.target.value)}
                                placeholder="Polish word (e.g. Dzień dobry)"
                                required
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#AF2024]"
                            />
                            <input
                                type="text"
                                value={newTranslation}
                                onChange={(e) => setNewTranslation(e.target.value)}
                                placeholder="Translation (e.g. Good morning)"
                                required
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#AF2024]"
                            />
                            <button disabled={isAdding} className="w-full bg-[#AF2024] text-white font-bold py-3 rounded-xl hover:bg-[#99151A] transition-colors disabled:opacity-70">
                                {isAdding ? 'Adding...' : 'Add to Deck'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
