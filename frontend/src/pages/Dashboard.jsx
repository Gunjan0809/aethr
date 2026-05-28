import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, BookOpen, Calendar, Flame, Gauge, Sparkles, Target, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlassPanel, KineticButton, Reveal, SectionKicker } from '../components/Cinematic';
import { apiRequest } from '../api';
import { Pill } from '../components/FeaturePrimitives';

const studioCards = [
  {
    title: 'Knowledge Vault',
    eyebrow: 'Ingest',
    description: 'Upload PDFs and transform dense material into a searchable, AI-ready study archive.',
    path: '/vault',
    icon: BookOpen,
  },
  {
    title: 'Study Roadmap',
    eyebrow: 'Plan',
    description: 'Turn exams and daily goals into a focused trajectory with XP, streaks, and completion rituals.',
    path: '/planner',
    icon: Calendar,
  },
  {
    title: 'Aether Oracle',
    eyebrow: 'Synthesize',
    description: 'Ask questions, collapse ambiguity, and get concise explanations from your learning context.',
    path: '/mentor',
    icon: Sparkles,
  },
];

export default function Dashboard({ userStats = { name: 'Student', xp: 120, level: 2, streak: 5 } }) {
  const xpGoal = Math.max(userStats.level * 100, 100);
  const xpPercentage = Math.min(Math.round((userStats.xp / xpGoal) * 100), 100);
  const [summary, setSummary] = useState({ upcoming: [], today: [], overdue: [] });
  const [assets, setAssets] = useState({ flashcards: [], quizzes: [] });

  useEffect(() => {
    apiRequest('/deadlines/summary').then(setSummary).catch(() => {});
    Promise.all([apiRequest('/assets?type=flashcard&limit=3'), apiRequest('/assets?type=quiz&limit=3')])
      .then(([flashcards, quizzes]) => setAssets({ flashcards, quizzes }))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-24 md:space-y-32">
      <section className="relative grid min-h-[calc(100vh-8rem)] items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal className="relative z-10">
          <SectionKicker icon={Gauge}>Personal learning command</SectionKicker>
          <h1 className="mt-8 max-w-5xl text-[clamp(3.8rem,10vw,9.5rem)] font-black leading-[0.82] tracking-[-0.08em] text-white">
            Study with cinematic focus.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-white/54 md:text-xl">
            Welcome back, {userStats.name}. Aethr turns documents, goals, and AI guidance into one elegant operating layer for serious learning.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <KineticButton as={Link} to="/vault">Open vault</KineticButton>
            <Link
              to="/mentor"
              className="inline-flex items-center justify-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white/70 backdrop-blur-xl transition hover:border-white/25 hover:text-white"
            >
              Ask Oracle <ArrowUpRight size={15} />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <GlassPanel className="p-5 md:p-7">
            <div className="relative aspect-[0.92] overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#09090c] p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_34%,rgba(129,140,248,0.28),transparent_28%),radial-gradient(circle_at_70%_72%,rgba(168,85,247,0.18),transparent_32%)]" />
              <div className="absolute inset-6 rounded-full border border-white/10" />
              <div className="absolute inset-16 rounded-full border border-white/10" />
              <motion.div
                className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-white/[0.04] shadow-[0_0_90px_rgba(129,140,248,0.24)] backdrop-blur-xl"
                animate={{ rotate: 360 }}
                transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
              >
                <div className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_25px_rgba(255,255,255,0.8)]" />
              </motion.div>
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/40">Level {userStats.level}</span>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">Live</span>
                </div>
                <div>
                  <div className="text-[clamp(4rem,9vw,8rem)] font-black leading-none tracking-[-0.08em]">{xpPercentage}%</div>
                  <p className="mt-3 text-sm uppercase tracking-[0.22em] text-white/40">XP charge toward next level</p>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full bg-gradient-to-r from-white via-indigo-200 to-accent-violet"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPercentage}%` }}
                    transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            </div>
          </GlassPanel>
        </Reveal>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={Flame} label="Daily streak" value={userStats.streak} subtext="days in motion" delay={0} />
        <MetricCard icon={Zap} label="Total XP" value={userStats.xp} subtext={`${xpGoal} XP next threshold`} delay={0.08} />
        <MetricCard icon={Target} label="Workspace" value="Synced" subtext="vault, roadmap, oracle" delay={0.16} />
      </section>

      <section className="space-y-8">
        <Reveal>
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <SectionKicker>System modules</SectionKicker>
              <h2 className="mt-5 max-w-3xl text-4xl font-black tracking-[-0.05em] md:text-6xl">Everything important floats forward.</h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-white/45">
              No dashboard clutter. Each module behaves like a focused surface in a larger learning cockpit.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-5 lg:grid-cols-3">
          {studioCards.map((card, index) => (
            <Reveal key={card.title} delay={index * 0.08}>
              <Link to={card.path} className="group block h-full">
                <GlassPanel interactive className="flex h-full min-h-80 flex-col justify-between p-7">
                  <div>
                    <div className="mb-10 flex items-center justify-between">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-white/70 transition group-hover:text-white">
                        <card.icon size={22} />
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/30">{card.eyebrow}</span>
                    </div>
                    <h3 className="text-3xl font-black tracking-[-0.04em]">{card.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-white/45">{card.description}</p>
                  </div>
                  <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-5">
                    <span className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Enter module</span>
                    <ArrowUpRight size={18} className="text-white/40 transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-white" />
                  </div>
                </GlassPanel>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <DashboardList title="Upcoming Deadlines" items={summary.upcoming} empty="No upcoming pressure." />
        <DashboardList title="Today’s Tasks" items={summary.today} empty="Today is clean." />
        <DashboardList title="Overdue Tasks" items={summary.overdue} empty="Nothing overdue." danger />
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <AssetWidget title="Recent Flashcards" items={assets.flashcards} path="/flashcards" />
        <AssetWidget title="Continue Quiz" items={assets.quizzes} path="/quizzes" />
        <GlassPanel interactive className="p-6">
          <Pill tone="info">Recommended Revision</Pill>
          <h3 className="mt-5 text-2xl font-black tracking-[-0.04em]">Review weak concepts from recent quizzes.</h3>
          <p className="mt-3 text-sm leading-7 text-white/45">Spaced repetition architecture is ready through asset progress metadata.</p>
        </GlassPanel>
      </section>
    </div>
  );
}

function DashboardList({ title, items, empty, danger = false }) {
  return (
    <GlassPanel className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/45">{title}</h3>
        <Pill tone={danger ? 'danger' : 'info'}>{items.length}</Pill>
      </div>
      <div className="space-y-3">
        {items.length === 0 ? <p className="text-sm text-white/30">{empty}</p> : items.map((item) => (
          <div key={item._id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="font-bold">{item.title}</p>
            <p className="mt-1 text-xs text-white/35">{new Date(item.dueAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}

function AssetWidget({ title, items, path }) {
  return (
    <Link to={path}>
      <GlassPanel interactive className="h-full p-6">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/45">{title}</h3>
        <div className="mt-5 space-y-3">
          {items.length === 0 ? <p className="text-sm text-white/30">Nothing generated yet.</p> : items.map((item) => <p key={item._id} className="truncate rounded-2xl border border-white/10 bg-white/[0.03] p-4 font-bold">{item.title}</p>)}
        </div>
      </GlassPanel>
    </Link>
  );
}

function MetricCard({ icon: Icon, label, value, subtext, delay }) {
  return (
    <Reveal delay={delay}>
      <GlassPanel interactive className="p-6">
        <div className="flex items-start justify-between">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-accent-indigo">
            <Icon size={22} />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">{label}</span>
        </div>
        <div className="mt-10">
          <div className="text-5xl font-black tracking-[-0.06em]">{value}</div>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/35">{subtext}</p>
        </div>
      </GlassPanel>
    </Reveal>
  );
}
