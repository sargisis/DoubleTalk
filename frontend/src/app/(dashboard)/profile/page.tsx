'use client';
import React, { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';

interface UserProfile {
    username: string;
    email: string;
    words_learned: number;
    xp_points: number;
    level: number;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = getCookie('token');
            if (!token) return;

            try {
                const res = await fetch('http://localhost:8080/api/v1/user/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                }
            } catch (err) {
                console.error("Failed to load profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#AF2024] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[700px] mx-auto flex flex-col gap-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
                <p className="text-[15px] text-gray-500 font-medium">
                    View your personal details and learning progress.
                </p>
            </header>

            <div className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 border-b border-gray-100 pb-10">
                    <div className="w-32 h-32 rounded-full bg-[#FCF4F4] text-[#AF2024] font-bold flex items-center justify-center text-5xl shadow-sm border-4 border-white">
                        {profile?.username.charAt(0).toUpperCase() || 'U'}
                    </div>

                    <div className="flex flex-col items-center sm:items-start text-center sm:text-left mt-2">
                        <h2 className="text-3xl font-bold text-gray-900 mb-1">{profile?.username}</h2>
                        <p className="text-gray-500 font-medium mb-4">{profile?.email}</p>

                        <div className="flex gap-3">
                            <span className="bg-[#FFF8E6] text-[#C7912E] px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-sm">
                                <span className="text-lg">⚡</span> {profile?.xp_points} XP
                            </span>
                            <span className="bg-[#FDE8E8] text-[#AF2024] px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-sm">
                                <span className="text-lg">⭐</span> Lvl {profile?.level}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="pt-10">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Learning Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                            <p className="text-gray-500 text-sm font-bold mb-1 uppercase tracking-wider">Words Mastered</p>
                            <p className="text-3xl font-bold text-[#AF2024]">{profile?.words_learned}</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                            <p className="text-gray-500 text-sm font-bold mb-1 uppercase tracking-wider">Current Streak</p>
                            <p className="text-3xl font-bold text-[#C7912E]">1 Day</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
