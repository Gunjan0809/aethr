import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Cpu, Send, Sparkles } from 'lucide-react';
import { apiRequest } from '../api';
import { GlassPanel, KineticButton, Reveal, SectionKicker } from '../components/Cinematic';

export default function AIMentor() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'I am Aethr Oracle. Bring me a concept, document question, or exam problem and I will help you compress it into clarity.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const data = await apiRequest('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ question: input }),
      });
      setMessages((prev) => [...prev, { sender: 'ai', text: data.response }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'ai', text: err.message || 'The Oracle hit interference. Try a sharper prompt.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-6xl flex-col">
      <Reveal>
        <header className="mb-8 text-center md:mb-12">
          <SectionKicker icon={Cpu}>Neural interface</SectionKicker>
          <h1 className="mx-auto mt-6 max-w-5xl text-[clamp(3.4rem,8vw,7.5rem)] font-black leading-[0.86] tracking-[-0.08em]">
            Ask better. Learn faster.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/45 md:text-base">
            A calm AI mentor for explanations, study strategy, recall practice, and high-signal synthesis.
          </p>
        </header>
      </Reveal>

      <GlassPanel className="relative flex min-h-[34rem] flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-white/10 p-4 md:p-5">
          <span className="text-xs font-black uppercase tracking-[0.24em] text-white/40">Oracle stream</span>
          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent-indigo">
            <Sparkles size={12} /> Live synthesis
          </span>
        </div>

        <div ref={scrollRef} className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 md:p-8">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div
                key={`${msg.sender}-${index}`}
                initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-3xl rounded-[1.6rem] p-5 text-sm leading-7 md:p-6 ${
                  msg.sender === 'user'
                    ? 'rounded-tr-sm bg-white text-black shadow-[0_18px_60px_rgba(255,255,255,0.12)]'
                    : 'rounded-tl-sm border border-white/10 bg-white/[0.045] text-white/72'
                }`}>
                  {msg.text}
                  <div className={`mt-4 font-mono text-[9px] uppercase tracking-[0.22em] ${msg.sender === 'user' ? 'text-black/35' : 'text-white/25'}`}>
                    {msg.sender === 'user' ? 'Query' : 'Synthesis'}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
              <Sparkles size={13} className="animate-spin text-accent-indigo" /> Synthesizing
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="border-t border-white/10 p-4 md:p-5">
          <div className="flex gap-3 rounded-[1.4rem] border border-white/10 bg-black/25 p-2 backdrop-blur-xl transition focus-within:border-accent-indigo/60">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask for a concept map, explanation, or practice question..."
              className="min-w-0 flex-1 bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/22"
            />
            <KineticButton type="submit" className="px-4 py-3" icon={false}>
              <Send size={16} />
            </KineticButton>
          </div>
        </form>
      </GlassPanel>
    </div>
  );
}
