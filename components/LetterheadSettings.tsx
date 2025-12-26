
import React, { useState, useRef } from 'react';
import { LetterheadConfig } from '../types';
import { Save, Building, MapPin, Phone, Globe, CheckCircle, ImagePlus, Trash2, Mail } from 'lucide-react';

interface Props {
  config: LetterheadConfig;
  onSave: (config: LetterheadConfig) => void;
}

const LetterheadSettings: React.FC<Props> = ({ config, onSave }) => {
  const [formData, setFormData] = useState<LetterheadConfig>(config);
  const [showSaved, setShowSaved] = useState(false);
  const leftLogoRef = useRef<HTMLInputElement>(null);
  const rightLogoRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'left' | 'right') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData(p => side === 'left' ? { ...p, logoPemkab: result } : { ...p, logoPuskesmas: result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Pengaturan Instansi</h1>
        <p className="text-slate-500">Sesuaikan logo dan identitas resmi Puskesmas Anda untuk laporan hasil kegiatan.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 space-y-8">
          {/* Dual Logo Upload Section */}
          <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
            <div className="flex flex-col items-center text-center">
              <label className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Logo Kiri (Pemkab)</label>
              {formData.logoPemkab ? (
                <div className="relative group">
                  <img src={formData.logoPemkab} alt="Logo Kiri" className="h-20 w-auto object-contain mb-3 bg-white p-2 rounded-xl shadow-sm" />
                  <button type="button" onClick={() => setFormData(p => ({ ...p, logoPemkab: undefined }))} className="absolute -top-2 -right-2 p-1.5 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                </div>
              ) : (
                <button type="button" onClick={() => leftLogoRef.current?.click()} className="w-20 h-20 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-300 hover:text-teal-500 hover:border-teal-500 transition-all mb-3"><ImagePlus size={24} /></button>
              )}
              <input type="file" ref={leftLogoRef} onChange={(e) => handleLogoUpload(e, 'left')} accept="image/*" className="hidden" />
              <button type="button" onClick={() => leftLogoRef.current?.click()} className="text-[9px] font-black text-teal-600 uppercase">Ganti Logo Pemkab</button>
            </div>

            <div className="flex flex-col items-center text-center border-l border-slate-200">
              <label className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Logo Kanan (Puskesmas)</label>
              {formData.logoPuskesmas ? (
                <div className="relative group">
                  <img src={formData.logoPuskesmas} alt="Logo Kanan" className="h-20 w-auto object-contain mb-3 bg-white p-2 rounded-xl shadow-sm" />
                  <button type="button" onClick={() => setFormData(p => ({ ...p, logoPuskesmas: undefined }))} className="absolute -top-2 -right-2 p-1.5 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                </div>
              ) : (
                <button type="button" onClick={() => rightLogoRef.current?.click()} className="w-20 h-20 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-300 hover:text-teal-500 hover:border-teal-500 transition-all mb-3"><ImagePlus size={24} /></button>
              )}
              <input type="file" ref={rightLogoRef} onChange={(e) => handleLogoUpload(e, 'right')} accept="image/*" className="hidden" />
              <button type="button" onClick={() => rightLogoRef.current?.click()} className="text-[9px] font-black text-teal-600 uppercase">Ganti Logo Puskesmas</button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 px-1">Pemerintah</label>
                <div className="relative"><Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} /><input type="text" value={formData.govName} onChange={e => setFormData({...formData, govName: e.target.value.toUpperCase()})} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500" /></div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 px-1">Dinas</label>
                <input type="text" value={formData.deptName} onChange={e => setFormData({...formData, deptName: e.target.value.toUpperCase()})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 px-1">Nama Puskesmas</label>
              <input type="text" value={formData.puskesmasName} onChange={e => setFormData({...formData, puskesmasName: e.target.value.toUpperCase()})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-teal-700 outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 px-1">Alamat Kantor</label>
              <div className="relative"><MapPin className="absolute left-3 top-3 text-slate-300" size={18} /><textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 h-20 outline-none" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm" placeholder="Telepon" />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm" placeholder="Email" />
              </div>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm" placeholder="Website" />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-teal-600 text-white font-black rounded-2xl shadow-xl flex items-center justify-center space-x-2 active:scale-95 transition-all">
            <Save size={20} /><span>SIMPAN PERUBAHAN IDENTITAS</span>
          </button>
          
          {showSaved && <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200 font-bold text-sm flex items-center space-x-2 animate-in fade-in"><CheckCircle size={18} /><span>Berhasil diperbarui!</span></div>}
        </form>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Preview Kop Surat F4</h3>
            <div className="bg-white border border-slate-200 p-6 shadow-sm rounded-lg text-center font-serif text-black">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="w-10 h-10 border border-slate-200 rounded flex items-center justify-center text-[6px] overflow-hidden">
                  {formData.logoPemkab ? <img src={formData.logoPemkab} className="w-full h-full object-contain" /> : 'PEMKAB'}
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="text-[8px] font-bold leading-tight uppercase">{formData.govName}</p>
                  <p className="text-[8px] font-bold leading-tight uppercase">{formData.deptName}</p>
                  <p className="text-[10px] font-black leading-tight uppercase text-teal-800">{formData.puskesmasName}</p>
                  <p className="text-[6px] italic leading-tight">{formData.address}</p>
                  <p className="text-[5px] font-bold mt-1">Telp: {formData.phone} • Email: {formData.email} • Web: {formData.website}</p>
                </div>
                <div className="w-10 h-10 border border-slate-200 rounded flex items-center justify-center text-[6px] overflow-hidden">
                  {formData.logoPuskesmas ? <img src={formData.logoPuskesmas} className="w-full h-full object-contain" /> : 'PKM'}
                </div>
              </div>
              <div className="w-full border-b-[1.5px] border-black mt-1"></div>
              <div className="w-full border-b-[0.5px] border-black mt-[1px]"></div>
            </div>
            <p className="mt-6 text-[10px] text-slate-400 italic leading-relaxed">
              Pratinjau di atas menunjukkan tata letak simetris dengan Logo Pemkab di kiri dan Logo Puskesmas di kanan beserta kontak lengkap.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LetterheadSettings;
