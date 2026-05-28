import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import LayoutWrapper from './components/LayoutWrapper';
import Auth from './pages/Auth';
import Workspace from './pages/Workspace';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [showSplash, setShowSplash] = useState(true);
  const [userStats, setUserStats] = useState({
    name: token ? 'Aether Scholar' : 'Student',
    xp: 0,
    level: 1,
    streak: 1,
  });

  const handleAuthSuccess = (data) => {
    setToken(data.token);
    setUserStats({
      name: data.name,
      xp: data.xp || 0,
      level: data.level || 1,
      streak: data.streak || 1,
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2100);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <LaunchSplash />;
  }

  if (!token) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <Router>
      <LayoutWrapper>
        <Routes>
          <Route path="/" element={<Workspace userStats={userStats} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}

function LaunchSplash() {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.82, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <div className="rounded-3xl border border-white/20 bg-white/10 p-3 shadow-[0_0_45px_rgba(255,255,255,0.35)] backdrop-blur-sm">
            <img
              src="/logo.png"
              alt="Aethr logo"
              className="h-24 w-24 rounded-2xl object-contain brightness-150 contrast-125 saturate-150 drop-shadow-[0_0_24px_rgba(255,255,255,0.65)] sm:h-28 sm:w-28"
            />
          </div>
          <motion.p
            className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-white/70"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.55 }}
          >
            Aethr Study Platform
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
