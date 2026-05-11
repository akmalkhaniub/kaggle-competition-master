import React from 'react';
import { 
  Trophy, 
  LayoutDashboard, 
  Award, 
  Zap, 
  PieChart as PieIcon, 
  Terminal as TerminalIcon, 
  Settings,
  X,
  Menu
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isConsoleOpen: boolean;
  setIsConsoleOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isSidebarOpen, 
  setIsSidebarOpen,
  isConsoleOpen,
  setIsConsoleOpen
}) => {
  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
      <div className="h-full flex flex-col p-8">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="bg-[#20beff] p-2.5 rounded-xl shadow-lg shadow-blue-500/10">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900 uppercase">KCM Master</span>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-4">Workspace</p>
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Explore" active={activeTab === 'general'} onClick={() => setActiveTab('general')} />
          <SidebarItem icon={<Award size={20} />} label="Hall of Fame" active={activeTab === 'completed'} onClick={() => setActiveTab('completed')} />
          <SidebarItem icon={<Zap size={20} />} label="My Tracks" active={activeTab === 'entered'} onClick={() => setActiveTab('entered')} />
          <SidebarItem icon={<PieIcon size={20} />} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
          
          <div className="my-6 border-t border-slate-100" />
          
          <SidebarItem icon={<TerminalIcon size={20} />} label="Kaggle CLI" active={isConsoleOpen} onClick={() => setIsConsoleOpen(!isConsoleOpen)} />
          <SidebarItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="mt-auto">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <img 
                  src={`https://ui-avatars.com/api/?name=Akmal+Shahbaz&background=20beff&color=fff&bold=true`} 
                  className="w-11 h-11 rounded-full border-2 border-white shadow-sm"
                  alt="Avatar"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-900 truncate">akmal.shahbaz</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Grandmaster</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

const SidebarItem: React.FC<{ icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${
      active 
        ? 'bg-[#20beff] text-white shadow-xl shadow-blue-500/20' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <span className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-[#20beff]'} transition-colors`}>{icon}</span>
    <span className="font-black text-[10px] uppercase tracking-widest">{label}</span>
  </button>
);

export default Sidebar;
