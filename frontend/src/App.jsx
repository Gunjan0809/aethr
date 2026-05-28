import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LayoutWrapper from './components/LayoutWrapper';
import Dashboard from './pages/Dashboard';
import StudyVault from './pages/StudyVault';
import AIMentor from './pages/AIMentor';
import Planner from './pages/Planner';
import Auth from './pages/Auth';
import { GlassPanel, Reveal, SectionKicker } from './components/Cinematic';
import Deadlines from './pages/Deadlines';
import ExamEngine from './pages/ExamEngine';
import { Flashcards, PracticeQuizzes } from './pages/StudyAssets';
import QRGenerator from './pages/QRGenerator';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
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

  const handleStatsUpdate = (updatedStats) => {
    setUserStats((prev) => ({ ...prev, ...updatedStats }));
  };

  if (!token) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <Router>
      <LayoutWrapper>
        <Routes>
          <Route path="/" element={<Dashboard userStats={userStats} />} />
          <Route path="/vault" element={<StudyVault />} />
          <Route path="/planner" element={<Planner onStatsUpdate={handleStatsUpdate} />} />
          <Route path="/deadlines" element={<Deadlines />} />
          <Route path="/exam-engine" element={<ExamEngine />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/quizzes" element={<PracticeQuizzes />} />
          <Route path="/qr" element={<QRGenerator />} />
          <Route path="/mentor" element={<AIMentor />} />
          <Route path="/rewards" element={
            <div className="mx-auto max-w-5xl space-y-8 pt-10 text-center">
              <Reveal>
                <SectionKicker>Recognition layer</SectionKicker>
                <h1 className="mt-6 text-[clamp(3.4rem,8vw,7rem)] font-black leading-[0.86] tracking-[-0.08em]">Rewards are being forged.</h1>
                <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-white/45">Milestones, badges, and learning identity will live here as a polished achievement surface.</p>
              </Reveal>
              <GlassPanel className="p-10">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-white/35">Coming soon</p>
              </GlassPanel>
            </div>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}
