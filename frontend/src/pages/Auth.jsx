import React, { useState } from 'react';
import { apiRequest } from '../api';

export default function Auth({ onAuthSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isLogin ? '/auth/login' : '/auth/register';
        try {
            const data = await apiRequest(endpoint, {
                method: 'POST',
                body: JSON.stringify(formData),
            });
            localStorage.setItem('token', data.token);
            onAuthSuccess(data);
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm w-full max-w-md">
                <h2 className="text-2xl font-bold text-slate-900 text-center mb-1">Welcome to Aether</h2>
                <p className="text-sm text-gray-500 text-center mb-6">{isLogin ? 'Sign in to access your dashboard' : 'Create your free account'}</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase">Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 mt-1 text-sm focus:outline-none"
                            />
                        </div>
                    )}
                    <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 mt-1 text-sm focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase">Password</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 mt-1 text-sm focus:outline-none"
                        />
                    </div>
                    <button type="submit" className="w-full bg-brand-blue hover:bg-brand-darkBlue text-white py-3 rounded-xl font-semibold text-sm transition-all mt-4">
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>

                <button onClick={() => setIsLogin(!isLogin)} className="w-full text-center text-xs text-brand-blue font-semibold mt-4">
                    {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
                </button>
            </div>
        </div>
    );
}