
import React, { useState, useMemo, useEffect } from 'react';
import { ScheduleEvent, Staff, ActivityType, Holiday } from '../types';
import { ChevronLeft, ChevronRight, Search, Plus, Calendar as CalendarIcon, MapPin, ListChecks, Trash2, UsersRound, ClipboardList, X, FileSpreadsheet, Hash, FileSignature, Umbrella } from 'lucide-react';

interface Props {
  schedules: ScheduleEvent[];
  setSchedules: React.Dispatch<React.SetStateAction<ScheduleEvent[]>>;
  staff: Staff[];
  activityTypes: ActivityType[];
  holidays: Holiday[];
  setHolidays: React.Dispatch<React.SetStateAction<Holiday[]>>;
  selectedYear: number;
  userRole: 'admin' | 'tamu';
}

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const ScheduleManager: React.FC<Props> = ({ schedules, setSchedules, staff, activityTypes, holidays, setHolidays, selectedYear, userRole }) => {
  const [searchTermStaff, setSearchTermStaff] = useState('');
  const [searchTermActivity, setSearchTermActivity] = useState('');
  const [viewDate, setViewDate] = useState(new Date(selectedYear, new Date().getMonth(), 1));
  const [isAdding, setIsAdding] = useState(false);
  const [isManagingHolidays, setIsManagingHolidays] = useState(false);
  
  const [sptModalData, setSptModalData] = useState<{activityId: string, sptNumber: string, sptDate: string} | null>(null);

  const [newRecap, setNewRecap] = useState({
    activityId: activityTypes[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    staffNames: [] as string[]
  });

  const [newHoliday, setNewHoliday] = useState({ date: '', description: '' });
  
  useEffect(() => {
    setViewDate(current => new Date(selectedYear, current.getMonth(), 1));
  }, [selectedYear]);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const filteredStaff = useMemo(() => staff.filter(s => s.name.toLowerCase().includes(searchTermStaff.toLowerCase())), [staff, searchTermStaff]);

  const selectedActivity = useMemo(() => activityTypes.find(a => a.id === newRecap.activityId), [newRecap.activityId, activityTypes]);

  const busyStaffOnSelectedDate = useMemo(() => {
    return schedules
      .filter(s => s.date === newRecap.date)
      .flatMap(s => s.staffNames);
  }, [schedules, newRecap.date]);

  useEffect(() => {
    if (selectedActivity) {
      const currentCount = newRecap.staffNames.length;
      const targetCount = selectedActivity.requiredStaffCount;
      
      if (currentCount !== targetCount) {
        let updatedStaff = [...newRecap.staffNames];
        if (currentCount < targetCount) {
          for (let i = currentCount; i < targetCount; i++) updatedStaff.push('');
        } else {
          updatedStaff = updatedStaff.slice(0, targetCount);
        }
        setNewRecap(prev => ({ ...prev, staffNames: updatedStaff }));
      }
    }
  }, [newRecap.activityId, selectedActivity]);

  const sortedSchedules = useMemo(() => {
    return [...schedules]
      .filter(s => {
        const d = new Date(s.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [schedules, currentMonth, currentYear]);

  const filteredGroupedSchedules = useMemo(() => {
    const groups = sortedSchedules.reduce((acc, schedule) => {
      const actId = schedule.activityId;
      if (!acc[actId]) acc[actId] = [];
      acc[actId].push(schedule);
      return acc;
    }, {} as Record<string, ScheduleEvent[]>);

    if (!searchTermActivity.trim()) return groups;

    const filtered: Record<string, ScheduleEvent[]> = {};
    Object.keys(groups).forEach(id => {
      const actType = activityTypes.find(a => a.id === id);
      if (actType?.name.toLowerCase().includes(searchTermActivity.toLowerCase())) {
        filtered[id] = groups[id];
      }
    });
    return filtered;
  }, [sortedSchedules, searchTermActivity, activityTypes]);

  const handleSaveRecap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecap.date || !newRecap.activityId || !newRecap.location.trim() || newRecap.staffNames.some(n => !n)) {
      alert("Mohon lengkapi semua data: Tanggal, Jenis Kegiatan, LOKASI (Wajib), dan semua Petugas.");
      return;
    }

    const hasDoubleBooking = newRecap.staffNames.some(name => busyStaffOnSelectedDate.includes(name));
    if (hasDoubleBooking) {
      alert("Salah satu petugas sudah memiliki jadwal lain di tanggal tersebut. Mohon periksa kembali.");
      return;
    }

    const event: ScheduleEvent = {
      id: crypto.randomUUID(),
      ...newRecap
    };

    setSchedules(prev => [...prev, event]);
    setIsAdding(false);
    setNewRecap({
      activityId: activityTypes[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      location: '',
      staffNames: []
    });
  };

  const handleSaveSpt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sptModalData) return;

    setSchedules(prev => prev.map(s => {
      const d = new Date(s.date);
      const isSameMonth = d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      
      if (s.activityId === sptModalData.activityId && isSameMonth) {
        return { ...s, sptNumber: sptModalData.sptNumber, sptDate: sptModalData.sptDate };
      }
      return s;
    }));
    setSptModalData(null);
  };

  const addHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHoliday.date || !newHoliday.description) return;
    setHolidays(prev => [...prev, { ...newHoliday }]);
    setNewHoliday({ date: '', description: '' });
  };

  const deleteHoliday = (date: string) => {
    setHolidays(prev => prev.filter(h => h.date !== date));
  };

  const deleteSchedule = (id: string) => {
    if(confirm('Hapus rekapan jadwal ini?')) {
      setSchedules(prev => prev.filter(s => s.id !== id));
    }
  };

  const getDayInfo = (day: number) => {
    const d = new Date(currentYear, currentMonth, day);
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const customHoliday = holidays.find(h => h.date === dateStr);
    return { 
      dayName: DAY_NAMES[d.getDay()], 
      holiday: customHoliday?.description, 
      isSun: d.getDay() === 0, 
      dateStr 
    };
  };

  const handleDownloadExcel = () => {
    if (sortedSchedules.length === 0) {
      alert("Tidak ada data untuk diunduh pada periode ini.");
      return;
    }

    const aggregateMap = new Map<string, { activityId: string, activityName: string, staff: string, location: string, dates: number[], firstDate: string, sptNumber?: string }>();

    sortedSchedules.forEach(s => {
      const act = activityTypes.find(a => a.id === s.activityId);
      const actName = act?.name || 'Lainnya';
      const loc = s.location || '-';
      
      s.staffNames.forEach(staffName => {
        const key = `${s.activityId}|${staffName}|${loc}`;
        const day = new Date(s.date).getDate();
        
        if (!aggregateMap.has(key)) {
          aggregateMap.set(key, {
            activityId: s.activityId,
            activityName: actName,
            staff: staffName,
            location: loc,
            dates: [day],
            firstDate: s.date,
            sptNumber: s.sptNumber
          });
        } else {
          const existing = aggregateMap.get(key)!;
          if (!existing.dates.includes(day)) {
            existing.dates.push(day);
            existing.dates.sort((a, b) => a - b);
          }
        }
      });
    });

    const finalData = Array.from(aggregateMap.values()).sort((a, b) => {
      const nameCompare = a.activityName.localeCompare(b.activityName);
      if (nameCompare !== 0) return nameCompare;
      return a.firstDate.localeCompare(b.firstDate);
    });

    const headers = ["No.", "Nama Kegiatan", "Nama Pegawai", "Nomor SPT", "Tanggal", "Lokasi"];
    const monthYearStr = viewDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    
    let counter = 1;
    const csvRows = finalData.map(item => {
      const datesDisplay = `${item.dates.join(', ')} ${monthYearStr}`;
      return [
        (counter++).toString(),
        item.activityName,
        item.staff,
        item.sptNumber || '-',
        datesDisplay,
        item.location.replace(/,/g, ' ')
      ].map(val => `"${val}"`).join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rekap_kegiatan_puskesmas_${viewDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200">
        <div className="flex items-center space-x-4">
          <div className="bg-teal-600 p-3 rounded-2xl text-white shadow-lg"><ClipboardList size={24} /></div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Rekapan & Penjadwalan</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Kelola roster kerja lapangan Puskesmas</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {userRole === 'admin' && (
            <>
              <button 
                onClick={() => setIsManagingHolidays(true)}
                className="bg-white text-rose-600 border-2 border-rose-100 px-5 py-3 rounded-2xl font-black flex items-center space-x-2 hover:bg-rose-50 transition-all active:scale-95 shadow-sm"
              >
                <Umbrella size={20} />
                <span className="hidden sm:inline">LIBUR/CUTI</span>
              </button>
              <button 
                onClick={handleDownloadExcel}
                className="bg-white text-teal-600 border-2 border-teal-100 px-5 py-3 rounded-2xl font-black flex items-center space-x-2 hover:bg-teal-50 transition-all active:scale-95 shadow-sm"
              >
                <FileSpreadsheet size={20} />
                <span className="hidden sm:inline">EXCEL</span>
              </button>
            </>
          )}
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-teal-600 text-white px-6 py-3 rounded-2xl font-black flex items-center space-x-2 shadow-lg hover:bg-teal-700 transition-all active:scale-95"
          >
            <Plus size={20} />
            <span>BARU</span>
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4 pt-24 transition-all duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in duration-300 max-h-[80vh] flex flex-col border border-slate-100 relative">
            {/* Modal Header */}
            <div className="p-8 md:px-10 md:py-8 border-b border-slate-50 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Tambah Rekapan Jadwal</h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Lengkapi Data Kegiatan Lapangan</p>
                </div>
                <button onClick={() => setIsAdding(false)} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-400 transition-all">
                  <X size={24} />
                </button>
            </div>
            
            {/* Modal Body (Scrollable) */}
            <div className="p-8 md:px-10 md:py-8 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200">
              <form id="add-schedule-form" onSubmit={handleSaveRecap} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block px-1 tracking-widest">Jenis Kegiatan</label>
                    <select 
                      value={newRecap.activityId}
                      onChange={e => setNewRecap({...newRecap, activityId: e.target.value})}
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:border-teal-500 outline-none transition-all"
                    >
                      {activityTypes.map(act => (
                        <option key={act.id} value={act.id}>{act.name} (Butuh {act.requiredStaffCount} Petugas)</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block px-1 tracking-widest">Tanggal Kegiatan</label>
                    <input 
                      type="date" 
                      value={newRecap.date}
                      onChange={e => {
                        setNewRecap({...newRecap, date: e.target.value, staffNames: newRecap.staffNames.map(() => '')});
                      }}
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:border-teal-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block px-1 tracking-widest flex items-center">
                    Lokasi Kegiatan <span className="text-rose-500 ml-1 font-black">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      placeholder="Wajib Diisi (Contoh: Balai Desa Sukamaju)"
                      value={newRecap.location}
                      onChange={e => setNewRecap({...newRecap, location: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:border-teal-500 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center">
                      <UsersRound size={16} className="mr-2 text-teal-600" /> 
                      Petugas Pelaksana ({selectedActivity?.requiredStaffCount} Orang)
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {newRecap.staffNames.map((staffName, idx) => (
                      <div key={idx} className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase block px-1 tracking-widest">Petugas {idx + 1}</label>
                        <select 
                          value={staffName}
                          onChange={e => {
                            const updated = [...newRecap.staffNames];
                            updated[idx] = e.target.value;
                            setNewRecap({...newRecap, staffNames: updated});
                          }}
                          className="w-full p-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-xs text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                        >
                          <option value="">-- Pilih Pegawai --</option>
                          {staff.map(s => {
                            const isBusy = busyStaffOnSelectedDate.includes(s.name);
                            const isAlreadySelectedInForm = newRecap.staffNames.some((name, i) => name === s.name && i !== idx);
                            if (isBusy || isAlreadySelectedInForm) return null;
                            return <option key={s.id} value={s.name}>{s.name}</option>
                          })}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-8 md:px-10 md:py-8 border-t border-slate-50 bg-slate-50/50 flex space-x-4 shrink-0">
               <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Batal</button>
               <button form="add-schedule-form" type="submit" className="flex-[2] py-4 bg-teal-600 text-white font-black rounded-2xl shadow-xl shadow-teal-100 active:scale-95 transition-all text-[10px] uppercase tracking-widest">SIMPAN REKAPAN</button>
            </div>
          </div>
        </div>
      )}

      {isManagingHolidays && userRole === 'admin' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1010] flex items-center justify-center p-4 pt-24">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Kelola Hari Libur / Cuti</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Tanggal ini akan ditandai merah di kalender</p>
                </div>
                <button onClick={() => setIsManagingHolidays(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
              </div>

              <form onSubmit={addHoliday} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                <input 
                  type="date" 
                  value={newHoliday.date} 
                  onChange={e => setNewHoliday({...newHoliday, date: e.target.value})} 
                  className="p-3 bg-slate-50 border rounded-xl text-sm font-bold outline-none focus:border-rose-500" 
                  required
                />
                <div className="flex gap-2">
                  <input 
                    placeholder="Ket. Libur" 
                    value={newHoliday.description} 
                    onChange={e => setNewHoliday({...newHoliday, description: e.target.value})} 
                    className="flex-1 p-3 bg-slate-50 border rounded-xl text-sm font-bold outline-none focus:border-rose-500"
                    required
                  />
                  <button type="submit" className="bg-rose-600 text-white p-3 rounded-xl hover:bg-rose-700"><Plus size={20} /></button>
                </div>
              </form>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-100">
                {holidays.length > 0 ? [...holidays].sort((a,b) => a.date.localeCompare(b.date)).map(h => (
                  <div key={h.date} className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl border border-rose-100 group">
                    <div>
                      <p className="text-xs font-black text-rose-700">{new Date(h.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">{h.description}</p>
                    </div>
                    <button onClick={() => deleteHoliday(h.date)} className="p-2 text-rose-300 hover:text-rose-600 hover:bg-white rounded-xl transition-all"><Trash2 size={16}/></button>
                  </div>
                )) : (
                  <div className="text-center py-10 text-slate-300 text-xs italic">Belum ada hari libur kustom ditambahkan.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {sptModalData && userRole === 'admin' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1010] flex items-center justify-center p-4 pt-24">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Input SPT Bulanan</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Berlaku untuk seluruh kegiatan sejenis di bulan ini</p>
                </div>
                <button onClick={() => setSptModalData(null)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
              </div>
              
              <form onSubmit={handleSaveSpt} className="space-y-6">
                <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block tracking-widest">Nomor SPT</label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                      <input 
                        type="text"
                        placeholder="094/001/PKM.KUPU/2026"
                        value={sptModalData.sptNumber}
                        onChange={e => setSptModalData({...sptModalData, sptNumber: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-100 rounded-xl font-bold text-slate-700 focus:border-amber-500 outline-none transition-all"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block tracking-widest">Tanggal SPT</label>
                    <input 
                      type="date" 
                      value={sptModalData.sptDate}
                      onChange={e => setSptModalData({...sptModalData, sptDate: e.target.value})}
                      className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl font-bold text-slate-700 focus:border-amber-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                   <button type="button" onClick={() => setSptModalData(null)} className="flex-1 py-3 text-slate-400 font-bold text-sm">Batal</button>
                   <button type="submit" className="flex-[2] py-3 bg-teal-600 text-white font-black rounded-xl shadow-lg">SIMPAN DATA SPT</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3">
            <ListChecks className="text-teal-600" size={24} />
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Daftar Rekapan Kegiatan</h3>
          </div>
          <div className="flex flex-1 max-w-md relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              placeholder="Cari nama kegiatan..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold focus:border-teal-500 transition-all" 
              value={searchTermActivity} 
              onChange={e => setSearchTermActivity(e.target.value)} 
            />
          </div>
        </div>
        
        <div className="space-y-12">
          {Object.keys(filteredGroupedSchedules).length > 0 ? (
            (Object.entries(filteredGroupedSchedules) as [string, ScheduleEvent[]][]).map(([actId, items]) => {
              const actType = activityTypes.find(a => a.id === actId);
              const hasSpt = items[0]?.sptNumber;
              return (
                <div key={actId} className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-slate-50 pb-6 mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white font-black text-xl shadow-lg" style={{ backgroundColor: actType?.color }}>
                        {actType?.code}
                      </div>
                      <div>
                        <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{actType?.name}</h4>
                        <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                           {hasSpt ? (
                             <div className="flex items-center bg-amber-50 text-amber-700 px-4 py-2 rounded-2xl border border-amber-100">
                               <Hash size={14} className="mr-2" />
                               <span className="text-[10px] font-black uppercase tracking-widest mr-3">SPT: {items[0].sptNumber}</span>
                               <span className="text-[10px] font-bold">({items[0].sptDate ? new Date(items[0].sptDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'})</span>
                               {userRole === 'admin' && <button 
                                 onClick={() => setSptModalData({activityId: actId, sptNumber: items[0].sptNumber || '', sptDate: items[0].sptDate || new Date().toISOString().split('T')[0]})}
                                 className="ml-4 p-1.5 bg-white rounded-lg hover:text-amber-900 transition-colors shadow-sm"
                               >
                                 <FileSignature size={12} />
                               </button>}
                             </div>
                           ) : (
                             userRole === 'admin' && <button 
                               onClick={() => setSptModalData({activityId: actId, sptNumber: '', sptDate: new Date().toISOString().split('T')[0]})}
                               className="flex items-center bg-slate-50 text-slate-400 px-4 py-2 rounded-2xl border border-dashed border-slate-200 hover:border-teal-500 hover:text-teal-600 transition-all text-[10px] font-black uppercase tracking-widest"
                             >
                               <Plus size={14} className="mr-2" /> Tambah SPT Bulanan
                             </button>
                           )}
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-full">{items.length} Entri</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto rounded-[2rem] border border-slate-100 shadow-inner bg-slate-50/30">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                          <th className="px-8 py-5 w-16 text-center">No</th>
                          <th className="px-8 py-5">Tanggal</th>
                          <th className="px-8 py-5">Petugas Pelaksana</th>
                          <th className="px-8 py-5">Lokasi Kegiatan</th>
                          {userRole === 'admin' && <th className="px-8 py-5 text-center w-24">Aksi</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {items.map((item, index) => (
                          <tr key={item.id} className="hover:bg-teal-50/50 transition-colors group bg-white">
                            <td className="px-8 py-5 text-xs font-bold text-slate-300 text-center">{index + 1}</td>
                            <td className="px-8 py-5 whitespace-nowrap">
                              <div className="flex items-center">
                                <CalendarIcon size={14} className="mr-2 text-teal-500" />
                                <span className="text-xs font-black text-teal-700 uppercase tracking-widest">
                                  {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                                </span>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex flex-wrap gap-1.5">
                                {item.staffNames.map(name => (
                                  <span key={name} className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-100 uppercase">
                                    {name}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex items-center text-xs font-bold text-slate-700">
                                <MapPin size={14} className="mr-2 text-teal-500 flex-shrink-0" />
                                <span className="truncate" title={item.location}>{item.location}</span>
                              </div>
                            </td>
                            {userRole === 'admin' && <td className="px-8 py-5 text-center">
                              <button 
                                onClick={() => deleteSchedule(item.id)}
                                className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                title="Hapus rekapan"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                 <Search size={32} className="text-slate-300" />
              </div>
              <p className="text-slate-400 italic text-sm font-bold">Tidak ada rekapan yang sesuai dengan pencarian Anda.</p>
              {userRole === 'admin' && <button onClick={() => setSearchTermActivity('')} className="mt-4 text-teal-600 font-black text-xs uppercase tracking-widest hover:underline">Reset Pencarian</button>}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600"><CalendarIcon size={24} /></div>
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">Grid Visual Roster</h2>
              <div className="flex items-center space-x-2">
                <button onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><ChevronLeft size={16} /></button>
                <span className="text-sm font-black text-indigo-700 w-40 text-center uppercase tracking-widest">{viewDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><ChevronRight size={16} /></button>
              </div>
            </div>
          </div>
          <div className="flex flex-1 max-w-md relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              placeholder="Cari nama pegawai..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold focus:border-indigo-500 transition-all" 
              value={searchTermStaff} 
              onChange={e => setSearchTermStaff(e.target.value)} 
            />
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
            <table className="w-full border-collapse table-fixed min-w-[2000px]">
              <thead className="sticky top-0 z-[20]">
                <tr className="bg-slate-50">
                  <th className="sticky left-0 z-[25] bg-slate-50 p-4 border-r border-slate-200 w-64 shadow-md font-black text-[10px] text-slate-400 uppercase tracking-widest text-left">Nama Pegawai</th>
                  {daysArray.map(day => {
                    const info = getDayInfo(day);
                    const isHoliday = !!info.holiday || info.isSun;
                    return (
                      <th key={day} className={`p-2 border-r border-slate-100 min-w-[60px] ${isHoliday ? 'bg-rose-50' : 'bg-slate-50'}`}>
                        <div className={`text-[10px] font-black uppercase ${isHoliday ? 'text-rose-400' : 'text-slate-400'}`}>{info.dayName}</div>
                        <div className={`text-sm font-black ${isHoliday ? 'text-rose-600' : 'text-slate-700'}`}>{day}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map(staff => (
                  <tr key={staff.id} className="border-b border-slate-50 hover:bg-slate-50/50 group">
                    <td className="sticky left-0 z-[15] bg-white p-4 border-r border-slate-200 shadow-sm flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-[10px] shadow-sm">{staff.code}</div>
                      <span className="text-xs font-bold text-slate-700 truncate">{staff.name}</span>
                    </td>
                    {daysArray.map(day => {
                      const info = getDayInfo(day);
                      const isHoliday = !!info.holiday || info.isSun;
                      const event = schedules.find(s => s.date === info.dateStr && s.staffNames.includes(staff.name));
                      const actType = activityTypes.find(a => a.id === event?.activityId);
                      return (
                        <td key={day} className={`p-1 border-r border-slate-50 min-h-[44px] ${isHoliday ? 'bg-rose-50/30' : ''}`} title={info.holiday || ''}>
                          {event ? (
                            <div className="w-full h-full p-1 animate-in zoom-in duration-300">
                              <div className="rounded-lg h-8 flex items-center justify-center text-[10px] text-white font-black shadow-md border-b-2 border-black/10" style={{ backgroundColor: actType?.color || '#94a3b8' }} title={`${actType?.name} at ${event.location}`}>
                                {actType?.code || '?'}
                              </div>
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleManager;