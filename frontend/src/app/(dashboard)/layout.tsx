import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';

// Icons as basic SVG Components
const HomeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const BookIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;
const TrophyIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path></svg>;
const UserIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const SettingsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const CardsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="16" height="16" rx="2" ry="2"></rect></svg>;
const ChatIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen font-sans">
            {/* Sidebar */}
            <aside className="w-[260px] bg-white border-r border-[#EEEEEE] dark:bg-[#0f172a] dark:border-[#1e293b] flex flex-col justify-between hidden lg:flex sticky top-0 h-screen transition-colors duration-300">
                <div className="p-6">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-10 pl-2">
                        <div className="w-10 h-10 rounded-[0.4rem] bg-[#AF2024] text-white font-bold flex items-center justify-center text-lg">
                            DT
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">Double Talk</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-col gap-2">
                        <Link href="/dashboard" className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-500 hover:text-gray-900 dark:hover:bg-[#1e293b] dark:text-gray-400 dark:hover:text-white font-medium transition-colors">
                            <HomeIcon />
                            Dashboard
                        </Link>
                        <Link href="/courses" className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-[#1e293b] dark:text-gray-400 dark:hover:text-white font-medium transition-colors">
                            <BookIcon />
                            Courses
                        </Link>
                        <Link href="/flashcards" className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-[#1e293b] dark:text-gray-400 dark:hover:text-white font-medium transition-colors">
                            <CardsIcon />
                            Words
                        </Link>
                        {/* <Link href="/chat" className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-[#1e293b] dark:text-gray-400 dark:hover:text-white font-medium transition-colors relative">
                            <ChatIcon />
                            AI Chat
                            <span className="absolute right-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide">New</span>
                        </Link> */}
                        <Link href="/leaderboard" className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-[#1e293b] dark:text-gray-400 dark:hover:text-white font-medium transition-colors">
                            <TrophyIcon />
                            Leaderboard
                        </Link>
                        <Link href="/profile" className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-[#1e293b] dark:text-gray-400 dark:hover:text-white font-medium transition-colors">
                            <UserIcon />
                            Profile
                        </Link>
                        <Link href="/settings" className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-[#1e293b] dark:text-gray-400 dark:hover:text-white font-medium transition-colors">
                            <SettingsIcon />
                            Settings
                        </Link>
                    </nav>
                </div>

                {/* Language Switcher */}
                <div className="p-6 border-t border-[#EEEEEE] dark:border-[#1e293b]">
                    <span className="text-[11px] font-bold text-gray-400 mb-4 block tracking-wider uppercase">Switch Language</span>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#1e293b] cursor-pointer transition-colors">
                            <div className="flex items-center gap-3">
                                <span className="text-xl drop-shadow-sm">🇬🇧</span>
                                <span className="text-[15px] font-medium text-gray-700 dark:text-gray-300">English</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-[#AF2024] cursor-pointer shadow-sm transition-transform hover:scale-[1.02]">
                            <div className="flex items-center gap-3">
                                <span className="text-xl drop-shadow-sm">🇵🇱</span>
                                <span className="text-[15px] font-medium text-white">Polish</span>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-white opacity-90"></div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 lg:p-12 overflow-y-auto w-full">
                {children}
            </main>
        </div>
    );
}
