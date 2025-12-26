
import React, { useState } from 'react';
import { Transaction, ScheduleEvent, ActivityReport, Staff, RPKGoal, ActivityType } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, Activity, Calendar, FileText, CheckCircle2, Target, TrendingUp, ChevronLeft, ChevronRight, BarChart3, LayoutGrid, Table as TableIcon, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  transactions: Transaction[];
  schedules: ScheduleEvent[];
  reports: ActivityReport[];
  staff: Staff[];
  activityTypes: ActivityType[];
  rpkGoals: RPKGoal[];
  selectedYear: number;
  setSelectedYear: React.Dispatch<React.SetStateAction<number>>;
  userRole: 'admin' | 'tamu';
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 
  'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
];

const Dashboard: React.FC<Props> = ({ transactions, schedules, reports, staff, activityTypes, rpkGoals, selectedYear, setSelectedYear, userRole }) => {
  const filteredTransactions = transactions.filter(t => new Date(t.date).getFullYear() === selectedYear);
  const filteredReports = reports.filter(r => new Date(r.date).getFullYear() === selectedYear);
  const filteredSchedules = schedules.filter(s => new Date(s.date).getFullYear() === selectedYear);

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const chartData = filteredTransactions.slice(-7).map(t => ({
    name: new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    amount: t.type === 'income' ? t.amount : -t.amount
  }));

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySchedules = filteredSchedules.filter(s => s.date === todayStr);

  const getCellData = (activityId: string, monthIdx: number) => {
    const monthStr = `${selectedYear}-${String(monthIdx + 1).padStart(2, '0')}`;
    
    const goal = rpkGoals.find(g => g.activityTypeId === activityId && g.month === monthStr);
    const target = goal ? goal.target : 0;
    
    const actual = filteredReports.filter(r => {
      const rMonth = r.date.slice(0, 7);
      return r.activityId === activityId && rMonth === monthStr && r.status === 'submitted';
    }).length;

    return { actual, target };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10">
          <Activity size={240} />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">BOK Puskesmas Kupu</h1>
          <p className="text-teal-100 max-w-md">Sistem integrasi monitoring RPK bulanan, realisasi anggaran, dan laporan kegiatan lapangan untuk tahun {selectedYear}.</p>
          {userRole === 'admin' && (
            <div className="flex space-x-4 mt-6">
              <Link to="/reports/new" className="bg-white text-teal-800 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-teal-50 transition-all active:scale-95">
                Input Laporan Baru
              </Link>
              <Link to="/rpk" className="bg-teal-600/50 backdrop-blur text-white border border-teal-500/30 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-teal-600 transition-all active:scale-95">
                Update Target RPK
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          label="Saldo Kas" 
          value={`Rp ${balance.toLocaleString('id-ID')}`} 
          trend={`T.A ${selectedYear}`} 
          icon={<ArrowUpRight className="text-emerald-500" />} 
          color="border-emerald-100"
        />
        <StatCard 
          label="Laporan Masuk" 
          value={filteredReports.filter(r => r.status === 'submitted').length.toString()} 
          trend={`T.A ${selectedYear}`} 
          icon={<CheckCircle2 className="text-teal-500" />} 
          color="border-teal-100"
        />
        <StatCard 
          label="Petugas Lapangan" 
          value={staff.length.toString()} 
          trend="Aktif" 
          icon={<UsersRound className="text-indigo-500" size={20} />} 
          color="border-indigo-100"
        />
        <StatCard 
          label="Tugas Hari Ini" 
          value={todaySchedules.length.toString()} 
          trend="On Progress" 
          icon={<Calendar className="text-amber-500" />} 
          color="border-amber-100"
        />
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-2 text-teal-700 mb-1">
              <TableIcon size={20} />
              <h3 className="text-lg font-black uppercase tracking-tight">Monitoring RPK Tahunan</h3>
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Rekapitulasi Target (T) dan Realisasi (R) per Bulan</p>
          </div>
          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
             <button onClick={() => setSelectedYear(selectedYear - 1)} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm"><ChevronLeft size={16}/></button>
             <span className="px-6 font-black text-slate-700">{selectedYear}</span>
             <button onClick={() => setSelectedYear(selectedYear + 1)} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm"><ChevronRight size={16}/></button>
          </div>
        </div>

        <div className="overflow-x-auto -mx-8 px-8 pb-4 scrollbar-thin scrollbar-thumb-slate-200">
          <table className="w-full text-center border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b-2 border-slate-50">
                <th className="py-4 text-left font-black text-[10px] text-slate-400 uppercase tracking-widest sticky left-0 bg-white z-10 w-48">Jenis Kegiatan</th>
                {MONTH_NAMES.map(month => (
                  <th key={month} className="px-2 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest w-16">{month}</th>
                ))}
                <th className="px-4 py-4 font-black text-[10px] text-teal-600 uppercase tracking-widest bg-teal-50/50 rounded-t-2xl">Total Thn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activityTypes.map(activity => {
                let yearlyActual = 0;
                let yearlyTarget = 0;

                return (
                  <tr key={activity.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 text-left sticky left-0 bg-white z-10 group-hover:bg-slate-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-[10px] shadow-sm" style={{ backgroundColor: activity.color }}>
                          {activity.code}
                        </div>
                        <span className="text-xs font-black text-slate-700 truncate w-32">{activity.name}</span>
                      </div>
                    </td>
                    {MONTH_NAMES.map((_, idx) => {
                      const { actual, target } = getCellData(activity.id, idx);
                      yearlyActual += actual;
                      yearlyTarget += target;
                      
                      const hasData = target > 0 || actual > 0;
                      const isComplete = target > 0 && actual >= target;
                      const isWarning = target > 0 && actual < target && actual > 0;
                      const isPending = target > 0 && actual === 0;

                      return (
                        <td key={idx} className="px-1 py-5">
                          {hasData ? (
                            <div className={`py-1.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                              isComplete ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                              isWarning ? 'bg-amber-50 border-amber-100 text-amber-700' :
                              isPending ? 'bg-rose-50 border-rose-100 text-rose-500' :
                              'bg-slate-50 border-slate-100 text-slate-400'
                            }`}>
                              <span className="text-[10px] font-black leading-none mb-0.5">{actual}</span>
                              <div className="w-4 border-t border-current opacity-30 my-0.5"></div>
                              <span className="text-[8px] font-bold opacity-70 leading-none">{target}</span>
                            </div>
                          ) : (
                            <span className="text-slate-200 font-bold">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-5 bg-teal-50/30">
                       <div className="flex flex-col items-center">
                          <span className="text-xs font-black text-teal-700">{yearlyActual}</span>
                          <span className="text-[9px] font-bold text-teal-400 uppercase tracking-tighter">Target: {yearlyTarget}</span>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t border-slate-50">
          <LegendItem color="bg-emerald-50 text-emerald-700 border-emerald-100" label="Target Tercapai" />
          <LegendItem color="bg-amber-50 text-amber-700 border-amber-100" label="Sedang Berproses" />
          <LegendItem color="bg-rose-50 text-rose-500 border-rose-100" label="Belum Realisasi" />
          <LegendItem color="bg-slate-50 text-slate-400 border-slate-100" label="Tidak Ada Target" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <BarChart3 size={20} className="text-teal-600" />
              <h3 className="text-lg font-bold text-slate-800">Tren Arus Kas Mingguan</h3>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `Rp ${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(v: any) => `Rp ${v.toLocaleString('id-ID')}`}
                />
                <Area type="monotone" dataKey="amount" stroke="#0d9488" fillOpacity={1} fill="url(#colorAmt)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Jadwal Hari Ini</h3>
            <Link to="/schedule" className="text-teal-600 text-xs font-bold hover:underline">Lihat Semua</Link>
          </div>
          <div className="space-y-4 max-h-[256px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-100">
            {todaySchedules.length > 0 ? todaySchedules.map(s => (
              <div key={s.id} className="p-4 bg-slate-50 rounded-2xl border-l-4 border-teal-500 hover:shadow-md transition-all">
                <p className="font-bold text-slate-800 text-sm leading-tight">Kegiatan Lapangan</p>
                <div className="flex items-center text-[10px] text-slate-500 mt-2">
                   <Activity size={12} className="mr-1 text-teal-500" />
                   <span className="truncate font-bold uppercase">{s.location}</span>
                </div>
                <div className="flex mt-3 space-x-1">
                  {s.staffNames.map(name => (
                    <span key={name} className="w-6 h-6 flex items-center justify-center bg-teal-600 text-white rounded-lg text-[10px] font-black shadow-sm" title={name}>
                      {staff.find(st => st.name === name)?.code || "?"}
                    </span>
                  ))}
                </div>
              </div>
            )) : (
              <div className="text-center py-10">
                <Calendar size={32} className="text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 text-xs italic">Belum ada kegiatan luar hari ini.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const LegendItem: React.FC<{ color: string, label: string }> = ({ color, label }) => (
  <div className="flex items-center space-x-2">
    <div className={`w-4 h-4 rounded-md border ${color.split(' ')[0]} ${color.split(' ')[2]}`}></div>
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
  </div>
);

const StatCard: React.FC<{ label: string, value: string, trend: string, icon: React.ReactNode, color: string }> = ({ label, value, trend, icon, color }) => (
  <div className={`bg-white p-6 rounded-3xl shadow-sm border-2 ${color} relative overflow-hidden hover:scale-[1.02] transition-transform`}>
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-50 rounded-2xl">
        {icon}
      </div>
      <span className="text-[10px] font-black px-2 py-1 bg-slate-100 rounded-full text-slate-500 uppercase tracking-tighter">{trend}</span>
    </div>
    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{label}</p>
    <p className="text-xl font-black text-slate-900 mt-1">{value}</p>
  </div>
);

export default Dashboard;
