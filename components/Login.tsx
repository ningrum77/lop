
import React, { useState } from 'react';
import { Hospital, KeyRound, LogIn, User, AlertCircle, Eye, EyeOff, X } from 'lucide-react';

interface Props {
  onLoginSuccess: () => void;
  onClose: () => void;
}

const Login: React.FC<Props> = ({ onLoginSuccess, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPassword = localStorage.getItem('puskesmas_admin_password') || 'BOK Kupu';

    if (username === 'BOK Kupu' && password === storedPassword) {
      onLoginSuccess();
    } else {
      setError('Username atau password salah.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[2000] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in duration-300 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
        
        <div className="text-center mb-8">
          <div className="inline-block bg-teal-600 p-4 rounded-2xl text-white shadow-lg mb-4">
            <Hospital size={24} />
          </div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Login Administrator</h1>
          <p className="text-slate-500 text-sm mt-1">Masukkan kredensial Anda.</p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Username</label>
            <div className="relative mt-1">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username Admin"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
            <div className="relative mt-1">
              <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="flex items-center space-x-2 bg-rose-50 text-rose-600 text-xs font-bold p-3 rounded-xl border border-rose-100">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-teal-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-100 hover:bg-teal-700 transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <LogIn size={18} />
            <span>LOGIN</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
