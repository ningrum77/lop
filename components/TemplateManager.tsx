
import React, { useState, useMemo } from 'react';
import { Template } from '../types';
import { Plus, Trash2, Layout, Info, Code, X, Table as TableIcon, Columns, Rows, Eye, FileText, PenTool, Landmark } from 'lucide-react';

interface Props {
  templates: Template[];
  onAdd: (template: Template) => void;
  onDelete: (id: string) => void;
}

const TemplateManager: React.FC<Props> = ({ templates, onAdd, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTpl, setNewTpl] = useState({ name: '', body: '' });
  const [showTableHelper, setShowTableHelper] = useState(false);
  const [tableConfig, setTableConfig] = useState({ rows: 3, cols: 3 });

  const detectedVariables = useMemo(() => {
    if (!newTpl.body) return [];
    const regex = /\{\{(.*?)\}\}/g;
    const matches = Array.from(newTpl.body.matchAll(regex));
    return [...new Set(matches.map(m => m[1].trim()))];
  }, [newTpl.body]);

  const insertTable = () => {
    let tableHtml = '\n<table style="width: 100%; border-collapse: collapse; border: 1px solid black; margin: 10px 0;">\n';
    for (let r = 0; r < tableConfig.rows; r++) {
      tableHtml += '  <tr>\n';
      for (let c = 0; c < tableConfig.cols; c++) {
        const isHeader = r === 0;
        const tag = isHeader ? 'th' : 'td';
        const content = isHeader ? `Header ${c + 1}` : `{{kolom_${c+1}_baris_${r}}}`;
        const style = `border: 1px solid black; padding: 8px; text-align: left; ${isHeader ? 'background-color: #f2f2f2; font-weight: bold;' : ''}`;
        tableHtml += `    <${tag} style="${style}">${content}</${tag}>\n`;
      }
      tableHtml += '  </tr>\n';
    }
    tableHtml += '</table>\n';
    setNewTpl(p => ({ ...p, body: p.body + tableHtml }));
    setShowTableHelper(false);
  };

  const quickInsert = (tag: string) => {
    setNewTpl(p => ({ ...p, body: p.body + `\n{{${tag}}}\n` }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTpl.name || !newTpl.body) return;
    onAdd({ id: crypto.randomUUID(), name: newTpl.name, body: newTpl.body });
    setNewTpl({ name: '', body: '' });
    setIsAdding(false);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Master Desain Template</h1>
          <p className="text-slate-500 font-medium">Buat struktur laporan permanen lengkap dengan tabel dan kop dinamis.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-2xl flex items-center space-x-2 transition-all shadow-xl font-black text-sm uppercase tracking-widest"
          >
            <Plus size={20} />
            <span>BUAT TEMPLATE BARU</span>
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-200 animate-in zoom-in duration-300">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Editor Layout</h3>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600 p-2"><X size={24} /></button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <input 
              type="text" 
              value={newTpl.name}
              onChange={e => setNewTpl(p => ({ ...p, name: e.target.value }))}
              className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-teal-500 outline-none font-black text-slate-800 text-lg shadow-inner"
              placeholder="Nama Template (Contoh: Laporan Pasca Pusling)"
              required
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  <button type="button" onClick={() => quickInsert('kop_surat')} className="bg-teal-100 text-teal-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center space-x-1 border border-teal-200">
                    <Landmark size={14} /><span>+ Kop Surat (Resmi)</span>
                  </button>
                  <button type="button" onClick={() => quickInsert('kop_memo')} className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center space-x-1 border border-amber-200">
                    <FileText size={14} /><span>+ Kop Memo (Yth.)</span>
                  </button>
                  <button type="button" onClick={() => quickInsert('tanda_tangan')} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center space-x-1 border border-slate-200">
                    <PenTool size={14} /><span>+ Tanda Tangan</span>
                  </button>
                  <button type="button" onClick={() => setShowTableHelper(true)} className="bg-slate-900 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center space-x-1 hover:bg-slate-800">
                    <TableIcon size={14} /><span>+ Sisipkan Tabel</span>
                  </button>
                </div>
                
                <textarea 
                  value={newTpl.body}
                  onChange={e => setNewTpl(p => ({ ...p, body: e.target.value }))}
                  className="w-full px-6 py-5 rounded-[2.5rem] border-2 border-slate-100 focus:border-teal-500 outline-none font-mono text-[11px] text-slate-700 h-[600px] leading-relaxed shadow-inner bg-slate-50/20"
                  placeholder="Ketik teks atau gunakan tombol di atas untuk menyisipkan komponen..."
                  required
                />
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white shadow-xl">
                  <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-4">Preview Struktur</h4>
                  <div className="bg-white text-slate-800 p-6 rounded-2xl min-h-[400px] overflow-auto max-h-[500px] font-serif printable-preview text-[9px]" 
                       dangerouslySetInnerHTML={{ __html: newTpl.body
                        .replace(/\{\{kop_memo\}\}/g, '<div class="border-2 border-dashed border-amber-300 p-4 text-amber-600 font-bold mb-4">HEADER MEMO (KEPADA YTH.)</div>')
                        .replace(/\{\{kop_surat\}\}/g, '<div class="border-2 border-dashed border-teal-300 p-4 text-teal-600 font-bold mb-4">KOP SURAT RESMI (LENGKAP)</div>')
                        .replace(/\{\{tanda_tangan\}\}/g, '<div class="mt-4 border-2 border-dashed border-teal-200 p-2 text-right text-teal-500 font-bold">BLOK TANDA TANGAN</div>') || '<p class="text-slate-400 italic">Mulai mengetik...</p>' }} />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-50">
              <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-12 py-4 rounded-2xl font-black text-xs uppercase shadow-xl transition-all">
                SIMPAN MASTER TEMPLATE
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map(tpl => (
          <div key={tpl.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 group hover:shadow-xl transition-all flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-teal-50 rounded-2xl text-teal-600"><Layout size={24} /></div>
                <div><h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">{tpl.name}</h3><span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Master Template</span></div>
              </div>
              <button onClick={() => { if(confirm('Hapus template?')) onDelete(tpl.id) }} className="p-3 text-rose-300 hover:text-rose-500"><Trash2 size={20} /></button>
            </div>
            <div className="flex-1 bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-6 overflow-hidden max-h-48 opacity-60">
               <div className="text-[9px] font-serif" dangerouslySetInnerHTML={{ __html: tpl.body.slice(0, 500) + '...' }} />
            </div>
            <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 p-3 rounded-xl flex items-center justify-center">
               <Info size={14} className="mr-2 text-teal-600" /> Detail Master
            </button>
          </div>
        ))}
      </div>

      {showTableHelper && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in">
            <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-tight">Buat Tabel</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                 <div><label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Baris</label><input type="number" value={tableConfig.rows} onChange={e => setTableConfig({...tableConfig, rows: parseInt(e.target.value) || 1})} className="w-full p-3 bg-slate-50 border rounded-xl font-bold" /></div>
                 <div><label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Kolom</label><input type="number" value={tableConfig.cols} onChange={e => setTableConfig({...tableConfig, cols: parseInt(e.target.value) || 1})} className="w-full p-3 bg-slate-50 border rounded-xl font-bold" /></div>
              </div>
              <div className="flex space-x-3">
                <button onClick={() => setShowTableHelper(false)} className="flex-1 py-3 font-bold text-slate-400">Batal</button>
                <button onClick={insertTable} className="flex-1 py-3 bg-teal-600 text-white font-black rounded-xl shadow-lg">Sisipkan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .printable-preview table { width: 100%; border-collapse: collapse; }
        .printable-preview th, .printable-preview td { border: 1px solid #ddd; padding: 4px; }
      `}</style>
    </div>
  );
};

export default TemplateManager;
