
import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { Transaction, ScheduleEvent, Staff, ActivityReport, Template, ActivityType, LetterheadConfig, Holiday, RPKGoal, SHSItem } from './types';
import MainLayout from './components/MainLayout';

// Data default tetap di sini sebagai sumber data awal jika localStorage kosong
const DEFAULT_TEMPLATES: Template[] = [
  { 
    id: 'tpl-1', 
    name: 'Template Laporan Perjalanan Dinas (Memo)', 
    body: `{{kop_memo}}

<p style="text-align: center; font-weight: bold; font-size: 14px; margin-bottom: 20px;">LAPORAN HASIL KEGIATAN</p>

<p>I. Dasar Pelaksanaan</p>
<p>Surat Perintah Tugas Nomor: {{nomor_spt}} Tanggal {{tanggal_spt}}</p>

<p>II. Hasil Kegiatan</p>
<p>Kegiatan dilaksanakan pada tanggal {{tanggal_kegiatan}} bertempat di {{lokasi_kegiatan}} dengan rincian data sebagai berikut:</p>

<table style="width: 100%; border-collapse: collapse; border: 1px solid black; margin: 10px 0;">
  <tr style="background-color: #f2f2f2;">
    <th style="border: 1px solid black; padding: 8px; text-align: center; width: 40px;">No</th>
    <th style="border: 1px solid black; padding: 8px; text-align: left;">Uraian Temuan / Hasil</th>
    <th style="border: 1px solid black; padding: 8px; text-align: left;">Keterangan / Sasaran</th>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 8px; text-align: center;">1</td>
    <td style="border: 1px solid black; padding: 8px;">{{hasil_uraian_1}}</td>
    <td style="border: 1px solid black; padding: 8px;">{{keterangan_1}}</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 8px; text-align: center;">2</td>
    <td style="border: 1px solid black; padding: 8px;">{{hasil_uraian_2}}</td>
    <td style="border: 1px solid black; padding: 8px;">{{keterangan_2}}</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 8px; text-align: center;">3</td>
    <td style="border: 1px solid black; padding: 8px;">{{hasil_uraian_3}}</td>
    <td style="border: 1px solid black; padding: 8px;">{{keterangan_3}}</td>
  </tr>
</table>

<p>III. Kesimpulan dan Saran</p>
<p>{{kesimpulan_dan_saran}}</p>

<p>IV. Penutup</p>
<p>Demikian laporan ini dibuat untuk dipergunakan sebagaimana mestinya.</p>

{{tanda_tangan}}`
  }
];

const DEFAULT_ACTIVITIES: ActivityType[] = [
  { id: 'act-1', code: 'P', name: 'Pusling', color: '#0d9488', requiredStaffCount: 3 },
  { id: 'act-2', code: 'PY', name: 'Posyandu', color: '#0ea5e9', requiredStaffCount: 2 },
  { id: 'act-3', code: 'F', name: 'Fogging', color: '#f59e0b', requiredStaffCount: 4 },
  { id: 'act-4', code: 'I', name: 'Imunisasi', color: '#8b5cf6', requiredStaffCount: 2 },
  { id: 'act-5', code: 'D', name: 'Dinas Luar', color: '#ec4899', requiredStaffCount: 1 }
];

const DEFAULT_SHS: SHSItem[] = [
  { id: 'shs-1', name: 'Transport Petugas (Lokal)', category: 'Transport', unit: 'Org/Kali', price: 50000 },
  { id: 'shs-2', name: 'Transport Petugas (Kecamatan)', category: 'Transport', unit: 'Org/Kali', price: 75000 },
  { id: 'shs-3', name: 'Snack Peserta/Sasaran', category: 'Makan Minum', unit: 'Kotak', price: 15000 },
  { id: 'shs-4', name: 'Makan Siang Petugas', category: 'Makan Minum', unit: 'Porsi', price: 35000 },
];

const DEFAULT_LETTERHEAD: LetterheadConfig = {
  govName: 'PEMERINTAH KABUPATEN TEGAL',
  deptName: 'DINAS KESEHATAN',
  puskesmasName: 'PUSKESMAS KUPU',
  address: 'Jl. Raya Kupu No. 123, Kec. Dukuhturi, Kabupaten Tegal',
  phone: '(0283) 123456',
  email: 'pkmkupu@tegal.go.id',
  website: 'www.pkmkupu.tegalkab.go.id'
};

const INITIAL_STAFF: Staff[] = [
  { id: 's1', name: 'Dr. Ahmad Subagyo', code: '1' },
  { id: 's2', name: 'Siti Aminah, Amd.Keb', code: '2' },
  { id: 's3', name: 'Budi Santoso, SKM', code: '3' }
];


const App: React.FC = () => {
  // State untuk semua data aplikasi
  const [transactions, setTransactions] = useState<Transaction[]>(() => JSON.parse(localStorage.getItem('puskesmas_transactions') || '[]'));
  const [schedules, setSchedules] = useState<ScheduleEvent[]>(() => JSON.parse(localStorage.getItem('puskesmas_schedules') || '[]'));
  const [reports, setReports] = useState<ActivityReport[]>(() => JSON.parse(localStorage.getItem('puskesmas_reports') || '[]'));
  const [templates, setTemplates] = useState<Template[]>(() => JSON.parse(localStorage.getItem('puskesmas_templates') || JSON.stringify(DEFAULT_TEMPLATES)));
  const [staff, setStaff] = useState<Staff[]>(() => JSON.parse(localStorage.getItem('puskesmas_staff') || JSON.stringify(INITIAL_STAFF)));
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>(() => JSON.parse(localStorage.getItem('puskesmas_activities') || JSON.stringify(DEFAULT_ACTIVITIES)));
  const [letterhead, setLetterhead] = useState<LetterheadConfig>(() => JSON.parse(localStorage.getItem('puskesmas_letterhead') || JSON.stringify(DEFAULT_LETTERHEAD)));
  const [holidays, setHolidays] = useState<Holiday[]>(() => JSON.parse(localStorage.getItem('puskesmas_holidays') || '[]'));
  const [rpkGoals, setRpkGoals] = useState<RPKGoal[]>(() => JSON.parse(localStorage.getItem('puskesmas_rpk') || '[]'));
  const [shsMaster, setShsMaster] = useState<SHSItem[]>(() => JSON.parse(localStorage.getItem('puskesmas_shs') || JSON.stringify(DEFAULT_SHS)));

  // State untuk otentikasi
  const [userRole, setUserRole] = useState<'admin' | 'tamu'>(() => {
    return (localStorage.getItem('puskesmas_user_role') as 'admin' | 'tamu') || 'tamu';
  });

  // Cek sesi login saat aplikasi dimuat
  useEffect(() => {
    // Inisialisasi password default jika belum ada
    if (!localStorage.getItem('puskesmas_admin_password')) {
      localStorage.setItem('puskesmas_admin_password', 'BOK Kupu');
    }
  }, []);

  // Simpan data ke localStorage setiap ada perubahan
  useEffect(() => {
    localStorage.setItem('puskesmas_transactions', JSON.stringify(transactions));
    localStorage.setItem('puskesmas_schedules', JSON.stringify(schedules));
    localStorage.setItem('puskesmas_reports', JSON.stringify(reports));
    localStorage.setItem('puskesmas_templates', JSON.stringify(templates));
    localStorage.setItem('puskesmas_staff', JSON.stringify(staff));
    localStorage.setItem('puskesmas_activities', JSON.stringify(activityTypes));
    localStorage.setItem('puskesmas_letterhead', JSON.stringify(letterhead));
    localStorage.setItem('puskesmas_holidays', JSON.stringify(holidays));
    localStorage.setItem('puskesmas_rpk', JSON.stringify(rpkGoals));
    localStorage.setItem('puskesmas_shs', JSON.stringify(shsMaster));
  }, [transactions, schedules, reports, templates, staff, activityTypes, letterhead, holidays, rpkGoals, shsMaster]);

  const handleSetRole = (role: 'admin' | 'tamu') => {
    localStorage.setItem('puskesmas_user_role', role);
    setUserRole(role);
  };
  
  // Data props untuk diteruskan ke MainLayout
  const appData = {
    transactions, setTransactions,
    schedules, setSchedules,
    reports, setReports,
    templates, setTemplates,
    staff, setStaff,
    activityTypes, setActivityTypes,
    letterhead, setLetterhead,
    holidays, setHolidays,
    rpkGoals, setRpkGoals,
    shsMaster, setShsMaster,
  };

  return (
    <HashRouter>
      <MainLayout 
        userRole={userRole} 
        onSetRole={handleSetRole} 
        {...appData} 
      />
    </HashRouter>
  );
};

export default App;
