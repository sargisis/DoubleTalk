'use client';
import React, { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';

interface TopNavProps {
    streak: number;
    xp_points: number;
    due_cards: number;
}

export function TopNav() {
    const [stats, setStats] = useState<TopNavProps>({ streak: 0, xp_points: 0, due_cards: 0 });

    useEffect(() => {
        const updateAndFetchStats = async () => {
            const token = getCookie('token');
            if (!token) return;

            try {
                // Background POST to register a streak visit today
                await fetch('http://localhost:8080/api/v1/user/visit', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // Fetch resulting stats
                const [resMe, resDue] = await Promise.all([
                    fetch('http://localhost:8080/api/v1/user/me', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch('http://localhost:8080/api/v1/cards/due-count', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                if (resMe.ok && resDue.ok) {
                    const dataMe = await resMe.json();
                    const dataDue = await resDue.json();
                    setStats({
                        streak: dataMe.streak || 0,
                        xp_points: dataMe.xp_points || 0,
                        due_cards: dataDue.count || 0
                    });
                }
            } catch (err) {
                console.error("Failed to load top nav stats", err);
            }
        };
        updateAndFetchStats();
    }, []);

    return (
        <div className="w-full flex justify-end gap-6 mb-8 mt-2 lg:mt-0">
             {/* Due Cards */}
             <div className="flex items-center gap-2 cursor-pointer bg-red-50 dark:bg-red-900/20 px-4 py-1.5 rounded-2xl border border-red-100 dark:border-red-900/30">
                <span className="text-xl">📚</span>
                <span className="font-bold text-[#AF2024] dark:text-red-400">
                    {stats.due_cards} <span className="text-[10px] uppercase ml-1 opacity-70 tracking-wider">Due</span>
                </span>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-2 group cursor-pointer bg-white dark:bg-[#0f172a] px-4 py-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <span className="text-xl grayscale group-hover:grayscale-0 transition-all duration-300">
                    {stats.streak > 0 ? '🔥' : '🔥'}
                </span>
                <span className={`font-bold ${stats.streak > 0 ? 'text-[#FF9600] dark:text-orange-400' : 'text-gray-400 dark:text-gray-600'}`}>
                    {stats.streak}
                </span>
            </div>

            {/* XP */}
            <div className="flex items-center gap-2 cursor-pointer bg-white dark:bg-[#0f172a] px-4 py-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <span className="text-xl">⚡</span>
                <span className="font-bold text-[#C7912E] dark:text-yellow-500">
                    {stats.xp_points}
                </span>
            </div>
        </div>
    );
}
