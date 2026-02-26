'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteCookie, getCookie } from 'cookies-next';
import { useTheme } from '../../theme-provider';

interface SettingsData {
    email_notifications: boolean;
    dark_mode: boolean;
}

export default function SettingsPage() {
    const router = useRouter();
    const { setTheme } = useTheme();
    const [settings, setSettings] = useState<SettingsData>({
        email_notifications: true,
        dark_mode: false
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            const token = getCookie('token');
            if (!token) return;

            try {
                const res = await fetch('http://localhost:8080/api/v1/user/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setSettings({
                        email_notifications: data.email_notifications,
                        dark_mode: data.dark_mode
                    });
                }
            } catch (err) {
                console.error("Failed to load settings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const toggleSetting = async (key: keyof SettingsData) => {
        const newValue = !settings[key];

        // Optimistic UI update
        setSettings(prev => ({ ...prev, [key]: newValue }));

        if (key === 'dark_mode') {
            setTheme(newValue);
        }

        const token = getCookie('token');
        if (!token) return;

        try {
            await fetch('http://localhost:8080/api/v1/user/me', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ [key]: newValue })
            });
        } catch (err) {
            console.error("Failed to update setting", err);
            // Revert on error
            setSettings(prev => ({ ...prev, [key]: !newValue }));

            if (key === 'dark_mode') {
                setTheme(!newValue);
            }
        }
    };

    const handleLogout = () => {
        deleteCookie('token');
        router.push('/login');
    };

    return (
        <div className="max-w-[700px] mx-auto flex flex-col gap-8 transition-colors duration-300">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
                <p className="text-[15px] text-gray-500 dark:text-gray-400 font-medium">
                    Manage your account preferences.
                </p>
            </header>

            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <div className="w-8 h-8 border-4 border-[#AF2024] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="bg-white dark:bg-[#0f172a] rounded-[2rem] p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-50 dark:border-[#1e293b] flex flex-col gap-8 transition-colors duration-300">

                    {/* Account Section */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-3">Account Settings</h2>
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center py-2">
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">Email Notifications</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Receive daily reminders and progress updates.</p>
                                </div>
                                <div
                                    onClick={() => toggleSetting('email_notifications')}
                                    className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${settings.email_notifications ? 'bg-[#AF2024]' : 'bg-gray-200'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings.email_notifications ? 'right-1' : 'left-1'}`}></div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">Dark Mode</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Toggle dark appearance for the app.</p>
                                </div>
                                <div
                                    onClick={() => toggleSetting('dark_mode')}
                                    className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${settings.dark_mode ? 'bg-gray-800' : 'bg-gray-200'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings.dark_mode ? 'right-1' : 'left-1'}`}></div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Theme Danger Zone */}
                    <section className="pt-4">
                        <h2 className="text-xl font-bold text-red-600 dark:text-red-500 mb-6 border-b border-red-100 dark:border-red-900/30 pb-3">Danger Zone</h2>
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={handleLogout}
                                className="bg-white dark:bg-[#0f172a] border-2 border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold py-4 rounded-xl transition-colors text-left px-6 shadow-sm dark:shadow-none"
                            >
                                Log Out from all devices
                            </button>
                        </div>
                    </section>

                </div>
            )}
        </div>
    );
}
