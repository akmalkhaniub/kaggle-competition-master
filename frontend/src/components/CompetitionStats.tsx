import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'framer-motion';

interface StatsProps {
  competitions: any[];
}

const CompetitionStats: React.FC<StatsProps> = ({ competitions }) => {
  // Aggregate data for Pie Chart (Categories)
  const categoryData = competitions.reduce((acc: any[], comp) => {
    const existing = acc.find(i => i.name === comp.category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: comp.category, value: 1 });
    }
    return acc;
  }, []);

  // Aggregate data for Bar Chart (Prizes)
  const prizeData = competitions
    .filter(c => c.reward.includes('$'))
    .map(c => ({
      name: c.title.substring(0, 15) + '...',
      prize: parseInt(c.reward.replace(/[^0-9]/g, '')) || 0
    }))
    .sort((a, b) => b.prize - a.prize)
    .slice(0, 8);

  const COLORS = ['#20beff', '#00e676', '#ff9100', '#f44336', '#9c27b0', '#3f51b5', '#00bcd4', '#ffeb3b'];

  return (
    <div className="space-y-8 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard title="Total Active" value={competitions.length} subtitle="Live Competitions" color="blue" />
        <StatCard title="Prize Pool" value={`$${(prizeData.reduce((a, b) => a + b.prize, 0) / 1000).toFixed(0)}k+`} subtitle="Top 8 aggregate" color="green" />
        <StatCard title="Research" value={competitions.filter(c => c.category === 'Research').length} subtitle="Deep learning focus" color="purple" />
        <StatCard title="New Today" value={2} subtitle="Recently added" color="orange" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm"
        >
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Prize Distribution (Top 8)</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prizeData}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', padding: '16px' }}
                  itemStyle={{ fontWeight: '900', color: '#1e293b' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Prize Pool']}
                />
                <Bar dataKey="prize" fill="#20beff" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm"
        >
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Category Dominance</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {categoryData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', padding: '16px' }}
                />
                <Legend iconType="circle" verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm"
      >
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Complexity Trend</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={prizeData.reverse()}>
              <defs>
                <linearGradient id="colorPrize" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#20beff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#20beff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="prize" stroke="#20beff" strokeWidth={4} fillOpacity={1} fill="url(#colorPrize)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: string | number, subtitle: string, color: 'blue' | 'green' | 'purple' | 'orange' }> = ({ title, value, subtitle, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{title}</p>
      <p className={`text-3xl font-black mb-1 ${colors[color].split(' ')[1]}`}>{value}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase">{subtitle}</p>
    </div>
  );
};

export default CompetitionStats;
