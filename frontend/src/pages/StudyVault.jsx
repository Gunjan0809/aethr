import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BrainCircuit, Download, Eye, ExternalLink, FileText, MessageSquare, Sparkles, Tag, Upload, X } from 'lucide-react';
import { apiRequest } from '../api';
import { GlassPanel, KineticButton, Reveal, SectionKicker } from '../components/Cinematic';

export default function StudyVault() {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [activeDoc, setActiveDoc] = useState(null);
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [pdfState, setPdfState] = useState({ loading: false, error: '', previewUrl: '' });

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docs = await apiRequest('/documents');
        setDocuments(docs);
      } catch (err) {
        console.error('Error fetching documents', err);
      }
    };

    fetchDocuments();
  }, []);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { uploadUrl, s3Key } = await apiRequest('/documents/upload-url', {
        method: 'POST',
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });

      const s3Response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!s3Response.ok) throw new Error('S3 upload failed');

      const savedDocument = await apiRequest('/documents', {
        method: 'POST',
        body: JSON.stringify({
          title: file.name,
          s3Key,
          fileType: file.type,
          fileSize: file.size,
          tags: ['PDF Study'],
        }),
      });

      setDocuments((prev) => [...prev, savedDocument]);
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDocChat = async (event) => {
    event.preventDefault();
    if (!chatQuestion.trim() || chatLoading) return;

    const userMsg = chatQuestion;
    setChatHistory((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatQuestion('');
    setChatLoading(true);

    try {
      const data = await apiRequest('/ai/doc-chat', {
        method: 'POST',
        body: JSON.stringify({ documentId: activeDoc._id, question: userMsg }),
      });
      setChatHistory((prev) => [...prev, { sender: 'ai', text: data.response }]);
    } catch {
      setChatHistory((prev) => [...prev, { sender: 'ai', text: 'I could not retrieve a clean answer from this document yet.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const generateStudyAsset = async (type) => {
    setGenerating(true);
    try {
      const aiResponse = await apiRequest('/ai/generate', {
        method: 'POST',
        body: JSON.stringify({ text: activeDoc.extractedText || activeDoc.title, type }),
      });

      await apiRequest('/assets', {
        method: 'POST',
        body: JSON.stringify({
          documentId: activeDoc._id,
          type,
          title: `AI Generated ${type === 'quiz' ? 'Quiz' : 'Flashcards'} - ${activeDoc.title}`,
          content: aiResponse.data,
          tags: ['AI Generated'],
        }),
      });

      alert(`Generated and saved study ${type} items.`);
    } catch (err) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const getPdfUrl = async (doc, download = false) => {
    setPdfState({ loading: true, error: '', previewUrl: pdfState.previewUrl });
    try {
      const data = await apiRequest(`/documents/${doc._id}/url${download ? '?download=true' : ''}`);
      setPdfState({ loading: false, error: '', previewUrl: download ? pdfState.previewUrl : data.url });
      return data.url;
    } catch (error) {
      setPdfState({ loading: false, error: error.message || 'PDF unavailable', previewUrl: '' });
      return '';
    }
  };

  const openPdf = async (doc) => {
    const url = await getPdfUrl(doc);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const downloadPdf = async (doc) => {
    const url = await getPdfUrl(doc, true);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-16">
      <Reveal>
        <header className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <SectionKicker icon={FileText}>Knowledge archive</SectionKicker>
            <h1 className="mt-6 max-w-5xl text-[clamp(3.4rem,8vw,7.4rem)] font-black leading-[0.86] tracking-[-0.08em]">
              Your material, made queryable.
            </h1>
          </div>
          <label className="group inline-flex cursor-pointer items-center justify-center gap-3 rounded-full border border-white/15 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-black shadow-[0_16px_60px_rgba(255,255,255,0.12)] transition hover:-translate-y-0.5 hover:bg-white/90">
            <Upload size={16} />
            {uploading ? 'Parsing PDF' : 'Ingest PDF'}
            <input type="file" onChange={handleUpload} disabled={uploading} className="hidden" accept=".pdf" />
          </label>
        </header>
      </Reveal>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {documents.map((doc, index) => (
          <Reveal key={doc._id} delay={index * 0.05}>
            <button
              onClick={() => { setActiveDoc(doc); setChatHistory([]); }}
              className="group block h-full w-full text-left"
            >
              <GlassPanel interactive className="flex min-h-72 flex-col justify-between p-6">
                <div>
                  <div className="mb-8 flex items-start justify-between gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-white/50 transition group-hover:text-white">
                      <FileText size={24} />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/30">
                      {doc.fileSize ? `${(doc.fileSize / 1024 / 1024).toFixed(2)} MB` : 'PDF'}
                    </span>
                  </div>
                  <h2 className="line-clamp-2 text-2xl font-black tracking-[-0.04em]">{doc.title}</h2>
                </div>
                <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-5">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
                    <Tag size={11} /> {doc.tags?.[0] || 'Knowledge'}
                  </span>
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/45 transition group-hover:text-white">
                    Focus <ArrowRight size={13} />
                  </span>
                </div>
              </GlassPanel>
            </button>
          </Reveal>
        ))}
      </section>

      {documents.length === 0 && (
        <GlassPanel className="p-14 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-white/30">No documents in the vault yet. Upload a PDF to begin.</p>
        </GlassPanel>
      )}

      <AnimatePresence>
        {activeDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-[#050507]/88 p-4 backdrop-blur-2xl md:p-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="grid h-[88vh] w-full max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#09090c]/95 shadow-[0_30px_120px_rgba(0,0,0,0.7)] lg:grid-cols-[24rem_1fr]"
            >
              <aside className="flex flex-col justify-between border-b border-white/10 p-6 lg:border-b-0 lg:border-r">
                <div>
                  <div className="mb-8 flex items-start justify-between">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-accent-indigo">
                      <FileText size={24} />
                    </div>
                    <button onClick={() => setActiveDoc(null)} className="rounded-full border border-white/10 p-2 text-white/40 transition hover:text-white">
                      <X size={18} />
                    </button>
                  </div>
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-white/30">Focus document</p>
                  <h2 className="text-3xl font-black tracking-[-0.05em]">{activeDoc.title}</h2>
                  <p className="mt-5 text-sm leading-7 text-white/45">Generate structured practice assets or ask contextual questions against this document.</p>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-white/35">
                    <span>Size: {activeDoc.fileSize ? `${(activeDoc.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}</span>
                    <span>Type: {activeDoc.resourceType || 'resource'}</span>
                    <span>Subject: {activeDoc.subject || activeDoc.tags?.[0] || 'General'}</span>
                    <span>Uploaded: {activeDoc.createdAt ? new Date(activeDoc.createdAt).toLocaleDateString() : '-'}</span>
                  </div>
                  <div className="mt-6 grid gap-3">
                    <ActionButton onClick={() => openPdf(activeDoc)} icon={ExternalLink}>Open PDF</ActionButton>
                    <ActionButton onClick={() => getPdfUrl(activeDoc)} icon={Eye}>Preview PDF</ActionButton>
                    <ActionButton onClick={() => downloadPdf(activeDoc)} icon={Download}>Download PDF</ActionButton>
                  </div>
                  <div className="mt-8 grid gap-3">
                    <ActionButton onClick={() => generateStudyAsset('flashcard')} disabled={generating} icon={Sparkles}>Flashcards</ActionButton>
                    <ActionButton onClick={() => generateStudyAsset('quiz')} disabled={generating} icon={BrainCircuit}>Practice quiz</ActionButton>
                  </div>
                </div>
                <p className="mt-8 truncate font-mono text-[10px] uppercase tracking-[0.18em] text-white/22">ID {activeDoc._id}</p>
              </aside>

              <section className="flex min-h-0 flex-col">
                <div className="flex items-center justify-between border-b border-white/10 p-5">
                  <h3 className="text-xs font-black uppercase tracking-[0.24em] text-white/40">Contextual Oracle</h3>
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300/70">
                    <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.8)]" /> Active
                  </span>
                </div>
                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 md:p-8">
                  {pdfState.loading && <div className="h-60 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]" />}
                  {pdfState.error && <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">{pdfState.error}</div>}
                  {pdfState.previewUrl && (
                    <iframe title={activeDoc.title} src={pdfState.previewUrl} className="h-[55vh] w-full rounded-3xl border border-white/10 bg-white" />
                  )}
                  {chatHistory.map((msg, index) => (
                    <motion.div
                      key={`${msg.sender}-${index}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-2xl rounded-[1.4rem] p-5 text-sm leading-7 ${
                        msg.sender === 'user'
                          ? 'rounded-tr-sm bg-white text-black'
                          : 'rounded-tl-sm border border-white/10 bg-white/[0.045] text-white/70'
                      }`}>
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                  {chatLoading && <div className="text-xs font-black uppercase tracking-[0.22em] text-white/30">Analyzing document...</div>}
                  {chatHistory.length === 0 && (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <MessageSquare size={40} className="mb-5 text-white/18" />
                      <p className="max-w-sm text-sm leading-7 text-white/35">Ask for a summary, quiz angle, definition, or comparison. The answer stays anchored to this document.</p>
                    </div>
                  )}
                </div>
                <form onSubmit={handleDocChat} className="flex gap-3 border-t border-white/10 p-4 md:p-5">
                  <input
                    type="text"
                    value={chatQuestion}
                    onChange={(event) => setChatQuestion(event.target.value)}
                    placeholder="Query this document..."
                    className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-accent-indigo/60"
                  />
                  <KineticButton type="submit" className="px-5">Ask</KineticButton>
                </form>
              </section>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionButton({ icon: Icon, children, ...props }) {
  return (
    <button
      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left text-xs font-black uppercase tracking-[0.18em] text-white/55 transition hover:border-white/24 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    >
      <span className="flex items-center gap-3"><Icon size={15} className="text-accent-indigo" /> {children}</span>
      <ArrowRight size={14} />
    </button>
  );
}
