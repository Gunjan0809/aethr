import { useEffect, useMemo, useState } from 'react';
import { Bell, BookOpen, CalendarClock, CheckCircle2, ClipboardList, Copy, Download, ExternalLink, FileText, Link2, QrCode, Search, Sparkles, Star, Timer } from 'lucide-react';
import { apiRequest } from '../api';

const shell = 'mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8';
const chip = 'inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50';

export default function Workspace({ userStats }) {
  return (
    <div className="bg-slate-50 pb-20 text-slate-900">
      <TopNav />
      <Hero userStats={userStats} />
      <main className={`${shell} mt-10 space-y-8`}>
        <DeadlinesSection />
        <VaultSection />
        <ExamSection />
        <StudyAssetsSection />
        <QrSection />
      </main>
    </div>
  );
}

function TopNav() {
  const links = [['deadlines', 'Deadlines'], ['vault', 'Vault'], ['exam', 'Exam'], ['assets', 'Revision'], ['qr', 'Share']];
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className={`${shell} flex h-16 items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Aethr logo" className="h-9 w-9 rounded-xl object-contain" />
          <p className="text-sm font-semibold tracking-tight">Aethr Study OS</p>
        </div>
        <nav className="hidden items-center gap-1 md:flex">{links.map(([id, label]) => <a key={id} href={`#${id}`} className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900">{label}</a>)}</nav>
        <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Sign out</button>
      </div>
    </header>
  );
}

function Hero({ userStats }) {
  return (
    <section className={`${shell} pt-10`}>
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Focused Workspace</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">A clean, scroll-first study workflow.</h1>
        <p className="mt-4 max-w-2xl text-sm text-slate-600 sm:text-base">Welcome back {userStats?.name || 'Scholar'}. Everything important lives in one smooth page so you can plan, practice, revise, and share without switching tabs.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3"><Stat label="Streak" value={`${userStats?.streak || 0} days`} /><Stat label="XP" value={`${userStats?.xp || 0}`} /><Stat label="Level" value={`${userStats?.level || 1}`} /></div>
      </div>
    </section>
  );
}

function DeadlinesSection() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', dueAt: '', priority: 'medium', reminderType: 'custom', tags: '', alerts: { browser: true, sound: false, minutesBefore: 30 } });
  const [toast, setToast] = useState('');
  const load = async () => setItems(await apiRequest('/deadlines'));
  useEffect(() => { load().catch(() => {}); }, []);
  const add = async (e) => {
    e.preventDefault();
    if (form.alerts.browser && Notification?.permission === 'default') await Notification.requestPermission();
    await apiRequest('/deadlines', { method: 'POST', body: JSON.stringify({ ...form, tags: form.tags.split(',').map((x) => x.trim()).filter(Boolean) }) });
    setToast('Reminder saved');
    setForm({ title: '', dueAt: '', priority: 'medium', reminderType: 'custom', tags: '', alerts: { browser: true, sound: false, minutesBefore: 30 } });
    load();
  };
  const complete = async (id) => { await apiRequest(`/deadlines/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'completed' }) }); load(); };
  const groups = useMemo(() => {
    const now = new Date();
    const today = now.toDateString();
    return {
      today: items.filter((x) => x.status === 'pending' && new Date(x.dueAt).toDateString() === today),
      overdue: items.filter((x) => x.status !== 'completed' && new Date(x.dueAt) < now),
      upcoming: items.filter((x) => x.status === 'pending' && new Date(x.dueAt) >= now),
    };
  }, [items]);
  return <section id="deadlines" className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6"><SectionHead icon={CalendarClock} title="Deadlines & Alerts" subtitle="Assignments, exam reminders, revision schedules, and custom goals." />{toast && <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-700">{toast}</div>}<div className="grid gap-4 lg:grid-cols-[320px_1fr]"><form onSubmit={add} className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4"><Input label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required /><Input label="Due date & time" type="datetime-local" value={form.dueAt} onChange={(v) => setForm({ ...form, dueAt: v })} required /><div className="grid grid-cols-2 gap-2"><Select label="Priority" value={form.priority} onChange={(v) => setForm({ ...form, priority: v })} options={['low', 'medium', 'high', 'critical']} /><Select label="Type" value={form.reminderType} onChange={(v) => setForm({ ...form, reminderType: v })} options={['assignment', 'exam', 'revision', 'study-goal', 'custom']} /></div><Input label="Subject tags" value={form.tags} onChange={(v) => setForm({ ...form, tags: v })} /><button className="w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Create Reminder</button></form><div className="space-y-3"><div className="grid gap-3 sm:grid-cols-3"><Stat label="Upcoming" value={String(groups.upcoming.length)} /><Stat label="Today" value={String(groups.today.length)} /><Stat label="Overdue" value={String(groups.overdue.length)} /></div><div className="rounded-2xl border border-slate-200 p-3"><p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Timeline</p><div className="space-y-2">{items.slice(0, 8).map((item) => <div key={item._id} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2"><div><p className="text-sm font-semibold">{item.title}</p><p className="text-xs text-slate-500">{new Date(item.dueAt).toLocaleString()}</p></div><button onClick={() => complete(item._id)} className="rounded-full border border-slate-200 p-1.5 text-slate-600"><CheckCircle2 size={16} /></button></div>)}</div></div></div></div></section>;
}

function VaultSection() {
  const [docs, setDocs] = useState([]);
  const [active, setActive] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const load = async () => setDocs(await apiRequest('/documents'));
  useEffect(() => { load().catch(() => {}); }, []);
  const fetchUrl = async (doc, download = false) => (await apiRequest(`/documents/${doc._id}/url${download ? '?download=true' : ''}`)).url;
  return <section id="vault" className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6"><SectionHead icon={BookOpen} title="Study Vault" subtitle="Reliable PDF preview, open in new tab, and direct download." /><div className="grid gap-3 md:grid-cols-2">{docs.map((doc) => <div key={doc._id} className="rounded-2xl border border-slate-200 p-4"><p className="line-clamp-1 text-sm font-semibold">{doc.title}</p><div className="mt-3 flex flex-wrap gap-2"><button onClick={async () => setPreviewUrl(await fetchUrl(doc))} className={chip}><FileText size={14} />Preview</button><button onClick={async () => window.open(await fetchUrl(doc), '_blank', 'noopener')} className={chip}><ExternalLink size={14} />Open PDF</button><button onClick={async () => window.open(await fetchUrl(doc, true), '_blank', 'noopener')} className={chip}><Download size={14} />Download</button><button onClick={() => setActive(doc)} className={chip}><Sparkles size={14} />Generate</button></div></div>)}</div>{previewUrl && <iframe title="PDF preview" src={previewUrl} className="h-[420px] w-full rounded-2xl border border-slate-200" />}{active && <AssetGenerator doc={active} onClose={() => setActive(null)} />}</section>;
}

function AssetGenerator({ doc, onClose }) {
  const [state, setState] = useState('idle');
  const generate = async (type) => {
    setState('running');
    try {
      const ai = await apiRequest('/ai/generate', { method: 'POST', body: JSON.stringify({ text: doc.extractedText || doc.title, type }) });
      await apiRequest('/assets', { method: 'POST', body: JSON.stringify({ documentId: doc._id, type, title: `${type} - ${doc.title}`, content: ai.data, tags: ['AI Generated'] }) });
      setState('done');
    } catch {
      setState('error');
    }
  };
  return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-semibold">Generate from {doc.title}</p><div className="mt-2 flex gap-2"><button onClick={() => generate('flashcard')} className={chip}>Flashcards</button><button onClick={() => generate('quiz')} className={chip}>Quiz</button><button onClick={onClose} className={chip}>Close</button></div><p className="mt-2 text-xs text-slate-500">{state === 'idle' ? 'Pick an output format.' : state === 'running' ? 'Generating...' : state === 'done' ? 'Generated successfully.' : 'Generation failed.'}</p></div>;
}

function ExamSection() {
  const [docs, setDocs] = useState([]);
  const [exams, setExams] = useState([]);
  const [cfg, setCfg] = useState({ documentIds: [], subjects: '', difficulty: 'mixed', durationMinutes: 60 });
  const [active, setActive] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [left, setLeft] = useState(0);
  const [result, setResult] = useState(null);
  useEffect(() => { apiRequest('/documents').then(setDocs); apiRequest('/exams').then(setExams); }, []);
  useEffect(() => {
    if (!active) return undefined;
    const started = Date.now();
    setLeft(active.durationMinutes * 60);
    const t = setInterval(() => { const remaining = Math.max(0, active.durationMinutes * 60 - Math.floor((Date.now() - started) / 1000)); setLeft(remaining); if (remaining === 0) submit(active); }, 1000);
    return () => clearInterval(t);
  }, [active]);
  const generate = async (e) => {
    e.preventDefault();
    const exam = await apiRequest('/exams/generate', { method: 'POST', body: JSON.stringify({ ...cfg, subjects: cfg.subjects.split(',').map((x) => x.trim()).filter(Boolean) }) });
    setExams((prev) => [exam, ...prev]); setActive(exam); setQIndex(0); setAnswers({}); setResult(null);
  };
  const submit = async (exam) => { if (!exam || result) return; setResult(await apiRequest(`/exams/${exam._id}/submit`, { method: 'POST', body: JSON.stringify({ answers, timeSpentSeconds: exam.durationMinutes * 60 - left }) })); };
  const q = active?.questions?.[qIndex];
  return <section id="exam" className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6"><SectionHead icon={ClipboardList} title="Exam Engine" subtitle="AI-generated exams with timed flow and analytics." />{!active ? <div className="grid gap-4 lg:grid-cols-[340px_1fr]"><form onSubmit={generate} className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="max-h-40 space-y-1 overflow-auto rounded-xl border border-slate-200 bg-white p-2 text-xs">{docs.map((d) => <label key={d._id} className="flex gap-2"><input type="checkbox" onChange={(e) => setCfg((c) => ({ ...c, documentIds: e.target.checked ? [...c.documentIds, d._id] : c.documentIds.filter((id) => id !== d._id) }))} />{d.title}</label>)}</div><Input label="Subjects" value={cfg.subjects} onChange={(v) => setCfg({ ...cfg, subjects: v })} /><div className="grid grid-cols-2 gap-2"><Select label="Difficulty" value={cfg.difficulty} onChange={(v) => setCfg({ ...cfg, difficulty: v })} options={['mixed', 'easy', 'medium', 'hard']} /><Input label="Minutes" type="number" value={String(cfg.durationMinutes)} onChange={(v) => setCfg({ ...cfg, durationMinutes: Number(v) })} /></div><button className="w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Generate Exam</button></form><div className="space-y-2">{exams.map((e) => <button key={e._id} onClick={() => { setActive(e); setQIndex(0); setAnswers({}); setResult(null); }} className="w-full rounded-2xl border border-slate-200 p-4 text-left hover:bg-slate-50"><p className="text-sm font-semibold">{e.title}</p><p className="text-xs text-slate-500">{e.questions?.length || 0} questions • {e.durationMinutes} min</p></button>)}</div></div> : <div className="rounded-2xl border border-slate-200 p-4"><div className="mb-4 flex items-center justify-between"><button onClick={() => setActive(null)} className="text-xs font-semibold text-slate-500">Exit exam</button><p className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700"><Timer size={14} />{Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}</p></div>{result ? <ResultBox result={result} /> : <>{q && <div className="space-y-3"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Q{qIndex + 1} • {q.type}</p><h3 className="text-base font-semibold">{q.question}</h3>{q.options ? q.options.map((o) => <button key={o} onClick={() => setAnswers({ ...answers, [q.id]: o })} className={`block w-full rounded-xl border px-3 py-2 text-left text-sm ${answers[q.id] === o ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-700'}`}>{o}</button>) : <textarea value={answers[q.id] || ''} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} className="h-28 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />}</div>}<div className="mt-4 flex flex-wrap gap-2"><button onClick={() => setQIndex(Math.min(qIndex + 1, active.questions.length - 1))} className={chip}>Save & Next</button><button onClick={() => submit(active)} className={chip}>Submit</button></div></>}</div>}</section>;
}

function StudyAssetsSection() {
  const [assets, setAssets] = useState([]);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('flashcard');
  const [flipped, setFlipped] = useState({});
  useEffect(() => { apiRequest(`/assets?type=${type}`).then(setAssets); }, [type]);
  const filtered = useMemo(() => assets.filter((x) => `${x.title} ${x.subject || ''} ${(x.tags || []).join(' ')}`.toLowerCase().includes(query.toLowerCase())), [assets, query]);
  const toggleFavorite = async (a) => { const u = await apiRequest(`/assets/${a._id}`, { method: 'PATCH', body: JSON.stringify({ favorite: !a.favorite }) }); setAssets((prev) => prev.map((x) => (x._id === u._id ? u : x))); };
  return <section id="assets" className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6"><SectionHead icon={Sparkles} title="Flashcards & Quizzes" subtitle="Search, favorites, and quick revision flow." /><div className="grid gap-2 sm:grid-cols-[1fr_160px_160px]"><div className="relative"><Search size={14} className="absolute left-2 top-2.5 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search assets" className="h-9 w-full rounded-lg border border-slate-200 pl-8 pr-2 text-sm" /></div><Select value={type} onChange={setType} options={['flashcard', 'quiz']} /><a href="#exam" className="flex h-9 items-center justify-center rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50">Continue Exam</a></div><div className="grid gap-3 md:grid-cols-2">{filtered.map((a) => <div key={a._id} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-2"><p className="text-sm font-semibold">{a.title}</p><button onClick={() => toggleFavorite(a)} className="text-slate-500"><Star size={16} fill={a.favorite ? 'currentColor' : 'none'} /></button></div>{type === 'flashcard' ? <button onClick={() => setFlipped({ ...flipped, [a._id]: !flipped[a._id] })} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-left text-sm text-slate-700">{flipped[a._id] ? a.content?.[0]?.answer : a.content?.[0]?.question}</button> : <div className="mt-2 text-xs text-slate-600">{Array.isArray(a.content) ? a.content.length : 0} questions • Retry available</div>}</div>)}</div></section>;
}

function QrSection() {
  const [docs, setDocs] = useState([]);
  const [form, setForm] = useState({ kind: 'pdf', docId: '', value: '', title: '', expiresIn: '7', visibility: 'public' });
  const [link, setLink] = useState('');
  useEffect(() => { apiRequest('/documents').then(setDocs); }, []);
  const selected = docs.find((d) => d._id === form.docId);
  const create = async () => {
    const value = form.kind === 'pdf' ? selected?.viewUrl || '' : form.value;
    const expiresAt = form.expiresIn === 'never' ? undefined : new Date(Date.now() + Number(form.expiresIn) * 86400000);
    const share = await apiRequest('/share', { method: 'POST', body: JSON.stringify({ kind: form.kind, title: form.title || selected?.title || 'Shared resource', payload: { value, documentId: selected?._id }, expiresAt, visibility: form.visibility }) });
    setLink(share.publicUrl);
  };
  const downloadSvg = () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><rect width="240" height="240" fill="#fff"/><text x="20" y="120" fill="#111" font-size="12">${(link || 'No link').slice(0, 30)}</text></svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'aethr-qr.svg';
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return <section id="qr" className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6"><SectionHead icon={QrCode} title="QR Sharing" subtitle="Generate share links for vault PDFs, notes, quizzes, flashcards, and text resources." /><div className="grid gap-4 lg:grid-cols-[320px_1fr]"><div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4"><Select label="Type" value={form.kind} onChange={(v) => setForm({ ...form, kind: v })} options={['pdf', 'link', 'note', 'flashcard', 'quiz', 'text', 'resource']} />{form.kind === 'pdf' ? <Select label="Document" value={form.docId} onChange={(v) => setForm({ ...form, docId: v })} options={['', ...docs.map((d) => d._id)]} labels={{ '': 'Select document', ...Object.fromEntries(docs.map((d) => [d._id, d.title])) }} /> : <Input label="Value" value={form.value} onChange={(v) => setForm({ ...form, value: v })} />}<Input label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} /><Select label="Access" value={form.visibility} onChange={(v) => setForm({ ...form, visibility: v })} options={['public', 'private']} /><Select label="Expiry" value={form.expiresIn} onChange={(v) => setForm({ ...form, expiresIn: v })} options={['1', '7', '30', 'never']} labels={{ 1: '1 day', 7: '7 days', 30: '30 days', never: 'Never' }} /><button onClick={create} className="w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Create Share QR</button></div><div className="rounded-2xl border border-slate-200 p-4"><div className="flex items-center justify-between"><p className="text-sm font-semibold">Share Output</p><Bell size={16} className="text-slate-500" /></div><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => navigator.clipboard.writeText(link)} className={chip}><Copy size={14} />Copy Link</button><button onClick={downloadSvg} className={chip}><Download size={14} />SVG</button><button onClick={() => window.print()} className={chip}>PDF Export</button><button onClick={() => link && window.open(link, '_blank', 'noopener')} className={chip}><Link2 size={14} />Preview</button></div><p className="mt-4 break-all rounded-xl border border-slate-200 p-3 text-xs text-slate-600">{link || 'Create a share link to generate QR resources.'}</p></div></div></section>;
}

function ResultBox({ result }) { return <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4"><Stat label="Score" value={String(result.score)} /><Stat label="Accuracy" value={`${result.accuracy}%`} /><Stat label="Strong Topics" value={String(result.strongTopics?.length || 0)} /><Stat label="Weak Topics" value={String(result.weakTopics?.length || 0)} /><div className="rounded-2xl border border-slate-200 p-3 sm:col-span-2 lg:col-span-4"><p className="text-xs font-medium text-slate-600">AI Feedback: {result.feedback}</p></div></div>; }
function SectionHead({ icon: Icon, title, subtitle }) { return <div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2><p className="mt-1 text-sm text-slate-600">{subtitle}</p></div><div className="rounded-xl border border-slate-200 p-2 text-slate-600"><Icon size={16} /></div></div>; }
function Stat({ label, value }) { return <div className="rounded-2xl border border-slate-200 bg-white p-3"><p className="text-xs text-slate-500">{label}</p><p className="text-lg font-semibold">{value}</p></div>; }
function Input({ label, value, onChange, type = 'text', required }) { return <label className="block text-xs font-medium text-slate-600">{label}<input required={required} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2 text-sm text-slate-800" /></label>; }
function Select({ label, value, onChange, options, labels = {} }) { return <label className="block text-xs font-medium text-slate-600">{label}<select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2 text-sm text-slate-800">{options.map((o) => <option key={o} value={o}>{labels[o] || o}</option>)}</select></label>; }
