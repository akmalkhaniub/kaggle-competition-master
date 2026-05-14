import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2, Trophy, Send, Database, BarChart2 } from 'lucide-react';
import SubmissionsTab from './SubmissionsTab';
import DataInsightsTab from './DataInsightsTab';

interface Competition {
  ref: string;
  title: string;
  category: string;
}

interface LeaderboardEntry {
  teamName: string;
  rank: number;
  score: string;
}

interface CompetitionModalProps {
  selectedComp: Competition | null;
  onClose: () => void;
  aiSummary: any;
  loadingAi: boolean;
  leaderboard: LeaderboardEntry[];
  loadingLeaderboard: boolean;
  onDownload: (ref: string) => void;
  downloadProgress?: number;
}

const CompetitionModal: React.FC<CompetitionModalProps> = ({
  selectedComp,
  onClose,
  aiSummary,
  loadingAi,
  leaderboard,
  loadingLeaderboard,
  onDownload,
  downloadProgress
}) => {
  const [activeTab, setActiveTab] = useState<'strategy' | 'leaderboard' | 'submissions' | 'data'>('strategy');

  if (!selectedComp) return null;

  const tabs = [
    { id: 'strategy', label: 'AI Strategy', icon: <Sparkles size={16} /> },
    { id: 'leaderboard', label: 'Standings', icon: <Trophy size={16} /> },
    { id: 'submissions', label: 'My Submissions', icon: <Send size={16} /> },
    { id: 'data', label: 'Data Insights', icon: <Database size={16} /> },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.9, opacity: 0, y: 20 }} 
        className="relative w-full max-w-6xl bg-white rounded-[2.5rem] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[90vh] md:h-[85vh]"
      >
        {/* Header Section */}
        <div className="p-8 md:p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 bg-white sticky top-0 z-20">
          <div className="flex-1">
             <div className="flex items-center gap-3 text-[#20beff] font-black text-[10px] uppercase tracking-widest mb-2">
                <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center">
                   <BarChart2 size={12} />
                </div>
                {selectedComp.category} Competition
             </div>
             <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight truncate max-w-2xl">
               {selectedComp.title}
             </h3>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={onClose} 
              className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-500 transition-all active:scale-95"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-8 border-b border-slate-100 bg-white flex gap-2 overflow-x-auto no-scrollbar shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-5 text-xs font-black uppercase tracking-widest transition-all border-b-2 relative ${
                activeTab === tab.id 
                ? 'text-[#20beff] border-[#20beff]' 
                : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="activeTab" className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-[#20beff]" />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
          <div className="p-8 md:p-12 max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'strategy' && (
                <motion.div
                  key="strategy"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-10"
                >
                  {loadingAi ? (
                    <div className="py-20 flex flex-col items-center gap-4">
                      <Loader2 className="w-10 h-10 text-[#20beff] animate-spin" />
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Consulting AI Strategist...</span>
                    </div>
                  ) : aiSummary && (
                    <div className="space-y-10">
                      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">The Challenge</h4>
                        <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{aiSummary.summary}"</p>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Winning Strategy</h4>
                           <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                             aiSummary.difficulty === 'Hard' ? 'bg-red-50 text-red-500 border border-red-100' : 
                             aiSummary.difficulty === 'Medium' ? 'bg-orange-50 text-orange-500 border border-orange-100' : 
                             'bg-green-50 text-green-500 border border-green-100'
                           }`}>
                             {aiSummary.difficulty} Difficulty
                           </span>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          {(typeof aiSummary.strategy === 'string' ? aiSummary.strategy.split('\n') : aiSummary.strategy).map((step: string, i: number) => (
                            <div key={i} className="flex items-start gap-5 bg-white p-6 rounded-2xl border border-slate-100 hover:border-[#20beff]/30 transition-all shadow-sm group">
                              <div className="w-8 h-8 bg-slate-50 group-hover:bg-blue-50 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-black text-[#20beff] border border-slate-100 transition-colors">
                                {i+1}
                              </div>
                              <p className="text-xs text-slate-600 font-bold leading-relaxed pt-1">{step.replace(/^[0-9]\. /, '')}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'leaderboard' && (
                <motion.div
                  key="leaderboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-8">
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Top 15</h4>
                     <p className="text-[10px] font-black text-[#20beff] uppercase tracking-widest">Live Standings</p>
                  </div>
                  {loadingLeaderboard ? (
                    <div className="flex flex-col items-center py-20">
                      <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {leaderboard.length > 0 ? (
                        leaderboard.map((entry, i) => (
                          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-5 shadow-sm hover:shadow-md transition-all group">
                            <span className={`text-xs font-black w-8 h-8 rounded-lg flex items-center justify-center ${
                              i === 0 ? 'bg-yellow-50 text-yellow-600' : 
                              i === 1 ? 'bg-slate-100 text-slate-600' : 
                              i === 2 ? 'bg-orange-50 text-orange-600' : 
                              'bg-slate-50 text-slate-300'
                            }`}>
                              #{i+1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate group-hover:text-[#20beff] transition-colors">{entry.teamName || 'Anonymous'}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">{entry.score}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full py-20 text-center">
                           <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No leaderboard data available</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'submissions' && (
                <motion.div
                  key="submissions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <SubmissionsTab competitionRef={selectedComp.ref} />
                </motion.div>
              )}

              {activeTab === 'data' && (
                <motion.div
                  key="data"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <DataInsightsTab 
                    competitionRef={selectedComp.ref} 
                    onDownload={onDownload}
                    downloadProgress={downloadProgress}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CompetitionModal;
