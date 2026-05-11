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
  downloadProgress?: number;
}

const CompetitionCard: React.FC<CompetitionCardProps> = ({ 
  comp, 
  onOpenDetails, 
  onDownload, 
  onInitNotebook,
  downloadProgress 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 hover:shadow-2xl hover:shadow-slate-200/50 transition-all group relative"
    >
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
          className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 py-3.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 border border-slate-100 active:scale-95"
        >
          <BookOpen size={14} /> Start
        </button>
      </div>
    </motion.div>
  );
};

export default CompetitionCard;
