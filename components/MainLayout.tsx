import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Transaction, ScheduleEvent, Staff, ActivityReport, Template, ActivityType, LetterheadConfig, Holiday, RPKGoal, SHSItem } from '../types';
import Dashboard from './Dashboard';
import FinanceTracker from './FinanceTracker';
import ScheduleManager from './ScheduleManager';
import ReportList from './ReportList';
import ReportEditor from './ReportEditor';
import TemplateManager from './TemplateManager';
import StaffManager from './StaffManager';
import PrintableReport from './PrintableReport';
import LetterheadSettings from './LetterheadSettings';
import RPKManager from './RPKManager';
import SHSManager from './SHSManager';
import ChangePassword from './ChangePassword';
import Login from './Login';
import { 
  LayoutDashboard, Wallet, CalendarDays, Users, Hospital, FileText, Settings, Tags, Menu, X, Building2, Target, UsersRound, Banknote, Coins, LogOut, KeyRound, LogIn
} from 'lucide-react';

const AVAILABLE_YEARS = [2026, 2027, 2028, 2029];

// Gabungkan semua props menjadi satu interface
interface MainLayoutProps {
  userRole: 'admin' | 'tamu';
  onSetRole: (role: 'admin' | 'tamu') => void;
  transactions: Transaction[]; setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  schedules: ScheduleEvent[]; setSchedules: React.Dispatch<React.SetStateAction<ScheduleEvent[]>>;
  reports: ActivityReport[]; setReports: React.Dispatch<React.SetStateAction<ActivityReport[]>>;
  templates: Template[]; setTemplates: React.Dispatch<React.SetStateAction<Template[]>>;
  staff: Staff[]; setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
  activityTypes: ActivityType[]; setActivityTypes: React.Dispatch<React.SetStateAction<ActivityType[]>>;
  letterhead: LetterheadConfig; setLetterhead: React.Dispatch<React.SetStateAction<LetterheadConfig>>;
  holidays: Holiday[]; setHolidays: React.Dispatch<React.SetStateAction<Holiday[]>>;
  rpkGoals: RPKGoal[]; setRpkGoals: React.Dispatch<React.SetStateAction<RPKGoal[]>>;
  shsMaster: SHSItem[]; setShsMaster: React.Dispatch<React.SetStateAction<SHSItem[]>>;
}

const MainLayout: React.FC<MainLayoutProps> = (props) => {
  const { userRole, onSetRole, letterhead, ...appData } = props;
  
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onSetRole('tamu');
    navigate('/schedule');
  }

  const handleLoginSuccess = () => {
    onSetRole('admin');
    setIsLoginModalOpen(false);
  }

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Tentukan link sidebar berdasarkan peran
  const guestLinks = [
    { to: "/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { to: "/rpk", icon: <Target size={20} />, label: "Plafon Tahunan" },
    { to: "/schedule", icon: <CalendarDays size={20} />, label: "Jadwal Petugas" },
    { to: "/reports", icon: <FileText size={20} />, label: "Hasil Kegiatan" },
  ];

  const adminLinks = [
    { to: "/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard", section: "Umum" },
    { to: "/rpk", icon: <Target size={20} />, label: "Plafon Tahunan", section: "Administrasi RPK" },
    { to: "/shs", icon: <Coins size={20} />, label: "Master Harga (SHS)", section: "Administrasi RPK" },
    { to: "/schedule", icon: <CalendarDays size={20} />, label: "Jadwal Petugas", section: "Kegiatan & Jadwal" },
    { to: "/reports", icon: <FileText size={20} />, label: "Hasil Kegiatan", section: "Kegiatan & Jadwal" },
    { to: "/staff", icon: <Users size={20} />, label: "Kelola Pegawai", section: "Master Data" },
    { to: "/activities", icon: <Tags size={20} />, label: "Kode Kegiatan", section: "Master Data" },
    { to: "/templates", icon: <Settings size={20} />, label: "Template Laporan", section: "Master Data" },
    { to: "/finance", icon: <Wallet size={20} />, label: "Buku Kas Umum", section: "Keuangan & Sistem" },
    { to: "/settings", icon: <Building2 size={20} />, label: "Instansi (Kop Surat)", section: "Keuangan & Sistem" },
    { to: "/change-password", icon: <KeyRound size={20} />, label: "Ganti Password", section: "Keuangan & Sistem" },
  ];
  
  const links = userRole === 'admin' ? adminLinks : guestLinks;

  return (
    <>
      <div className="min-h-screen flex bg-slate-50 font-sans relative print:bg-white">
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[1150] md:hidden transition-opacity duration-300"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
        )}

        <aside className={`
          fixed md:sticky top-0 h-screen w-64 bg-teal-900 text-white flex flex-col shadow-2xl z-[1200] transition-transform duration-300 ease-in-out print:hidden
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-6 flex items-center justify-between border-b border-teal-800/50">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-xl text-teal-900 shadow-inner"><Hospital size={24} /></div>
              <div><h1 className="text-xl font-bold tracking-tight">BOK Puskesmas Kupu</h1></div>
            </div>
            <button onClick={closeMobileMenu} className="md:hidden p-2 hover:bg-teal-800 rounded-lg"><X size={20} /></button>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-hide">
            {userRole === 'admin' ? (
              ['Umum', 'Administrasi RPK', 'Kegiatan & Jadwal', 'Master Data', 'Keuangan & Sistem'].map(section => (
                <div key={section}>
                  {section !== 'Umum' && <div className="text-[10px] font-bold text-teal-500 uppercase px-4 mt-6 mb-2">{section}</div>}
                  {links.filter(l => (l as any).section === section).map(link => (
                    <SidebarLink key={link.to} to={link.to} icon={link.icon} label={link.label} onClick={closeMobileMenu} />
                  ))}
                </div>
              ))
            ) : (
              links.map(link => (
                  <SidebarLink key={link.to} to={link.to} icon={link.icon} label={link.label} onClick={closeMobileMenu} />
              ))
            )}
          </nav>

          {userRole === 'admin' && (
            <div className="p-4 border-t border-teal-800/50">
              <button onClick={handleLogout} className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-rose-300 hover:bg-rose-900/50 hover:text-white transition-all">
                <LogOut size={20} />
                <span className="font-semibold text-sm">Logout</span>
              </button>
            </div>
          )}
        </aside>

        <main className="flex-1 min-w-0 relative print:overflow-visible">
          <header className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-[1100] shadow-sm print:hidden">
            <div className="flex items-center space-x-4">
              <button onClick={toggleMobileMenu} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"><Menu size={24} /></button>
              <h2 className="text-slate-700 font-black text-sm md:text-lg truncate tracking-tight uppercase">{letterhead.puskesmasName}</h2>
            </div>
            <div className="flex items-center space-x-4">
              {userRole === 'tamu' ? (
                <button onClick={() => setIsLoginModalOpen(true)} className="flex items-center space-x-2 bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg hover:bg-slate-900 transition-all">
                  <LogIn size={16} />
                  <span>Login Admin</span>
                </button>
              ) : (
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-teal-100 text-teal-700">Admin</span>
              )}
              <div className="flex items-center space-x-2 bg-slate-100 px-1 py-1 rounded-full text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest border border-slate-200">
                <span className="hidden sm:inline pl-2">Tahun Anggaran</span>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="bg-white font-black text-teal-700 border-none rounded-full py-1 text-center outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {AVAILABLE_YEARS.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>
            </div>
          </header>

          <div className="p-4 md:p-8 pt-20 md:pt-24 print:p-0">
            <Routes>
              {/* Rute Publik */}
              <Route path="/" element={<Navigate to="/schedule" replace />} />
              <Route path="/dashboard" element={<Dashboard {...appData} selectedYear={selectedYear} setSelectedYear={setSelectedYear} userRole={userRole} />} />
              <Route path="/schedule" element={<ScheduleManager {...appData} selectedYear={selectedYear} userRole={userRole}/>} />
              <Route path="/reports" element={<ReportList reports={appData.reports} onDelete={(id) => appData.setReports(prev => prev.filter(r => r.id !== id))} selectedYear={selectedYear} userRole={userRole}/>} />
              <Route path="/rpk" element={<RPKManager {...appData} selectedYear={selectedYear} setSelectedYear={setSelectedYear} userRole={userRole}/>} />
              <Route path="/reports/new" element={<ReportEditor templates={appData.templates} schedules={appData.schedules} activityTypes={appData.activityTypes} rpkGoals={appData.rpkGoals} shsMaster={appData.shsMaster} onSave={(r) => appData.setReports(prev => [r, ...prev])} />} />
              <Route path="/reports/edit/:id" element={<ReportEditor reports={appData.reports} templates={appData.templates} schedules={appData.schedules} activityTypes={appData.activityTypes} rpkGoals={appData.rpkGoals} shsMaster={appData.shsMaster} onSave={(u) => appData.setReports(prev => prev.map(r => r.id === u.id ? u : r))} />} />
              {/* FIX: Use `letterhead` from props, not from `appData`. */}
              <Route path="/reports/print/:id" element={<PrintableReport reports={appData.reports} templates={appData.templates} letterhead={letterhead} />} />

              {/* Rute Khusus Admin */}
              {userRole === 'admin' && (
                <>
                  <Route path="/finance" element={<FinanceTracker transactions={appData.transactions} setTransactions={appData.setTransactions} selectedYear={selectedYear} />} />
                  <Route path="/staff" element={<StaffManager staff={appData.staff} setStaff={appData.setStaff} />} />
                  <Route path="/activities" element={<ActivityTypeManager activityTypes={appData.activityTypes} setActivityTypes={appData.setActivityTypes} />} />
                  <Route path="/templates" element={<TemplateManager templates={appData.templates} onAdd={(t) => appData.setTemplates(prev => [...prev, t])} onDelete={(id) => appData.setTemplates(prev => prev.filter(t => t.id !== id))} />} />
                  {/* FIX: Use `letterhead` from props for the config, not from `appData`. */}
                  <Route path="/settings" element={<LetterheadSettings config={letterhead} onSave={appData.setLetterhead} />} />
                  <Route path="/shs" element={<SHSManager shsItems={appData.shsMaster} setShsItems={appData.setShsMaster} />} />
                  <Route path="/change-password" element={<ChangePassword />} />
                </>
              )}
            </Routes>
          </div>
        </main>
      </div>
      {isLoginModalOpen && (
        <Login onLoginSuccess={handleLoginSuccess} onClose={() => setIsLoginModalOpen(false)} />
      )}
    </>
  );
};

const SidebarLink: React.FC<{ to: string, icon: React.ReactNode, label: string, onClick?: () => void }> = ({ to, icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link to={to} onClick={onClick} className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-teal-600 text-white shadow-lg' : 'text-teal-300 hover:bg-teal-800 hover:text-white'}`}>
      <span>{icon}</span><span className="font-semibold text-sm">{label}</span>
    </Link>
  );
};

const ActivityTypeManager: React.FC<{ activityTypes: ActivityType[], setActivityTypes: any }> = ({ activityTypes, setActivityTypes }) => {
  const [newAct, setNewAct] = useState({ code: '', name: '', color: '#0d9488', requiredStaffCount: 1 });
  return (
    <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-200">
      <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-6 uppercase tracking-tight">Master Kode Kegiatan</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Tambah Kegiatan</h3>
          <div className="grid grid-cols-2 gap-3">
             <input placeholder="Kode (Misal: P)" className="p-3 bg-slate-50 border rounded-xl text-sm font-bold" value={newAct.code} onChange={e => setNewAct({...newAct, code: e.target.value.toUpperCase()})} />
             <input type="color" className="w-full h-full min-h-[48px] p-1 bg-white border rounded-xl" value={newAct.color} onChange={e => setNewAct({...newAct, color: e.target.value})} />
          </div>
          <input placeholder="Nama Kegiatan (Misal: Pusling)" className="w-full p-3 bg-slate-50 border rounded-xl text-sm font-bold" value={newAct.name} onChange={e => setNewAct({...newAct, name: e.target.value})} />
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Jumlah Petugas Yang Dibutuhkan</label>
            <input type="number" min="1" className="w-full p-3 bg-slate-50 border rounded-xl text-sm font-bold" value={newAct.requiredStaffCount} onChange={e => setNewAct({...newAct, requiredStaffCount: parseInt(e.target.value) || 1})} />
          </div>
          <button onClick={() => { if(newAct.code && newAct.name) { setActivityTypes([...activityTypes, {...newAct, id: crypto.randomUUID()}]); setNewAct({code:'', name:'', color:'#0d9488', requiredStaffCount: 1}); } }} className="w-full py-3 bg-teal-600 text-white font-black rounded-xl shadow-lg uppercase tracking-widest text-xs active:scale-95 transition-all">Tambah Ke Master</button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {activityTypes.map(act => (
            <div key={act.id} className="p-4 rounded-2xl border border-slate-100 flex items-center justify-between group relative bg-slate-50/50">
               <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-black" style={{ backgroundColor: act.color }}>{act.code}</div>
                 <div>
                   <p className="font-bold text-slate-700 text-sm">{act.name}</p>
                   <p className="text-[10px] text-teal-600 font-black flex items-center uppercase"><UsersRound size={12} className="mr-1" /> {act.requiredStaffCount} Petugas</p>
                 </div>
               </div>
               <button onClick={() => setActivityTypes(activityTypes.filter(a => a.id !== act.id))} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors">
                 <X size={14} />
               </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;