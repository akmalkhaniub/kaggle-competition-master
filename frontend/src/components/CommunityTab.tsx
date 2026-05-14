import React, { useState, useEffect } from 'react';
import { MessageSquare, Sparkles, AlertCircle, Zap, Loader2, Library } from 'lucide-react';
import toast from 'react-hot-toast';

interface Nugget {
  title: string;
  description: string;
}

interface CommunityWisdom {
  nuggets: Nugget[];
  pitfalls: string[];
  stack: string[];
}

interface CommunityTabProps {
  competitionRef: string;
}

const CommunityTab: React.FC<CommunityTabProps> = ({ competitionRef }) => {
  const [wisdom, setWisdom] = useState<CommunityWisdom | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWisdom = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/competitions/${competitionRef}/discussions/summary`);
      const data = await response.json();
      setWisdom(data);
    } catch (error) {
      toast.error('Failed to summarize community wisdom');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWisdom();
  }, [competitionRef]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center gap-6">
        <div className="relative">
           <Loader2 className="w-12 h-12 text-[#20beff] animate-spin" />
           <MessageSquare className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-[#20beff]/50" />
        </div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Distilling Forum Threads...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Info */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
        <Sparkles className="absolute -top-6 -right-6 text-white/5 w-32 h-32" />
        <div className="relative z-10">
           <h4 className="text-[10px] font-black text-[#20beff] uppercase tracking-widest mb-4 flex items-center gap-2">
             <Zap size={14} /> AI community synthesis
           </h4>
           <h3 className="text-xl font-black mb-6">"What Kaggler's are saying"</h3>
           <div className="flex flex-wrap gap-2">
              {wisdom?.stack.map((item, i) => (
                <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  {item}
                </span>
              ))}
           </div>
        </div>
      </div>

      {/* Nuggets */}
      <div className="space-y-6">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Gold Nuggets (Tips & Tricks)</h4>
        <div className="grid grid-cols-1 gap-4">
           {wisdom?.nuggets.map((nugget, i) => (
             <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-start gap-5">
                   <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-[#20beff] group-hover:scale-110 transition-transform">
                      <Sparkles size={18} />
                   </div>
                   <div className="flex-1">
                      <h5 className="text-sm font-black text-slate-900 mb-2">{nugget.title}</h5>
                      <p className="text-xs text-slate-500 font-bold leading-relaxed">{nugget.description}</p>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Pitfalls */}
      <div className="bg-red-50/50 p-8 rounded-[2.5rem] border border-red-100/50">
        <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-6 flex items-center gap-2">
          <AlertCircle size={14} /> Critical Pitfalls
        </h4>
        <div className="space-y-4">
           {wisdom?.pitfalls.map((pitfall, i) => (
             <div key={i} className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5" />
                <p className="text-xs font-bold text-slate-700 leading-relaxed">{pitfall}</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityTab;
