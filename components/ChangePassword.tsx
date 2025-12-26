
import React, { useState } from 'react';
import { KeyRound, Lock, CheckCircle, AlertCircle } from 'lucide-react';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const storedPassword = localStorage.getItem('puskesmas_admin_password') || 'BOK Kupu';

    if (oldPassword !== storedPassword) {
      setError('Password lama tidak sesuai.');
      return;
    }

    if (newPassword.length < 4) {
      setError('Password baru minimal 4 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password baru tidak cocok.');
      return;
    }

    localStorage.setItem('puskesmas_admin_password', newPassword);
    setMessage('Password berhasil diperbarui!');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-500">
       <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Ganti Password Admin</h1>
        <p className="text-slate-500 mt-1">Perbarui kredensial login Anda untuk menjaga keamanan akun.</p>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">Password Lama</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">Password Baru</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">Konfirmasi Password Baru</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 bg-rose-50 text-rose-600 text-sm font-bold p-4 rounded-xl border border-rose-100">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 text-sm font-bold p-4 rounded-xl border border-emerald-200">
              <CheckCircle size={20} />
              <span>{message}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-teal-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-teal-700 transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <Lock size={18} />
            <span>SIMPAN PASSWORD BARU</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
