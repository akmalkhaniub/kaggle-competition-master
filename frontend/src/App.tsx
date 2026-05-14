import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Loader2,
  Bell,
  Plus
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import CompetitionCard from './components/CompetitionCard';
import CompetitionModal from './components/CompetitionModal';
import Terminal from './components/Terminal';
import CompetitionStats from './components/CompetitionStats';
import ComparisonOverlay from './components/ComparisonOverlay';

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
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

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
    if (activeTab !== 'analytics' && activeTab !== 'settings') {
      fetchCompetitions();
    }
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
        toast.success('Notebook initialized locally');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to initialize notebook');
    }
  };

  const handlePushKernel = async (ref: string) => {
    const slug = ref.split('/').pop() || ref;
    toast.loading('Pushing kernel...', { id: `push-${slug}` });
    try {
      const response = await fetch(`/api/competitions/${slug}/push-kernel`, { method: 'POST' });
      const result = await response.json();
      if (result.status === 'success') {
        toast.success('Kernel pushed successfully', { id: `push-${slug}` });
      } else {
        toast.error(result.message || 'Push failed', { id: `push-${slug}` });
      }
    } catch (error) {
      toast.error('Connection failed', { id: `push-${slug}` });
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

  const handleToggleCompare = (ref: string) => {
    setSelectedForCompare(prev => {
      if (prev.includes(ref)) {
        return prev.filter(r => r !== ref);
      }
      if (prev.length >= 2) {
        toast.error('You can only compare 2 competitions at once');
        return prev;
      }
      return [...prev, ref];
    });
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
      
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isConsoleOpen={isConsoleOpen}
        setIsConsoleOpen={setIsConsoleOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 md:px-10 sticky top-0 z-30">
          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <form onSubmit={handleSearch}>
              <input 
                type="text" 
                placeholder="Search global competitions..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-100/50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#20beff]/30 transition-all outline-none font-bold"
              />
            </form>
          </div>

          <div className="flex items-center gap-4 md:gap-6 ml-4">
            <button className="hidden sm:flex items-center gap-2 bg-[#20beff] hover:bg-[#00a6e6] text-white px-5 py-2.5 rounded-xl font-black text-sm transition-all shadow-lg shadow-blue-500/10 active:scale-95">
              <Plus size={18} /> Push Kernel
            </button>
            <button className="p-2.5 text-slate-400 hover:text-[#20beff] hover:bg-blue-50 rounded-xl transition-all relative">
              <Bell size={22} />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        {/* Dashboard Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            
            {activeTab === 'analytics' ? (
              <CompetitionStats competitions={competitions} />
            ) : (
              <>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
                      Master <span className="text-[#20beff]">Intelligence</span>
                    </h2>
                    <p className="text-slate-500 font-bold">Synchronized with Kaggle API • Real-time Insights</p>
                  </div>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-32 gap-6">
                    <Loader2 className="w-12 h-12 text-[#20beff] animate-spin" />
                    <p className="text-slate-400 font-black tracking-widest uppercase text-xs animate-pulse">Syncing Engine...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {competitions.length > 0 ? (
                      competitions.map((comp) => (
                        <CompetitionCard 
                          key={comp.ref}
                          comp={comp}
                          onOpenDetails={openCompetitionDetails}
                          onDownload={handleDownload}
                          onInitNotebook={handleInitNotebook}
                          onPushKernel={handlePushKernel}
                          onToggleCompare={handleToggleCompare}
                          isSelectedForCompare={selectedForCompare.includes(comp.ref)}
                          downloadProgress={downloadProgress[comp.ref]}
                        />
                      ))
                    ) : (
                      <div className="col-span-full py-20 text-center">
                        <p className="text-slate-400 font-bold uppercase tracking-widest">No competitions found</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        <Terminal 
          isOpen={isConsoleOpen}
          onClose={() => setIsConsoleOpen(false)}
          output={cliOutput}
          input={cliInput}
          onInputChange={setCliInput}
          onSubmit={executeCli}
        />
      </div>

      <CompetitionModal 
        selectedComp={selectedComp}
        onClose={() => setSelectedComp(null)}
        aiSummary={aiSummary}
        loadingAi={loadingAi}
        leaderboard={leaderboard}
        loadingLeaderboard={loadingLeaderboard}
        onDownload={handleDownload}
        downloadProgress={selectedComp ? downloadProgress[selectedComp.ref] : undefined}
      />

      <ComparisonOverlay 
        selectedComps={competitions.filter(c => selectedForCompare.includes(c.ref))}
        onClose={() => setSelectedForCompare([])}
        onClear={() => setSelectedForCompare([])}
      />
    </div>
  );
};

export default App;
