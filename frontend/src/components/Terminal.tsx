import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal as TerminalIcon } from 'lucide-react';

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
  output: string;
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const Terminal: React.FC<TerminalProps> = ({
  isOpen,
  onClose,
  output,
  input,
  onInputChange,
  onSubmit
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute inset-x-0 bottom-0 z-[60] bg-slate-900 text-emerald-400 p-6 md:p-8 h-[400px] border-t border-slate-800 shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                <TerminalIcon size={18} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-500/80">Kaggle CLI Interface</span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto mb-6 font-mono text-xs md:text-sm whitespace-pre-wrap p-5 bg-black/40 rounded-2xl border border-slate-800/50 custom-scrollbar">
            {output || (
              <div className="text-slate-600 italic">
                > Ready for command... <br />
                Try: kaggle competitions list
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="flex gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">$</span>
              <input 
                type="text"
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder="Enter kaggle command..."
                className="w-full bg-black/60 border border-slate-800 rounded-xl pl-10 pr-4 py-3.5 text-sm focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-700"
              />
            </div>
            <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3.5 rounded-xl font-black text-sm transition-all active:scale-95 shadow-lg shadow-emerald-900/20">
              Execute
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Terminal;
