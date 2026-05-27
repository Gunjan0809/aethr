import React, { useState } from 'react';
import { Send, Sparkles, Bot } from 'lucide-react';
import { apiRequest } from '../api';

export default function AIMentor() {
    const [messages, setMessages] = useState([{ sender: 'ai', text: 'Hello! I am your Aether AI Mentor. How can I help you study today?' }]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { sender: 'user', text: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const data = await apiRequest('/ai/chat', {
                method: 'POST',
                body: JSON.stringify({ question: input }),
            });

            setMessages((prev) => [...prev, { sender: 'ai', text: data.response }]);
        } catch (err) {
            setMessages((prev) => [...prev, { sender: 'ai', text: err.message || 'Sorry, I encountered an issue handling that request.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 bg-slate-50 min-h-screen p-10 ml-64 flex flex-col h-screen">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                    AI Mentor <Sparkles className="text-brand-blue" size={24} />
                </h2>
                <p className="text-sm text-gray-500 mt-1">Generate dynamic notes, study summaries, and custom explanations.</p>
            </div>

            <div className="flex-1 bg-white border border-gray-100 rounded-2xl flex flex-col overflow-hidden shadow-sm">
                {/* Chat History */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-3 max-w-xl items-start ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`p-2 rounded-xl ${msg.sender === 'user' ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-800'}`}>
                                    {msg.sender === 'user' ? 'You' : <Bot size={18} />}
                                </div>
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-brand-blue text-white' : 'bg-gray-50 text-gray-800'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-50 text-gray-400 text-xs p-4 rounded-2xl animate-pulse">Thinking...</div>
                        </div>
                    )}
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-3 bg-white">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask anything about your study topics..."
                        className="flex-1 border border-gray-200 rounded-xl px-4 text-sm focus:outline-none focus:border-brand-blue"
                    />
                    <button type="submit" className="p-3 bg-brand-blue text-white rounded-xl hover:bg-brand-darkBlue transition-all">
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
