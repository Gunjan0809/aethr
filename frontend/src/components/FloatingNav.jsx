import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Calendar, ClipboardList, Layers3, LayoutDashboard, QrCode, Sparkles, Trophy } from 'lucide-react';
import { AetherMark } from './Cinematic';

const navItems = [
  { name: 'Hub', path: '/', icon: LayoutDashboard },
  { name: 'Vault', path: '/vault', icon: BookOpen },
  { name: 'Deadlines', path: '/deadlines', icon: Calendar },
  { name: 'Exam', path: '/exam-engine', icon: ClipboardList },
  { name: 'Cards', path: '/flashcards', icon: Layers3 },
  { name: 'Oracle', path: '/mentor', icon: Sparkles },
  { name: 'QR', path: '/qr', icon: QrCode },
  { name: 'Rewards', path: '/rewards', icon: Trophy },
];

export default function FloatingNav() {
  const location = useLocation();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 py-4 md:px-7">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
        <Link to="/" className="hidden rounded-full border border-white/10 bg-black/25 px-4 py-2 backdrop-blur-2xl transition hover:border-white/20 md:flex">
          <AetherMark />
        </Link>
        <nav className="mx-auto flex items-center gap-1 rounded-full border border-white/10 bg-[#09090c]/70 p-1.5 shadow-[0_18px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl md:mx-0">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-2 rounded-full px-3 py-2 transition-all duration-300 md:px-4
                ${isActive
                  ? 'bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.16)]'
                  : 'text-white/45 hover:bg-white/7 hover:text-white'}
              `}
            >
              <item.icon size={16} />
              <span className="hidden text-[10px] font-black uppercase tracking-[0.22em] sm:inline">
                {item.name}
              </span>
            </Link>
          );
        })}
        </nav>
        <button
          onClick={() => { localStorage.clear(); window.location.reload(); }}
          className="hidden rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-white/50 backdrop-blur-2xl transition hover:border-white/20 hover:text-white md:block"
        >
          Exit
        </button>
      </div>
    </header>
  );
}
