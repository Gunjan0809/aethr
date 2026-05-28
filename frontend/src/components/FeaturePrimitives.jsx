import { motion } from 'framer-motion';
import { GlassPanel } from './Cinematic';

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 ml-1 block text-[10px] font-black uppercase tracking-[0.22em] text-white/35">{label}</span>
      {children}
    </label>
  );
}

export const inputClass = 'w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-accent-indigo/60';

export function EmptyState({ children }) {
  return <GlassPanel className="p-10 text-center text-sm font-bold uppercase tracking-[0.2em] text-white/30">{children}</GlassPanel>;
}

export function SkeletonCard() {
  return (
    <GlassPanel className="p-6">
      <motion.div className="h-5 w-2/3 rounded bg-white/10" animate={{ opacity: [0.35, 0.8, 0.35] }} transition={{ repeat: Infinity, duration: 1.4 }} />
      <motion.div className="mt-5 h-20 rounded-2xl bg-white/5" animate={{ opacity: [0.25, 0.6, 0.25] }} transition={{ repeat: Infinity, duration: 1.4 }} />
    </GlassPanel>
  );
}

export function Pill({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'border-white/10 bg-white/[0.04] text-white/45',
    good: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    warn: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
    danger: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
    info: 'border-accent-indigo/25 bg-accent-indigo/10 text-accent-indigo',
  };
  return <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${tones[tone]}`}>{children}</span>;
}
