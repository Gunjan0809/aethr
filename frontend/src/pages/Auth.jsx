import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, LockKeyhole, Mail, User } from 'lucide-react';
import { apiRequest } from '../api';

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
    <div className="surface-3d min-h-screen overflow-hidden text-slate-950">
      <main className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-5 py-8 lg:grid-cols-[1fr_26rem]">
        <section className="relative">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-white/80 bg-white/70 px-4 py-3 shadow-[0_18px_40px_rgba(31,41,55,0.10)] backdrop-blur-xl">
            <img src="/logo.svg" alt="AETHR" className="h-9 w-9" />
            <span className="text-sm font-bold">AETHR</span>
          </div>
          <h1 className="mt-8 max-w-3xl text-5xl font-black leading-none text-slate-950 sm:text-7xl">
            Study space with a little lift.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600">
            A clean academic workspace for deadlines, PDFs, exams, flashcards, quizzes, and quick sharing.
          </p>
          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            {['Vault', 'Exam', 'Revision'].map((item) => (
              <div key={item} className="rounded-2xl border border-white/80 bg-white/60 p-4 text-sm font-semibold text-slate-700 shadow-[0_14px_36px_rgba(31,41,55,0.08)] backdrop-blur-xl">
                {item}
              </div>
            ))}
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 18, rotateX: 4 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.55 }}
          className="panel p-5 sm:p-6"
        >
          <h2 className="text-2xl font-bold">{isLogin ? 'Welcome back' : 'Create account'}</h2>
          <p className="mt-1 text-sm text-slate-500">Your focused dashboard is ready.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {!isLogin && (
              <Field icon={User} label="Name" value={formData.name} onChange={(value) => setFormData({ ...formData, name: value })} />
            )}
            <Field icon={Mail} label="Email" type="email" value={formData.email} onChange={(value) => setFormData({ ...formData, email: value })} />
            <Field icon={LockKeyhole} label="Password" type="password" value={formData.password} onChange={(value) => setFormData({ ...formData, password: value })} />
            <button className="btn-main flex w-full items-center justify-center gap-2">
              {isLogin ? 'Enter AETHR' : 'Create Workspace'} <ArrowRight size={16} />
            </button>
          </form>

          <button onClick={() => setIsLogin(!isLogin)} className="mt-5 text-sm font-semibold text-slate-500 hover:text-slate-950">
            {isLogin ? 'Create a new account' : 'I already have an account'}
          </button>
        </motion.section>
      </main>
    </div>
  );
}

function Field({ icon: Icon, label, value, onChange, type = 'text' }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-slate-500">{label}</span>
      <span className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 shadow-inner focus-within:border-slate-400">
        <Icon size={16} className="text-slate-400" />
        <input required type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent text-sm text-slate-950 outline-none" />
      </span>
    </label>
  );
}
