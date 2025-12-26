
import React, { useState } from 'react';
import { SHSItem } from '../types';
import { Plus, Trash2, Coins, Search, Tag, Wallet, Landmark, X } from 'lucide-react';

interface Props {
  shsItems: SHSItem[];
  setShsItems: React.Dispatch<React.SetStateAction<SHSItem[]>>;
}

const CATEGORIES = ['Transport', 'Makan Minum', 'Honorarium', 'ATK/BHP', 'Lainnya'];

const SHSManager: React.FC<Props> = ({ shsItems, setShsItems }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newItem, setNewItem] = useState<Partial<SHSItem>>({
    name: '',
    category: CATEGORIES[0],
    unit: 'Org/Kali',
    price: 0
  });

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return;

    const item: SHSItem = {
      id: crypto.randomUUID(),
      name: newItem.name as string,
      category: newItem.category as string,
      unit: newItem.unit as string,
      price: newItem.price as number
    };

    setShsItems(prev => [...prev, item]);
    setIsAdding(false);
    setNewItem({ name: '', category: CATEGORIES[0], unit: 'Org/Kali', price: 0 });
  };

  const deleteItem = (id: string) => {
    if (confirm('Hapus item harga standar ini?')) {
      setShsItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const filteredItems = shsItems.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center space-x-4">
            <div className="bg-amber-500 p-3 rounded-2xl text-white shadow-lg"><Coins size={24} /></div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">Master Harga (SHS)</h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Standar Harga Satuan untuk Biaya Lapangan</p>
            </div>
          </div>
          <div className="flex space-x-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                placeholder="Cari item SHS..." 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-bold"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-teal-600 text-white px-6 py-3 rounded-xl font-black shadow-lg hover:bg-teal-700 active:scale-95 transition-all"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800">Tambah Item Harga</h3>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
              </div>
              <form onSubmit={addItem} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block px-1 tracking-widest">Kategori</label>
                  <select 
                    value={newItem.category}
                    onChange={e => setNewItem({...newItem, category: e.target.value})}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block px-1 tracking-widest">Nama Item / Keterangan</label>
                  <input 
                    placeholder="Contoh: Transport Petugas Lokal"
                    value={newItem.name}
                    onChange={e => setNewItem({...newItem, name: e.target.value})}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block px-1 tracking-widest">Satuan</label>
                    <input 
                      placeholder="Org/Kali"
                      value={newItem.unit}
                      onChange={e => setNewItem({...newItem, unit: e.target.value})}
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block px-1 tracking-widest">Harga Satuan (Rp)</label>
                    <input 
                      type="number"
                      placeholder="0"
                      value={newItem.price || ''}
                      onChange={e => setNewItem({...newItem, price: parseInt(e.target.value) || 0})}
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none"
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-teal-600 text-white font-black rounded-2xl shadow-lg hover:bg-teal-700">SIMPAN MASTER HARGA</button>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 hover:shadow-xl transition-all group relative">
            <button 
              onClick={() => deleteItem(item.id)}
              className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={16} />
            </button>
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-slate-50 rounded-xl text-amber-500"><Tag size={20} /></div>
              <div>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 px-2 py-0.5 bg-slate-100 rounded-full">{item.category}</span>
                <h4 className="font-black text-slate-800 uppercase tracking-tight text-sm mt-1">{item.name}</h4>
              </div>
            </div>
            <div className="flex justify-between items-end border-t border-slate-50 pt-4">
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Harga Standar</p>
                <p className="text-lg font-black text-slate-900">Rp {item.price.toLocaleString('id-ID')}</p>
              </div>
              <p className="text-[10px] font-bold text-slate-400">{item.unit}</p>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
             <Landmark size={48} className="mx-auto text-slate-200 mb-4" />
             <p className="text-slate-400 font-bold">Belum ada item harga dalam Master SHS.</p>
             <button onClick={() => setIsAdding(true)} className="mt-4 text-teal-600 font-black text-xs uppercase hover:underline">Tambah Sekarang</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SHSManager;
