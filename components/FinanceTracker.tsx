import React, { useState, useRef } from 'react';
import { Transaction } from '../types';
import { Plus, Search, Filter, Download, Trash2, Wallet, Camera, X, Eye, FileImage } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  selectedYear: number;
}

const FinanceTracker: React.FC<Props> = ({ transactions, setTransactions, selectedYear }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<Transaction>>({
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    category: 'Alat Kesehatan',
    source: 'BOK'
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(p => ({ ...p, receiptImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      amount: Number(formData.amount) || 0,
      description: formData.description || '',
      category: formData.category || 'Lainnya',
      date: formData.date || '',
      type: formData.type as 'income' | 'expense',
      source: formData.source || 'Lainnya',
      receiptImage: formData.receiptImage
    };
    setTransactions(prev => [...prev, newTransaction]);
    setIsAdding(false);
    setFormData({
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      category: 'Alat Kesehatan',
      source: 'BOK'
    });
  };

  const deleteTransaction = (id: string) => {
    if (confirm('Hapus transaksi ini?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const filteredTransactions = transactions.filter(t => new Date(t.date).getFullYear() === selectedYear);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Data Keuangan {selectedYear}</h1>
          <p className="text-slate-500">Kelola arus kas, pemasukan dari JKN/BOK, dan pengeluaran operasional.</p>
        </div>
        <div className="flex space-x-2">
          <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm transition-all">
            <Download size={20} />
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-teal-200 transition-all active:scale-95"
          >
            <Plus size={20} />
            <span>Tambah Transaksi</span>
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[800] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Tambah Transaksi Baru</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
                  <button 
                    type="button" 
                    onClick={() => setFormData(p => ({ ...p, type: 'income' }))}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${formData.type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    Pemasukan
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setFormData(p => ({ ...p, type: 'expense' }))}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${formData.type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    Pengeluaran
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal</label>
                    <input type="date" className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nominal (Rp)</label>
                    {/* FIX: Convert input value string to a number for the 'amount' field. */}
                    <input type="number" className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="0" value={formData.amount || ''} onChange={e => setFormData(p => ({ ...p, amount: Number(e.target.value) }))} required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sumber Dana</label>
                  <select className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none bg-white" value={formData.source} onChange={e => setFormData(p => ({ ...p, source: e.target.value }))}>
                    <option value="BOK">BOK (Bantuan Operasional Kesehatan)</option>
                    <option value="JKN">JKN (Jaminan Kesehatan Nasional)</option>
                    <option value="APBD">APBD Kab/Kota</option>
                    <option value="Lainnya">Dana Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kategori</label>
                  <select className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none bg-white" value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}>
                    {formData.type === 'expense' ? (
                      <>
                        <option value="Alat Kesehatan">Alat Kesehatan</option>
                        <option value="Obat-obatan">Obat-obatan</option>
                        <option value="Gaji & Honor">Gaji & Honor</option>
                        <option value="Pemeliharaan">Pemeliharaan</option>
                        <option value="Transport/Dinas">Transport/Dinas</option>
                        <option value="Lainnya">Lainnya</option>
                      </>
                    ) : (
                      <>
                        <option value="Penerimaan Kas">Penerimaan Kas</option>
                        <option value="Hibah">Hibah</option>
                        <option value="Lainnya">Lainnya</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deskripsi</label>
                  <textarea className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none" rows={3} placeholder="Contoh: Pembelian APD untuk Posyandu" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} required></textarea>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-slate-200">
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Bukti Pengeluaran (Opsional)</label>
                  {formData.receiptImage ? (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden group">
                      <img src={formData.receiptImage} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setFormData(p => ({ ...p, receiptImage: undefined }))} className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center space-y-2 text-slate-400 hover:text-teal-600 transition-colors"
                    >
                      <Camera size={32} />
                      <span className="text-[10px] font-bold">UPLOAD FOTO</span>
                    </button>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl">Batal</button>
                  <button type="submit" className="flex-1 py-3 bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-100">Simpan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="max-w-3xl w-full bg-white rounded-3xl p-2 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewImage(null)} className="absolute -top-12 right-0 text-white flex items-center space-x-2 font-bold">
              <X size={24} /> <span>Tutup</span>
            </button>
            <img src={previewImage} className="w-full h-auto rounded-2xl max-h-[80vh] object-contain" />
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Cari transaksi..." className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none text-sm" />
          </div>
          <div className="flex space-x-2">
             <button className="flex items-center space-x-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 bg-white">
               <Filter size={16} />
               <span>Filter</span>
             </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase tracking-widest font-bold text-slate-500">
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Deskripsi</th>
                <th className="px-6 py-4">Kategori / Sumber</th>
                <th className="px-6 py-4 text-center">Bukti</th>
                <th className="px-6 py-4 text-right">Nominal</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.slice().reverse().map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                    {new Date(t.date).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 text-sm">{t.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-600">{t.category}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-tighter">{t.source}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {t.receiptImage ? (
                      <button 
                        onClick={() => setPreviewImage(t.receiptImage!)}
                        className="p-2 text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors shadow-sm"
                        title="Lihat Bukti"
                      >
                        <FileImage size={18} />
                      </button>
                    ) : (
                      <span className="text-[8px] font-black text-slate-300 uppercase italic">Tanpa Bukti</span>
                    )}
                  </td>
                  <td className={`px-6 py-4 text-right font-black text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => deleteTransaction(t.id)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <Wallet size={48} className="text-slate-200 mb-4" />
                      <p className="text-slate-400 italic">Belum ada catatan transaksi di tahun {selectedYear}.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinanceTracker;