'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { deleteCookie } from 'cookies-next';

export default function SettingsPage() {
    const router = useRouter();

    const handleLogout = () => {
        deleteCookie('token');
        router.push('/login');
    };

    return (
        <div className="max-w-[700px] mx-auto flex flex-col gap-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                <p className="text-[15px] text-gray-500 font-medium">
                    Manage your account preferences.
                </p>
            </header>

            <div className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col gap-8">

                {/* Account Section */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-3">Account Settings</h2>
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center py-2">
                            <div>
                                <h3 className="font-bold text-gray-900">Email Notifications</h3>
                                <p className="text-sm text-gray-500 font-medium">Receive daily reminders and progress updates.</p>
                            </div>
                            <div className="w-12 h-6 bg-[#AF2024] rounded-full relative cursor-pointer shadow-inner">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <div>
                                <h3 className="font-bold text-gray-900">Dark Mode</h3>
                                <p className="text-sm text-gray-500 font-medium">Toggle dark appearance for the app.</p>
                            </div>
                            <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer shadow-inner">
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Theme Danger Zone */}
                <section className="pt-4">
                    <h2 className="text-xl font-bold text-red-600 mb-6 border-b border-red-100 pb-3">Danger Zone</h2>
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={handleLogout}
                            className="bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 font-bold py-4 rounded-xl transition-colors text-left px-6 shadow-sm"
                        >
                            Log Out from all devices
                        </button>
                    </div>
                </section>

            </div>
        </div>
    );
}
