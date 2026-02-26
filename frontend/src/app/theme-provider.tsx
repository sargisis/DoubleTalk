'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';

interface ThemeContextType {
    isDark: boolean;
    setTheme: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // Lazy initialize to avoid flash without triggering effect cascaded renders
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark';
        }
        return false;
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        }

        // Fetch user's preference from database
        const initTheme = async () => {
            const token = getCookie('token');
            if (!token) return;

            try {
                const res = await fetch('http://localhost:8080/api/v1/user/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.dark_mode) {
                        setIsDark(true);
                        document.documentElement.classList.add('dark');
                        localStorage.setItem('theme', 'dark');
                    } else {
                        setIsDark(false);
                        document.documentElement.classList.remove('dark');
                        localStorage.setItem('theme', 'light');
                    }
                }
            } catch {
                // Silently handle auth errors on initial load
            }
        };
        initTheme();
    }, []);

    const setTheme = (dark: boolean) => {
        setIsDark(dark);
        if (dark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    // If we only want to render children once we know the theme (to avoid flashes),
    // we could return null here, but usually it's fine.

    return (
        <ThemeContext.Provider value={{ isDark, setTheme }}>
            <div className="min-h-screen transition-colors duration-300 bg-[#FCF4F4] dark:bg-[#0f172a] text-gray-900 dark:text-white">
                {children}
            </div>
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
