import React, { useState, useEffect, useRef } from 'react';
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
  BookOpen,
  Terminal as TerminalIcon,
  Sparkles,
  PieChart as PieIcon,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import CompetitionStats from './components/CompetitionStats';

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
  const [activeTab, setActiveTab] = useState('general'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedComp, setSelectedComp] = useState<Competition | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [cliInput, setCliInput] = useState('');
  const [cliOutput, setCliOutput] = useState('');
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // WebSocket for Progress
  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.hostname}:8000/ws/progress`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'download_progress') {
        setDownloadProgress(prev => ({
          ...prev,
          [data.ref]: data.progress
        }));
        if (data.progress === 100) {
          toast.success(`Download complete: ${data.ref}`, { id: data.ref });
        }
      }
    };
    return () => ws.close();
  }, []);

  const fetchCompetitions = async (group = activeTab) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/competitions?group=${group}${searchTerm ? `&search=${searchTerm}` : ''}`);
      const data = await response.json();
      setCompetitions(data);
    } catch (error) {
      toast.error('Failed to fetch competitions');
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
    toast.loading('Starting download...', { id: ref });
    try {
      const response = await fetch(`/api/competitions/${slug}/download`, { method: 'POST' });
      const result = await response.json();
      if (result.status !== 'success') {
        toast.error(result.message, { id: ref });
      }
    } catch (error) {
      toast.error('Connection failed', { id: ref });
    }
  };

  const handleInitNotebook = async (ref: string) => {
    const slug = ref.split('/').pop() || ref;
    try {
      const response = await fetch(`/api/competitions/${slug}/init-notebook`, { method: 'POST' });
      const result = await response.json();
      if (result.status === 'success') {
        toast.success('Notebook initialized localy');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to initialize notebook');
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

  const fetchAiSummary = async (comp: Competition) => {
    setLoadingAi(true);
    try {
      const response = await fetch(`/api/competitions/${comp.ref}/ai-summary?title=${encodeURIComponent(comp.title)}&category=${encodeURIComponent(comp.category)}`);
      const data = await response.json();
      setAiSummary(data);
    } catch (error) {
      toast.error('AI Summary unavailable');
    } finally {
      setLoadingAi(false);
    }
  };

  const openCompetitionDetails = (comp: Competition) => {
    setSelectedComp(comp);
    setAiSummary(null);
    fetchLeaderboard(comp.ref);
    fetchAiSummary(comp);
  };

  const executeCli = async (e: React.FormEvent) => {
    e.preventDefault();
    setCliOutput('Executing...');
    try {
      const response = await fetch(`/api/cli/execute?command=${encodeURIComponent(cliInput)}`, { method: 'POST' });
      const result = await response.json();
      setCliOutput(result.stdout || result.stderr || result.message);
    } catch (error) {
      setCliOutput('Command failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex font-sans antialiased overflow-hidden">
      <Toaster position="top-right" />
      
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
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
                placeholder="Search global competitions..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-100/50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#20beff]/30 transition-all outline-none font-medium"
              />
            </form>
          </div>

          <div className="flex items-center gap-6">
            <button className="hidden sm:flex items-center gap-2 bg-[#20beff] hover:bg-[#00a6e6] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/10">
              <Plus size={18} /> Push Kernel
            </button>
            <button className="p-2.5 text-slate-400 hover:text-[#20beff] hover:bg-blue-50 rounded-xl transition-all relative">
              <Bell size={22} />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        {/* Dashboard Area */}
        <main className="flex-1 overflow-y-auto p-10">
          <div className="max-w-7xl mx-auto">
            
            {activeTab === 'analytics' ? (
              <CompetitionStats competitions={competitions} />
            ) : (
              <>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                      Master <span className="text-[#20beff]">Intelligence</span>
                    </h2>
                    <p className="text-slate-500 font-medium">Synchronized with Kaggle API • Real-time Insights</p>
                  </div>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-32 gap-6">
                    <Loader2 className="w-12 h-12 text-[#20beff] animate-spin" />
                    <p className="text-slate-400 font-bold tracking-widest uppercase text-xs animate-pulse">Syncing Engine...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {competitions.map((comp) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={comp.ref} 
                        className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 hover:shadow-2xl hover:shadow-slate-200/50 transition-all group relative"
                      >
                        {downloadProgress[comp.ref] !== undefined && downloadProgress[comp.ref] < 100 && (
                          <div className="absolute inset-x-0 top-0 h-1 bg-slate-100 overflow-hidden">
                            <div 
                              className="h-full bg-[#20beff] transition-all duration-300" 
                              style={{ width: `${downloadProgress[comp.ref]}%` }} 
                            />
                          </div>
                        )}

                        <div className="flex justify-between items-start mb-6">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-3 py-1.5 rounded-lg">
                            {comp.category}
                          </span>
                          <span className="text-[#20beff] font-black text-lg">{comp.reward}</span>
                        </div>
                        
                        <h3 
                          onClick={() => openCompetitionDetails(comp)}
                          className="text-xl font-black text-slate-900 mb-6 cursor-pointer hover:text-[#20beff] transition-colors"
                        >
                          {comp.title}
                        </h3>
                        
                        <div className="flex gap-3 mt-auto">
                          <button 
                            onClick={() => handleDownload(comp.ref)}
                            className="flex-1 bg-[#20beff] text-white hover:bg-[#00a6e6] py-3.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2"
                          >
                            <Download size={14} /> 
                            {downloadProgress[comp.ref] ? `${downloadProgress[comp.ref]}%` : 'Fetch Data'}
                          </button>
                          <button 
                            onClick={() => handleInitNotebook(comp.ref)}
                            className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 py-3.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 border border-slate-100"
                          >
                            <BookOpen size={14} /> Start
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        {/* CLI Console Drawer */}
        <AnimatePresence>
          {isConsoleOpen && (
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="absolute inset-x-0 bottom-0 z-[60] bg-slate-900 text-emerald-400 p-8 h-96 border-t border-slate-800 shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <TerminalIcon size={20} />
                  <span className="text-xs font-black uppercase tracking-widest">Kaggle CLI Interface</span>
                </div>
                <button onClick={() => setIsConsoleOpen(false)} className="text-slate-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto mb-4 font-mono text-sm whitespace-pre-wrap p-4 bg-black/30 rounded-xl">
                {cliOutput || '> Ready for command...'}
              </div>

              <form onSubmit={executeCli} className="flex gap-4">
                <input 
                  type="text"
                  value={cliInput}
                  onChange={(e) => setCliInput(e.target.value)}
                  placeholder="e.g. kaggle competitions submissions -c titanic"
                  className="flex-1 bg-black/50 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-emerald-500/50 outline-none"
                />
                <button className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-sm">Run</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedComp && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedComp(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex h-[85vh]">
              
              {/* Left: Info & AI */}
              <div className="flex-1 p-12 border-r border-slate-100 overflow-y-auto">
                <div className="flex items-center gap-2 text-[#20beff] font-black text-[10px] uppercase tracking-widest mb-4">
                  <Sparkles size={14} /> AI Analysis Engine
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-8 leading-tight">{selectedComp.title}</h3>
                
                {loadingAi ? (
                  <div className="py-12 flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Analyzing Dataset...</span>
                  </div>
                ) : aiSummary && (
                  <div className="space-y-8">
                    <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50">
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">{aiSummary.summary}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Proposed Strategy</h4>
                      <div className="space-y-3">
                        {aiSummary.strategy.split('\n').map((line: string, i: number) => (
                          <div key={i} className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="w-5 h-5 bg-white rounded-lg flex items-center justify-center text-[10px] font-bold text-blue-500 border border-slate-200">{i+1}</div>
                            <p className="text-xs text-slate-600 font-medium">{line.replace(/^[0-9]\. /, '')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Leaderboard */}
              <div className="w-96 bg-slate-50/50 p-12 overflow-y-auto">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Top 15 Standings</h4>
                {loadingLeaderboard ? (
                  <div className="flex flex-col items-center py-12">
                    <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((entry, i) => (
                      <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                        <span className={`text-xs font-black ${i < 3 ? 'text-blue-500' : 'text-slate-300'}`}>#{i+1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{entry.teamName || 'Anonymous'}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{entry.score}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
    <span className="font-black text-[10px] uppercase tracking-widest">{label}</span>
  </button>
);

export default App;
