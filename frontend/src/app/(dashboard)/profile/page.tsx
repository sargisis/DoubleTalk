'use client';
import React, { useEffect, useState, useRef } from 'react';
import { getCookie } from 'cookies-next';
import AvatarEditor from 'react-avatar-editor';

interface UserProfile {
    username: string;
    email: string;
    avatar_url: string;
    words_learned: number;
    xp_points: number;
    level: number;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Editing properties
    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState('');
    const [updateStatus, setUpdateStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const editorRef = useRef<AvatarEditor>(null);

    // Avatar Editor state
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imageScale, setImageScale] = useState(1);

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
                    setEditName(data.username);
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

    const handleSaveName = async () => {
        if (!editName.trim() || editName === profile?.username) {
            setIsEditingName(false);
            setEditName(profile?.username || '');
            return;
        }

        setUpdateStatus('saving');
        const token = getCookie('token');

        try {
            const res = await fetch('http://localhost:8080/api/v1/user/me', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: editName })
            });

            if (res.ok) {
                const data = await res.json();
                setProfile(prev => prev ? { ...prev, username: data.username } : null);
                setUpdateStatus('success');
                setIsEditingName(false);
                setTimeout(() => setUpdateStatus('idle'), 2000);
            } else {
                throw new Error("Failed to update");
            }
        } catch (err) {
            console.error(err);
            setUpdateStatus('error');
            setEditName(profile?.username || ''); // Revert on err
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert("Please select an image file.");
            return;
        }

        setSelectedImage(file);
        // Reset file input so same file can be chosen again if needed
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSaveAvatar = async () => {
        if (!editorRef.current) return;

        // Get the scaled image cropped by the editor
        const canvas = editorRef.current.getImageScaledToCanvas();
        const base64String = canvas.toDataURL('image/jpeg', 0.8);

        setSelectedImage(null); // Close modal
        setUpdateStatus('saving');
        const token = getCookie('token');

        try {
            const res = await fetch('http://localhost:8080/api/v1/user/me', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ avatar_url: base64String })
            });

            if (res.ok) {
                const data = await res.json();
                setProfile(prev => prev ? { ...prev, avatar_url: data.avatar_url } : null);
                setUpdateStatus('success');
                setTimeout(() => setUpdateStatus('idle'), 2000);
            } else {
                throw new Error("Failed to update avatar");
            }
        } catch (err) {
            console.error(err);
            setUpdateStatus('error');
        }
    };

    return (
        <div className="max-w-[700px] mx-auto flex flex-col gap-8 relative">
            {/* Avatar Editor Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                    <div className="bg-white dark:bg-[#0f172a] rounded-[2rem] p-8 shadow-2xl max-w-md w-full flex flex-col items-center">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Adjust your Avatar</h3>

                        <div className="rounded-full overflow-hidden border-4 border-gray-100 mb-6">
                            <AvatarEditor
                                ref={editorRef}
                                image={selectedImage}
                                width={200}
                                height={200}
                                border={0}
                                borderRadius={100}
                                color={[255, 255, 255, 0.6]} // RGBA
                                scale={imageScale}
                                rotate={0}
                            />
                        </div>

                        <div className="w-full flex items-center gap-4 mb-8">
                            <span className="text-gray-400 font-bold text-sm">Zoom</span>
                            <input
                                type="range"
                                min="1"
                                max="3"
                                step="0.01"
                                value={imageScale}
                                onChange={(e) => setImageScale(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#AF2024]"
                            />
                        </div>

                        <div className="flex gap-4 w-full">
                            <button
                                onClick={() => { setSelectedImage(null); setImageScale(1); }}
                                className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveAvatar}
                                className="flex-1 py-3 bg-[#AF2024] hover:bg-[#99151A] text-white font-bold rounded-xl transition-colors shadow-md shadow-red-900/10"
                            >
                                Save Avatar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Profile</h1>
                <p className="text-[15px] text-gray-500 dark:text-gray-400 font-medium">
                    View your personal details and learning progress.
                </p>
            </header>

            <div className="bg-white dark:bg-[#0f172a] rounded-[2rem] p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-50 dark:border-[#1e293b] transition-colors duration-300">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 border-b border-gray-100 dark:border-gray-800 pb-10">
                    <div
                        className="w-32 h-32 flex-shrink-0 rounded-full bg-[#FCF4F4] dark:bg-gray-800 text-[#AF2024] dark:text-red-400 font-bold flex items-center justify-center text-5xl shadow-sm border-4 border-white dark:border-gray-900 cursor-pointer relative group overflow-hidden"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            profile?.username.charAt(0).toUpperCase() || 'U'
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs uppercase tracking-widest flex flex-col items-center gap-1">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                Upload
                            </span>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleAvatarChange}
                            className="hidden"
                        />
                    </div>

                    <div className="flex flex-col items-center sm:items-start text-center sm:text-left mt-2 flex-1">
                        {isEditingName ? (
                            <div className="flex items-center gap-3 mb-2">
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="text-2xl font-bold text-gray-900 dark:text-white border-b-2 border-[#AF2024] bg-transparent outline-none max-w-[200px]"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveName();
                                        if (e.key === 'Escape') {
                                            setIsEditingName(false);
                                            setEditName(profile?.username || '');
                                        }
                                    }}
                                />
                                <button onClick={handleSaveName} disabled={updateStatus === 'saving'} className="text-sm bg-[#AF2024] text-white px-3 py-1.5 rounded-lg disabled:opacity-50">Save</button>
                                <button onClick={() => { setIsEditingName(false); setEditName(profile?.username || ''); }} className="text-sm bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-3 py-1.5 rounded-lg">Cancel</button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 mb-1 group">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{profile?.username}</h2>
                                <button onClick={() => setIsEditingName(true)} className="text-gray-300 dark:text-gray-600 hover:text-[#AF2024] dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                                {updateStatus === 'success' && <span className="text-green-500 text-sm ml-2 font-medium">Saved!</span>}
                            </div>
                        )}
                        <p className="text-gray-500 dark:text-gray-400 font-medium mb-4">{profile?.email}</p>

                        <div className="flex gap-3">
                            <span className="bg-[#FFF8E6] dark:bg-yellow-900/30 text-[#C7912E] dark:text-yellow-500 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-sm dark:shadow-none">
                                <span className="text-lg">⚡</span> {profile?.xp_points} XP
                            </span>
                            <span className="bg-[#FDE8E8] dark:bg-red-900/20 text-[#AF2024] dark:text-red-400 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-sm dark:shadow-none">
                                <span className="text-lg">⭐</span> Lvl {profile?.level}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="pt-10">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Learning Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 transition-colors">
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mb-1 uppercase tracking-wider">Words Mastered</p>
                            <p className="text-3xl font-bold text-[#AF2024] dark:text-red-400">{profile?.words_learned}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 transition-colors">
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mb-1 uppercase tracking-wider">Current Streak</p>
                            <p className="text-3xl font-bold text-[#C7912E] dark:text-yellow-500">1 Day</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
