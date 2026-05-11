import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2 } from 'lucide-react';

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
}

const CompetitionModal: React.FC<CompetitionModalProps> = ({
  selectedComp,
  onClose,
  aiSummary,
  loadingAi,
  leaderboard,
  loadingLeaderboard
}) => {
  if (!selectedComp) return null;

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
        className="relative w-full max-w-5xl bg-white rounded-[2.5rem] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[85vh]"
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-10 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Left: Info & AI */}
        <div className="flex-1 p-8 md:p-12 border-b md:border-b-0 md:border-r border-slate-100 overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-2 text-[#20beff] font-black text-[10px] uppercase tracking-widest mb-4">
            <Sparkles size={14} /> AI Analysis Engine
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-8 leading-tight">{selectedComp.title}</h3>
          
          {loadingAi ? (
            <div className="py-12 flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-[#20beff] animate-spin" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Analyzing Dataset...</span>
            </div>
          ) : aiSummary && (
            <div className="space-y-8">
              <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50">
                <p className="text-sm text-slate-700 leading-relaxed font-medium">{aiSummary.summary}</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-6">
                   <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Proposed Strategy</h4>
                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                     aiSummary.difficulty === 'Hard' ? 'bg-red-50 text-red-500' : 
                     aiSummary.difficulty === 'Medium' ? 'bg-orange-50 text-orange-500' : 
                     'bg-green-50 text-green-500'
                   }`}>
                     {aiSummary.difficulty} Difficulty
                   </span>
                </div>
                <div className="space-y-3">
                  {typeof aiSummary.strategy === 'string' ? (
                    aiSummary.strategy.split('\n').map((line: string, i: number) => (
                      <div key={i} className="flex items-start gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-[#20beff]/30 transition-colors">
                        <div className="w-6 h-6 bg-white rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-[#20beff] border border-slate-200 shadow-sm">{i+1}</div>
                        <p className="text-xs text-slate-600 font-bold leading-relaxed">{line.replace(/^[0-9]\. /, '')}</p>
                      </div>
                    ))
                  ) : Array.isArray(aiSummary.strategy) ? (
                    aiSummary.strategy.map((step: string, i: number) => (
                      <div key={i} className="flex items-start gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-[#20beff]/30 transition-colors">
                        <div className="w-6 h-6 bg-white rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-[#20beff] border border-slate-200 shadow-sm">{i+1}</div>
                        <p className="text-xs text-slate-600 font-bold leading-relaxed">{step}</p>
                      </div>
                    ))
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Leaderboard */}
        <div className="w-full md:w-96 bg-slate-50/50 p-8 md:p-12 overflow-y-auto custom-scrollbar">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Top 15 Standings</h4>
          {loadingLeaderboard ? (
            <div className="flex flex-col items-center py-12">
              <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.length > 0 ? (
                leaderboard.map((entry, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <span className={`text-xs font-black w-6 ${i < 3 ? 'text-[#20beff]' : 'text-slate-300'}`}>#{i+1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{entry.teamName || 'Anonymous'}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{entry.score}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-400 text-xs font-bold py-12">No data available</p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CompetitionModal;
