'use client';
import React, { useState, useEffect } from 'react';
import { getCookie } from 'cookies-next';
import Image from 'next/image';

interface LeaderboardUser {
    id: number;
    username: string;
    xp_points: number;
    level: number;
    avatar_url: string;
}

export default function LeaderboardPage() {
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            const token = getCookie('token');
            try {
                const res = await fetch('http://localhost:8080/api/v1/leaderboard', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    // Assuming API returns an array or an object with "leaderboard" key
                    setUsers(Array.isArray(data) ? data : data.leaderboard || []);
                }
            } catch (err) {
                console.error("Failed to fetch leaderboard", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    // Get medal styling for top 3
    const getMedalStyles = (index: number) => {
        if (index === 0) return "bg-yellow-400/10 text-yellow-500 border-yellow-400/50 shadow-[0_0_15px_rgba(250,204,21,0.2)]";
        if (index === 1) return "bg-gray-300/10 text-gray-400 border-gray-300/50 shadow-[0_0_15px_rgba(209,213,219,0.1)]";
        if (index === 2) return "bg-[#cd7f32]/10 text-[#cd7f32] border-[#cd7f32]/50 shadow-[0_0_15px_rgba(205,127,50,0.1)]";
        return "bg-white dark:bg-[#151c2c] text-gray-600 dark:text-gray-400 border-transparent text-sm font-semibold";
    };

    const getMedalIcon = (index: number) => {
        if (index === 0) return "🥇";
        if (index === 1) return "🥈";
        if (index === 2) return "🥉";
        return `#${index + 1}`;
    };

    return (
        <div className="max-w-[800px] mx-auto flex flex-col gap-8 pb-16">
            <header className="mb-8 text-center bg-gradient-to-b from-[#AF2024]/10 to-transparent p-12 rounded-3xl border border-[#AF2024]/20 shadow-sm relative overflow-hidden">
                <div className="absolute -top-10 -right-10 text-[150px] opacity-5 rotate-12">🏆</div>
                <div className="absolute -bottom-10 -left-10 text-[100px] opacity-5 -rotate-12">⚡</div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 relative z-10 tracking-tight">Global Leaderboard</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 font-medium relative z-10 max-w-md mx-auto">
                    Compete with learners worldwide. Earn XP by completing lessons and mastering vocabulary!
                </p>
            </header>

            <div className="flex flex-col gap-4">
                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#AF2024] rounded-full animate-spin"></div>
                    </div>
                ) : users.length > 0 ? (
                    users.map((user, index) => {
                        const style = getMedalStyles(index);
                        const isTop3 = index < 3;
                        return (
                            <div
                                key={user.id}
                                className={`flex items-center justify-between p-4 md:p-5 rounded-2xl border-2 transition-transform hover:-translate-y-1 ${style}`}
                            >
                                <div className="flex items-center gap-4 md:gap-6">
                                    {/* Rank Marker */}
                                    <div className="w-10 flex justify-center text-xl md:text-2xl font-black">
                                        {getMedalIcon(index)}
                                    </div>

                                    {/* Avatar */}
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden shadow-inner border-2 border-white/10 flex-shrink-0">
                                        {user.avatar_url ? (
                                            <img src={`http://localhost:8080${user.avatar_url}`} alt={user.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xl uppercase">
                                                {user.username.charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                    {/* User Info */}
                                    <div className="flex flex-col">
                                        <span className={`font-bold text-lg md:text-xl ${isTop3 ? 'text-gray-900 dark:text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                                            {user.username}
                                        </span>
                                        <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-gray-500 opacity-80">
                                            Level {user.level}
                                        </span>
                                    </div>
                                </div>

                                {/* XP Points */}
                                <div className="flex items-center gap-2 bg-black/5 dark:bg-black/20 px-4 py-2 rounded-xl backdrop-blur-sm">
                                    <span className="text-xl">⚡</span>
                                    <span className="font-black text-xl md:text-2xl">{user.xp_points} <span className="text-sm font-bold opacity-60">XP</span></span>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="p-12 text-center text-gray-500 bg-white dark:bg-[#151c2c] rounded-2xl border border-gray-100 dark:border-[#1e293b]">
                        <p className="font-medium text-lg">No leaderboard data found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
