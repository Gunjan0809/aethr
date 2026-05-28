import { useEffect, useMemo, useState } from 'react';
import { Heart, RotateCcw, Search } from 'lucide-react';
import { apiRequest } from '../api';
import { GlassPanel, KineticButton, Reveal, SectionKicker } from '../components/Cinematic';
import { EmptyState, Field, Pill, SkeletonCard, inputClass } from '../components/FeaturePrimitives';

export function Flashcards() {
  return <AssetBrowser type="flashcard" title="My Flashcards" kicker="Revision cards" />;
}

export function PracticeQuizzes() {
  return <AssetBrowser type="quiz" title="Practice Quizzes" kicker="Attempt history" />;
}

function AssetBrowser({ type, title, kicker }) {
  const [assets, setAssets] = useState([]);
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [flipped, setFlipped] = useState({});
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});

  const load = async () => { setLoading(true); setAssets(await apiRequest(`/assets?type=${type}`)); setLoading(false); };
  useEffect(() => { load(); }, [type]);

  const subjects = [...new Set(assets.flatMap((a) => [a.subject, ...(a.tags || [])]).filter(Boolean))];
  const filtered = useMemo(() => assets.filter((a) => `${a.title} ${a.subject} ${(a.tags || []).join(' ')}`.toLowerCase().includes(query.toLowerCase()) && (!subject || a.subject === subject || a.tags?.includes(subject))), [assets, query, subject]);

  const toggleFavorite = async (asset) => {
    const updated = await apiRequest(`/assets/${asset._id}`, { method: 'PATCH', body: JSON.stringify({ favorite: !asset.favorite }) });
    setAssets((prev) => prev.map((a) => a._id === updated._id ? updated : a));
  };

  if (activeQuiz) return <QuizAttempt asset={activeQuiz} answers={answers} setAnswers={setAnswers} onBack={() => { setActiveQuiz(null); setAnswers({}); }} />;

  return (
    <div className="space-y-10">
      <Reveal><SectionKicker>{kicker}</SectionKicker><h1 className="mt-6 text-[clamp(3.2rem,8vw,7rem)] font-black leading-[0.86] tracking-[-0.08em]">{title}</h1></Reveal>
      <GlassPanel className="p-4 md:p-5"><div className="grid gap-3 md:grid-cols-[1fr_14rem]"><div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" size={16} /><input className={`${inputClass} pl-11`} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by subject, topic, title..." /></div><select className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)}><option className="bg-[#111116]" value="">All subjects</option>{subjects.map((s) => <option className="bg-[#111116]" key={s}>{s}</option>)}</select></div></GlassPanel>
      {loading ? <SkeletonCard /> : filtered.length === 0 ? <EmptyState>No generated {type === 'quiz' ? 'quizzes' : 'flashcards'} yet</EmptyState> : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map((asset) => <GlassPanel interactive className="p-5" key={asset._id}><div className="mb-5 flex items-start justify-between gap-3"><div><Pill tone="info">{asset.subject || asset.tags?.[0] || 'General'}</Pill><h2 className="mt-3 line-clamp-2 text-xl font-black">{asset.title}</h2></div><button onClick={() => toggleFavorite(asset)} className={`rounded-full border border-white/10 p-3 ${asset.favorite ? 'text-rose-300' : 'text-white/30'}`}><Heart size={16} /></button></div>{type === 'flashcard' ? <FlashcardSet asset={asset} flipped={flipped} setFlipped={setFlipped} /> : <QuizCard asset={asset} onStart={() => setActiveQuiz(asset)} />}</GlassPanel>)}</div>
      )}
    </div>
  );
}

function FlashcardSet({ asset, flipped, setFlipped }) {
  const cards = Array.isArray(asset.content) ? asset.content : [];
  const card = cards[0] || {};
  return <button onClick={() => setFlipped({ ...flipped, [asset._id]: !flipped[asset._id] })} className="min-h-56 w-full rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-left transition hover:border-white/20"><div className="mb-4 flex justify-between"><Pill>{asset.difficulty}</Pill><RotateCcw size={15} className="text-white/30" /></div><p className="text-lg font-bold leading-7">{flipped[asset._id] ? card.answer : card.question}</p><p className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/25">{flipped[asset._id] ? 'Answer' : 'Question'} · {cards.length} cards</p></button>;
}

function QuizCard({ asset, onStart }) {
  const questions = Array.isArray(asset.content) ? asset.content : [];
  const accuracy = asset.progress?.attempts ? Math.round((asset.progress.correct / asset.progress.attempts) * 100) : 0;
  return <div className="space-y-5"><div className="grid grid-cols-2 gap-3"><GlassPanel className="p-4"><p className="text-white/30">Questions</p><div className="text-3xl font-black">{questions.length}</div></GlassPanel><GlassPanel className="p-4"><p className="text-white/30">Accuracy</p><div className="text-3xl font-black">{accuracy}%</div></GlassPanel></div><KineticButton onClick={onStart} className="w-full">Timed practice</KineticButton></div>;
}

function QuizAttempt({ asset, answers, setAnswers, onBack }) {
  const questions = Array.isArray(asset.content) ? asset.content : [];
  const score = questions.filter((q, i) => answers[i] && answers[i] === q.correctAnswer).length;
  return <div className="space-y-6"><button onClick={onBack} className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Back to quizzes</button><GlassPanel className="p-6"><h1 className="text-4xl font-black">{asset.title}</h1><p className="mt-2 text-white/40">Score preview: {score}/{questions.length}</p></GlassPanel><div className="space-y-4">{questions.map((q, i) => <GlassPanel className="p-5" key={i}><h2 className="font-bold">{i + 1}. {q.question}</h2><div className="mt-4 grid gap-2">{(q.options || []).map((o) => <button key={o} onClick={() => setAnswers({ ...answers, [i]: o })} className={`rounded-2xl border p-3 text-left ${answers[i] === o ? 'border-white bg-white text-black' : 'border-white/10 text-white/55'}`}>{o}</button>)}</div>{answers[i] && <p className="mt-4 text-sm text-white/45">AI explanation: Correct answer is {q.correctAnswer}. Revisit the related concept if this felt uncertain.</p>}</GlassPanel>)}</div></div>;
}
