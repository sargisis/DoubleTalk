'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCookie } from 'cookies-next';

const LightningIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="#F4B400" stroke="#F4B400" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
const StarOutlineIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#AF2024" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const ClockIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const PlayIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l14 8-14 8V4z" /></svg>;
const ChatIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;

interface UserProfile {
    username: string;
    email: string;
    words_learned: number;
    xp_points: number;
    level: number;
}

export default function Dashboard() {
    const [profile, setProfile] = useState<UserProfile | null>(null);

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
            }
        };
        fetchProfile();
    }, []);

    const username = profile?.username || 'Learner';
    const words = profile?.words_learned || 0;
    const xp = profile?.xp_points || 0;
    const level = profile?.level || 1;

    return (
        <div className="max-w-[1000px] mx-auto flex flex-col gap-8">
            {/* Top Header Row */}
            <header className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Witaj, {username}!</h1>
                    <p className="text-[15px] text-gray-500 dark:text-gray-400 font-medium">
                        Przed tobą pierwszy dzień nauki. Powodzenia! <span className="text-lg ml-1"></span>
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    {/* XP Block */}
                    <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-sm px-5 py-3 flex items-center gap-4 border border-gray-50 dark:border-[#1e293b]">
                        <div className="w-10 h-10 rounded-full bg-[#FFF5E5] dark:bg-yellow-900/30 flex items-center justify-center">
                            <LightningIcon />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-wider">XP POINTS</span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{xp}</span>
                        </div>
                    </div>
                    {/* Level Block */}
                    <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-sm px-5 py-3 flex items-center gap-4 border border-gray-50 dark:border-[#1e293b]">
                        <div className="w-10 h-10 rounded-full bg-[#FDE8E8] dark:bg-red-900/20 flex items-center justify-center">
                            <StarOutlineIcon />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-wider">LEVEL</span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{level}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Card */}
            <section className="bg-gradient-to-r from-[#AF2024] to-[#99151A] rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-md flex flex-col md:flex-row justify-between items-center z-0">
                {/* Background design glow */}
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/5 rounded-full blur-3xl -z-10"></div>
                <div className="absolute right-40 -bottom-20 w-60 h-60 bg-black/10 rounded-full blur-2xl -z-10"></div>

                <div className="max-w-[32rem] z-10 w-full mb-8 md:mb-0">
                    <div className="bg-white/10 w-fit rounded-full px-4 py-1.5 flex items-center gap-2 mb-6 backdrop-blur-sm border border-white/10">
                        <ClockIcon />
                        <span className="text-[13px] font-medium text-white/90">20 min left today</span>
                    </div>
                    <h2 className="text-[2.2rem] font-bold text-white mb-3">Unit 4: Ordering Food</h2>
                    <p className="text-white/80 text-[15px] leading-relaxed mb-8">
                        Master the art of ordering in a restaurant. Learn vocabulary for menus, drinks, and paying the bill.
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                        <Link href="/courses" className="bg-white text-[#AF2024] hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:border dark:border-white/20 dark:hover:bg-white/20 transition-colors px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2.5 shadow-sm text-[15px]">
                            <PlayIcon />
                            Continue learning
                        </Link>
                        <button className="bg-white/10 hover:bg-white/20 transition-colors border border-white/20 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2.5 backdrop-blur-sm text-[15px]">
                            <ChatIcon />
                            Practice Chat
                        </button>
                    </div>
                </div>

                {/* Progress Circle right side */}
                <div className="w-40 h-40 relative z-10 flex-shrink-0 flex items-center justify-center md:mr-4">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeDasharray="264" strokeDashoffset="264" className="transition-all duration-1000 ease-out" />
                    </svg>
                    <span className="absolute text-3xl font-bold text-white/90">0%</span>
                </div>
            </section>

            {/* Stats Cards Row */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#0f172a] rounded-[1.8rem] p-7 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] dark:shadow-none border border-transparent dark:border-[#1e293b] relative overflow-hidden group transition-colors">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FCF4F4]/70 dark:bg-red-900/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500"></div>
                    <div className="relative z-10">
                        <p className="text-[14px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">Words Learned</p>
                        <p className="text-[2rem] font-bold text-[#AF2024] dark:text-red-400">{words}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#0f172a] rounded-[1.8rem] p-7 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] dark:shadow-none border border-transparent dark:border-[#1e293b] relative overflow-hidden group transition-colors">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFFAF0]/80 dark:bg-yellow-900/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500"></div>
                    <div className="relative z-10">
                        <p className="text-[14px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">Hours Spent</p>
                        <p className="text-[2rem] font-bold text-[#C7912E] dark:text-yellow-500">0.0</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#0f172a] rounded-[1.8rem] p-7 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] dark:shadow-none border border-transparent dark:border-[#1e293b] relative overflow-hidden group transition-colors">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FCF4F4]/70 dark:bg-red-900/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500"></div>
                    <div className="relative z-10">
                        <p className="text-[14px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">Accuracy</p>
                        <p className="text-[2rem] font-bold text-[#AF2024] dark:text-red-400">0%</p>
                    </div>
                </div>
            </section>

            {/* Recent Lessons */}
            <section className="mt-2 text-gray-900 dark:text-white pb-12">
                <h3 className="text-[1.3rem] font-bold mb-5 ml-1">Recent Lessons</h3>
                <div className="bg-white dark:bg-[#0f172a] rounded-[1.4rem] p-8 flex flex-col items-center justify-center shadow-[0_4px_16px_-8px_rgba(0,0,0,0.03)] dark:shadow-none border border-gray-100 dark:border-[#1e293b] text-center transition-colors">
                    <div className="w-16 h-16 bg-[#FCF4F4] dark:bg-gray-800 rounded-full flex items-center justify-center text-3xl mb-4">
                        🌱
                    </div>
                    <h4 className="font-bold text-lg mb-2">No lessons completed yet</h4>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Head over to the Courses section to start learning Polish!</p>
                </div>
            </section>
        </div>
    );
}
