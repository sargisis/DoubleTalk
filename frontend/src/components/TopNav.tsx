'use client';
import React, { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';

interface TopNavProps {
    streak: number;
    xp_points: number;
}

export function TopNav() {
    const [stats, setStats] = useState<TopNavProps>({ streak: 0, xp_points: 0 });

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
                const res = await fetch('http://localhost:8080/api/v1/user/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats({
                        streak: data.streak || 0,
                        xp_points: data.xp_points || 0
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
            {/* Streak */}
            <div className="flex items-center gap-2 group cursor-pointer">
                <span className="text-2xl grayscale group-hover:grayscale-0 transition-all duration-300">
                    {stats.streak > 0 ? '🔥' : '🔥'}
                </span>
                <span className={`font-bold text-lg ${stats.streak > 0 ? 'text-[#FF9600] dark:text-orange-400' : 'text-gray-400 dark:text-gray-600'}`}>
                    {stats.streak}
                </span>
            </div>

            {/* XP */}
            <div className="flex items-center gap-2 cursor-pointer">
                <span className="text-2xl">⚡</span>
                <span className="font-bold text-lg text-[#C7912E] dark:text-yellow-500">
                    {stats.xp_points}
                </span>
            </div>
        </div>
    );
}
