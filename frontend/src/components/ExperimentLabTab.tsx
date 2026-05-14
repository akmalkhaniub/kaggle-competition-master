import React, { useState, useEffect } from 'react';
import { Beaker, Plus, History, TrendingUp, Award, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface Experiment {
  id: number;
  timestamp: string;
  model: string;
  cvScore: string;
  lbScore: string;
  notes: string;
}

interface ExperimentLabTabProps {
  competitionRef: string;
}

const ExperimentLabTab: React.FC<ExperimentLabTabProps> = ({ competitionRef }) => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [model, setModel] = useState('');
  const [cvScore, setCvScore] = useState('');
  const [lbScore, setLbScore] = useState('');
  const [notes, setNotes] = useState('');

  const fetchExperiments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/competitions/${competitionRef}/experiments`);
      const data = await response.json();
      setExperiments(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load experiments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiments();
  }, [competitionRef]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!model || !cvScore) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/competitions/${competitionRef}/experiments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, cvScore, lbScore, notes })
      });
      const result = await response.json();
      if (result.status === 'success') {
        toast.success('Experiment logged');
        setModel('');
        setCvScore('');
        setLbScore('');
        setNotes('');
        fetchExperiments();
      }
    } catch (error) {
      toast.error('Failed to save experiment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Logger Form */}
      <div className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 md:p-10">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Beaker size={14} /> New Experiment Record
        </h4>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Model Architecture</label>
             <input 
              type="text" 
              placeholder="e.g. CatBoost with Optuna" 
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 px-5 text-xs font-bold focus:ring-2 focus:ring-[#20beff]/30 transition-all outline-none"
             />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Local CV</label>
                <input 
                  type="text" 
                  placeholder="0.8421" 
                  value={cvScore}
                  onChange={(e) => setCvScore(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 px-5 text-xs font-bold focus:ring-2 focus:ring-[#20beff]/30 transition-all outline-none"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Public LB</label>
                <input 
                  type="text" 
                  placeholder="0.8390" 
                  value={lbScore}
                  onChange={(e) => setLbScore(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 px-5 text-xs font-bold focus:ring-2 focus:ring-[#20beff]/30 transition-all outline-none"
                />
             </div>
          </div>
          <div className="md:col-span-2 space-y-2">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Technical Notes</label>
             <textarea 
              placeholder="What changed? (e.g. added target encoding on feature X)" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 px-5 text-xs font-bold focus:ring-2 focus:ring-[#20beff]/30 transition-all outline-none min-h-[100px] resize-none"
             />
          </div>
          <div className="md:col-span-2 flex justify-end">
             <button 
              type="submit"
              disabled={saving || !model || !cvScore}
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-2xl transition-all shadow-xl shadow-slate-200 flex items-center gap-2"
             >
               {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
               Log to Database
             </button>
          </div>
        </form>
      </div>

      {/* History & Trends */}
      <div>
        <div className="flex justify-between items-center mb-8 px-2">
           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
             <History size={14} /> Performance History
           </h4>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                 <div className="w-2 h-2 bg-[#20beff] rounded-full" />
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Trust local CV</span>
              </div>
           </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
             <Loader2 className="w-8 h-8 text-[#20beff] animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
             {experiments.length > 0 ? (
               [...experiments].reverse().map((exp) => (
                 <div key={exp.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md">Exp #{exp.id}</span>
                             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{new Date(exp.timestamp).toLocaleDateString()}</span>
                          </div>
                          <h5 className="text-sm font-black text-slate-900 group-hover:text-[#20beff] transition-colors">{exp.model}</h5>
                          {exp.notes && <p className="text-[11px] text-slate-500 font-medium mt-2 line-clamp-2 italic">"{exp.notes}"</p>}
                       </div>
                       
                       <div className="flex items-center gap-6">
                          <div className="text-center">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Local CV</p>
                             <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                                <span className="text-sm font-black text-[#20beff]">{exp.cvScore}</span>
                             </div>
                          </div>
                          <div className="text-center">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Public LB</p>
                             <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                <span className="text-sm font-black text-slate-900">{exp.lbScore || '—'}</span>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
               ))
             ) : (
               <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No experiments logged yet</p>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperimentLabTab;
