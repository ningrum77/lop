
import React, { useState } from 'react';
import { Staff } from '../types';
import { Search, Edit3, Check, X, UserPlus, Trash2, Plus, Users, Hash } from 'lucide-react';

interface Props {
  staff: Staff[];
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
}

const StaffManager: React.FC<Props> = ({ staff, setStaff }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Staff | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Otomatis tentukan nomor urut berikutnya
  const nextNumber = staff.length > 0 ? (Math.max(...staff.map(s => parseInt(s.code) || 0)) + 1).toString() : "1";
  const [newStaff, setNewStaff] = useState({ name: '', code: nextNumber });

  const startEdit = (s: Staff) => {
    setEditingId(s.id);
    setEditForm({ ...s });
  };

  const saveEdit = () => {
    if (editForm) {
      setStaff(prev => prev.map(s => s.id === editForm.id ? editForm : s));
      setEditingId(null);
      setEditForm(null);
    }
  };

  const addStaff = () => {
    if (newStaff.name && newStaff.code) {
      const staffMember: Staff = {
        id: `staff-${Date.now()}`,
        name: newStaff.name,
        code: newStaff.code
      };
      setStaff(prev => [staffMember, ...prev]);
      
      // Reset form dengan nomor urut berikutnya lagi
      const nextNumStr = (parseInt(newStaff.code) + 1).toString();
      setNewStaff({ name: '', code: nextNumStr });
      setIsAdding(false);
    }
  };

  const deleteStaff = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pegawai ini dari sistem?')) {
      setStaff(prev => prev.filter(s => s.id !== id));
    }
  };

  const filteredStaff = [...staff]
    .sort((a, b) => parseInt(a.code) - parseInt(b.code))
    .filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Manajemen Pegawai</h2>
            <p className="text-slate-500 text-sm">Kelola daftar pegawai Puskesmas dengan sistem nomor urut pelaksana.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari pegawai..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm font-medium"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => {
                const nextNum = staff.length > 0 ? (Math.max(...staff.map(s => parseInt(s.code) || 0)) + 1).toString() : "1";
                setNewStaff(p => ({ ...p, code: nextNum }));
                setIsAdding(true);
              }}
              className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-teal-100 hover:bg-teal-700 transition-all flex items-center justify-center space-x-2"
            >
              <UserPlus size={18} />
              <span>Tambah Pegawai</span>
            </button>
          </div>
        </div>

        {isAdding && (
          <div className="mb-8 p-6 bg-teal-50 border border-teal-100 rounded-[2rem] animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black text-teal-800 uppercase tracking-widest">Input Pegawai Baru</h3>
              <button onClick={() => setIsAdding(false)} className="text-teal-400 hover:text-teal-600"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-teal-600 uppercase mb-1 block px-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  placeholder="Nama Lengkap Pegawai" 
                  className="w-full p-3 bg-white border border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm font-bold"
                  value={newStaff.name}
                  onChange={e => setNewStaff({...newStaff, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-teal-600 uppercase mb-1 block px-1">Nomor Urut</label>
                <div className="relative">
                  <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-300" />
                  <input 
                    type="number" 
                    placeholder="Contoh: 1" 
                    className="w-full pl-8 pr-3 py-3 bg-white border border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm font-bold"
                    value={newStaff.code}
                    onChange={e => setNewStaff({...newStaff, code: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button 
                  onClick={addStaff}
                  className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition-all flex items-center justify-center space-x-2"
                >
                  <Plus size={20} />
                  <span>SIMPAN</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map(s => (
            <div key={s.id} className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-teal-100 transition-all group overflow-hidden relative">
              {editingId === s.id ? (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div>
                    <label className="text-[9px] font-black text-teal-600 uppercase mb-1 block">Nama Pegawai</label>
                    <input 
                      className="w-full p-2.5 border border-teal-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-teal-500 outline-none" 
                      value={editForm?.name} 
                      onChange={e => setEditForm(prev => prev ? {...prev, name: e.target.value} : null)} 
                    />
                  </div>
                  <div className="flex space-x-2 items-end">
                    <div className="w-24">
                      <label className="text-[9px] font-black text-teal-600 uppercase mb-1 block">No. Urut</label>
                      <input 
                        type="number"
                        className="w-full p-2.5 border border-teal-200 rounded-lg text-xs font-black" 
                        value={editForm?.code} 
                        onChange={e => setEditForm(prev => prev ? {...prev, code: e.target.value} : null)} 
                      />
                    </div>
                    <button onClick={saveEdit} className="flex-1 bg-teal-600 text-white rounded-lg h-[40px] hover:bg-teal-700 font-bold text-xs flex items-center justify-center shadow-md"><Check size={16} /></button>
                    <button onClick={() => setEditingId(null)} className="flex-1 bg-slate-200 text-slate-600 rounded-lg h-[40px] hover:bg-slate-300 font-bold text-xs flex items-center justify-center"><X size={16} /></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-black text-sm shadow-inner group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                      {s.code}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm group-hover:text-teal-700 transition-colors">{s.name}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Petugas No. {s.code}</p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <button 
                      onClick={() => startEdit(s)}
                      className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all"
                      title="Edit Nama/No. Urut"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => deleteStaff(s.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      title="Hapus Pegawai"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {filteredStaff.length === 0 && (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
              <Users size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold italic">Tidak ada pegawai ditemukan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffManager;
