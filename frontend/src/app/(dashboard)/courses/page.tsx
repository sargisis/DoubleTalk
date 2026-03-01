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

            {/* Top Roadmap View */}
            <div className="flex flex-col items-center">
                {roadmapUnits.map((unit) => (
                    <div key={unit.id} className="w-full max-w-2xl mb-12">
                        {/* Unit Header */}
                        <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-[#1e293b] rounded-3xl p-6 mb-8 shadow-sm flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{unit.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400">{unit.description}</p>
                            </div>
                            <div className="bg-[#AF2024]/10 text-[#AF2024] dark:bg-red-900/30 dark:text-red-400 px-4 py-2 rounded-xl font-bold flex-shrink-0">
                                Unit {unit.id}
                            </div>
                        </div>

                        {/* Lessons Path - Vertical Timeline */}
                        <div className="flex flex-col gap-0 relative ml-4 md:ml-8">
                            {/* Connecting Line behind nodes */}
                            <div className="absolute top-8 bottom-12 left-[23px] md:left-[27px] w-1 bg-gray-200 dark:bg-gray-800 -z-10 rounded-full"></div>

                            {unit.lessons.map((lesson: any) => {
                                // Determine styles based on status
                                let nodeStyle = '';
                                let cardStyle = '';
                                let icon = null;
                                const isLocked = lesson.status === 'locked';

                                if (lesson.status === 'completed') {
                                    nodeStyle = 'bg-yellow-400 text-white shadow-md border-4 border-white dark:border-[#0f172a]';
                                    cardStyle = 'bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-gray-800 hover:border-yellow-400 dark:hover:border-yellow-600';
                                    icon = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
                                } else if (lesson.status === 'unlocked') {
                                    nodeStyle = 'bg-[#AF2024] text-white shadow-lg shadow-red-900/20 border-4 border-white dark:border-[#0f172a]';
                                    cardStyle = 'bg-white dark:bg-[#0f172a] border-2 border-[#AF2024]/30 dark:border-red-900/50 hover:border-[#AF2024] dark:hover:border-red-500 shadow-md';
                                    icon = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
                                } else {
                                    nodeStyle = 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-4 border-white dark:border-[#0f172a]';
                                    cardStyle = 'bg-gray-50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800 opacity-60';
                                    icon = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
                                }

                                return (
                                    <div key={lesson.id} className="flex items-start gap-6 md:gap-8 mb-8 relative group w-full">

                                        {/* Timeline Node */}
                                        <div className={`relative z-10 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center flex-shrink-0 mt-2 ${nodeStyle} transition-transform ${!isLocked && 'group-hover:scale-110'}`}>
                                            {icon}
                                        </div>

                                        {/* Detailed Lesson Card */}
                                        <Link
                                            href={isLocked ? '#' : lesson.href}
                                            className={`flex-1 rounded-3xl p-6 transition-all block ${cardStyle} ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1'}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-xs font-bold uppercase tracking-wider ${lesson.status === 'completed' ? 'text-yellow-600 dark:text-yellow-500' : lesson.status === 'unlocked' ? 'text-[#AF2024] dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>
                                                    {lesson.label}
                                                </span>
                                                <span className="text-gray-400 dark:text-gray-500 text-sm font-medium capitalize">
                                                    {lesson.type}
                                                </span>
                                            </div>
                                            <h4 className={`text-xl font-bold mb-2 ${isLocked ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                                {lesson.title}
                                            </h4>
                                            <p className={`text-sm ${isLocked ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'}`}>
                                                {lesson.desc}
                                            </p>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
