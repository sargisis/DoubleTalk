'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
    id: string;
    sender: 'ai' | 'user';
    text: string;
    correction?: string;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            sender: 'ai',
            text: 'Cześć! Jestem twoim baristą. Na co masz dzisiaj ochotę? (Hi! I am your barista. What would you like today?)'
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            text: inputValue.trim()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:8080/api/v1/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({ message: userMsg.text }),
            });

            if (!res.ok) {
                throw new Error('Failed to communicate with AI');
            }

            const data = await res.json();

            const aiResponse: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: data.text,
                correction: data.correction
            };
            setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            console.error("AI Chat Error:", error);
            const errorResponse: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: 'Oj! Something went wrong connecting to the AI barista. Please try again later.'
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-100px)]">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                    <span className="text-4xl">☕</span>
                    Roleplay: Coffee Shop
                </h1>
                <p className="text-[15px] text-gray-500 dark:text-gray-400 font-medium">
                    Practice your Polish by ordering a drink. The AI will correct your grammar automatically!
                </p>
            </header>

            <div className="flex-1 bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-[#1e293b] rounded-[2rem] shadow-sm flex flex-col overflow-hidden">
                {/* Chat History */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-10 flex flex-col gap-6">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>

                            {msg.sender === 'ai' && (
                                <div className="w-10 h-10 rounded-full bg-[#AF2024] flex items-center justify-center text-white text-lg shrink-0 mr-4 shadow-sm mb-auto mt-2">
                                    🤖
                                </div>
                            )}

                            <div className={`max-w-[80%] flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`relative px-6 py-4 rounded-3xl ${msg.sender === 'user'
                                    ? 'bg-[#F2F2F2] dark:bg-[#1e293b] text-gray-900 dark:text-white rounded-br-sm'
                                    : 'bg-[#AF2024] text-white rounded-bl-sm shadow-md'
                                    }`}>
                                    <p className="text-[16px] leading-relaxed font-medium">{msg.text}</p>
                                </div>

                                {/* Grammar Correction Toast */}
                                {msg.correction && (
                                    <div className="mt-2 bg-[#FFF8E6] dark:bg-yellow-900/20 border border-[#FDE68A] dark:border-yellow-700/50 rounded-2xl p-4 w-full text-sm text-[#92400E] dark:text-yellow-400 font-medium">
                                        <div className="flex gap-2 items-start">
                                            <span className="text-lg leading-none mt-0.5">💡</span>
                                            <p className="whitespace-pre-wrap">{msg.correction}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="w-10 h-10 rounded-full bg-[#AF2024] flex items-center justify-center text-white text-lg shrink-0 mr-4 shadow-sm">
                                🤖
                            </div>
                            <div className="bg-[#AF2024] px-5 py-4 rounded-3xl rounded-bl-sm flex items-center gap-1.5 shadow-md">
                                <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 lg:p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type your response in Polish... (Try: Poproszę kawa)"
                            className="flex-1 bg-white dark:bg-[#1e293b] border-2 border-gray-200 dark:border-gray-700 rounded-full px-6 py-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#AF2024] dark:focus:border-[#AF2024] transition-colors"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isTyping}
                            className="bg-[#AF2024] hover:bg-[#8B1417] disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors shrink-0"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
