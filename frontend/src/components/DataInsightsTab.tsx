import React, { useState } from 'react';
import { Database, AlertTriangle, Target, BarChart3, Loader2, Sparkles, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface DataInsights {
  overview: string;
  features: string[];
  risks: string;
  target: string;
}

interface DataInsightsTabProps {
  competitionRef: string;
  onDownload: (ref: string) => void;
  downloadProgress?: number;
}

const DataInsightsTab: React.FC<DataInsightsTabProps> = ({ 
  competitionRef, 
  onDownload,
  downloadProgress 
}) => {
  const [insights, setInsights] = useState<DataInsights | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/competitions/${competitionRef}/analyze`, { method: 'POST' });
      const data = await response.json();
      if (data.status === 'error') {
        toast.error(data.message);
      } else {
        setInsights(data);
        toast.success('AI Data analysis complete');
      }
    } catch (error) {
      toast.error('Failed to analyze dataset');
    } finally {
      setLoading(false);
    }
  };

  if (!insights && !loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-[#20beff]">
          <Database size={40} />
        </div>
        <div className="max-w-md">
          <h4 className="text-xl font-black text-slate-900 mb-2">Automated EDA Engine</h4>
          <p className="text-sm font-medium text-slate-500 leading-relaxed">
            I'll unzip your downloaded data, analyze the schema, and use Gemini to provide technical insights before you even write a line of code.
          </p>
        </div>
        <button 
          onClick={fetchInsights}
          className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest px-8 py-4 rounded-2xl transition-all shadow-xl shadow-slate-200 flex items-center gap-2 group"
        >
          <Sparkles size={16} className="group-hover:rotate-12 transition-transform" /> 
          Run AI Analysis
        </button>
        {downloadProgress === undefined && (
          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1">
            <AlertTriangle size={12} /> Note: Requires dataset to be downloaded first
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {loading ? (
        <div className="py-20 flex flex-col items-center gap-6">
          <div className="relative">
             <Loader2 className="w-16 h-16 text-[#20beff] animate-spin" />
             <Database className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-[#20beff]/50" />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Scanning CSV Structures...</p>
        </div>
      ) : insights && (
        <>
          {/* Overview */}
          <div className="bg-blue-50/50 p-8 rounded-[2rem] border border-blue-100/50 relative overflow-hidden group">
            <Sparkles className="absolute top-6 right-6 text-[#20beff]/20 w-12 h-12 group-hover:scale-110 transition-transform" />
            <h4 className="text-[10px] font-black text-[#20beff] uppercase tracking-widest mb-4 flex items-center gap-2">
              <Database size={14} /> Data Overview
            </h4>
            <p className="text-sm font-bold text-slate-700 leading-relaxed relative z-10">
              {insights.overview}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Target */}
             <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Target size={14} /> Identified Target
                </h4>
                <p className="text-sm font-bold text-slate-800">{insights.target}</p>
             </div>

             {/* Risks */}
             <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <AlertTriangle size={14} /> Potential Risks
                </h4>
                <p className="text-sm font-bold text-slate-800">{insights.risks}</p>
             </div>
          </div>

          {/* Key Features */}
          <div className="bg-slate-900 p-8 rounded-[2rem] text-white">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <BarChart3 size={14} /> Strategic Feature Importance
            </h4>
            <div className="space-y-4">
               {insights.features.map((feature, i) => (
                 <div key={i} className="flex items-start gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                   <span className="text-[#20beff] font-black text-xs">0{i+1}</span>
                   <p className="text-xs font-bold text-slate-300 leading-relaxed">{feature}</p>
                 </div>
               ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DataInsightsTab;
