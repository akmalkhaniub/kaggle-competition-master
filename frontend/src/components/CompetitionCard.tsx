import React from 'react';
import { motion } from 'framer-motion';
import { Download, BookOpen } from 'lucide-react';

interface Competition {
  ref: string;
  title: string;
  url: string;
  deadline: string;
  category: string;
  reward: string;
  userHasEntered: boolean;
}

interface CompetitionCardProps {
  comp: Competition;
  onOpenDetails: (comp: Competition) => void;
  onDownload: (ref: string) => void;
  onInitNotebook: (ref: string) => void;
  onPushKernel: (ref: string) => void;
  onToggleCompare: (ref: string) => void;
  isSelectedForCompare?: boolean;
  downloadProgress?: number;
}

const CompetitionCard: React.FC<CompetitionCardProps> = ({ 
  comp, 
  onOpenDetails, 
  onDownload, 
  onInitNotebook,
  onPushKernel,
  onToggleCompare,
  isSelectedForCompare,
  downloadProgress 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 hover:shadow-2xl hover:shadow-slate-200/50 transition-all group relative"
    >
      <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
        <input 
          type="checkbox" 
          checked={isSelectedForCompare}
          onChange={() => onToggleCompare(comp.ref)}
          className="w-5 h-5 rounded-lg border-2 border-slate-200 text-[#20beff] focus:ring-[#20beff] transition-all cursor-pointer"
        />
        {isSelectedForCompare && (
          <span className="text-[10px] font-black text-[#20beff] uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md border border-blue-100">Compare</span>
        )}
      </div>

      {downloadProgress !== undefined && downloadProgress < 100 && (
        <div className="absolute inset-x-0 top-0 h-1 bg-slate-100 overflow-hidden rounded-t-[2.5rem]">
          <div 
            className="h-full bg-[#20beff] transition-all duration-300" 
            style={{ width: `${downloadProgress}%` }} 
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
        onClick={() => onOpenDetails(comp)}
        className="text-xl font-black text-slate-900 mb-6 cursor-pointer hover:text-[#20beff] transition-colors"
      >
        {comp.title}
      </h3>
      
      <div className="flex gap-3 mt-auto">
        <button 
          onClick={() => onDownload(comp.ref)}
          className="flex-1 bg-[#20beff] text-white hover:bg-[#00a6e6] py-3.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 active:scale-95"
        >
          <Download size={14} /> 
          {downloadProgress ? `${downloadProgress}%` : 'Fetch Data'}
        </button>
        <button 
          onClick={() => onInitNotebook(comp.ref)}
          className="bg-slate-50 hover:bg-slate-100 text-slate-600 py-3.5 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 border border-slate-100 active:scale-95"
          title="Initialize Notebook"
        >
          <BookOpen size={14} />
        </button>
        <button 
          onClick={() => onPushKernel(comp.ref)}
          className="bg-slate-900 hover:bg-slate-800 text-white py-3.5 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
          title="Push to Kaggle"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19l-5-5-5 5M12 14V3"/></svg>
        </button>
      </div>
    </motion.div>
  );
};

export default CompetitionCard;
