import { useEffect, useMemo, useState } from 'react';
import { Copy, Download, QrCode, Share2 } from 'lucide-react';
import { apiRequest } from '../api';
import { GlassPanel, KineticButton, Reveal, SectionKicker } from '../components/Cinematic';
import { Field, inputClass } from '../components/FeaturePrimitives';

function pseudoQr(seed, fg, bg, rounded) {
  let hash = 0; for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const cells = 29; const size = 290; const unit = size / cells;
  const rects = [];
  for (let y = 0; y < cells; y++) for (let x = 0; x < cells; x++) {
    const finder = (x < 7 && y < 7) || (x > 21 && y < 7) || (x < 7 && y > 21);
    const bit = finder || (((x * 73856093) ^ (y * 19349663) ^ hash) % 7 < 3);
    if (bit) rects.push(`<rect x="${x * unit}" y="${y * unit}" width="${unit * .86}" height="${unit * .86}" rx="${rounded ? unit * .28 : 0}" fill="${fg}"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="28" fill="${bg}"/>${rects.join('')}</svg>`;
}

export default function QRGenerator() {
  const [docs, setDocs] = useState([]);
  const [form, setForm] = useState({ kind: 'link', title: '', value: '', docId: '', fg: '#ffffff', bg: '#050507', rounded: true, expiresIn: '7' });
  const [shareUrl, setShareUrl] = useState('');
  useEffect(() => { apiRequest('/documents').then(setDocs); }, []);
  const selectedDoc = docs.find((d) => d._id === form.docId);
  const qrValue = form.kind === 'pdf' ? (selectedDoc?.viewUrl || selectedDoc?.title || '') : form.value;
  const svg = useMemo(() => pseudoQr(qrValue || 'Aethr', form.fg, form.bg, form.rounded), [qrValue, form.fg, form.bg, form.rounded]);
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  const createShare = async () => {
    const expiresAt = form.expiresIn === 'never' ? undefined : new Date(Date.now() + Number(form.expiresIn) * 86400000);
    const share = await apiRequest('/share', { method: 'POST', body: JSON.stringify({ kind: form.kind, title: form.title || selectedDoc?.title || 'Shared resource', payload: { value: qrValue, documentId: form.docId }, expiresAt }) });
    setShareUrl(share.publicUrl);
    setForm((prev) => ({ ...prev, value: share.publicUrl }));
  };

  const download = (ext = 'svg') => {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `aethr-qr.${ext}`; a.click(); URL.revokeObjectURL(a.href);
  };

  return <div className="space-y-10"><Reveal><SectionKicker icon={QrCode}>QR generator</SectionKicker><h1 className="mt-6 text-[clamp(3.2rem,8vw,7rem)] font-black leading-[0.86] tracking-[-0.08em]">Share anything elegantly.</h1></Reveal><div className="grid gap-6 lg:grid-cols-[24rem_1fr]"><GlassPanel className="p-6"><div className="space-y-4"><Field label="QR type"><select className={inputClass} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>{['pdf','link','note','text','resource','quiz','flashcard'].map((x) => <option className="bg-[#111116]" key={x}>{x}</option>)}</select></Field>{form.kind === 'pdf' ? <Field label="Vault PDF"><select className={inputClass} value={form.docId} onChange={(e) => setForm({ ...form, docId: e.target.value })}><option className="bg-[#111116]" value="">Select PDF</option>{docs.map((d) => <option className="bg-[#111116]" value={d._id} key={d._id}>{d.title}</option>)}</select></Field> : <Field label="Content / URL"><textarea className={`${inputClass} min-h-28`} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></Field>}<Field label="Title"><input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field><div className="grid grid-cols-2 gap-3"><Field label="Foreground"><input type="color" className={inputClass} value={form.fg} onChange={(e) => setForm({ ...form, fg: e.target.value })} /></Field><Field label="Background"><input type="color" className={inputClass} value={form.bg} onChange={(e) => setForm({ ...form, bg: e.target.value })} /></Field></div><label className="text-sm text-white/45"><input type="checkbox" checked={form.rounded} onChange={(e) => setForm({ ...form, rounded: e.target.checked })} /> Rounded QR style</label><Field label="Expiration"><select className={inputClass} value={form.expiresIn} onChange={(e) => setForm({ ...form, expiresIn: e.target.value })}><option className="bg-[#111116]" value="1">1 day</option><option className="bg-[#111116]" value="7">7 days</option><option className="bg-[#111116]" value="30">30 days</option><option className="bg-[#111116]" value="never">Never</option></select></Field><KineticButton onClick={createShare} className="w-full"><Share2 size={15} /> Public link</KineticButton></div></GlassPanel><GlassPanel className="p-6"><div className="flex flex-col items-center justify-center gap-6"><div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl"><img src={dataUrl} alt="QR preview" className="h-72 w-72" /></div>{shareUrl && <button onClick={() => navigator.clipboard.writeText(shareUrl)} className="text-xs font-black uppercase tracking-[0.2em] text-white/45"><Copy size={14} className="inline" /> Copy {shareUrl}</button>}<div className="flex flex-wrap justify-center gap-3"><KineticButton onClick={() => download('svg')}><Download size={15} /> SVG</KineticButton><button onClick={() => download('png')} className="rounded-full border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white/50">PNG-ready SVG</button><button onClick={() => print()} className="rounded-full border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white/50">PDF</button></div></div></GlassPanel></div></div>;
}
