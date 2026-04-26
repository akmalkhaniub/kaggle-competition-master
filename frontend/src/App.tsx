import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Search, 
  Download, 
  FileText, 
  Settings, 
  TrendingUp, 
  LayoutDashboard,
  ExternalLink,
  Loader2,
  Calendar,
  DollarSign,
  ChevronRight,
  Bell,
  Menu,
  X,
  Plus,
  Users,
  Award,
  Zap,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Competition {
  ref: string;
  title: string;
  url: string;
  deadline: string;
  category: string;
  reward: string;
  userHasEntered: boolean;
}

interface LeaderboardEntry {
  teamName: string;
  rank: number;
  score: string;
}

const App: React.FC = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('general'); // general, completed, entered
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedComp, setSelectedComp] = useState<Competition | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const fetchCompetitions = async (group = activeTab) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/competitions?group=${group}${searchTerm ? `&search=${searchTerm}` : ''}`);
      const data = await response.json();
      setCompetitions(data);
    } catch (error) {
      console.error('Error fetching competitions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, [activeTab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCompetitions();
  };

  const handleDownload = async (ref: string) => {
    const slug = ref.split('/').pop() || ref;
    try {
      const response = await fetch(`/api/competitions/${slug}/download`, { method: 'POST' });
      const result = await response.json();
      alert(result.status === 'success' ? 'Download started to backend/downloads!' : 'Error: ' + result.message);
    } catch (error) {
      alert('Failed to connect to backend');
    }
  };

  const handleInitNotebook = async (ref: string) => {
    const slug = ref.split('/').pop() || ref;
    try {
      const response = await fetch(`/api/competitions/${slug}/init-notebook`, { method: 'POST' });
      const result = await response.json();
      alert(result.status === 'success' ? `Notebook initialized at: ${result.path}` : 'Error: ' + result.message);
    } catch (error) {
      alert('Failed to initialize notebook');
    }
  };

  const fetchLeaderboard = async (ref: string) => {
    setLoadingLeaderboard(true);
    try {
      const response = await fetch(`/api/competitions/${ref}/leaderboard`);
      const data = await response.json();
      setLeaderboard(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Leaderboard error:', error);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const openCompetitionDetails = (comp: Competition) => {
    setSelectedComp(comp);
    fetchLeaderboard(comp.ref);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex font-sans antialiased">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="h-full flex flex-col p-8">
          <div className="flex items-center gap-3 mb-12 px-2">
            <div className="bg-[#20beff] p-2.5 rounded-xl shadow-lg shadow-blue-500/10">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 uppercase">KCM Master</span>
          </div>

          <nav className="flex-1 flex flex-col gap-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-4">Menu</p>
            <SidebarItem icon={<LayoutDashboard size={20} />} label="Open Challenges" active={activeTab === 'general'} onClick={() => setActiveTab('general')} />
            <SidebarItem icon={<Award size={20} />} label="Completed" active={activeTab === 'completed'} onClick={() => setActiveTab('completed')} />
            <SidebarItem icon={<Zap size={20} />} label="My Participations" active={activeTab === 'entered'} onClick={() => setActiveTab('entered')} />
            <SidebarItem icon={<FileText size={20} />} label="Notebooks" active={activeTab === 'notebooks'} onClick={() => setActiveTab('notebooks')} />
            
            <div className="my-6 border-t border-slate-100" />
            
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
              <button className="w-full py-2.5 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 rounded-xl transition-all border border-slate-200 shadow-sm">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-30">
          <button className="lg:hidden p-2 text-slate-500" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
          
          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <form onSubmit={handleSearch}>
              <input 
                type="text" 
                placeholder="Search competitions, teams, tags..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-100/50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#20beff]/30 transition-all outline-none font-medium"
              />
            </form>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden xl:flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Rank</span>
              <span className="text-sm font-black text-slate-900">#1,245</span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <button className="p-2.5 text-slate-400 hover:text-[#20beff] hover:bg-blue-50 rounded-xl transition-all relative">
              <Bell size={22} />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        {/* Dashboard Area */}
        <main className="flex-1 overflow-y-auto p-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2 capitalize">
                  {activeTab.replace('general', 'Open')} Competitions
                </h2>
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <Trophy size={16} className="text-[#20beff]" />
                  Join the world's most challenging data science competitions.
                </div>
              </div>
              <button 
                onClick={() => fetchCompetitions()}
                className="flex items-center gap-2 bg-[#20beff] hover:bg-[#00a6e6] text-white px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              >
                <Plus size={18} /> New Notebook
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6">
                <div className="relative">
                  <Loader2 className="w-12 h-12 text-[#20beff] animate-spin" />
                  <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full" />
                </div>
                <p className="text-slate-400 font-bold tracking-widest uppercase text-xs animate-pulse">Syncing Leaderboards...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {competitions.map((comp) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={comp.ref} 
                    className="bg-white rounded-[2rem] border border-slate-200/60 p-8 hover:shadow-2xl hover:shadow-slate-200/60 transition-all group relative overflow-hidden flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        {comp.category}
                      </span>
                      <div className="flex items-center gap-1.5 text-[#20beff]">
                        <span className="font-black text-lg tracking-tighter">{comp.reward}</span>
                      </div>
                    </div>
                    
                    <h3 
                      onClick={() => openCompetitionDetails(comp)}
                      className="text-xl font-black text-slate-900 mb-6 line-clamp-2 leading-tight group-hover:text-[#20beff] cursor-pointer transition-colors"
                    >
                      {comp.title}
                    </h3>
                    
                    <div className="grid grid-cols-3 gap-4 mb-8 mt-auto">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                          <Calendar size={12} className="text-blue-500" /> Deadline
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          {new Date(comp.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                          <Users size={12} className="text-emerald-500" /> Status
                        </span>
                        <span className={`text-xs font-bold ${comp.userHasEntered ? 'text-emerald-500' : 'text-slate-700'}`}>
                          {comp.userHasEntered ? 'Joined' : 'Available'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                          <Zap size={12} className="text-orange-500" /> Type
                        </span>
                        <span className="text-xs font-bold text-slate-700 truncate">Competition</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleDownload(comp.ref)}
                        className="flex-1 bg-[#20beff] text-white hover:bg-[#00a6e6] py-3.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
                      >
                        <Download size={14} /> Download Data
                      </button>
                      <button 
                        onClick={() => handleInitNotebook(comp.ref)}
                        className="flex-1 bg-white border border-slate-200 hover:border-[#20beff] hover:text-[#20beff] text-slate-600 py-3.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2"
                      >
                        <BookOpen size={14} /> Init Notebook
                      </button>
                      <a 
                        href={comp.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-none bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 p-3.5 rounded-2xl transition-all border border-slate-200/50"
                      >
                        <ExternalLink size={20} />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Leaderboard/Detail Modal */}
      <AnimatePresence>
        {selectedComp && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedComp(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-10 border-b border-slate-100">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-blue-50 text-[#20beff] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                    Leaderboard
                  </div>
                  <button onClick={() => setSelectedComp(null)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                    <X size={24} className="text-slate-400" />
                  </button>
                </div>
                <h3 className="text-3xl font-black text-slate-900 leading-tight mb-2">{selectedComp.title}</h3>
                <p className="text-slate-500 font-medium">{selectedComp.reward} Prize Pool • {new Date(selectedComp.deadline).toLocaleDateString()} Deadline</p>
              </div>

              <div className="flex-1 overflow-y-auto p-10">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Top Performances</h4>
                  <button className="text-[#20beff] text-xs font-black hover:underline">View Full Board</button>
                </div>

                {loadingLeaderboard ? (
                  <div className="flex flex-col items-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 text-[#20beff] animate-spin" />
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Fetching standings...</span>
                  </div>
                ) : leaderboard.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {leaderboard.map((entry, i) => (
                      <div key={i} className="flex items-center gap-4 p-5 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                        <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-sm ${
                          i === 0 ? 'bg-yellow-100 text-yellow-700' : 
                          i === 1 ? 'bg-slate-100 text-slate-600' : 
                          i === 2 ? 'bg-orange-100 text-orange-700' : 'text-slate-400'
                        }`}>
                          #{i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-800 group-hover:text-[#20beff] transition-colors">{entry.teamName || 'Anonymous Team'}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Participation Verified</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900">{entry.score || '0.000'}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Score</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold italic">No public leaderboard data available for this competition yet.</p>
                  </div>
                )}
              </div>

              <div className="p-8 bg-slate-50 flex gap-4">
                <button 
                  onClick={() => handleInitNotebook(selectedComp.ref)}
                  className="flex-1 bg-[#20beff] text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20"
                >
                  Start Training Now
                </button>
                <a 
                  href={selectedComp.url}
                  target="_blank"
                  className="flex-1 bg-white border border-slate-200 text-slate-700 py-4 rounded-2xl font-black text-sm text-center shadow-sm"
                >
                  Open Official Page
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
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
    <span className="font-black text-xs uppercase tracking-widest">{label}</span>
    {active && <ChevronRight size={14} className="ml-auto opacity-60" />}
  </button>
);

export default App;
