import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import StudyVault from './pages/StudyVault';
import AIMentor from './pages/AIMentor';
import Planner from './pages/Planner';
import Auth from './pages/Auth';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [userStats, setUserStats] = useState({ name: 'Student', xp: 0, level: 1, streak: 1 });

  useEffect(() => {
    if (token) {
      // Decode mock credentials on app start or fetch standard dashboard data
      setUserStats((prev) => ({ ...prev, name: 'Aether Scholar' }));
    }
  }, [token]);

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
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 min-h-screen">
        {currentTab === 'dashboard' && <Dashboard userStats={userStats} />}
        {currentTab === 'vault' && <StudyVault />}
        {currentTab === 'planner' && <Planner onStatsUpdate={handleStatsUpdate} />}
        {currentTab === 'ai' && <AIMentor />}
        {currentTab === 'rewards' && (
          <div className="p-10 ml-64 text-center mt-20">
            <h2 className="text-2xl font-bold">Rewards & Badges</h2>
            <p className="text-gray-500 mt-2">Achieve your milestones to unlock digital badges!</p>
          </div>
        )}
      </main>
    </div>
  );
}