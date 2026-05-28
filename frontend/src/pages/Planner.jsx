import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Circle, Flag, Plus, Route, Target } from 'lucide-react';
import { apiRequest } from '../api';
import { GlassPanel, KineticButton, Reveal, SectionKicker } from '../components/Cinematic';

export default function Planner({ onStatsUpdate }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('daily');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await apiRequest('/tasks');
        setTasks(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTasks();
  }, []);

  const completedCount = useMemo(() => tasks.filter((task) => task.completed).length, [tasks]);
  const completion = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  const createTask = async (event) => {
    event.preventDefault();
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
      setTasks((prev) => prev.map((task) => (task._id === id ? { ...task, completed: true } : task)));
      onStatsUpdate({ xp: result.xp, level: result.level });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-16">
      <Reveal>
        <header className="grid gap-8 lg:grid-cols-[1fr_25rem] lg:items-end">
          <div>
            <SectionKicker icon={Route}>Growth trajectory</SectionKicker>
            <h1 className="mt-6 max-w-5xl text-[clamp(3.4rem,8vw,7.5rem)] font-black leading-[0.86] tracking-[-0.08em]">
              A roadmap that feels inevitable.
            </h1>
          </div>
          <GlassPanel className="p-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">Trajectory completion</p>
                <div className="mt-3 text-6xl font-black tracking-[-0.06em]">{completion}%</div>
              </div>
              <Target className="mb-2 text-accent-indigo" size={34} />
            </div>
            <div className="mt-6 h-1 overflow-hidden rounded-full bg-white/10">
              <motion.div className="h-full bg-white" animate={{ width: `${completion}%` }} transition={{ duration: 0.8 }} />
            </div>
          </GlassPanel>
        </header>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-[25rem_1fr]">
        <Reveal>
          <GlassPanel className="sticky top-28 p-6 md:p-7">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">New milestone</p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">Shape the next move</h2>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-accent-indigo">
                <Flag size={22} />
              </div>
            </div>

            <form onSubmit={createTask} className="space-y-4">
              <label className="block">
                <span className="mb-2 ml-1 block text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Objective</span>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Finish calculus practice set"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-accent-indigo/60"
                />
              </label>
              <label className="block">
                <span className="mb-2 ml-1 block text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Intensity</span>
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  className="w-full appearance-none rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-white outline-none transition focus:border-accent-indigo/60"
                >
                  <option value="daily" className="bg-[#111116]">Daily ritual · 10 XP</option>
                  <option value="exam" className="bg-[#111116]">Exam push · 30 XP</option>
                </select>
              </label>
              <KineticButton type="submit" className="w-full">
                <Plus size={15} /> Save milestone
              </KineticButton>
            </form>
          </GlassPanel>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black uppercase tracking-[0.24em] text-white/40">Active sequence</h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/30">{tasks.length} milestones</span>
            </div>

            <div className="relative space-y-4">
              <div className="absolute bottom-10 left-6 top-10 hidden w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent md:block" />
              <AnimatePresence mode="popLayout">
                {tasks.map((task, index) => (
                  <motion.div
                    key={task._id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: task.completed ? 0.48 : 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.35 }}
                  >
                    <GlassPanel interactive={!task.completed} className="p-5 md:p-6">
                      <div className="flex items-center gap-5">
                        <button
                          onClick={() => !task.completed && completeTask(task._id)}
                          disabled={task.completed}
                          className={`relative z-10 rounded-full border p-2.5 transition ${
                            task.completed
                              ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                              : 'border-white/10 bg-[#08080b] text-white/35 hover:border-white/35 hover:text-white'
                          }`}
                        >
                          {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/25">Step {String(index + 1).padStart(2, '0')}</span>
                            <span className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] ${
                              task.type === 'exam'
                                ? 'border-accent-violet/25 bg-accent-violet/10 text-accent-violet'
                                : 'border-accent-indigo/25 bg-accent-indigo/10 text-accent-indigo'
                            }`}>
                              {task.type}
                            </span>
                          </div>
                          <p className={`truncate text-lg font-bold tracking-[-0.03em] ${task.completed ? 'text-white/35 line-through' : 'text-white'}`}>{task.title}</p>
                        </div>
                        <span className={`font-mono text-xs font-black ${task.completed ? 'text-white/25' : 'text-white/70'}`}>+{task.xpReward} XP</span>
                      </div>
                    </GlassPanel>
                  </motion.div>
                ))}
              </AnimatePresence>

              {tasks.length === 0 && (
                <GlassPanel className="p-12 text-center">
                  <p className="text-sm font-bold uppercase tracking-[0.22em] text-white/30">No milestones yet. Add one to begin the arc.</p>
                </GlassPanel>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
