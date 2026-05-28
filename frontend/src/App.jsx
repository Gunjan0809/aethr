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
    name: token ? 'AETHR Scholar' : 'Student',
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
        className="surface-3d fixed inset-0 z-[999] flex items-center justify-center"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.82, y: 20, rotateX: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <div className="rounded-[2rem] border border-white/80 bg-white/70 p-4 shadow-[0_28px_70px_rgba(31,41,55,0.18)] backdrop-blur-xl">
            <img
              src="/logo.svg"
              alt="AETHR logo"
              className="h-24 w-24 object-contain sm:h-28 sm:w-28"
            />
          </div>
          <motion.p
            className="mt-5 text-sm font-black text-slate-950"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.55 }}
          >
            AETHR
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
