import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, LockKeyhole, Mail, Sparkles, User } from 'lucide-react';
import { apiRequest } from '../api';
import { AetherMark, AmbientScene, GlassPanel, KineticButton, SectionKicker } from '../components/Cinematic';

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();
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
    <div className="relative min-h-screen overflow-hidden bg-[#050507] px-5 py-6 text-white selection:bg-accent-indigo/30">
      <AmbientScene />
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between">
        <AetherMark />
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.28em] text-white/35 sm:block">Private beta workspace</span>
      </header>

      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-12 py-12 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.section initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <SectionKicker icon={Brain}>AI learning operating system</SectionKicker>
          <h1 className="mt-8 max-w-4xl text-[clamp(3.6rem,9vw,8.6rem)] font-black leading-[0.84] tracking-[-0.08em]">
            Enter your focus layer.
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-white/52">
            Aethr organizes your study materials, milestones, and AI guidance into a calm, cinematic workspace built for deep learning.
          </p>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            {['Vault', 'Roadmap', 'Oracle'].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white/45 backdrop-blur-xl">
                {item}
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }}>
          <GlassPanel className="mx-auto max-w-md p-6 md:p-8">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-accent-indigo">
                <Sparkles size={24} />
              </div>
              <h2 className="text-4xl font-black tracking-[-0.05em]">{isLogin ? 'Resume Aethr' : 'Create Aethr'}</h2>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.24em] text-white/35">
                {isLogin ? 'Verify identity' : 'Initialize workspace'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <Field
                  icon={User}
                  label="Name"
                  type="text"
                  value={formData.name}
                  placeholder="Your full name"
                  onChange={(value) => setFormData({ ...formData, name: value })}
                />
              )}
              <Field
                icon={Mail}
                label="Email"
                type="email"
                value={formData.email}
                placeholder="email@example.com"
                onChange={(value) => setFormData({ ...formData, email: value })}
              />
              <Field
                icon={LockKeyhole}
                label="Password"
                type="password"
                value={formData.password}
                placeholder="••••••••"
                onChange={(value) => setFormData({ ...formData, password: value })}
              />
              <KineticButton type="submit" className="mt-2 w-full">
                {isLogin ? 'Enter workspace' : 'Create account'}
              </KineticButton>
            </form>

            <button
              onClick={() => setIsLogin(!isLogin)}
              className="mt-7 w-full text-center text-[10px] font-black uppercase tracking-[0.22em] text-white/35 transition hover:text-white"
            >
              {isLogin ? 'No account? Initialize here' : 'Already have access? Sign in'}
            </button>
          </GlassPanel>
        </motion.section>
      </main>
    </div>
  );
}

function Field({ icon: Icon, label, value, onChange, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 ml-1 block text-[10px] font-black uppercase tracking-[0.22em] text-white/35">{label}</span>
      <span className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 transition focus-within:border-accent-indigo/60 focus-within:bg-white/[0.06]">
        <Icon size={16} className="text-white/30" />
        <input
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/18"
          {...props}
        />
      </span>
    </label>
  );
}
