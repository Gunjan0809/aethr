import React, { useState, useEffect } from 'react';
import { Calendar, Plus, CheckCircle2, Circle } from 'lucide-react';
import { apiRequest } from '../api';

export default function Planner({ onStatsUpdate }) {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState('');
    const [type, setType] = useState('daily');

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const data = await apiRequest('/tasks');
            setTasks(data);
        } catch (err) {
            console.error(err);
        }
    };

    const createTask = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        try {
            const newTask = await apiRequest('/tasks', {
                method: 'POST',
                body: JSON.stringify({ title, type, xpReward: type === 'exam' ? 30 : 10 }),
            });
            setTasks((prev) => [...prev, newTask]);
            setTitle('');
        } catch (err) {
            alert(err.message);
        }
    };

    const completeTask = async (id) => {
        try {
            const result = await apiRequest(`/tasks/${id}/complete`, { method: 'PATCH' });
            setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, completed: true } : t)));

            // Update User stats in App parent component for layout header
            onStatsUpdate({ xp: result.xp, level: result.level });
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="flex-1 bg-slate-50 min-h-screen p-10 ml-64">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900">Study Planner</h2>
                <p className="text-sm text-gray-500 mt-1">Plan exams and daily habits to unlock experience points.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Task Creator */}
                <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm h-fit">
                    <h3 className="font-bold text-lg mb-4">Add Task or Exam</h3>
                    <form onSubmit={createTask} className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Study Physics Chapter 3"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 mt-1 text-sm focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase">Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 mt-1 text-sm focus:outline-none"
                            >
                                <option value="daily">Daily Goal (10 XP)</option>
                                <option value="exam">Major Exam Tracker (30 XP)</option>
                            </select>
                        </div>
                        <button type="submit" className="w-full bg-brand-blue hover:bg-brand-darkBlue text-white py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2">
                            <Plus size={16} /> Save Task
                        </button>
                    </form>
                </div>

                {/* Task List */}
                <div className="lg:col-span-2 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                    <h3 className="font-bold text-lg mb-4">Active Schedule</h3>
                    <div className="space-y-3">
                        {tasks.map((task) => (
                            <div key={task._id} className="flex items-center justify-between p-4 rounded-xl border border-gray-50 bg-slate-50/50 hover:bg-slate-50 transition-all">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => !task.completed && completeTask(task._id)} disabled={task.completed}>
                                        {task.completed ? (
                                            <CheckCircle2 className="text-green-500" size={20} />
                                        ) : (
                                            <Circle className="text-gray-300 hover:text-brand-blue" size={20} />
                                        )}
                                    </button>
                                    <div>
                                        <p className={`text-sm font-semibold ${task.completed ? 'line-through text-gray-400' : 'text-slate-900'}`}>{task.title}</p>
                                        <span className="text-xs bg-brand-lightBlue text-brand-blue font-semibold px-2 py-0.5 rounded-full uppercase mt-1 inline-block">
                                            {task.type}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-brand-blue">{task.xpReward} XP</span>
                                </div>
                            </div>
                        ))}
                        {tasks.length === 0 && <p className="text-center text-sm text-gray-400 py-6">No tasks planned yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}