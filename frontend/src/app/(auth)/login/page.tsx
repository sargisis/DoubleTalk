'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { setCookie } from 'cookies-next';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('http://localhost:8080/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to login');
            }

            setCookie('token', data.token, { maxAge: 60 * 60 * 24 * 7 }); // 1 week
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FCF4F4] flex flex-col justify-center items-center p-4">
            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Back to Home
            </Link>

            <div className="w-full max-w-[420px] bg-white rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex justify-center mb-8">
                    <div className="w-14 h-14 rounded-xl bg-[#AF2024] text-white font-bold flex items-center justify-center text-2xl shadow-sm">DT</div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">Welcome Back</h1>
                <p className="text-center text-gray-500 mb-8 font-medium">Sign in to continue your progress</p>

                {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">{error}</div>}

                <form className="flex flex-col gap-5" onSubmit={handleLogin}>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="alex@example.com"
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AF2024]/20 focus:border-[#AF2024] transition-all text-gray-900"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-sm font-bold text-gray-700">Password</label>
                            <a href="#" className="text-xs font-bold text-[#AF2024] hover:underline">Forgot?</a>
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AF2024]/20 focus:border-[#AF2024] transition-all text-gray-900"
                        />
                    </div>

                    <button disabled={loading} className="w-full bg-[#AF2024] hover:bg-[#99151A] text-white font-bold py-4 rounded-xl mt-2 transition-all shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-70">
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-gray-500 font-medium">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="text-[#AF2024] font-bold hover:underline">Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
