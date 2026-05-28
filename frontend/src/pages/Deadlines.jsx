import { useEffect, useMemo, useState } from 'react';
import { Bell, CalendarClock, CheckCircle2, Plus } from 'lucide-react';
import { apiRequest } from '../api';
import { GlassPanel, KineticButton, Reveal, SectionKicker } from '../components/Cinematic';
import { EmptyState, Field, Pill, SkeletonCard, inputClass } from '../components/FeaturePrimitives';

const initialForm = { title: '', description: '', dueAt: '', priority: 'medium', reminderType: 'custom', tags: '', recurring: { enabled: false, frequency: 'none' }, alerts: { browser: true, sound: false, minutesBefore: 30 } };
const priorityTone = { low: 'neutral', medium: 'info', high: 'warn', critical: 'danger' };

export default function Deadlines() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const load = async () => {
    setLoading(true);
    try { setItems(await apiRequest('/deadlines')); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const soon = items.find((item) => item.status === 'pending' && new Date(item.dueAt).getTime() - Date.now() < (item.alerts?.minutesBefore || 30) * 60000 && new Date(item.dueAt) > new Date());
      if (soon) setToast(`Upcoming: ${soon.title}`);
      if (soon?.alerts?.browser && Notification?.permission === 'granted') new Notification('Aethr reminder', { body: soon.title });
      if (soon?.alerts?.sound) new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=').play().catch(() => {});
    }, 60000);
    return () => clearInterval(timer);
  }, [items]);

  const grouped = useMemo(() => ({
    today: items.filter((x) => new Date(x.dueAt).toDateString() === new Date().toDateString() && x.status === 'pending'),
    overdue: items.filter((x) => new Date(x.dueAt) < new Date() && x.status !== 'completed'),
    upcoming: items.filter((x) => new Date(x.dueAt) >= new Date() && x.status === 'pending'),
  }), [items]);

  const create = async (event) => {
    event.preventDefault();
    if (form.alerts.browser && Notification?.permission === 'default') Notification.requestPermission();
    await apiRequest('/deadlines', { method: 'POST', body: JSON.stringify({ ...form, tags: form.tags.split(',').map((x) => x.trim()).filter(Boolean) }) });
    setToast('Reminder created');
    setForm(initialForm);
    load();
  };

  const complete = async (id) => {
    await apiRequest(`/deadlines/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'completed' }) });
    load();
  };

  return (
    <div className="space-y-12">
      {toast && <button onClick={() => setToast('')} className="fixed right-5 top-24 z-[80] rounded-2xl border border-white/10 bg-white text-black px-5 py-3 text-xs font-black uppercase tracking-[0.18em] shadow-2xl">{toast}</button>}
      <Reveal><SectionKicker icon={CalendarClock}>Deadline intelligence</SectionKicker><h1 className="mt-6 text-[clamp(3.2rem,8vw,7rem)] font-black leading-[0.86] tracking-[-0.08em]">Never miss the important thing.</h1></Reveal>
      <div className="grid gap-6 lg:grid-cols-[24rem_1fr]">
        <Reveal>
          <GlassPanel className="p-6">
            <form onSubmit={create} className="space-y-4">
              <Field label="Title"><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="Assignment, exam, revision..." /></Field>
              <Field label="Description"><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} min-h-24`} /></Field>
              <Field label="Due date & time"><input required type="datetime-local" value={form.dueAt} onChange={(e) => setForm({ ...form, dueAt: e.target.value })} className={inputClass} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Priority"><select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={inputClass}>{['low','medium','high','critical'].map((x) => <option className="bg-[#111116]" key={x}>{x}</option>)}</select></Field>
                <Field label="Type"><select value={form.reminderType} onChange={(e) => setForm({ ...form, reminderType: e.target.value })} className={inputClass}>{['assignment','exam','study-goal','revision','custom'].map((x) => <option className="bg-[#111116]" key={x}>{x}</option>)}</select></Field>
              </div>
              <Field label="Subject tags"><input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputClass} placeholder="Physics, PYQ" /></Field>
              <div className="grid grid-cols-2 gap-3 text-xs text-white/45">
                <label><input type="checkbox" checked={form.alerts.browser} onChange={(e) => setForm({ ...form, alerts: { ...form.alerts, browser: e.target.checked } })} /> Browser</label>
                <label><input type="checkbox" checked={form.alerts.sound} onChange={(e) => setForm({ ...form, alerts: { ...form.alerts, sound: e.target.checked } })} /> Sound</label>
              </div>
              <KineticButton type="submit" className="w-full"><Plus size={15} /> Add reminder</KineticButton>
            </form>
          </GlassPanel>
        </Reveal>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">{['upcoming','today','overdue'].map((key) => <GlassPanel key={key} className="p-5"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">{key}</p><div className="mt-3 text-5xl font-black">{grouped[key].length}</div></GlassPanel>)}</div>
          <GlassPanel className="p-4 md:p-6">
            <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-black">Calendar stream</h2><Bell size={18} className="text-white/35" /></div>
            {loading ? <SkeletonCard /> : items.length === 0 ? <EmptyState>No reminders yet</EmptyState> : <div className="space-y-3">{items.map((item) => <div key={item._id} className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-white/20 md:flex-row md:items-center md:justify-between"><div><div className="flex flex-wrap gap-2"><Pill tone={priorityTone[item.priority]}>{item.priority}</Pill><Pill>{item.status}</Pill></div><h3 className="mt-3 text-lg font-black">{item.title}</h3><p className="text-sm text-white/40">{new Date(item.dueAt).toLocaleString()} · {item.tags?.join(', ')}</p></div><button onClick={() => complete(item._id)} className="rounded-full border border-white/10 p-3 text-white/45 hover:text-white"><CheckCircle2 size={18} /></button></div>)}</div>}
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
