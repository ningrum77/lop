
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ActivityReport, Template, Expense, ScheduleEvent, ActivityType, RPKGoal, SHSItem } from '../types';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Landmark, 
  UsersRound, 
  X, 
  ImagePlus, 
  Sparkles, 
  Calculator, 
  Coins,
  ArrowDownToLine,
  FileText,
  Layout,
  Type,
  Camera,
  FileImage,
  // Added Eye icon to the import list from lucide-react
  Eye
} from 'lucide-react';
import { generateReportContent } from '../services/geminiService';

interface Props {
  templates: Template[];
  reports?: ActivityReport[];
  schedules: ScheduleEvent[];
  activityTypes: ActivityType[];
  rpkGoals?: RPKGoal[];
  shsMaster: SHSItem[];
  onSave: (report: ActivityReport) => void;
}

const ReportEditor: React.FC<Props> = ({ templates, reports = [], schedules, activityTypes, rpkGoals = [], shsMaster, onSave }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const expenseFileRef = useRef<HTMLInputElement>(null);
  const [activeExpenseId, setActiveExpenseId] = useState<string | null>(null);
  const isEditing = !!id;

  const [activeTab, setActiveTab] = useState<'content' | 'staff' | 'budget' | 'docs'>('content');
  const [isSaving, setIsSaving] = useState(false);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [showSHSPicker, setShowSHSPicker] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [formData, setFormData] = useState<ActivityReport>(() => {
    if (isEditing) {
      const existing = reports.find(r => r.id === id);
      if (existing) {
        return { 
          ...existing, 
          images: existing.images || [], 
          content: existing.content || {},
          expenses: existing.expenses || [],
          staffNames: existing.staffNames || []
        };
      }
    }
    return {
      id: crypto.randomUUID(),
      title: '',
      date: new Date().toISOString().split('T')[0],
      location: '',
      templateId: templates[0]?.id || '',
      content: {},
      totalBudget: 0,
      expenses: [],
      staffNames: [],
      status: 'draft',
      images: [],
      sptNumber: '',
      sptDate: '',
      activityId: ''
    };
  });

  const selectedTemplate = useMemo(() => 
    templates.find(t => t.id === formData.templateId) || templates[0], 
  [formData.templateId, templates]);

  const budgetInfo = useMemo(() => {
    if (!formData.activityId || !formData.date) return null;
    const monthStr = formData.date.slice(0, 7);
    const goal = rpkGoals.find(g => g.activityTypeId === formData.activityId && g.month === monthStr);
    
    if (!goal) return null;

    const totalSpentInOtherReports = reports
      .filter(r => r.id !== formData.id && r.activityId === formData.activityId && r.date.slice(0, 7) === monthStr && r.status === 'submitted')
      .reduce((sum, r) => sum + r.expenses.reduce((s, e) => s + e.amount, 0), 0);

    const currentReportSpent = formData.expenses.reduce((s, e) => s + e.amount, 0);
    const totalSpent = totalSpentInOtherReports + currentReportSpent;
    const remaining = goal.plannedBudget - totalSpent;

    return {
      plafon: goal.plannedBudget,
      spent: totalSpent,
      remaining: remaining,
      overBudget: remaining < 0
    };
  }, [formData.activityId, formData.date, formData.expenses, rpkGoals, reports, formData.id]);

  const handleAIEnhance = async (variable: string) => {
    const currentText = formData.content[variable] || "";
    const context = `Laporan kegiatan ${formData.title} di ${formData.location} tanggal ${formData.date}`;
    const enhanced = await generateReportContent(variable, currentText, context);
    if (enhanced) {
      setFormData(prev => ({
        ...prev,
        content: { ...prev.content, [variable]: enhanced }
      }));
    }
  };

  const importFromSchedule = (schedule: ScheduleEvent) => {
    const actType = activityTypes.find(a => a.id === schedule.activityId);
    const transportSHS = shsMaster.find(i => i.category.toLowerCase().includes('transport')) || shsMaster[0];
    
    // Auto-detect template based on activity name
    let targetTemplateId = formData.templateId;
    if (actType) {
      const matchingTemplate = templates.find(t => 
        t.name.toLowerCase().includes(actType.name.toLowerCase()) || 
        actType.name.toLowerCase().includes(t.name.toLowerCase())
      );
      if (matchingTemplate) {
        targetTemplateId = matchingTemplate.id;
      }
    }

    const autoExpense: Expense = {
      id: crypto.randomUUID(),
      description: `Transport Petugas: ${actType?.name || 'Kegiatan'}`,
      quantity: schedule.staffNames.length,
      unit: transportSHS?.unit || 'Org/Kali',
      unitPrice: transportSHS?.price || 0,
      amount: (schedule.staffNames.length) * (transportSHS?.price || 0),
      category: 'Transport',
      date: schedule.date,
      shsItemId: transportSHS?.id
    };

    const formattedSptDate = schedule.sptDate ? new Date(schedule.sptDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    const formattedDate = new Date(schedule.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    setFormData(prev => ({
      ...prev,
      title: `Laporan Hasil ${actType?.name || ''} - ${schedule.location}`,
      date: schedule.date,
      location: schedule.location,
      activityId: schedule.activityId,
      staffNames: schedule.staffNames,
      sptNumber: schedule.sptNumber || '',
      sptDate: schedule.sptDate || '',
      templateId: targetTemplateId, 
      content: {
        ...prev.content,
        nomor_spt: schedule.sptNumber || '',
        tanggal_spt: formattedSptDate,
        tanggal_kegiatan: formattedDate,
        lokasi_kegiatan: schedule.location
      },
      expenses: [...prev.expenses, autoExpense]
    }));

    setShowSchedulePicker(false);
  };

  const addExpense = () => {
    const newExpense: Expense = { 
      id: crypto.randomUUID(), 
      description: '', 
      quantity: 1, 
      unit: 'Kali', 
      unitPrice: 0,
      amount: 0, 
      category: 'Operasional', 
      date: formData.date 
    };
    setFormData(prev => ({ ...prev, expenses: [...prev.expenses, newExpense] }));
  };

  const updateExpense = (id: string, field: keyof Expense, value: any) => {
    setFormData(prev => ({ 
      ...prev, 
      expenses: prev.expenses.map(e => {
        if (e.id === id) {
          const updated = { ...e, [field]: value };
          updated.amount = updated.quantity * updated.unitPrice;
          return updated;
        }
        return e;
      }) 
    }));
  };

  const handleExpenseReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeExpenseId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateExpense(activeExpenseId, 'receiptImage', reader.result as string);
        setActiveExpenseId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const applySHS = (expenseId: string, shs: SHSItem) => {
    setFormData(prev => ({
      ...prev,
      expenses: prev.expenses.map(e => {
        if (e.id === expenseId) {
          const updated = { 
            ...e, 
            description: shs.name, 
            unit: shs.unit, 
            unitPrice: shs.price, 
            category: shs.category,
            shsItemId: shs.id 
          };
          updated.amount = updated.quantity * updated.unitPrice;
          return updated;
        }
        return e;
      })
    }));
    setShowSHSPicker(null);
  };

  const handleSave = () => {
    if (!formData.title.trim()) return alert('Judul wajib diisi!');
    if (budgetInfo?.overBudget && !confirm('Pengeluaran melebihi plafon tahunan. Tetap simpan?')) return;
    
    setIsSaving(true);
    setTimeout(() => {
      onSave({ ...formData, status: 'submitted' });
      navigate('/reports');
    }, 500);
  };

  const renderDocumentEditor = () => {
    if (!selectedTemplate) return null;
    
    const parts = selectedTemplate.body.split(/(\{\{.*?\}\})/g);
    
    return (
      <div className="report-preview-container font-serif text-slate-800 leading-relaxed text-sm whitespace-pre-wrap">
        <style>{`
          .report-preview-container p {
            text-indent: 40px;
            text-align: justify;
            margin-bottom: 12px;
          }
        `}</style>
        {parts.map((part, index) => {
          if (part.startsWith('{{') && part.endsWith('}}')) {
            const varName = part.slice(2, -2).trim();
            
            if (['kop_memo', 'kop_surat', 'tanda_tangan', 'tabel_biaya', 'tabel_petugas'].includes(varName)) {
              return (
                <div key={index} className="my-4 p-4 border-2 border-dashed border-teal-100 rounded-xl bg-teal-50/30 text-center font-sans">
                  <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Komponen Otomatis: {varName.replace(/_/g, ' ')}</span>
                </div>
              );
            }
            
            return (
              <span key={index} className="relative inline-block group align-top" style={{ minWidth: '120px' }}>
                <textarea
                  value={formData.content[varName] || ''}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      content: { ...prev.content, [varName]: e.target.value }
                    }));
                    e.target.style.height = 'inherit';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  onFocus={(e) => {
                    e.target.style.height = 'inherit';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  placeholder={`[Isi ${varName.replace(/_/g, ' ')}]`}
                  className="w-full bg-amber-50/50 border-b-2 border-amber-200 focus:border-teal-500 outline-none px-1 pt-1 font-bold text-slate-900 transition-all resize-none min-h-[1.5em] overflow-hidden rounded-t-lg"
                  rows={1}
                />
                <button 
                  onClick={() => handleAIEnhance(varName)}
                  className="absolute -top-6 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-teal-600 text-white p-1 rounded-md shadow-lg z-10"
                  title="Perbaiki dengan AI"
                >
                  <Sparkles size={12} />
                </button>
              </span>
            );
          }
          
          return (
            <span 
              key={index} 
              dangerouslySetInnerHTML={{ __html: part }} 
              className="inline"
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/reports')} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl transition-all"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">{isEditing ? 'Edit Laporan' : 'Input Hasil Kegiatan'}</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Dokumentasi & Pertanggungjawaban Biaya</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {!isEditing && (
            <button 
              onClick={() => setShowSchedulePicker(true)}
              className="bg-amber-100 text-amber-700 px-6 py-3 rounded-2xl flex items-center space-x-2 font-black text-xs shadow-sm hover:bg-amber-200 transition-all"
            >
              <ArrowDownToLine size={18} />
              <span>TARIK DARI JADWAL</span>
            </button>
          )}
          <button onClick={handleSave} disabled={isSaving} className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-2xl flex items-center justify-center space-x-2 font-black shadow-lg">
            {isSaving ? 'Menyimpan...' : <><Save size={18} /><span>SUBMIT</span></>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex bg-slate-50/50 p-2 border-b border-slate-100 overflow-x-auto">
              {[
                {id: 'content', label: 'Narasi Laporan'},
                {id: 'staff', label: 'Petugas'},
                {id: 'budget', label: 'Rincian Biaya'},
                {id: 'docs', label: 'Dokumentasi Foto'}
              ].map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`flex-1 py-4 px-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === t.id ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-400'}`}>
                   {t.label}
                </button>
              ))}
            </div>

            <div className="p-8">
              {activeTab === 'content' && (
                <div className="space-y-8 animate-in fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block px-1 tracking-widest">Judul Laporan</label>
                       <input className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-700 focus:border-teal-500 outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Misal: Laporan Pusling Desa Kupu" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block px-1 tracking-widest">Lokasi</label>
                       <input className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block px-1 tracking-widest">Tanggal</label>
                       <input type="date" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                    </div>
                  </div>

                  <div className="border-t-2 border-slate-50 pt-8 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <FileText size={18} className="text-teal-600" />
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Dokumen Laporan (F4)</h3>
                      </div>
                      <select className="text-[10px] font-black bg-slate-100 border-none rounded-lg p-2 uppercase outline-none" value={formData.templateId} onChange={e => setFormData({...formData, templateId: e.target.value})}>
                        {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>

                    <div className="bg-slate-50 p-1 rounded-[2.5rem] border border-slate-200">
                      <div className="bg-white m-4 p-8 md:p-12 shadow-inner rounded-[2rem] min-h-[750px] border border-slate-100 relative overflow-hidden">
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/p6.png')]"></div>
                        
                        <div className="relative z-10">
                          {renderDocumentEditor()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'staff' && (
                <div className="space-y-6 animate-in fade-in">
                   <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center"><UsersRound size={18} className="mr-2 text-teal-600" /> Petugas Pelaksana</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.staffNames.map((name, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-700">{idx + 1}. {name}</span>
                        <button onClick={() => setFormData(p => ({...p, staffNames: p.staffNames.filter((_, i) => i !== idx)}))} className="text-rose-300 hover:text-rose-500"><X size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'budget' && (
                <div className="space-y-6 animate-in fade-in">
                   <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center"><Calculator size={18} className="mr-2 text-teal-600" /> Rincian Biaya</h3>
                    <button onClick={addExpense} className="flex items-center space-x-2 text-[10px] bg-teal-50 text-teal-700 px-4 py-2 rounded-xl font-black uppercase"><Plus size={16} /><span>Baris Baru</span></button>
                  </div>
                  <div className="space-y-4">
                    {formData.expenses.map((exp) => (
                      <div key={exp.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200 space-y-4 relative group">
                        <button onClick={() => setFormData(p => ({...p, expenses: p.expenses.filter(e => e.id !== exp.id)}))} className="absolute top-4 right-4 text-rose-300 hover:text-rose-500"><X size={18} /></button>
                        <div className="grid grid-cols-12 gap-4">
                           <div className="col-span-12 md:col-span-8">
                              <label className="text-[9px] font-black uppercase text-slate-400 mb-1 block px-1">Keterangan / Komponen</label>
                              <div className="flex space-x-2">
                                <input className="flex-1 p-3 bg-white border border-slate-100 rounded-xl text-sm font-bold" value={exp.description} onChange={e => updateExpense(exp.id, 'description', e.target.value)} />
                                <button onClick={() => setShowSHSPicker(exp.id)} className="p-3 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-all"><Coins size={18}/></button>
                              </div>
                           </div>
                           <div className="col-span-6 md:col-span-2">
                              <label className="text-[9px] font-black uppercase text-slate-400 mb-1 block px-1">Vol</label>
                              <input type="number" className="w-full p-3 bg-white border border-slate-100 rounded-xl text-sm font-bold text-center" value={exp.quantity} onChange={e => updateExpense(exp.id, 'quantity', parseInt(e.target.value) || 0)} />
                           </div>
                           <div className="col-span-6 md:col-span-2">
                              <label className="text-[9px] font-black uppercase text-slate-400 mb-1 block px-1">Satuan</label>
                              <input className="w-full p-3 bg-white border border-slate-100 rounded-xl text-sm font-bold text-center" value={exp.unit} onChange={e => updateExpense(exp.id, 'unit', e.target.value)} />
                           </div>
                           <div className="col-span-12 md:col-span-5">
                              <label className="text-[9px] font-black uppercase text-slate-400 mb-1 block px-1">Harga Satuan</label>
                              <input type="number" className="w-full p-3 bg-white border border-slate-100 rounded-xl text-sm font-bold" value={exp.unitPrice} onChange={e => updateExpense(exp.id, 'unitPrice', parseInt(e.target.value) || 0)} />
                           </div>
                           <div className="col-span-6 md:col-span-4 bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                              <span className="text-[9px] font-black uppercase text-slate-400">Total:</span>
                              <span className="text-sm font-black text-teal-700">Rp {exp.amount.toLocaleString('id-ID')}</span>
                           </div>
                           <div className="col-span-6 md:col-span-3 flex items-center space-x-2">
                              {exp.receiptImage ? (
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-teal-200 group/img">
                                  <img src={exp.receiptImage} className="w-full h-full object-cover" />
                                  <button 
                                    onClick={() => setPreviewImage(exp.receiptImage!)}
                                    className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                                  >
                                    <Eye size={12} />
                                  </button>
                                  <button 
                                    onClick={() => updateExpense(exp.id, 'receiptImage', undefined)}
                                    className="absolute -top-1 -right-1 bg-rose-500 text-white p-0.5 rounded-full"
                                  >
                                    <X size={8} />
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => {
                                    setActiveExpenseId(exp.id);
                                    expenseFileRef.current?.click();
                                  }}
                                  className="w-12 h-12 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 hover:text-teal-600 hover:border-teal-300 transition-all"
                                  title="Upload Bukti Nota"
                                >
                                  <Camera size={16} />
                                  <span className="text-[6px] font-black uppercase mt-1">BUKTI</span>
                                </button>
                              )}
                           </div>
                        </div>
                      </div>
                    ))}
                    <input type="file" ref={expenseFileRef} className="hidden" accept="image/*" onChange={handleExpenseReceiptUpload} />
                  </div>
                </div>
              )}

              {activeTab === 'docs' && (
                <div className="space-y-6 animate-in fade-in">
                   <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center"><ImagePlus size={18} className="mr-2 text-teal-600" /> Foto Dokumentasi</h3>
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center space-x-2 text-[10px] bg-teal-50 text-teal-700 px-4 py-2 rounded-xl font-black uppercase"><Plus size={16} /><span>Upload Foto</span></button>
                    <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={(e) => {
                      const files = Array.from(e.target.files || []) as File[];
                      files.forEach(file => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData(prev => ({ ...prev, images: [...(prev.images || []), reader.result as string] }));
                        };
                        reader.readAsDataURL(file);
                      });
                    }} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images?.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-200">
                        <img src={img} className="w-full h-full object-cover" />
                        <button onClick={() => setFormData(p => ({...p, images: p.images?.filter((_, i) => i !== idx)}))} className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full"><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center"><Layout size={16} className="mr-2 text-teal-600" /> Mode Editor</h3>
             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-700 uppercase mb-2">Paper Mode F4 Aktif</p>
                <p className="text-xs font-bold text-teal-700 leading-relaxed">Ketik langsung di dalam dokumen untuk mengisi data laporan.</p>
             </div>
             <p className="mt-4 text-[10px] text-slate-400 italic leading-relaxed font-medium">
               Garis bawah berwarna oranye menunjukkan area yang harus diisi. Tiap paragraph akan menjorok ke kanan otomatis.
             </p>
           </div>
           
           {budgetInfo && (
            <div className={`p-8 rounded-[2.5rem] border-2 shadow-sm ${budgetInfo.overBudget ? 'bg-rose-50 border-rose-100 animate-pulse' : 'bg-white border-slate-200'}`}>
               <h3 className={`text-[10px] font-black uppercase mb-4 tracking-widest flex items-center ${budgetInfo.overBudget ? 'text-rose-600' : 'text-slate-400'}`}>
                 <Landmark size={16} className="mr-2" /> Monitoring Plafon
               </h3>
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase">
                    <span>Plafon Bulanan</span>
                    <span className="text-slate-800">Rp {budgetInfo.plafon.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase">
                    <span>Terpakai (YTD)</span>
                    <span className="text-rose-500">Rp {budgetInfo.spent.toLocaleString('id-ID')}</span>
                  </div>
                  <div className={`mt-4 p-5 rounded-2xl text-center shadow-inner ${budgetInfo.overBudget ? 'bg-rose-100 border border-rose-200' : 'bg-slate-900 text-white'}`}>
                    <p className="text-[8px] font-black uppercase opacity-60 mb-1 tracking-widest">Sisa Saldo</p>
                    <p className={`text-xl font-black ${budgetInfo.overBudget ? 'text-rose-700' : 'text-emerald-400'}`}>Rp {budgetInfo.remaining.toLocaleString('id-ID')}</p>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

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

      {showSchedulePicker && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800">Pilih Jadwal Kegiatan</h3>
                <button onClick={() => setShowSchedulePicker(false)} className="p-2"><X size={24}/></button>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {schedules.slice().reverse().map(s => {
                   const act = activityTypes.find(a => a.id === s.activityId);
                   return (
                    <button key={s.id} onClick={() => importFromSchedule(s)} className="w-full p-6 bg-slate-50 hover:bg-teal-50 border border-slate-100 hover:border-teal-200 rounded-3xl text-left transition-all">
                      <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs" style={{ backgroundColor: act?.color }}>{act?.code}</div>
                          <div>
                            <p className="text-xs font-black text-slate-700 uppercase">{act?.name}</p>
                            <p className="text-[10px] font-bold text-slate-400">{s.location} • {new Date(s.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}</p>
                          </div>
                        </div>
                    </button>
                   );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {showSHSPicker && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-slate-800 uppercase tracking-tight">Master Harga SHS</h3>
                <button onClick={() => setShowSHSPicker(null)} className="p-2 text-slate-400"><X size={20}/></button>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                 {shsMaster.map(item => (
                   <button key={item.id} onClick={() => applySHS(showSHSPicker, item)} className="w-full p-4 bg-slate-50 hover:bg-teal-50 border border-slate-100 hover:border-teal-200 rounded-2xl text-left transition-all">
                     <p className="text-xs font-black text-slate-700 uppercase">{item.name}</p>
                     <div className="flex justify-between items-center mt-1">
                       <p className="text-[10px] font-bold text-teal-600">Rp {item.price.toLocaleString('id-ID')}</p>
                       <p className="text-[8px] font-black text-slate-400 uppercase">{item.unit}</p>
                     </div>
                   </button>
                 ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportEditor;
