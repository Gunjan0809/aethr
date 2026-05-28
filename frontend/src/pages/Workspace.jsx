import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { Bell, BookOpen, CalendarClock, CheckCircle2, ClipboardList, Copy, Download, ExternalLink, FileText, QrCode, Search, Sparkles, Star, Timer, Trash2, UserCircle2, X } from 'lucide-react';
import { apiRequest } from '../api';

const shell = 'mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8';

export default function Workspace({ userStats }) {
  return (
    <div className="surface-3d min-h-screen pb-24 text-slate-950">
      <TopNav />
      <Hero userStats={userStats} />
      <main className={`${shell} mt-8 space-y-5`}>
        <DeadlinesSection />
        <VaultSection />
        <ExamSection />
        <AssetsSection />
        <QrSection />
      </main>
      <Footer />
    </div>
  );
}

function TopNav() {
  const links = [['deadlines', 'Deadlines'], ['vault', 'Vault'], ['exam', 'Exam'], ['assets', 'Revision'], ['qr', 'QR']];
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState({ name: '', email: '', mobile: '', college: '', department: '', semester: '', bio: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiRequest('/auth/me').then((data) => {
      setProfile({
        name: data.name || '',
        email: data.email || '',
        mobile: data.mobile || '',
        college: data.college || '',
        department: data.department || '',
        semester: data.semester || '',
        bio: data.bio || '',
      });
    }).catch(() => {});
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await apiRequest('/auth/me', { method: 'PATCH', body: JSON.stringify(profile) });
      setProfile({
        name: updated.name || '',
        email: updated.email || '',
        mobile: updated.mobile || '',
        college: updated.college || '',
        department: updated.department || '',
        semester: updated.semester || '',
        bio: updated.bio || '',
      });
      setShowProfile(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/72 shadow-[0_10px_35px_rgba(31,41,55,0.08)] backdrop-blur-xl">
      <div className={`${shell} flex h-16 items-center justify-between`}>
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="AETHR" className="h-9 w-9 object-contain" />
          <p className="text-sm font-semibold">AETHR</p>
        </div>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map(([id, label]) => <a key={id} href={`#${id}`} className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-950 hover:text-white">{label}</a>)}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowProfile(true)} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white"><UserCircle2 size={14} /> User</button>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white">Sign out</button>
        </div>
      </div>
      {showProfile && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-md">
          <form onSubmit={saveProfile} className="w-full max-w-lg rounded-2xl border border-white/80 bg-white/90 p-5 shadow-[0_30px_90px_rgba(31,41,55,0.22)] backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Profile</h3>
              <button type="button" onClick={() => setShowProfile(false)} className="chip-dark"><X size={14} /></button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input label="Name" value={profile.name} onChange={(v) => setProfile({ ...profile, name: v })} />
              <Input label="Email" value={profile.email} onChange={(v) => setProfile({ ...profile, email: v })} type="email" />
              <Input label="Mobile" value={profile.mobile} onChange={(v) => setProfile({ ...profile, mobile: v })} />
              <Input label="College" value={profile.college} onChange={(v) => setProfile({ ...profile, college: v })} />
              <Input label="Department" value={profile.department} onChange={(v) => setProfile({ ...profile, department: v })} />
              <Input label="Semester" value={profile.semester} onChange={(v) => setProfile({ ...profile, semester: v })} />
            </div>
            <Input label="Bio" value={profile.bio} onChange={(v) => setProfile({ ...profile, bio: v })} />
            <button className="btn-main mt-3 w-full" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>
          </form>
        </div>
      )}
    </header>
  );
}

function Hero({ userStats }) {
  return (
    <section className={`${shell} pt-8`}>
      <div className="panel p-6 sm:p-8">
        <p className="text-xs font-bold text-slate-500">Learning command center</p>
        <h1 className="mt-2 max-w-3xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl">Calm interface. Gamified progress.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Hi {userStats?.name || 'Scholar'} your workspace is tuned for deep focus with cleaner structure and faster navigation.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Stat label="Streak" value={`${userStats?.streak || 0} days`} />
          <Stat label="XP" value={`${userStats?.xp || 0}`} />
          <Stat label="Level" value={`${userStats?.level || 1}`} />
        </div>
      </div>
    </section>
  );
}

function DeadlinesSection() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', dueAt: '', priority: 'medium', reminderType: 'custom', tags: '' });
  const [toast, setToast] = useState('');
  const load = async () => setItems(await apiRequest('/deadlines'));
  useEffect(() => { load().catch(() => {}); }, []);

  const grouped = useMemo(() => {
    const now = new Date();
    const today = now.toDateString();
    return {
      upcoming: items.filter((i) => i.status === 'pending' && new Date(i.dueAt) >= now),
      today: items.filter((i) => i.status === 'pending' && new Date(i.dueAt).toDateString() === today),
      overdue: items.filter((i) => i.status !== 'completed' && new Date(i.dueAt) < now),
    };
  }, [items]);

  const create = async (e) => {
    e.preventDefault();
    await apiRequest('/deadlines', { method: 'POST', body: JSON.stringify({ ...form, tags: form.tags.split(',').map((x) => x.trim()).filter(Boolean) }) });
    setToast('Deadline added');
    setForm({ title: '', dueAt: '', priority: 'medium', reminderType: 'custom', tags: '' });
    load();
  };
  const done = async (id) => { await apiRequest(`/deadlines/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'completed' }) }); load(); };

  return <section id="deadlines" className="panel p-5"><SectionHead icon={CalendarClock} title="Deadlines" subtitle="Assignments, exam alerts, and revision goals." />{toast && <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{toast}</p>}<div className="mt-4 grid gap-4 lg:grid-cols-[320px_1fr]"><form onSubmit={create} className="space-y-2"><Input label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required /><Input label="Due Date & Time" type="datetime-local" value={form.dueAt} onChange={(v) => setForm({ ...form, dueAt: v })} required /><div className="grid grid-cols-2 gap-2"><Select label="Priority" value={form.priority} onChange={(v) => setForm({ ...form, priority: v })} options={['low', 'medium', 'high', 'critical']} /><Select label="Type" value={form.reminderType} onChange={(v) => setForm({ ...form, reminderType: v })} options={['assignment', 'exam', 'revision', 'study-goal', 'custom']} /></div><Input label="Tags" value={form.tags} onChange={(v) => setForm({ ...form, tags: v })} /><button className="btn-main w-full">Create Reminder</button></form><div className="space-y-3"><div className="grid gap-2 sm:grid-cols-3"><Stat label="Upcoming" value={String(grouped.upcoming.length)} /><Stat label="Today" value={String(grouped.today.length)} /><Stat label="Overdue" value={String(grouped.overdue.length)} /></div><div className="space-y-2">{items.slice(0, 8).map((it) => <div key={it._id} className="rounded-xl border border-white/80 bg-white/60 p-3 shadow-sm"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-slate-900">{it.title}</p><p className="text-xs text-slate-500">{new Date(it.dueAt).toLocaleString()}</p></div><button onClick={() => done(it._id)} className="chip-dark"><CheckCircle2 size={14} />Done</button></div></div>)}</div></div></div></section>;
}

function VaultSection() {
  const [docs, setDocs] = useState([]);
  const [previewUrl, setPreviewUrl] = useState('');
  const load = async () => setDocs(await apiRequest('/documents'));
  useEffect(() => { load().catch(() => {}); }, []);
  const getUrl = async (doc, download = false) => (await apiRequest(`/documents/${doc._id}/url${download ? '?download=true' : ''}`)).url;
  const removeDoc = async (id) => { await apiRequest(`/documents/${id}`, { method: 'DELETE' }); load(); };

  return <section id="vault" className="panel p-5"><SectionHead icon={BookOpen} title="Study Vault" subtitle="Open, preview, download, and delete PDFs." /><div className="mt-4 grid gap-2 md:grid-cols-2">{docs.map((doc) => <div key={doc._id} className="rounded-xl border border-white/80 bg-white/65 shadow-sm p-3"><p className="truncate text-sm font-medium">{doc.title}</p><div className="mt-2 flex flex-wrap gap-2"><button onClick={async () => setPreviewUrl(await getUrl(doc))} className="chip-dark"><FileText size={13} />Preview</button><button onClick={async () => window.open(await getUrl(doc), '_blank', 'noopener')} className="chip-dark"><ExternalLink size={13} />Open</button><button onClick={async () => window.open(await getUrl(doc, true), '_blank', 'noopener')} className="chip-dark"><Download size={13} />Download</button><button onClick={() => removeDoc(doc._id)} className="chip-dark"><Trash2 size={13} />Delete</button></div></div>)}</div>{previewUrl && <iframe title="PDF" src={previewUrl} className="mt-3 h-[380px] w-full rounded-xl border border-white/15 bg-white" />}</section>;
}

function ExamSection() {
  const [docs, setDocs] = useState([]);
  const [exams, setExams] = useState([]);
  const [cfg, setCfg] = useState({ documentIds: [], subjects: '', difficulty: 'mixed', durationMinutes: 60 });
  const [active, setActive] = useState(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [left, setLeft] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => { apiRequest('/documents').then(setDocs); apiRequest('/exams').then(setExams); }, []);
  useEffect(() => {
    if (!active) return;
    const started = Date.now();
    setLeft(active.durationMinutes * 60);
    const t = setInterval(() => {
      const remaining = Math.max(0, active.durationMinutes * 60 - Math.floor((Date.now() - started) / 1000));
      setLeft(remaining);
      if (remaining === 0) submit(active);
    }, 1000);
    return () => clearInterval(t);
  }, [active]);

  const generate = async (e) => {
    e.preventDefault();
    const exam = await apiRequest('/exams/generate', { method: 'POST', body: JSON.stringify({ ...cfg, subjects: cfg.subjects.split(',').map((s) => s.trim()).filter(Boolean) }) });
    setExams((p) => [exam, ...p]);
    setActive(exam); setIdx(0); setAnswers({}); setResult(null);
  };
  const submit = async (exam) => {
    if (!exam || result) return;
    setResult(await apiRequest(`/exams/${exam._id}/submit`, { method: 'POST', body: JSON.stringify({ answers, timeSpentSeconds: exam.durationMinutes * 60 - left }) }));
  };
  const removeExam = async (id) => { await apiRequest(`/exams/${id}`, { method: 'DELETE' }); setExams((prev) => prev.filter((x) => x._id !== id)); };

  const q = active?.questions?.[idx];
  return <section id="exam" className="panel p-5"><SectionHead icon={ClipboardList} title="Exam Engine" subtitle="Generate, attempt, and delete AI exams." />{!active ? <div className="mt-4 grid gap-3 lg:grid-cols-[320px_1fr]"><form onSubmit={generate} className="space-y-2"><div className="max-h-36 space-y-1 overflow-auto rounded-xl border border-white/80 bg-white/65 shadow-sm p-2 text-xs">{docs.map((d) => <label key={d._id} className="flex gap-2"><input type="checkbox" onChange={(e) => setCfg((c) => ({ ...c, documentIds: e.target.checked ? [...c.documentIds, d._id] : c.documentIds.filter((id) => id !== d._id) }))} />{d.title}</label>)}</div><Input label="Subjects" value={cfg.subjects} onChange={(v) => setCfg({ ...cfg, subjects: v })} /><div className="grid grid-cols-2 gap-2"><Select label="Difficulty" value={cfg.difficulty} onChange={(v) => setCfg({ ...cfg, difficulty: v })} options={['mixed', 'easy', 'medium', 'hard']} /><Input label="Minutes" type="number" value={String(cfg.durationMinutes)} onChange={(v) => setCfg({ ...cfg, durationMinutes: Number(v) })} /></div><button className="btn-main w-full">Generate Exam</button></form><div className="space-y-2">{exams.map((e) => <div key={e._id} className="rounded-xl border border-white/80 bg-white/65 shadow-sm p-3"><button onClick={() => { setActive(e); setIdx(0); setAnswers({}); setResult(null); }} className="block w-full text-left"><p className="text-sm font-medium">{e.title}</p><p className="text-xs text-slate-500">{e.questions?.length || 0} questions • {e.durationMinutes} min</p></button><button onClick={() => removeExam(e._id)} className="chip-dark mt-2"><Trash2 size={13} />Delete</button></div>)}</div></div> : <div className="mt-4 rounded-xl border border-white/80 bg-white/65 shadow-sm p-4"><div className="mb-3 flex items-center justify-between"><button onClick={() => setActive(null)} className="text-xs text-slate-500">Exit exam</button><p className="chip-dark"><Timer size={13} />{Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}</p></div>{result ? <div className="grid gap-2 sm:grid-cols-4"><Stat label="Score" value={String(result.score)} /><Stat label="Accuracy" value={`${result.accuracy}%`} /><Stat label="Strong" value={String(result.strongTopics?.length || 0)} /><Stat label="Weak" value={String(result.weakTopics?.length || 0)} /></div> : <>{q && <div className="space-y-2"><p className="text-xs text-slate-500">Q{idx + 1} • {q.type}</p><h3 className="text-sm font-medium">{q.question}</h3>{q.options ? q.options.map((o) => <button key={o} onClick={() => setAnswers({ ...answers, [q.id]: o })} className={`block w-full rounded-lg border px-3 py-2 text-left text-sm ${answers[q.id] === o ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white/80 text-slate-700'}`}>{o}</button>) : <textarea className="h-24 w-full rounded-lg border border-slate-200 bg-white/80 p-2 text-sm" value={answers[q.id] || ''} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />}</div>}<div className="mt-3 flex gap-2"><button onClick={() => setIdx(Math.min(idx + 1, active.questions.length - 1))} className="chip-dark">Save & Next</button><button onClick={() => submit(active)} className="chip-dark">Submit</button></div></>}</div>}</section>;
}

function AssetsSection() {
  const [assets, setAssets] = useState([]);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('flashcard');
  const [flipped, setFlipped] = useState({});
  useEffect(() => { apiRequest(`/assets?type=${type}`).then(setAssets); }, [type]);
  const filtered = useMemo(() => assets.filter((a) => `${a.title} ${(a.tags || []).join(' ')}`.toLowerCase().includes(query.toLowerCase())), [assets, query]);
  const fav = async (a) => { const u = await apiRequest(`/assets/${a._id}`, { method: 'PATCH', body: JSON.stringify({ favorite: !a.favorite }) }); setAssets((p) => p.map((x) => x._id === u._id ? u : x)); };
  const removeAsset = async (id) => { await apiRequest(`/assets/${id}`, { method: 'DELETE' }); setAssets((p) => p.filter((x) => x._id !== id)); };

  return <section id="assets" className="panel p-5"><SectionHead icon={Sparkles} title="Revision" subtitle="Flashcards and quiz history in one place." /><div className="mt-4 grid gap-2 sm:grid-cols-[1fr_160px]"><div className="relative"><Search size={14} className="absolute left-2 top-2.5 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="h-9 w-full rounded-lg border border-slate-200 bg-white/80 pl-8 pr-2 text-sm text-slate-950" /></div><Select value={type} onChange={setType} options={['flashcard', 'quiz']} /></div><div className="mt-3 grid gap-2 md:grid-cols-2">{filtered.map((a) => <div key={a._id} className="rounded-xl border border-white/80 bg-white/65 shadow-sm p-3"><div className="flex items-center justify-between"><p className="truncate text-sm font-medium">{a.title}</p><div className="flex items-center gap-2"><button onClick={() => fav(a)} className="text-slate-500"><Star size={14} fill={a.favorite ? 'currentColor' : 'none'} /></button><button onClick={() => removeAsset(a._id)} className="text-rose-500"><Trash2 size={14} /></button></div></div>{type === 'flashcard' ? <button onClick={() => setFlipped({ ...flipped, [a._id]: !flipped[a._id] })} className="mt-2 w-full rounded-lg border border-slate-200 bg-white/80 p-2 text-left text-sm">{flipped[a._id] ? a.content?.[0]?.answer : a.content?.[0]?.question}</button> : <p className="mt-2 text-xs text-slate-500">{Array.isArray(a.content) ? a.content.length : 0} questions • Retry ready</p>}</div>)}</div></section>;
}

function QrSection() {
  const [docs, setDocs] = useState([]);
  const [form, setForm] = useState({ kind: 'pdf', docId: '', value: '', title: '', expiresIn: '7', visibility: 'public' });
  const [link, setLink] = useState('');
  const [qrPng, setQrPng] = useState('');
  const [qrSvg, setQrSvg] = useState('');

  useEffect(() => { apiRequest('/documents').then(setDocs); }, []);
  const selected = docs.find((d) => d._id === form.docId);

  const generateQr = async (value) => {
    if (!value) return;
    const png = await QRCode.toDataURL(value, { width: 320, margin: 1, color: { dark: '#111827', light: '#FFFFFF' } });
    const svg = await QRCode.toString(value, { type: 'svg', margin: 1, color: { dark: '#111827', light: '#FFFFFF' } });
    setQrPng(png);
    setQrSvg(svg);
  };

  const create = async () => {
    const value = form.kind === 'pdf' ? selected?.viewUrl || '' : form.value;
    const expiresAt = form.expiresIn === 'never' ? undefined : new Date(Date.now() + Number(form.expiresIn) * 86400000);
    const share = await apiRequest('/share', { method: 'POST', body: JSON.stringify({ kind: form.kind, title: form.title || selected?.title || 'Shared resource', payload: { value, documentId: selected?._id }, expiresAt, visibility: form.visibility }) });
    setLink(share.publicUrl);
    await generateQr(share.publicUrl);
  };

  const download = (content, fileName, type) => {
    if (!content) return;
    const blob = content.startsWith('data:') ? null : new Blob([content], { type });
    const a = document.createElement('a');
    a.href = blob ? URL.createObjectURL(blob) : content;
    a.download = fileName;
    a.click();
    if (blob) URL.revokeObjectURL(a.href);
  };

  return <section id="qr" className="panel p-5"><SectionHead icon={QrCode} title="QR Sharing" subtitle="Generate real QR codes for vault docs and links." /><div className="mt-4 grid gap-4 lg:grid-cols-[320px_1fr]"><div className="space-y-2"><Select label="Type" value={form.kind} onChange={(v) => setForm({ ...form, kind: v })} options={['pdf', 'link', 'note', 'flashcard', 'quiz', 'text', 'resource']} />{form.kind === 'pdf' ? <Select label="Document" value={form.docId} onChange={(v) => setForm({ ...form, docId: v })} options={['', ...docs.map((d) => d._id)]} labels={{ '': 'Select document', ...Object.fromEntries(docs.map((d) => [d._id, d.title])) }} /> : <Input label="Content" value={form.value} onChange={(v) => setForm({ ...form, value: v })} />}<Input label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} /><Select label="Access" value={form.visibility} onChange={(v) => setForm({ ...form, visibility: v })} options={['public', 'private']} /><Select label="Expiry" value={form.expiresIn} onChange={(v) => setForm({ ...form, expiresIn: v })} options={['1', '7', '30', 'never']} labels={{ 1: '1 day', 7: '7 days', 30: '30 days', never: 'Never' }} /><button onClick={create} className="btn-main w-full">Generate QR</button></div><div className="rounded-xl border border-white/80 bg-white/65 shadow-sm p-4"><div className="flex items-center justify-between"><p className="text-sm font-medium">QR Preview</p><Bell size={15} className="text-slate-400" /></div><div className="mt-4 flex flex-col items-center gap-3">{qrPng ? <img src={qrPng} alt="QR" className="h-56 w-56 rounded-xl border border-slate-200 bg-white p-2" /> : <div className="flex h-56 w-56 items-center justify-center rounded-xl border border-slate-200 text-xs text-slate-500">Generate a link to render QR</div>}<p className="w-full break-all rounded-lg border border-slate-200 bg-white/80 p-2 text-xs text-slate-500">{link || 'No share link yet'}</p><div className="flex flex-wrap gap-2"><button onClick={() => navigator.clipboard.writeText(link)} className="chip-dark"><Copy size={13} />Copy Link</button><button onClick={() => download(qrPng, 'aethr-qr.png', 'image/png')} className="chip-dark"><Download size={13} />PNG</button><button onClick={() => download(qrSvg, 'aethr-qr.svg', 'image/svg+xml')} className="chip-dark"><Download size={13} />SVG</button></div></div></div></div></section>;
}

function SectionHead({ icon: Icon, title, subtitle }) {
  return <div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-bold">{title}</h2><p className="text-sm text-slate-500">{subtitle}</p></div><div className="rounded-lg border border-slate-200 bg-white/70 p-2 text-slate-500 shadow-sm"><Icon size={15} /></div></div>;
}
function Stat({ label, value }) { return <div className="rounded-xl border border-white/80 bg-white/65 shadow-sm p-3"><p className="text-xs text-slate-500">{label}</p><p className="text-lg font-semibold">{value}</p></div>; }
function Input({ label, value, onChange, type = 'text', required }) { return <label className="block text-xs text-slate-500">{label}<input required={required} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white/80 px-2 text-sm text-slate-950" /></label>; }
function Select({ label, value, onChange, options, labels = {} }) { return <label className="block text-xs text-slate-500">{label}<select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white/80 px-2 text-sm text-slate-950">{options.map((o) => <option key={o} className="bg-white text-slate-950" value={o}>{labels[o] || o}</option>)}</select></label>; }

function Footer() {
  return (
    <footer className="mt-8 border-t border-white/70">
      <div className={`${shell} flex flex-col gap-2 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between`}>
        <p>© {new Date().getFullYear()} AETHR. All rights reserved.</p>
        <p>Built for focused study: Vault, Exams, Revision, QR Share.</p>
      </div>
    </footer>
  );
}



