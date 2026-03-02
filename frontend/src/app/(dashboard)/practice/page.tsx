'use client';
import React, { useState } from 'react';
import { getCookie } from 'cookies-next';

export default function PracticePage() {
    const [sentence, setSentence] = useState('');
    const [responseMessage, setResponseMessage] = useState<{ text: string, correction?: string } | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    const handleCheckSentence = async () => {
        if (!sentence.trim()) return;

        setIsChecking(true);
        setResponseMessage(null);
        const token = getCookie('token');

        try {
            const res = await fetch('http://localhost:8080/api/v1/chat', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: sentence })
            });

            if (res.ok) {
                const data = await res.json();
                setResponseMessage({ text: data.text, correction: data.correction });
            } else {
                setResponseMessage({ text: "⚠️ I couldn't check that sentence right now." });
            }
        } catch (err) {
            console.error(err);
            setResponseMessage({ text: "⚠️ Network error while connecting to the AI." });
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="max-w-[700px] mx-auto flex flex-col gap-8 h-full min-h-[80vh]">
            <header className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sentence Corrector</h1>
                <p className="text-[15px] text-gray-500 dark:text-gray-400 font-medium">
                    Write a sentence in Polish and get AI feedback
                </p>
            </header>

            <div className="flex-1 flex flex-col gap-4">
                <div className="relative w-full shadow-sm rounded-2xl overflow-hidden bg-[#151c2c] border-2 border-transparent focus-within:border-[#AF2024]/50 transition-colors">
                    <textarea
                        value={sentence}
                        onChange={(e) => setSentence(e.target.value)}
                        placeholder="Type a sentence in Polish..."
                        className="w-full h-48 bg-transparent text-white p-6 outline-none resize-none placeholder-gray-500 text-lg"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleCheckSentence();
                            }
                        }}
                    />
                </div>

                <div>
                    <button
                        onClick={handleCheckSentence}
                        disabled={isChecking || !sentence.trim()}
                        className="bg-[#AF2024] hover:bg-[#99151A] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isChecking ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"></path><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        )}
                        Check Sentence
                    </button>
                </div>

                {responseMessage && (
                    <div className="mt-8 flex flex-col gap-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
                        {/* AI Main Response */}
                        <div className="bg-[#1e293b] rounded-2xl p-6 border-l-4 border-gray-500 shadow-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">💬</span>
                                <span className="text-white font-bold text-lg">AI Response</span>
                            </div>
                            <p className="text-gray-300 leading-relaxed font-medium">
                                {responseMessage.text}
                            </p>
                        </div>

                        {/* Grammar Correction (if exists) */}
                        {responseMessage.correction && (
                            <div className="bg-[#AF2024]/10 rounded-2xl p-6 border-l-4 border-[#AF2024] shadow-lg">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl">✏️</span>
                                    <span className="text-[#AF2024] dark:text-red-400 font-bold text-lg">Correction</span>
                                </div>
                                <p className="text-gray-300 leading-relaxed font-medium">
                                    {responseMessage.correction}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
