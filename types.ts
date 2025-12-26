
export interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  source: string;
  receiptImage?: string; // Foto kuitansi/bukti
}

export interface ScheduleEvent {
  id: string;
  date: string;
  staffNames: string[];
  activityId: string; // Referensi ke ActivityType
  location: string;
  sptNumber?: string;
  sptDate?: string;
}

export interface ActivityType {
  id: string;
  code: string;
  name: string;
  color: string;
  requiredStaffCount: number;
}

export interface Staff {
  id: string;
  name: string;
  code: string;
}

export interface Template {
  id: string;
  name: string;
  body: string; // Teks lengkap laporan dengan placeholder {{variabel}}
}

export interface SHSItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
}

export interface Expense {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number; // calculated: quantity * unitPrice
  category: string;
  date: string;
  shsItemId?: string; // Optional reference to master SHS
  receiptImage?: string; // Foto kuitansi per item pengeluaran
}

export interface LetterheadConfig {
  govName: string;
  deptName: string;
  puskesmasName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logoPemkab?: string; // Sisi Kiri
  logoPuskesmas?: string; // Sisi Kanan
}

export interface ActivityReport {
  id: string;
  title: string;
  date: string;
  location: string;
  templateId: string;
  content: Record<string, string>; // Menyimpan nilai untuk placeholder {{key}}
  totalBudget: number; // Anggaran khusus untuk satu perjalanan ini (jika ada)
  expenses: Expense[];
  staffNames: string[]; 
  participants?: string[]; // Daftar Pasien / Peserta
  excelTableData?: string[][]; // Data tabel hasil copy-paste dari Excel
  status: 'draft' | 'submitted';
  images?: string[]; // Menampung array base64 gambar
  sptNumber?: string;
  sptDate?: string;
  activityId?: string; // Menghubungkan laporan dengan tipe kegiatan untuk RPK
}

export interface Holiday {
  date: string; // format YYYY-MM-DD
  description: string;
}

export interface RPKGoal {
  id: string;
  month: string; // format YYYY-MM
  activityTypeId: string;
  target: number;
  unit: string; // Misal: Kali, Desa, Kelompok
  plannedBudget: number; // Pagu Anggaran (Target/Plafon)
  disbursedAmount: number; // Dana Cair (bisa otomatis atau manual)
}
