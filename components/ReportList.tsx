
import React from 'react';
import { ActivityReport } from '../types';
import { Edit2, Trash2, Printer, Calendar, MapPin, Eye, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  reports: ActivityReport[];
  onDelete: (id: string) => void;
  selectedYear: number;
  userRole: 'admin' | 'tamu';
}

const ReportList: React.FC<Props> = ({ reports, onDelete, selectedYear, userRole }) => {
  const navigate = useNavigate();

  const filteredReports = reports.filter(r => new Date(r.date).getFullYear() === selectedYear);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Hasil Kegiatan {selectedYear}</h1>
          <p className="text-slate-500 text-sm">Arsip laporan kegiatan dan pertanggungjawaban anggaran.</p>
        </div>
        <button 
          onClick={() => navigate('/reports/new')}
          className="bg-teal-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-teal-100 hover:bg-teal-700 transition-all active:scale-95"
        >
          Buat Laporan Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map(report => (
          <div key={report.id} className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest ${
                  report.status === 'submitted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {report.status}
                </span>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => navigate(`/reports/edit/${report.id}`)}
                    className="p-2 text-slate-400 hover:bg-teal-50 hover:text-teal-600 rounded-xl transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => { if(confirm('Hapus laporan ini?')) onDelete(report.id) }}
                    className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-4 leading-snug group-hover:text-teal-700 transition-colors">{report.title}</h3>
              
              <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-2xl">
                <div className="flex items-center text-slate-500 text-xs font-bold">
                  <Calendar size={14} className="mr-2 text-teal-500" />
                  {new Date(report.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div className="flex items-center text-slate-500 text-xs font-bold">
                  <MapPin size={14} className="mr-2 text-teal-500" />
                  {report.location}
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50/50 p-4 border-t border-slate-100 flex justify-between items-center px-6">
              <div>
                <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Total Biaya</p>
                <p className="font-black text-slate-700 text-sm">Rp {report.expenses.reduce((acc, e) => acc + e.amount, 0).toLocaleString('id-ID')}</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => navigate(`/reports/print/${report.id}`)}
                  className="bg-white border border-slate-200 p-3 rounded-xl text-teal-600 hover:bg-teal-600 hover:text-white transition-all shadow-sm flex items-center space-x-2 text-xs font-bold"
                  title="Cetak Laporan"
                >
                  <Printer size={16} />
                  <span className="hidden sm:inline">Cetak</span>
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredReports.length === 0 && (
          <div className="col-span-full py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <FileText size={32} />
            </div>
            <p className="text-slate-400 font-bold mb-4">Belum ada laporan kegiatan di tahun {selectedYear}.</p>
            <button 
              onClick={() => navigate('/reports/new')}
              className="bg-teal-50 text-teal-600 px-6 py-2 rounded-xl font-bold hover:bg-teal-100"
            >
              Mulai buat laporan pertama
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportList;
