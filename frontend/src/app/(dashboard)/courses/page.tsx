'use client';
import React from 'react';
import Link from 'next/link';

export default function CoursesPage() {
    // Mock data for the Roadmap
    const baseRoadmapUnits = [
        {
            id: 1,
            title: "Unit 1: Introductions",
            description: "Learn basic greetings and how to introduce yourself.",
            lessons: [
                { id: 101, type: 'vocabulary', label: 'Step 1: Flashcards', title: 'Basic Greetings', desc: 'Memorize the core words for saying hello and goodbye.', defaultStatus: 'unlocked', href: '/flashcards?lessonId=101' },
                { id: 102, type: 'grammar', label: 'Step 2: Theory', title: 'Verb "Być" (To Be)', desc: 'Read the foundational grammar rule for Polish sentences.', defaultStatus: 'locked', href: '/grammar/102' },
                { id: 103, type: 'homework', label: 'Step 3: Practice', title: 'Saying Hello', desc: 'Interactive exercise to build sentences.', defaultStatus: 'locked', href: '/homework/103' },
            ]
        },
        {
            id: 2,
            title: "Unit 2: Essential Phrases",
            description: "Yes, No, Please, Thanks, and basic polite phrases.",
            lessons: [
                { id: 201, type: 'vocabulary', label: 'Step 1: Flashcards', title: 'Polite Words', desc: 'Learn common polite phrases.', defaultStatus: 'locked', href: '/flashcards?lessonId=201' },
                { id: 202, type: 'homework', label: 'Step 2: Practice', title: 'Manners Quiz', desc: 'Test your knowledge on polite phrases.', defaultStatus: 'locked', href: '/homework/202' },
            ]
        }
    ];

    const [roadmapUnits, setRoadmapUnits] = React.useState(baseRoadmapUnits);
    const [loading, setLoading] = React.useState(true);
    const { getCookie } = require('cookies-next');

    React.useEffect(() => {
        const fetchProgress = async () => {
            const token = getCookie('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch('http://localhost:8080/api/v1/course/progress', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const progressData = await res.json();

                    // Map progress to roadmap map
                    const progressMap = new Map();
                    progressData.forEach((p: any) => progressMap.set(p.lesson_id, p.status));

                    // Update roadmap state
                    let isPreviousLessonCompleted = true; // Always true for the very first lesson

                    const updatedRoadmap = baseRoadmapUnits.map(unit => ({
                        ...unit,
                        lessons: unit.lessons.map(lesson => {
                            let statusFromDB = progressMap.get(lesson.id);
                            let finalStatus = lesson.defaultStatus;

                            if (statusFromDB) {
                                finalStatus = statusFromDB;
                            } else if (finalStatus === 'locked' && isPreviousLessonCompleted) {
                                finalStatus = 'unlocked';
                            }

                            isPreviousLessonCompleted = finalStatus === 'completed';

                            return { ...lesson, status: finalStatus };
                        })
                    }));

                    setRoadmapUnits(updatedRoadmap);
                }
            } catch (err) {
                console.error("Failed to load progress", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProgress();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-[#AF2024] rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[1000px] mx-auto flex flex-col gap-8 pb-16">
            <header className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Courses (Roadmap)</h1>
                <p className="text-[15px] text-gray-500 dark:text-gray-400 font-medium">
                    Follow the path to master Polish step-by-step.
                </p>
            </header>

            {/* Modern Roadmap View */}
            <div className="flex flex-col items-center">
                {roadmapUnits.map((unit) => {
                    // Check if unit has any unlocked/completed lesson to give it a red glow outline
                    const isUnitActive = unit.lessons.some((l: any) => l.status === 'unlocked' || l.status === 'completed');

                    return (
                        <div key={unit.id} className="w-full max-w-3xl mb-12 flex relative">
                            {/* Unit Circle (Left side, absolute or negative margin) */}
                            <div className="absolute -left-6 md:-left-12 top-6 w-8 h-8 rounded-full bg-[#AF2024] text-white flex items-center justify-center font-bold text-sm shadow-md z-10">
                                {unit.id}
                            </div>

                            {/* Vertical joining line for units (optional background line) */}
                            <div className="absolute -left-[10px] md:-left-[34px] top-14 bottom-[-48px] w-0.5 bg-gray-200 dark:bg-gray-800 -z-0"></div>

                            {/* Unit Card */}
                            <div className={`w-full bg-white dark:bg-[#151c2c] rounded-3xl p-6 md:p-8 flex flex-col 
                                ${isUnitActive ? 'border-2 border-[#AF2024]/50 shadow-[0_0_15px_rgba(175,32,36,0.1)]' : 'border border-gray-100 dark:border-[#1e293b]'}
                            `}>
                                {/* Unit Header */}
                                <div className="mb-6">
                                    <h3 className={`text-xl font-bold mb-1 ${isUnitActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                        Unit {unit.id}: {unit.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{unit.description}</p>
                                </div>

                                {/* Lessons List */}
                                <div className="flex flex-col gap-3">
                                    {unit.lessons.map((lesson: any) => {
                                        const isLocked = lesson.status === 'locked';
                                        const isCompleted = lesson.status === 'completed';
                                        const isCurrent = lesson.status === 'unlocked';

                                        // Shared generic style for list item rows
                                        let rowStyle = 'flex items-center justify-between p-4 rounded-xl border transition-all ';
                                        if (isCompleted) {
                                            rowStyle += 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600';
                                        } else if (isCurrent) {
                                            rowStyle += 'bg-[#AF2024]/5 dark:bg-red-900/10 border-[#AF2024]/30 dark:border-red-900/50 hover:border-[#AF2024] dark:hover:border-red-500';
                                        } else {
                                            rowStyle += 'bg-transparent border-transparent opacity-60 pointer-events-none';
                                        }

                                        // Icon logic based on lesson type
                                        const getIcon = (type: string, isLck: boolean) => {
                                            if (type === 'flashcard') {
                                                return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="16" height="16" rx="2" ry="2"></rect></svg>;
                                            } else if (type === 'grammar') {
                                                return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;
                                            } else if (type === 'practice') {
                                                return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="14 2 18 6 7 17 3 17 3 13 14 2"></polygon><line x1="3" y1="22" x2="21" y2="22"></line></svg>;
                                            }
                                        };

                                        return (
                                            <Link
                                                key={lesson.id}
                                                href={isLocked ? '#' : lesson.href}
                                                className={rowStyle}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className={`flex items-center justify-center w-8 h-8 rounded-lg ${isCurrent ? 'bg-white dark:bg-gray-800 text-[#AF2024] shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
                                                        {getIcon(lesson.type, isLocked)}
                                                    </span>
                                                    <span className={`font-semibold ${isLocked ? 'text-gray-500 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>
                                                        {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)} {lesson.label ? `- ${lesson.label}` : ''}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-center">
                                                    {isLocked ? (
                                                        <span className="text-yellow-600 dark:text-yellow-500/70 p-1">
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                                        </span>
                                                    ) : isCompleted ? (
                                                        <span className="text-green-500 p-1">
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                        </span>
                                                    ) : (
                                                        <span className="bg-[#FF9600] text-white rounded p-1 shadow-sm">
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                                        </span>
                                                    )}
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
