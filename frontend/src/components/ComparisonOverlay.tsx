import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sword, Sparkles, Loader2, Trophy, Target } from 'lucide-react';

interface Competition {
  ref: string;
  title: string;
  category: string;
  reward: string;
}

interface ComparisonOverlayProps {
  selectedComps: Competition[];
  onClose: () => void;
  onClear: () => void;
}

const ComparisonOverlay: React.FC<ComparisonOverlayProps> = ({ selectedComps, onClose, onClear }) => {
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedComps.length === 2) {
      fetchComparison();
    }
  }, [selectedComps]);

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/competitions/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comp1: selectedComps[0],
          comp2: selectedComps[1]
        })
      });
      const data = await response.json();
      setComparison(data);
    } catch (error) {
      console.error('AI comparison failed');
    } finally {
      setLoading(false);
    }
  };

  if (selectedComps.length === 0) return null;

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] w-full max-w-4xl px-6">
      <AnimatePresence>
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl p-6 md:p-10 text-white overflow-hidden relative"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#20beff] to-transparent opacity-50" />
          
          <button 
            onClick={onClear}
            className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex flex-col md:flex-row items-center gap-10">
            {/* Comp 1 */}
            <div className="flex-1 text-center md:text-right">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Competition A</p>
               <h4 className="text-lg font-black leading-tight mb-2 truncate">{selectedComps[0].title}</h4>
               <p className="text-[#20beff] font-black">{selectedComps[0].reward}</p>
            </div>

            <div className="flex flex-col items-center gap-4">
               <div className="w-14 h-14 bg-[#20beff] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-45">
                  <Sword size={24} className="-rotate-45" />
               </div>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">VERSUS</span>
            </div>

            {/* Comp 2 */}
            <div className="flex-1 text-center md:text-left">
               {selectedComps.length > 1 ? (
                 <>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Competition B</p>
                   <h4 className="text-lg font-black leading-tight mb-2 truncate">{selectedComps[1].title}</h4>
                   <p className="text-[#20beff] font-black">{selectedComps[1].reward}</p>
                 </>
               ) : (
                 <div className="flex flex-col items-center md:items-start justify-center h-full border-2 border-dashed border-white/5 rounded-2xl p-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select another to compare</p>
                 </div>
               )}
            </div>
          </div>

          {selectedComps.length === 2 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-10 pt-10 border-t border-white/5"
            >
              {loading ? (
                <div className="flex flex-col items-center py-10 gap-4">
                  <Loader2 className="w-8 h-8 text-[#20beff] animate-spin" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Gemini analyzing matchups...</p>
                </div>
              ) : comparison && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-4">
                      {comparison.comparison.map((item: any, i: number) => (
                        <div key={i} className="flex flex-col gap-1">
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                           <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                              <span className="text-xs font-bold text-slate-300">{item.val1}</span>
                              <div className="w-px h-4 bg-white/10" />
                              <span className="text-xs font-bold text-slate-300">{item.val2}</span>
                           </div>
                        </div>
                      ))}
                   </div>

                   <div className="bg-blue-500/10 rounded-[2rem] p-8 border border-blue-500/20 relative overflow-hidden group">
                      <Sparkles className="absolute -bottom-4 -right-4 text-[#20beff]/10 w-24 h-24" />
                      <h5 className="text-[10px] font-black text-[#20beff] uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Trophy size={14} /> AI Recommendation
                      </h5>
                      <p className="text-sm font-bold text-slate-200 leading-relaxed">
                         Go with <span className="text-[#20beff]">{comparison.winner}</span>. {comparison.reason}
                      </p>
                      <button className="mt-6 w-full bg-[#20beff] hover:bg-[#00a6e6] text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all">
                        Open Strategy
                      </button>
                   </div>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ComparisonOverlay;
