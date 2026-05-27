import React from 'react';
import { Zap, Target, BookOpen, Flame } from 'lucide-react';

export default function Dashboard({ userStats = { name: 'Student', xp: 120, level: 2, streak: 5 } }) {
    return (
        <div className="flex-1 bg-slate-50 min-h-screen p-10">
            {/* Header */}
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage your academic and personal growth journey.</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                    <div className="w-10 h-10 bg-brand-lightBlue text-brand-blue rounded-full flex items-center justify-center font-bold">
                        {userStats.name[0]}
                    </div>
                    <div>
                        <p className="text-sm font-semibold">{userStats.name}</p>
                        <p className="text-xs text-gray-400">Level {userStats.level}</p>
                    </div>
                </div>
            </header>

            {/* Hero Level Tracking Banner */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-brand-lightBlue text-brand-blue rounded-xl">
                        <Zap size={28} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Level {userStats.level} Learner</h3>
                        <p className="text-sm text-gray-400">Earn XP by completing tasks and interacting with your study materials.</p>
                    </div>
                </div>
                <div className="w-full md:w-64">
                    <div className="flex justify-between text-xs font-semibold mb-2">
                        <span>XP: {userStats.xp} / {(userStats.level) * 100}</span>
                        <span>{Math.round((userStats.xp / ((userStats.level) * 100)) * 100)}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-brand-blue transition-all duration-500"
                            style={{ width: `${(userStats.xp / ((userStats.level) * 100)) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Activity Overview Cards */}
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Activity Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-4xl font-bold block">{userStats.streak}</span>
                        <span className="text-sm text-gray-400 font-medium">Daily Streak</span>
                    </div>
                    <div className="p-3 bg-orange-50 text-orange-500 rounded-xl">
                        <Flame size={24} />
                    </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-4xl font-bold block">{userStats.xp}</span>
                        <span className="text-sm text-gray-400 font-medium">Total XP Points</span>
                    </div>
                    <div className="p-3 bg-brand-lightBlue text-brand-blue rounded-xl">
                        <Target size={24} />
                    </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-4xl font-bold block">Active</span>
                        <span className="text-sm text-gray-400 font-medium">Aether Core</span>
                    </div>
                    <div className="p-3 bg-green-50 text-green-500 rounded-xl">
                        <BookOpen size={24} />
                    </div>
                </div>
            </div>
        </div>
    );
}