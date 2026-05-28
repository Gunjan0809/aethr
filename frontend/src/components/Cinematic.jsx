import { useEffect, useState } from 'react';
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export function AetherMark({ compact = false }) {
  return (
    <div className="flex items-center gap-3" aria-label="Aethr">
      <div className="relative h-8 w-8 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] shadow-[0_0_30px_rgba(129,140,248,0.18)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.7),transparent_18%),linear-gradient(135deg,rgba(129,140,248,0.75),rgba(168,85,247,0.35)_55%,transparent)]" />
        <div className="absolute bottom-1 left-1 right-1 h-3 rounded-md border border-white/20 bg-black/35 backdrop-blur" />
      </div>
      {!compact && (
        <div className="leading-none">
          <p className="text-sm font-semibold tracking-[0.24em] text-white">AETHR</p>
          <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.28em] text-white/35">Study OS</p>
        </div>
      )}
    </div>
  );
}

export function AmbientScene() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#050507]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(255,255,255,0.12),transparent_28%),radial-gradient(circle_at_15%_20%,rgba(99,102,241,0.18),transparent_30%),radial-gradient(circle_at_88%_76%,rgba(168,85,247,0.16),transparent_34%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:88px_88px] opacity-[0.14] [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]" />
      <div className="noise" />
      <div className="absolute left-1/2 top-0 h-[70vh] w-px bg-gradient-to-b from-white/20 via-white/5 to-transparent" />
      <div className="absolute bottom-[-18rem] left-1/2 h-[36rem] w-[80rem] -translate-x-1/2 rounded-[100%] border border-white/10 bg-white/[0.025] blur-sm" />
    </div>
  );
}

export function BootLoader() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 100) {
          window.clearInterval(interval);
          window.setTimeout(() => setVisible(false), 240);
          return 100;
        }
        return Math.min(value + Math.ceil(Math.random() * 13), 100);
      });
    }, 80);

    return () => window.clearInterval(interval);
  }, [reducedMotion]);

  if (reducedMotion || !visible) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#050507]"
    >
      <div className="flex w-[min(18rem,76vw)] flex-col items-center gap-6">
        <AetherMark compact />
        <div className="h-px w-full overflow-hidden bg-white/10">
          <motion.div
            className="h-full bg-white shadow-[0_0_24px_rgba(255,255,255,0.7)]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          />
        </div>
        <div className="flex w-full justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">
          <span>Initializing workspace</span>
          <span>{progress}%</span>
        </div>
      </div>
    </motion.div>
  );
}

export function CursorAura() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || window.matchMedia('(pointer: coarse)').matches) return undefined;

    const handleMove = (event) => setPosition({ x: event.clientX, y: event.clientY });
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <motion.div
      className="pointer-events-none fixed z-[180] hidden h-8 w-8 rounded-full border border-white/20 mix-blend-difference md:block"
      animate={{ x: position.x - 16, y: position.y - 16 }}
      transition={{ type: 'spring', damping: 26, stiffness: 260, mass: 0.4 }}
    />
  );
}

export function FrameOverlay() {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <div className="pointer-events-none fixed inset-0 z-40 hidden p-5 md:block">
      <div className="absolute left-5 top-5 h-2 w-2 border-l border-t border-white/50" />
      <div className="absolute right-5 top-5 h-2 w-2 border-r border-t border-white/50" />
      <div className="absolute bottom-5 left-5 h-2 w-2 border-b border-l border-white/50" />
      <div className="absolute bottom-5 right-5 h-2 w-2 border-b border-r border-white/50" />
      <div className="absolute right-5 top-1/2 h-56 w-px -translate-y-1/2 bg-white/10">
        <motion.div style={{ scaleY, transformOrigin: 'top' }} className="h-full w-px bg-white" />
      </div>
    </div>
  );
}

export function Reveal({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SectionKicker({ children, icon: Icon = Sparkles }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-white/55 backdrop-blur-xl">
      <Icon size={12} className="text-accent-indigo" />
      {children}
    </div>
  );
}

export function KineticButton({ children, className = '', icon = true, as: Component = 'button', ...props }) {
  return (
    <Component
      className={`group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full border border-white/15 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-black shadow-[0_16px_60px_rgba(255,255,255,0.12)] transition duration-300 hover:-translate-y-0.5 hover:bg-white/90 active:translate-y-0 ${className}`}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      {icon && <ArrowRight size={15} className="relative z-10 transition duration-300 group-hover:translate-x-1" />}
    </Component>
  );
}

export function GlassPanel({ children, className = '', interactive = false }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-[0_24px_90px_rgba(0,0,0,0.42)] backdrop-blur-2xl ${interactive ? 'transition duration-500 hover:-translate-y-1 hover:border-white/22 hover:bg-white/[0.065]' : ''} ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      {children}
    </div>
  );
}
