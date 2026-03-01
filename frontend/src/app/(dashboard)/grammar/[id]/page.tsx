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
            type: 'text',
            content: 'The verb "być" is the foundation of Polish sentences. Unlike English, Polish often drops the pronoun (I, you, he) because the verb ending already tells us who is speaking.'
        },
        {
            type: 'table',
            title: 'Conjugation (Present Tense)',
            headers: ['Pronoun', 'Verb form', 'English'],
            rows: [
                ['Ja (I)', 'jestem', 'am'],
                ['Ty (You)', 'jesteś', 'are'],
                ['On/Ona/Ono (He/She/It)', 'jest', 'is'],
                ['My (We)', 'jesteśmy', 'are'],
                ['Wy (You plural)', 'jesteście', 'are'],
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
    const [revealedIds, setRevealedIds] = useState<number[]>([]);
    const [isCompleting, setIsCompleting] = useState(false);

    const toggleReveal = (index: number) => {
        if (revealedIds.includes(index)) {
            setRevealedIds(revealedIds.filter(id => id !== index));
        } else {
            setRevealedIds([...revealedIds, index]);
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
                    lesson_id: parseInt(resolvedParams.id) || 102,
                    status: 'completed'
                })
            });

            if (res.ok) {
                playSound('success');
                router.push('/courses');
            } else {
                console.error("Failed to mark as complete");
                setIsCompleting(false);
            }
        } catch (err) {
            console.error(err);
            setIsCompleting(false);
        }
    };

    return (
        <div className="max-w-[800px] mx-auto pb-20">
            {/* Nav Back */}
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-8 transition-colors font-medium">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Back to Roadmap
            </Link>

            {/* Header */}
            <header className="mb-12">
                <div className="text-[#AF2024] dark:text-red-400 font-bold tracking-wider uppercase text-sm mb-3">Grammar Lesson</div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
                    {grammarLesson.title}
                </h1>
                <p className="text-xl text-gray-500 dark:text-gray-400">
                    {grammarLesson.description}
                </p>
            </header>

            {/* Content Blocks */}
            <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-p:leading-relaxed prose-a:text-[#AF2024]">
                {grammarLesson.sections.map((section, idx) => {
                    if (section.type === 'text') {
                        return (
                            <p key={idx} className="text-gray-800 dark:text-gray-200 text-lg mb-8 leading-relaxed">
                                {section.content}
                            </p>
                        );
                    }

                    if (section.type === 'table') {
                        return (
                            <div key={idx} className="mb-12 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                                <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white m-0">{section.title}</h3>
                                </div>
                                <table className="w-full text-left m-0 border-collapse">
                                    <thead>
                                        <tr className="bg-white dark:bg-[#0f172a] border-b border-gray-100 dark:border-gray-800">
                                            {section.headers?.map((h, i) => (
                                                <th key={i} className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400 capitalize">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-[#0f172a] divide-y divide-gray-100 dark:divide-gray-800/60">
                                        {section.rows?.map((row, rIdx) => (
                                            <tr key={rIdx} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                                {row.map((cell, cIdx) => (
                                                    <td key={cIdx} className={`px-6 py-4 ${cIdx === 1 ? 'font-bold text-[#AF2024] dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    }

                    if (section.type === 'examples') {
                        return (
                            <div key={idx} className="mb-12">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#AF2024] dark:text-red-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                    {section.title}
                                </h3>
                                <div className="space-y-4">
                                    {section.items?.map((item, iIdx) => {
                                        const isRevealed = revealedIds.includes(iIdx);
                                        return (
                                            <div
                                                key={iIdx}
                                                onClick={() => toggleReveal(iIdx)}
                                                className="bg-white dark:bg-[#0f172a] border-2 border-transparent hover:border-gray-200 dark:border-[#1e293b] dark:hover:border-gray-700 p-6 rounded-2xl shadow-sm cursor-pointer transition-all flex flex-col gap-3 group"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xl font-medium text-gray-900 dark:text-white">{item.pl}</span>
                                                    <button className="text-gray-300 dark:text-gray-600 group-hover:text-[#AF2024] dark:group-hover:text-red-400 transition-colors">
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                                    </button>
                                                </div>

                                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isRevealed ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                                                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                                                        {item.en}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    }

                    return null;
                })}
            </article>

            {/* Next Action */}
            <div className="mt-16 flex justify-center">
                <button
                    onClick={handleComplete}
                    disabled={isCompleting}
                    className="bg-[#AF2024] hover:bg-[#8B1417] text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-[0_4px_0_0_rgb(139,20,23)] hover:-translate-y-1 active:translate-y-1 active:shadow-none disabled:opacity-70 transition-all flex items-center gap-2"
                >
                    {isCompleting ? 'Completing...' : 'Mark as Complete'}
                    {!isCompleting && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </button>
            </div>
        </div>
    );
}
