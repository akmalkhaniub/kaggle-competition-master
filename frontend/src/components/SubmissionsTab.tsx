import React, { useState, useEffect } from 'react';
import { Upload, MessageSquare, Loader2, CheckCircle2, XCircle, Clock, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

interface Submission {
  ref: string;
  date: string;
  description: string;
  status: string;
  publicScore: string | null;
  privateScore: string | null;
}

interface SubmissionsTabProps {
  competitionRef: string;
}

const SubmissionsTab: React.FC<SubmissionsTabProps> = ({ competitionRef }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/competitions/${competitionRef}/submissions`);
      const data = await response.json();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [competitionRef]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`/api/competitions/${competitionRef}/submit?message=${encodeURIComponent(message)}`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.status === 'success') {
        toast.success('Submission successful');
        setFile(null);
        setMessage('');
        fetchSubmissions();
      } else {
        toast.error(result.message || 'Submission failed');
      }
    } catch (error) {
      toast.error('Connection error');
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'complete': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-orange-500 animate-pulse" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Upload Section */}
      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-8">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">New Submission</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <input 
              type="file" 
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center gap-3 transition-all group-hover:border-[#20beff]/50 group-hover:bg-blue-50/30">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#20beff]">
                <Upload size={24} />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-700">
                  {file ? file.name : 'Select submission.csv'}
                </p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  Drag and drop or click to browse
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Submission message (e.g. 'XGBoost with feature engineering')" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-xs font-bold focus:ring-2 focus:ring-[#20beff]/30 transition-all outline-none"
            />
          </div>

          <button 
            type="submit"
            disabled={!file || uploading}
            className="w-full bg-[#20beff] hover:bg-[#00a6e6] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit to Kaggle'}
          </button>
        </form>
      </div>

      {/* History List */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Submission History</h4>
          <button 
            onClick={fetchSubmissions}
            className="text-[10px] font-black text-[#20beff] uppercase tracking-widest hover:underline"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-6 h-6 text-[#20beff] animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.length > 0 ? (
              submissions.map((s, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(s.status)}
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {new Date(s.date).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-[#20beff] transition-colors">
                      {s.description || 'No description'}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-6">
                    <div>
                      <p className="text-[10px] font-black text-[#20beff] uppercase tracking-tighter">Public Score</p>
                      <p className="text-sm font-black text-slate-900">{s.publicScore || '—'}</p>
                    </div>
                    {s.status.toLowerCase() === 'error' && (
                      <button 
                        onClick={async (e) => {
                          e.stopPropagation();
                          toast.loading('Analyzing Error...', { id: `trouble-${s.ref}` });
                          try {
                            const response = await fetch(`/api/competitions/${competitionRef}/troubleshoot?error_text=${encodeURIComponent(s.description || 'Submission Error')}`, {
                              method: 'POST'
                            });
                            const data = await response.json();
                            toast.dismiss(`trouble-${s.ref}`);
                            // Show diagnosis in a more prominent way
                            alert(`AI Diagnosis: ${data.diagnosis}\n\nSuggested Fix:\n${data.fix.join('\n')}`);
                          } catch (err) {
                            toast.error('Troubleshooting failed', { id: `trouble-${s.ref}` });
                          }
                        }}
                        className="p-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-all active:scale-95"
                        title="AI Troubleshooting"
                      >
                        <Zap size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-400 text-xs font-bold py-12">No submissions found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionsTab;
