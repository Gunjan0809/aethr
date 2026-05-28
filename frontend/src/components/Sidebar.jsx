import { LayoutDashboard, BookOpen, Calendar, HelpCircle, Trophy, LogOut } from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab }) {
    const menuItems = [
        { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
        { id: 'vault', name: 'Study Vault', icon: BookOpen },
        { id: 'planner', name: 'Planner', icon: Calendar },
        { id: 'ai', name: 'AI Mentor', icon: HelpCircle },
        { id: 'rewards', name: 'Rewards', icon: Trophy },
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between h-screen fixed left-0 top-0">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-brand-blue tracking-tight">Aether</h1>
                <nav className="mt-8 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setCurrentTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                        ? 'bg-brand-lightBlue text-brand-blue font-semibold'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon size={18} />
                                {item.name}
                            </button>
                        );
                    })}
                </nav>
            </div>
            <div className="p-6 border-t border-gray-50">
                <button
                    onClick={() => { localStorage.clear(); window.location.reload(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </aside>
    );
}
