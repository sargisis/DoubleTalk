'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';
import { playSound } from '@/lib/audio';

// Mock data for a grammar lesson
const grammarLesson = {
    id: 102,
    title: 'The Verb "Być" (To Be)',
    description: 'Learn the most important verb in the Polish language.',
    sections: [
        {
            type: 'intro',
            title: 'Welcome to Grammar!',
            content: 'The verb "być" is the foundation of Polish sentences. Unlike English, Polish often drops the pronoun (I, you, he) because the verb ending already tells us who is speaking.'
        },
        {
            type: 'table',
            title: 'Present Tense Conjugation',
            headers: ['Pronoun', 'Verb form', 'English'],
            rows: [
                ['Ja (I)', 'jestem', 'am'],
                ['Ty (You)', 'jesteś', 'are'],
                ['On/Ona/Ono', 'jest', 'is'],
                ['My (We)', 'jesteśmy', 'are'],
                ['Wy (You pl.)', 'jesteście', 'are'],
                ['Oni/One (They)', 'są', 'are']
            ]
        },
        {
            type: 'examples',
            title: 'Examples in context',
            items: [
                { pl: 'Jestem z Polski.', en: 'I am from Poland.' },
                { pl: 'Czy jesteś zmęczony?', en: 'Are you tired?' },
                { pl: 'Ona jest bardzo miła.', en: 'She is very nice.' }
            ]
        }
    ]
};

export default function GrammarPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = React.use(params);
    const lessonId = parseInt(resolvedParams.id) || 102;

    const [currentStep, setCurrentStep] = useState(0);
    const [revealedIds, setRevealedIds] = useState<number[]>([]);
    const [phase, setPhase] = useState<'learning' | 'done'>('learning');
    const [isCompleting, setIsCompleting] = useState(false);

    const totalSteps = grammarLesson.sections.length;
    const progressPercent = ((currentStep) / totalSteps) * 100;

    const toggleReveal = (index: number) => {
        if (revealedIds.includes(index)) {
            setRevealedIds(revealedIds.filter(id => id !== index));
        } else {
            setRevealedIds([...revealedIds, index]);
        }
    };

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Finish lesson
            handleComplete();
        }
    };

    const handleComplete = async () => {
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
                playSound('success');
                setPhase('done');
            } else {
                console.error("Failed to mark as complete");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsCompleting(false);
        }
    };

    if (phase === 'done') {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4 max-w-[600px] mx-auto animate-in zoom-in duration-500">
                <div className="text-[100px] mb-8 leading-none">🧠</div>
                <h2 className="text-4xl font-black text-[#af2024] dark:text-[#ff474d] mb-4">You're getting smarter!</h2>
                <p className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-8">
                    You've successfully completed the grammar lesson on {grammarLesson.title}.
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

    const currentSection = grammarLesson.sections[currentStep];

    return (
        <div className="max-w-3xl mx-auto py-8 text-gray-900 dark:text-white pb-24 h-full flex flex-col">

            <header className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                    <Link href="/courses" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    </Link>
                    <div className="text-gray-500 font-bold tracking-widest uppercase text-sm">
                        Theory
                    </div>
                </div>
                <div className="flex-1 mx-8 bg-gray-200 dark:bg-gray-800 rounded-full h-3">
                    <div className="bg-[#AF2024] h-3 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <div className="font-bold text-gray-500">
                    {currentStep + 1} / {totalSteps}
                </div>
            </header>

            <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-8 duration-300">
                <div className="mb-8 text-center">
                    <span className="bg-[#AF2024]/10 text-[#AF2024] dark:bg-red-900/40 dark:text-red-300 text-xs font-bold px-3 py-1 uppercase tracking-wider rounded-full inline-block mb-4">
                        {currentSection.title}
                    </span>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
                        {grammarLesson.title}
                    </h1>
                </div>

                <div className="flex-1 bg-white dark:bg-[#151c2c] border-2 border-gray-100 dark:border-[#1e293b] rounded-[2.5rem] p-6 md:p-10 shadow-sm flex flex-col overflow-y-auto mb-8">

                    {currentSection.type === 'intro' && (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="text-6xl mb-6">💡</div>
                            <p className="text-xl md:text-2xl font-medium text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl">
                                {currentSection.content}
                            </p>
                        </div>
                    )}

                    {currentSection.type === 'table' && (
                        <div className="w-full flex flex-col justify-center h-full">
                            <div className="overflow-hidden rounded-2xl border-2 border-gray-100 dark:border-[#1e293b]">
                                <table className="w-full text-left m-0 border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-[#0f172a] border-b-2 border-gray-100 dark:border-[#1e293b]">
                                            {currentSection.headers?.map((h, i) => (
                                                <th key={i} className="px-4 py-4 md:px-6 md:py-5 text-sm uppercase tracking-wide font-bold text-gray-500 dark:text-gray-400">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-[#151c2c] divide-y divide-gray-100 dark:divide-gray-800/60">
                                        {currentSection.rows?.map((row, rIdx) => (
                                            <tr key={rIdx} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                                {row.map((cell, cIdx) => (
                                                    <td key={cIdx} className={`px-4 py-4 md:px-6 md:py-5 text-lg ${cIdx === 1 ? 'font-black text-[#AF2024] dark:text-red-400' : 'text-gray-700 dark:text-gray-300 font-medium'}`}>
                                                        {cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {currentSection.type === 'examples' && (
                        <div className="w-full h-full flex flex-col justify-center gap-4">
                            {currentSection.items?.map((item, iIdx) => {
                                const isRevealed = revealedIds.includes(iIdx);
                                return (
                                    <div
                                        key={iIdx}
                                        onClick={() => toggleReveal(iIdx)}
                                        className="bg-gray-50 dark:bg-[#0f172a] border-2 border-gray-200 hover:border-gray-300 dark:border-[#1e293b] dark:hover:border-gray-700 p-6 rounded-2xl shadow-sm cursor-pointer transition-all group active:scale-[0.98]"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{item.pl}</span>
                                            <button className="text-gray-400 dark:text-gray-600 group-hover:text-[#AF2024] dark:group-hover:text-red-400 transition-colors">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    {isRevealed ? <path d="M18 15l-6-6-6 6" /> : <path d="M6 9l6 6 6-6" />}
                                                </svg>
                                            </button>
                                        </div>

                                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isRevealed ? 'max-h-20 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}>
                                            <div className="pt-4 border-t-2 border-gray-200 dark:border-gray-800 text-[#AF2024] dark:text-red-400 font-bold text-lg md:text-xl">
                                                {item.en}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>

                <button
                    onClick={handleNext}
                    disabled={isCompleting}
                    className="w-full bg-[#AF2024] hover:bg-[#8e191d] text-white font-bold text-xl py-5 rounded-2xl shadow-[0_5px_0_0_rgb(117,20,24)] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider flex items-center justify-center"
                >
                    {isCompleting ? (
                        <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        currentStep < totalSteps - 1 ? 'Got it' : 'Finish Lesson'
                    )}
                </button>
            </div>
        </div>
    );
}
