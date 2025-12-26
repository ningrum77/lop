
import React, { useState, useMemo } from 'react';
import { RPKGoal, ActivityType, ActivityReport } from '../types';
import { 
  Target, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Landmark, 
  Banknote, 
  Calendar, 
  Table as TableIcon, 
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  ExternalLink,
  Receipt
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  rpkGoals: RPKGoal[];
  setRpkGoals: React.Dispatch<React.SetStateAction<RPKGoal[]>>;
  activityTypes: ActivityType[];
  reports: ActivityReport[];
  selectedYear: number;
  setSelectedYear: React.Dispatch<React.SetStateAction<number>>;
  userRole: 'admin' | 'tamu';
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const RPKManager: React.FC<Props> = ({ rpkGoals, setRpkGoals, activityTypes, reports, selectedYear, setSelectedYear, userRole }) => {
  const navigate = useNavigate();
  const [editingCell, setEditingCell] = useState<{activityId: string, monthIdx: number} | null>(null);
  const [detailCell, setDetailCell] = useState<{activityId: string, monthIdx: number} | null>(null);
  
  const [editFormData, setEditFormData] = useState({
    target: 0,
    unit: 'Kali',
    plannedBudget: 0,
    disbursedAmount: 0
  });

  const getReportsInMonth = (activityId: string, monthIdx: number) => {
    const monthStr = `${selectedYear}-${String(monthIdx + 1).padStart(2, '0')}`;
    return reports.filter(r => r.activityId === activityId && r.date.startsWith(monthStr) && r.status === 'submitted');
  };

  const getRealisasiBulan = (activityId: string, monthIdx: number) => {
    const reportsInMonth = getReportsInMonth(activityId, monthIdx);
    return reportsInMonth.reduce((sum, r) => sum + r.expenses.reduce((s, e) => s + e.amount, 0), 0);
  };

  const getPlafonBulan = (activityId: string, monthIdx: number) => {
    const monthStr = `${selectedYear}-${String(monthIdx + 1).padStart(2, '0')}`;
    return rpkGoals.find(g => g.activityTypeId === activityId && g.month === monthStr)?.plannedBudget || 0;
  };

  const getTargetFisikBulan = (activityId: string, monthIdx: number) => {
    const monthStr = `${selectedYear}-${String(monthIdx + 1).padStart(2, '0')}`;
    return rpkGoals.find(g => g.activityTypeId === activityId && g.month === monthStr)?.target || 0;
  };

  const handleOpenEditor = (activityId: string, monthIdx: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah terbukanya detail modal
    const monthStr = `${selectedYear}-${String(monthIdx + 1).padStart(2, '0')}`;
    const existing = rpkGoals.find(g => g.activityTypeId === activityId && g.month === monthStr);
    
    setEditFormData({
      target: existing?.target || 0,
      unit: existing?.unit || 'Kali',
      plannedBudget: existing?.plannedBudget || 0,
      disbursedAmount: existing?.disbursedAmount || 0
    });
    setEditingCell({ activityId, monthIdx });
  };

  const handleSaveCell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCell) return;
    const monthStr = `${selectedYear}-${String(editingCell.monthIdx + 1).padStart(2, '0')}`;
    const newGoal: RPKGoal = { id: crypto.randomUUID(), month: monthStr, activityTypeId: editingCell.activityId, ...editFormData };
    setRpkGoals(prev => {
      const filtered = prev.filter(g => !(g.activityTypeId === editingCell.activityId && g.month === monthStr));
      return [...filtered, newGoal];
    });
    setEditingCell(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center space-x-4">
            <div className="bg-teal-600 p-3 rounded-2xl text-white shadow-lg"><Target size={24} /></div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">Plafon & Realisasi RPK</h1>
              <div className="flex items-center space-x-3 mt-1">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button onClick={() => setSelectedYear(selectedYear - 1)} className="p-1 hover:bg-white rounded-lg transition-all"><ChevronLeft size={16}/></button>
                  <span className="px-4 font-black text-slate-700">{selectedYear}</span>
                  <button onClick={() => setSelectedYear(selectedYear + 1)} className="p-1 hover:bg-white rounded-lg transition-all"><ChevronRight size={16}/></button>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Klik sel untuk melihat rincian laporan</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto -mx-8 px-8 pb-4 scrollbar-thin scrollbar-thumb-slate-200">
          <table className="w-full text-center border-collapse min-w-[1200px]">
            <thead>
              <tr className="border-b-2 border-slate-50">
                <th className="py-4 text-left font-black text-[10px] text-slate-400 uppercase tracking-widest sticky left-0 bg-white z-10 w-48">Jenis Kegiatan</th>
                {MONTH_NAMES.map((m, i) => (
                  <th key={i} className="px-2 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest w-24">{m.slice(0, 3)}</th>
                ))}
                <th className="px-4 py-4 font-black text-[10px] text-teal-600 uppercase tracking-widest bg-teal-50/50">Total Realisasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activityTypes.map(activity => {
                let yearlyPlafon = 0;
                let yearlyActual = 0;
                return (
                  <tr key={activity.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-6 text-left sticky left-0 bg-white z-10 group-hover:bg-slate-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-[10px] shadow-sm" style={{ backgroundColor: activity.color }}>{activity.code}</div>
                        <span className="text-xs font-black text-slate-700 truncate w-36">{activity.name}</span>
                      </div>
                    </td>
                    {MONTH_NAMES.map((_, idx) => {
                      const plafon = getPlafonBulan(activity.id, idx);
                      const realisasi = getRealisasiBulan(activity.id, idx);
                      const reportCount = getReportsInMonth(activity.id, idx).length;
                      const targetFisik = getTargetFisikBulan(activity.id, idx);
                      const percentage = plafon > 0 ? Math.round((realisasi / plafon) * 100) : 0;
                      
                      yearlyPlafon += plafon;
                      yearlyActual += realisasi;
                      
                      return (
                        <td key={idx} className="px-1 py-6">
                          <button 
                            onClick={() => userRole === 'admin' && setDetailCell({ activityId: activity.id, monthIdx: idx })}
                            className={`w-full p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all group/cell relative ${plafon > 0 ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-dashed border-slate-200 opacity-40 hover:opacity-100'} ${userRole === 'admin' ? 'cursor-pointer' : 'cursor-default'}`}
                          >
                            {userRole === 'admin' && (
                              <button 
                                onClick={(e) => handleOpenEditor(activity.id, idx, e)}
                                className="absolute -top-2 -right-2 bg-slate-900 text-white p-1 rounded-lg opacity-0 group-hover/cell:opacity-100 transition-opacity z-20 shadow-lg"
                                title="Edit Plafon"
                              >
                                <Save size={10} />
                              </button>
                            )}

                            <span className="text-[9px] font-black text-slate-700">Rp {Math.round(plafon/1000)}k</span>
                            <div className="w-full h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                              <div className={`h-full ${realisasi > plafon ? 'bg-rose-500' : 'bg-teal-500'}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
                            </div>
                            
                            <div className="flex flex-col items-center w-full mt-1.5 space-y-0.5">
                               <div className="flex justify-between w-full px-1">
                                  <span className={`text-[7px] font-bold ${realisasi > plafon ? 'text-rose-500' : 'text-slate-400'}`}>R: {Math.round(realisasi/1000)}k</span>
                                  {reportCount > 0 && (
                                    <span className="text-[7px] font-black text-teal-600 bg-teal-50 px-1 rounded-sm">{reportCount}/{targetFisik} Lpr</span>
                                  )}
                               </div>
                               <div className={`text-[8px] font-black px-1.5 rounded-md ${realisasi > plafon ? 'bg-rose-100 text-rose-600' : percentage > 80 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                 {percentage}%
                               </div>
                            </div>
                          </button>
                        </td>
                      );
                    })}
                    <td className="px-4 py-6 bg-teal-50/30">
                       <div className="flex flex-col items-center">
                          <span className="text-xs font-black text-teal-700">Rp {yearlyActual.toLocaleString('id-ID')}</span>
                          <span className="text-[8px] font-bold text-teal-400 uppercase tracking-tighter">Plafon: {yearlyPlafon.toLocaleString('id-ID')}</span>
                          <div className={`mt-1 text-[8px] font-black px-2 py-0.5 rounded-full ${yearlyActual > yearlyPlafon ? 'bg-rose-100 text-rose-600' : 'bg-teal-100 text-teal-700'}`}>
                            {yearlyPlafon > 0 ? Math.round((yearlyActual / yearlyPlafon) * 100) : 0}%
                          </div>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {detailCell && userRole === 'admin' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 md:p-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Rincian Realisasi Anggaran</h3>
                  <p className="text-[10px] text-teal-600 font-bold uppercase tracking-widest mt-1">
                    {activityTypes.find(a => a.id === detailCell.activityId)?.name} • {MONTH_NAMES[detailCell.monthIdx]} {selectedYear}
                  </p>
                </div>
                <button onClick={() => setDetailCell(null)} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Plafon Bulan Ini</p>
                  <p className="text-xl font-black text-slate-800">Rp {getPlafonBulan(detailCell.activityId, detailCell.monthIdx).toLocaleString('id-ID')}</p>
                </div>
                <div className={`p-6 rounded-[2rem] border ${getRealisasiBulan(detailCell.activityId, detailCell.monthIdx) > getPlafonBulan(detailCell.activityId, detailCell.monthIdx) ? 'bg-rose-50 border-rose-100' : 'bg-teal-50 border-teal-100'}`}>
                  <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${getRealisasiBulan(detailCell.activityId, detailCell.monthIdx) > getPlafonBulan(detailCell.activityId, detailCell.monthIdx) ? 'text-rose-400' : 'text-teal-400'}`}>Total Realisasi (Digabung)</p>
                  <div className="flex items-center space-x-2">
                    <p className={`text-xl font-black ${getRealisasiBulan(detailCell.activityId, detailCell.monthIdx) > getPlafonBulan(detailCell.activityId, detailCell.monthIdx) ? 'text-rose-600' : 'text-teal-700'}`}>
                      Rp {getRealisasiBulan(detailCell.activityId, detailCell.monthIdx).toLocaleString('id-ID')}
                    </p>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${getRealisasiBulan(detailCell.activityId, detailCell.monthIdx) > getPlafonBulan(detailCell.activityId, detailCell.monthIdx) ? 'bg-rose-200 text-rose-700' : 'bg-teal-200 text-teal-800'}`}>
                      {getPlafonBulan(detailCell.activityId, detailCell.monthIdx) > 0 ? Math.round((getRealisasiBulan(detailCell.activityId, detailCell.monthIdx) / getPlafonBulan(detailCell.activityId, detailCell.monthIdx)) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>

              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1 flex items-center">
                <FileText size={14} className="mr-2" /> Daftar Laporan Individu
              </h4>

              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-100">
                {getReportsInMonth(detailCell.activityId, detailCell.monthIdx).length > 0 ? (
                  getReportsInMonth(detailCell.activityId, detailCell.monthIdx).map(report => (
                    <div key={report.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-3xl hover:border-teal-200 transition-all group">
                      <div className="flex items-center space-x-4">
                        <div className="bg-teal-50 p-3 rounded-2xl text-teal-600">
                          <Receipt size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800">{report.title}</p>
                          <div className="flex items-center mt-1 space-x-3">
                            <span className="text-[10px] font-bold text-slate-400 flex items-center"><Calendar size={12} className="mr-1" /> {new Date(report.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                            <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-2 rounded-full uppercase tracking-tighter">{report.expenses.length} Komponen Biaya</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex items-center space-x-4">
                        <div>
                          <p className="text-xs font-black text-slate-800">Rp {report.expenses.reduce((s, e) => s + e.amount, 0).toLocaleString('id-ID')}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase">Perjalanan Ini</p>
                        </div>
                        <button 
                          onClick={() => navigate(`/reports/print/${report.id}`)}
                          className="p-2.5 bg-slate-50 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold text-xs italic">Belum ada laporan yang disubmit untuk periode ini.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {editingCell && userRole === 'admin' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div><h3 className="text-xl font-black text-slate-800">Set Plafon Tahunan</h3><p className="text-[10px] text-teal-600 font-bold uppercase">{MONTH_NAMES[editingCell.monthIdx]} {selectedYear}</p></div>
                <button onClick={() => setEditingCell(null)} className="p-2"><X size={24}/></button>
              </div>
              <form onSubmit={handleSaveCell} className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-[10px] font-black uppercase text-slate-400 mb-1 block px-1">Target Fisik (Kali)</label><input type="number" value={editFormData.target} onChange={e => setEditFormData({...editFormData, target: parseInt(e.target.value) || 0})} className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700" /></div>
                    <div><label className="text-[10px] font-black uppercase text-slate-400 mb-1 block px-1">Satuan</label><input type="text" value={editFormData.unit} onChange={e => setEditFormData({...editFormData, unit: e.target.value})} className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700" /></div>
                  </div>
                </div>
                <div className="bg-teal-50 p-6 rounded-3xl space-y-4 border border-teal-100">
                  <label className="text-[10px] font-black uppercase text-teal-600 mb-1 block px-1">Plafon Anggaran (Maksimal)</label>
                  <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-teal-700">Rp</span><input type="number" value={editFormData.plannedBudget} onChange={e => setEditFormData({...editFormData, plannedBudget: parseInt(e.target.value) || 0})} className="w-full pl-12 pr-4 py-4 bg-white border-2 border-teal-100 rounded-2xl font-bold text-teal-800" /></div>
                </div>
                <button type="submit" className="w-full py-4 bg-teal-600 text-white font-black rounded-2xl shadow-lg hover:bg-teal-700 flex items-center justify-center space-x-2"><Save size={18} /><span>SIMPAN PLAFON</span></button>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100 flex items-start space-x-4">
        <AlertCircle className="text-amber-600 mt-1" size={24} />
        <div className="space-y-2">
          <h4 className="text-sm font-black text-amber-800 uppercase tracking-widest underline">Logika Penggabungan Anggaran</h4>
          <p className="text-xs text-amber-700 leading-relaxed font-medium italic">
            "Jika dalam sebulan ada 3 laporan untuk kegiatan yang sama, sistem akan menjumlahkan ketiganya secara otomatis. Anda bisa mengklik sel pada tabel di atas untuk melihat rincian laporan individu mana saja yang menyusun total realisasi tersebut. Ini memudahkan Anda untuk mengontrol apakah sisa plafon bulanan masih mencukupi untuk kegiatan berikutnya."
          </p>
        </div>
      </div>
    </div>
  );
};

export default RPKManager;
