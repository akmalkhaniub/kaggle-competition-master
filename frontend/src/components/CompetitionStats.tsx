import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

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

  // Aggregate data for Bar Chart (Prizes - Simplified)
  const prizeData = competitions
    .filter(c => c.reward.includes('$'))
    .map(c => ({
      name: c.title.substring(0, 15) + '...',
      prize: parseInt(c.reward.replace(/[^0-9]/g, '')) || 0
    }))
    .sort((a, b) => b.prize - a.prize)
    .slice(0, 5);

  const COLORS = ['#20beff', '#00e676', '#ff9100', '#f44336', '#9c27b0'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Prize Distribution (Top 5)</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={prizeData}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Prize Pool']}
              />
              <Bar dataKey="prize" fill="#20beff" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Category Breakdown</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CompetitionStats;
