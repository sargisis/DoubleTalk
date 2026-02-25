import React from 'react';
import Link from 'next/link';

// Icons
const GlobeIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;
const SparkleIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"></path></svg>;

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FCF4F4] text-gray-900 font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="max-w-[1200px] mx-auto flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[0.4rem] bg-[#AF2024] text-white font-bold flex items-center justify-center text-lg">
            DT
          </div>
          <span className="text-xl font-bold">Double Talk</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="font-bold text-gray-600 hover:text-gray-900 transition-colors">
            Log in
          </Link>
          <Link href="/register" className="bg-[#AF2024] text-white px-6 py-2.5 rounded-full font-bold hover:bg-[#99151A] transition-colors shadow-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative max-w-[1200px] mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-100/50 rounded-full blur-[100px] -z-10"></div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[#AF2024] font-bold text-sm mb-8 shadow-sm border border-red-50">
          <SparkleIcon />
          <span>The smarter way to learn</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 max-w-[800px] leading-[1.1]">
          Master Languages <span className="text-[#AF2024]">Faster.</span> <br />
          Speak with <span className="text-[#C7912E]">Confidence.</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-[600px] leading-relaxed font-medium">
          Double Talk connects you with native context, real-world vocabulary, and AI-driven practice to make learning natural and effortless.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Link href="/register" className="w-full sm:w-auto bg-[#AF2024] hover:bg-[#99151A] text-white text-lg font-bold px-10 py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2">
            Start Learning Free
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </Link>
          <Link href="/dashboard" className="w-full sm:w-auto bg-white text-gray-900 border border-gray-200 text-lg font-bold px-10 py-4 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center">
            View Dashboard Demo
          </Link>
        </div>
      </header>

      {/* Features Showcase */}
      <section className="bg-white py-24 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#FCF4F4] p-8 rounded-[2rem] border border-red-50">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#AF2024] mb-6">
                <GlobeIcon />
              </div>
              <h3 className="text-xl font-bold mb-3">Real-World Context</h3>
              <p className="text-gray-600 font-medium">Learn phrases you&apos;ll actually use, not just textbook grammar.</p>
            </div>

            <div className="bg-[#FFF5E5] p-8 rounded-[2rem] border border-orange-50">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#C7912E] mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Earn XP & Rewards</h3>
              <p className="text-gray-600 font-medium">Stay motivated with streaks, leaderboards, and daily goals.</p>
            </div>

            <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-900 mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">AI Speaking Partners</h3>
              <p className="text-gray-600 font-medium">Practice speaking out loud without fear of making mistakes.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
