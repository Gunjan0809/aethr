import { useEffect, useMemo, useState } from 'react';
import { Maximize2, Play, Timer, Wand2 } from 'lucide-react';
import { apiRequest } from '../api';
import { GlassPanel, KineticButton, Reveal, SectionKicker } from '../components/Cinematic';
import { EmptyState, Field, Pill, SkeletonCard, inputClass } from '../components/FeaturePrimitives';

export default function ExamEngine() {
  const [docs, setDocs] = useState([]);
  const [exams, setExams] = useState([]);
  const [active, setActive] = useState(null);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({ documentIds: [], subjects: '', difficulty: 'mixed', durationMinutes: 60, totalMarks: 100, negativeMarking: 0, config: { mcq: 5, short: 3, long: 2 } });
  const [questionIndex, setQuestionIndex] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => { apiRequest('/documents').then(setDocs); apiRequest('/exams').then(setExams); }, []);
  useEffect(() => {
    if (!active || !startedAt) return undefined;
    const timer = setInterval(() => {
      const left = Math.max(0, active.durationMinutes * 60 - Math.floor((Date.now() - startedAt) / 1000));
      setSecondsLeft(left);
      if (left === 0) submit();
    }, 1000);
    return () => clearInterval(timer);
  }, [active, startedAt]);
  useEffect(() => {
    const warn = (e) => { if (active) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [active]);

  const q = active?.questions?.[questionIndex];
  const progress = useMemo(() => active?.questions?.length ? Math.round((Object.keys(answers).length / active.questions.length) * 100) : 0, [answers, active]);

  const generate = async (event) => {
    event.preventDefault(); setLoading(true);
    const exam = await apiRequest('/exams/generate', { method: 'POST', body: JSON.stringify({ ...config, subjects: config.subjects.split(',').map((x) => x.trim()).filter(Boolean) }) });
    setExams((prev) => [exam, ...prev]); setActive(exam); setStartedAt(Date.now()); setSecondsLeft(exam.durationMinutes * 60); setLoading(false);
  };

  async function submit() {
    if (!active || result) return;
    const attempt = await apiRequest(`/exams/${active._id}/submit`, { method: 'POST', body: JSON.stringify({ answers, timeSpentSeconds: active.durationMinutes * 60 - secondsLeft }) });
    setResult(attempt);
  }

  const openExam = (exam) => { setActive(exam); setAnswers({}); setMarked({}); setResult(null); setQuestionIndex(0); setStartedAt(Date.now()); setSecondsLeft(exam.durationMinutes * 60); };

  return (
    <div className="space-y-10">
      <Reveal><SectionKicker icon={Wand2}>Exam engine</SectionKicker><h1 className="mt-6 text-[clamp(3.2rem,8vw,7rem)] font-black leading-[0.86] tracking-[-0.08em]">Generate, attempt, improve.</h1></Reveal>
      {!active ? (
        <div className="grid gap-6 lg:grid-cols-[25rem_1fr]">
          <GlassPanel className="p-6"><form onSubmit={generate} className="space-y-4">
            <Field label="PDF sources"><div className="max-h-48 space-y-2 overflow-auto rounded-2xl border border-white/10 bg-white/[0.03] p-3">{docs.map((doc) => <label key={doc._id} className="flex gap-2 text-sm text-white/55"><input type="checkbox" onChange={(e) => setConfig((c) => ({ ...c, documentIds: e.target.checked ? [...c.documentIds, doc._id] : c.documentIds.filter((id) => id !== doc._id) }))} />{doc.title}</label>)}</div></Field>
            <Field label="Subjects"><input className={inputClass} value={config.subjects} onChange={(e) => setConfig({ ...config, subjects: e.target.value })} placeholder="Physics, Chemistry" /></Field>
            <div className="grid grid-cols-2 gap-3"><Field label="Difficulty"><select className={inputClass} value={config.difficulty} onChange={(e) => setConfig({ ...config, difficulty: e.target.value })}>{['mixed','easy','medium','hard'].map((x) => <option className="bg-[#111116]" key={x}>{x}</option>)}</select></Field><Field label="Minutes"><input className={inputClass} type="number" value={config.durationMinutes} onChange={(e) => setConfig({ ...config, durationMinutes: Number(e.target.value) })} /></Field></div>
            <div className="grid grid-cols-2 gap-3"><Field label="Marks"><input className={inputClass} type="number" value={config.totalMarks} onChange={(e) => setConfig({ ...config, totalMarks: Number(e.target.value) })} /></Field><Field label="Negative"><input className={inputClass} type="number" value={config.negativeMarking} onChange={(e) => setConfig({ ...config, negativeMarking: Number(e.target.value) })} /></Field></div>
            <KineticButton type="submit" className="w-full">{loading ? 'Generating' : 'Generate exam'}</KineticButton>
          </form></GlassPanel>
          <div className="space-y-4">{loading && <SkeletonCard />}{exams.length === 0 ? <EmptyState>No generated exams yet</EmptyState> : exams.map((exam) => <GlassPanel interactive className="p-5" key={exam._id}><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><Pill tone="info">{exam.difficulty}</Pill><h2 className="mt-3 text-2xl font-black">{exam.title}</h2><p className="text-sm text-white/40">{exam.questions?.length || 0} questions · {exam.durationMinutes} min · {exam.totalMarks} marks</p></div><KineticButton onClick={() => openExam(exam)}><Play size={15} /> Start</KineticButton></div></GlassPanel>)}</div>
        </div>
      ) : (
        <GlassPanel className="overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-white/10 p-5 md:flex-row md:items-center md:justify-between"><button onClick={() => setActive(null)} className="text-left text-xs font-black uppercase tracking-[0.22em] text-white/35">Exit exam</button><div className="flex items-center gap-3"><Pill tone={secondsLeft < 300 ? 'danger' : 'info'}><Timer size={12} /> {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}</Pill><button onClick={() => document.documentElement.requestFullscreen?.()} className="rounded-full border border-white/10 p-3 text-white/45"><Maximize2 size={15} /></button></div></div>
          {result ? <Result result={result} /> : <div className="grid min-h-[34rem] lg:grid-cols-[1fr_18rem]"><main className="p-6 md:p-8"><div className="mb-5 h-1 rounded-full bg-white/10"><div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} /></div>{q && <><Pill>{q.type} · {q.marks || 1} marks</Pill><h2 className="mt-5 text-3xl font-black tracking-[-0.04em]">{q.question}</h2>{q.options ? <div className="mt-8 grid gap-3">{q.options.map((option) => <button key={option} onClick={() => setAnswers({ ...answers, [q.id]: option })} className={`rounded-2xl border p-4 text-left transition ${answers[q.id] === option ? 'border-white bg-white text-black' : 'border-white/10 bg-white/[0.035] text-white/60 hover:text-white'}`}>{option}</button>)}</div> : <textarea className={`${inputClass} mt-8 min-h-40`} value={answers[q.id] || ''} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />}</>}<div className="mt-8 flex flex-wrap gap-3"><KineticButton onClick={() => setQuestionIndex(Math.min(questionIndex + 1, active.questions.length - 1))}>Save & next</KineticButton><button onClick={() => setMarked({ ...marked, [q.id]: !marked[q.id] })} className="rounded-full border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white/50">Mark review</button><button onClick={submit} className="rounded-full border border-rose-400/30 bg-rose-400/10 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-rose-300">Submit</button></div></main><aside className="border-t border-white/10 p-5 lg:border-l lg:border-t-0"><div className="grid grid-cols-5 gap-2">{active.questions.map((question, i) => <button key={question.id} onClick={() => setQuestionIndex(i)} className={`rounded-xl border p-3 text-xs font-black ${i === questionIndex ? 'border-white bg-white text-black' : marked[question.id] ? 'border-amber-400/30 text-amber-300' : answers[question.id] ? 'border-emerald-400/30 text-emerald-300' : 'border-white/10 text-white/35'}`}>{i + 1}</button>)}</div></aside></div>}
        </GlassPanel>
      )}
    </div>
  );
}

function Result({ result }) {
  return <div className="grid gap-5 p-8 md:grid-cols-3"><GlassPanel className="p-6"><p className="text-white/35">Score</p><div className="mt-3 text-6xl font-black">{result.score}</div></GlassPanel><GlassPanel className="p-6"><p className="text-white/35">Accuracy</p><div className="mt-3 text-6xl font-black">{result.accuracy}%</div></GlassPanel><GlassPanel className="p-6"><p className="text-white/35">Feedback</p><p className="mt-3 text-sm text-white/55">{result.feedback}</p></GlassPanel><GlassPanel className="p-6 md:col-span-3"><p className="text-white/35">Suggested revision</p><div className="mt-4 flex flex-wrap gap-2">{(result.revisionAreas || []).map((x) => <Pill key={x} tone="warn">{x}</Pill>)}</div></GlassPanel></div>;
}
