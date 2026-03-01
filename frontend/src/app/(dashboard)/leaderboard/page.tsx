'use client';

import React, { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';

interface LeaderboardUser {
    id: number;
    username: string;
    avatar_url: string;
    xp_points: number;
    level: number;
}

const TrophyIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
        <path d="M4 22h16"></path>
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path>
    </svg>
);

const LightningIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
);

export default function LeaderboardPage() {
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            const token = getCookie('token');
            if (!token) return;

            try {
                const res = await fetch('http://localhost:8080/api/v1/leaderboard', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data);
                }
            } catch (err) {
                console.error("Failed to load leaderboard", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-[#AF2024] rounded-full animate-spin"></div>
            </div>
        );
    }

    const topThree = users.slice(0, 3);
    const rest = users.slice(3);

    return (
        <div className="max-w-4xl mx-auto flex flex-col gap-10">
            {/* Header */}
            <header className="flex flex-col gap-3 text-center md:text-left">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-4">
                    <span className="text-[#AF2024]"><TrophyIcon /></span>
                    Global Leaderboard
                </h1>
                <p className="text-[16px] text-gray-500 dark:text-gray-400 font-medium max-w-xl">
                    Compete with learners worldwide. Earn XP by answering flashcards, writing sentences, and adding new words to your vocabulary!
                </p>
            </header>

            {/* Top 3 Podium */}
            {topThree.length > 0 && (
                <div className="flex items-end justify-center gap-4 md:gap-8 mt-8 mb-6 h-64">

                    {/* 2nd Place */}
                    {topThree[1] && (
                        <div className="flex flex-col items-center animate-[slideUp_0.8s_ease-out]">
                            <div className="relative mb-4">
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded-full border-4 border-[#C0C0C0] shadow-lg flex items-center justify-center text-xl font-bold text-gray-700 uppercase overflow-hidden">
                                    {topThree[1].avatar_url ? <img src={topThree[1].avatar_url} alt="" className="w-full h-full object-cover" /> : topThree[1].username[0]}
                                </div>
                                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#C0C0C0] text-white flex items-center justify-center text-sm font-bold shadow-sm shadow-gray-500/30">
                                    2
                                </div>
                            </div>
                            <div className="bg-gradient-to-t from-gray-100 to-white dark:from-gray-800 dark:to-gray-700 w-24 md:w-32 h-28 rounded-t-2xl border border-gray-200 dark:border-gray-600 shadow-inner flex flex-col items-center pt-4 relative overflow-hidden">
                                <span className="font-bold text-gray-800 dark:text-gray-200 text-sm truncate w-full text-center px-2">{topThree[1].username}</span>
                                <span className="text-[#F4B400] font-bold text-sm tracking-wide flex items-center gap-1 mt-1"><LightningIcon /> {topThree[1].xp_points}</span>
                            </div>
                        </div>
                    )}

                    {/* 1st Place */}
                    {topThree[0] && (
                        <div className="flex flex-col items-center animate-[slideUp_0.6s_ease-out] z-10">
                            <div className="relative mb-4">
                                <div className="w-20 h-20 md:w-28 md:h-28 bg-[#FFF9E6] rounded-full border-4 border-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.3)] flex items-center justify-center text-3xl font-bold text-yellow-600 uppercase overflow-hidden">
                                    {topThree[0].avatar_url ? <img src={topThree[0].avatar_url} alt="" className="w-full h-full object-cover" /> : topThree[0].username[0]}
                                </div>
                                <div className="absolute -top-4 -right-1 w-10 h-10 rounded-full bg-[#FFD700] text-yellow-900 flex items-center justify-center text-lg font-extrabold shadow-sm shadow-yellow-600/40">
                                    1
                                </div>
                            </div>
                            <div className="bg-gradient-to-t from-yellow-50 to-white dark:from-yellow-900/40 dark:to-gray-800 border-x border-t border-yellow-200 dark:border-yellow-700/50 w-28 md:w-36 h-40 rounded-t-2xl shadow-xl flex flex-col items-center pt-5 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300"></div>
                                <span className="font-bold text-gray-900 dark:text-white text-base truncate w-full text-center px-2">{topThree[0].username}</span>
                                <span className="text-[#F4B400] font-extrabold text-md tracking-wide flex items-center gap-1 mt-1"><LightningIcon /> {topThree[0].xp_points}</span>
                            </div>
                        </div>
                    )}

                    {/* 3rd Place */}
                    {topThree[2] && (
                        <div className="flex flex-col items-center animate-[slideUp_1s_ease-out]">
                            <div className="relative mb-4">
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-[#FAF5F0] rounded-full border-4 border-[#CD7F32] shadow-lg flex items-center justify-center text-xl font-bold text-[#8c531d] uppercase overflow-hidden">
                                    {topThree[2].avatar_url ? <img src={topThree[2].avatar_url} alt="" className="w-full h-full object-cover" /> : topThree[2].username[0]}
                                </div>
                                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#CD7F32] text-white flex items-center justify-center text-sm font-bold shadow-sm shadow-orange-900/30">
                                    3
                                </div>
                            </div>
                            <div className="bg-gradient-to-t from-orange-50 to-white dark:from-orange-900/20 dark:to-gray-800 w-24 md:w-32 h-20 rounded-t-2xl border border-orange-100 dark:border-orange-900/30 shadow-inner flex flex-col items-center pt-3 relative overflow-hidden">
                                <span className="font-bold text-gray-800 dark:text-gray-200 text-sm truncate w-full text-center px-2">{topThree[2].username}</span>
                                <span className="text-[#F4B400] font-bold text-sm tracking-wide flex items-center gap-1 mt-1"><LightningIcon /> {topThree[2].xp_points}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* The rest of the list */}
            <div className="bg-white dark:bg-[#0f172a] rounded-3xl shadow-sm border border-gray-100 dark:border-[#1e293b] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-800/20 text-gray-500 dark:text-gray-400 text-[12px] uppercase tracking-wider font-semibold border-b border-gray-100 dark:border-gray-800">
                                <th className="px-6 py-4 w-16 text-center">Rank</th>
                                <th className="px-6 py-4">Learner</th>
                                <th className="px-6 py-4 text-center">Level</th>
                                <th className="px-6 py-4 text-right">XP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                            {rest.map((user, index) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                    <td className="px-6 py-5 text-center">
                                        <span className="text-gray-400 dark:text-gray-500 font-bold group-hover:text-gray-900 dark:group-hover:text-gray-300 transition-colors">
                                            {index + 4}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-[#FCF4F4] dark:bg-gray-800 text-[#AF2024] dark:text-red-400 font-bold flex items-center justify-center uppercase overflow-hidden ring-2 ring-transparent group-hover:ring-[#AF2024]/20 transition-all">
                                                {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : user.username[0]}
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white text-[15px]">{user.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <div className="inline-flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-1 text-sm font-bold">
                                            Lvl {user.level}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right font-extrabold text-[#F4B400] flex items-center justify-end gap-1.5">
                                        {user.xp_points} XP
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-gray-500 font-medium">
                                        No users found. Be the first to earn XP!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideUp {
                    0% { transform: translateY(40px); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
