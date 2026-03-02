'use client';
import React, { useState, useEffect } from 'react';
import { getCookie } from 'cookies-next';

interface Word {
    id: number;
    text: string;
    translation: string;
    language_code: string;
}

const CATEGORIES = ["Greetings", "Responses", "Courtesy", "Basics", "Travel", "Food"];

export default function WordsPage() {
    const [words, setWords] = useState<Word[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWords = async () => {
            setLoading(true);
            const token = getCookie('token');
            try {
                const res = await fetch('http://localhost:8080/api/v1/words', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setWords(data || []);
                }
            } catch (err) {
                console.error("Failed to fetch words", err);
            } finally {
                setLoading(false);
            }
        };
        fetchWords();
    }, []);

    // Deterministic mock category assignment for design parity
    const getCategory = (word: string) => {
        if (!word) return CATEGORIES[3];
        const hash = (word.length + word.charCodeAt(0)) % CATEGORIES.length;
        return CATEGORIES[hash];
    };

    const filteredWords = words.filter(word =>
        word.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        word.translation.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-[1000px] mx-auto flex flex-col gap-8 pb-16">
            <header className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Vocabulary</h1>
                <p className="text-[15px] text-gray-500 dark:text-gray-400 font-medium">
                    Review and search your learned words
                </p>
            </header>

            {/* Search Bar */}
            <div className="relative w-full shadow-sm rounded-xl overflow-hidden bg-white dark:bg-[#151c2c] border border-gray-100 dark:border-[#1e293b]">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search words..."
                    className="w-full bg-transparent text-gray-900 dark:text-white py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#AF2024]/50 transition-shadow"
                />
            </div>

            {/* Data Table */}
            <div className="w-full bg-white dark:bg-[#151c2c] rounded-2xl border border-gray-100 dark:border-[#1e293b] overflow-hidden shadow-sm">
                <div className="flex bg-gray-50 dark:bg-gray-800/50 p-4 border-b border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-500 uppercase tracking-wider">
                    <div className="flex-1">Polish</div>
                    <div className="flex-1">English</div>
                    <div className="w-32 text-right">Category</div>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-[#AF2024] rounded-full animate-spin"></div>
                    </div>
                ) : filteredWords.length > 0 ? (
                    <div className="flex flex-col">
                        {filteredWords.map((word, index) => (
                            <div
                                key={word.id}
                                className={`flex items-center p-4 transition-colors hover:bg-gray-50 dark:hover:bg-[#1e293b]/50 ${index !== filteredWords.length - 1 ? 'border-b border-gray-50 dark:border-gray-800/50' : ''}`}
                            >
                                <div className="flex-1 font-semibold text-gray-900 dark:text-white text-lg">
                                    {word.text}
                                </div>
                                <div className="flex-1 text-gray-600 dark:text-gray-300 font-medium text-lg">
                                    {word.translation}
                                </div>
                                <div className="w-32 flex justify-end">
                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 text-xs font-bold rounded-full border border-gray-200 dark:border-gray-700">
                                        {getCategory(word.text)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-4">
                        <span className="text-4xl text-gray-300 dark:text-gray-700">📭</span>
                        <p className="font-medium text-lg">No words found.</p>
                        {!searchQuery && (
                            <p className="text-sm">Start lessons to add new vocabulary!</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
