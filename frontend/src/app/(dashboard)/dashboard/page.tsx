import React from 'react';

const LightningIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="#F4B400" stroke="#F4B400" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
const StarOutlineIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#AF2024" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const ClockIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const PlayIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l14 8-14 8V4z" /></svg>;
const ChatIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const StarFilledIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="#F4B400"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>;

export default function Dashboard() {
    return (
        <div className="max-w-[1000px] mx-auto flex flex-col gap-8">
            {/* Top Header Row */}
            <header className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Bienvenido de nuevo, Alex!</h1>
                    <p className="text-[15px] text-gray-500 font-medium">
                        You&apos;re on a 12-day streak! Keep it up. <span className="text-lg ml-1">🔥</span>
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {/* XP Block */}
                    <div className="bg-white rounded-2xl shadow-sm px-5 py-3 flex items-center gap-4 border border-gray-50">
                        <div className="w-10 h-10 rounded-full bg-[#FFF5E5] flex items-center justify-center">
                            <LightningIcon />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 tracking-wider">XP POINTS</span>
                            <span className="text-lg font-bold text-gray-900 leading-tight">2,450</span>
                        </div>
                    </div>
                    {/* Level Block */}
                    <div className="bg-white rounded-2xl shadow-sm px-5 py-3 flex items-center gap-4 border border-gray-50">
                        <div className="w-10 h-10 rounded-full bg-[#FDE8E8] flex items-center justify-center">
                            <StarOutlineIcon />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 tracking-wider">LEVEL</span>
                            <span className="text-lg font-bold text-gray-900 leading-tight">14</span>
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
                        <button className="bg-white text-[#AF2024] hover:bg-gray-50 transition-colors px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2.5 shadow-sm text-[15px]">
                            <PlayIcon />
                            Continuar aprendiendo
                        </button>
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
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeDasharray="264" strokeDashoffset="92.4" className="transition-all duration-1000 ease-out" />
                    </svg>
                    <span className="absolute text-3xl font-bold text-white/90">65%</span>
                </div>
            </section>

            {/* Stats Cards Row */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-[1.8rem] p-7 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FCF4F4]/70 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500"></div>
                    <div className="relative z-10">
                        <p className="text-[14px] font-medium text-gray-500 mb-1.5">Words Learned</p>
                        <p className="text-[2rem] font-bold text-[#AF2024]">843</p>
                    </div>
                </div>
                <div className="bg-white rounded-[1.8rem] p-7 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFFAF0]/80 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500"></div>
                    <div className="relative z-10">
                        <p className="text-[14px] font-medium text-gray-500 mb-1.5">Hours Spent</p>
                        <p className="text-[2rem] font-bold text-[#C7912E]">24.5</p>
                    </div>
                </div>
                <div className="bg-white rounded-[1.8rem] p-7 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FCF4F4]/70 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500"></div>
                    <div className="relative z-10">
                        <p className="text-[14px] font-medium text-gray-500 mb-1.5">Accuracy</p>
                        <p className="text-[2rem] font-bold text-[#AF2024]">94%</p>
                    </div>
                </div>
            </section>

            {/* Recent Lessons */}
            <section className="mt-2 text-gray-900">
                <h3 className="text-[1.3rem] font-bold mb-5 ml-1">Recent Lessons</h3>
                <div className="flex flex-col gap-3.5">
                    {[1, 2, 3].map((num) => (
                        <div key={num} className="bg-white rounded-[1.4rem] p-4 pr-6 flex items-center justify-between shadow-[0_4px_16px_-8px_rgba(0,0,0,0.03)] border border-transparent hover:border-gray-50 transition-colors">
                            <div className="flex items-center gap-5">
                                <div className="w-[42px] h-[42px] rounded-full bg-[#FCF4F4] text-[#AF2024] font-bold flex items-center justify-center text-[15px]">
                                    {num}
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-bold text-[15px]">Basic Greetings & Introductions</span>
                                    <span className="text-[13px] text-gray-400 font-medium">Completed 2 days ago</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex gap-1 hidden sm:flex">
                                    <StarFilledIcon />
                                    <StarFilledIcon />
                                    <StarFilledIcon />
                                </div>
                                <span className="font-bold text-[14px] w-12 text-right">100%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
