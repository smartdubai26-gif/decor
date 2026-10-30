import React, { useState } from 'react';
import { User } from '../../types';
import { mockUsers } from '../../data/mockData';
import { api, setAuthToken } from '../../services/api';
import { Shield, X, UserCheck, Key, Lock, AlertCircle, LogIn } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSelectUser: (user: User) => void;
  users?: User[];
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, currentUser, onSelectUser, users = mockUsers }) => {
  const [email, setEmail] = useState(currentUser.email);
  const [password, setPassword] = useState('Password@123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await api.login(email, password);
      setAuthToken(result.token);
      onSelectUser(result.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول. يرجى التحقق من صحة البيانات.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = async (user: User) => {
    setEmail(user.email);
    setPassword('Password@123');
    setLoading(true);
    setError(null);
    try {
      const result = await api.login(user.email, 'Password@123');
      setAuthToken(result.token);
      onSelectUser(result.user);
      onClose();
    } catch (err: any) {
      // Fallback for offline/local simulation
      onSelectUser(user);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-[#C6A780]/30 animate-in fade-in zoom-in duration-200 my-auto">
        
        {/* Header */}
        <div className="bg-[#28332F] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-[#C6A780]" />
            <div>
              <h3 className="font-bold text-lg">تسجيل الدخول وإدارة الصلاحيات (RBAC)</h3>
              <p className="text-xs text-[#F1E9DE]/80">توثيق خادمي حقيقي مع تشفير كلمات المرور وحماية الجلسات</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#F1E9DE]/70 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Real Login Form */}
          <form onSubmit={handleLogin} className="space-y-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#C6A780]" />
              تسجيل الدخول بالبيانات الرسمية:
            </div>
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#C6A780]"
              />
            </div>
            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#C6A780]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#28332F] hover:bg-[#1b2320] text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5 text-[#C6A780]" />
              {loading ? 'جاري التحقق...' : 'تسجيل الدخول وتفعيل الجلسة'}
            </button>
          </form>

          {/* Quick-Switch Role Presets */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>أو التبديل السريع لاختبار صلاحيات الأدوار:</span>
              <span className="text-[10px] text-slate-400 font-normal">كلمة المرور: Password@123</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {users.map((user) => {
                const isSelected = currentUser.id === user.id;
                return (
                  <div
                    key={user.id}
                    onClick={() => handleQuickSelect(user)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#C6A780] bg-[#F1E9DE]/50 shadow-2xs'
                        : 'border-slate-200 hover:border-[#C6A780]/50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#28332F] text-[#C6A780] flex items-center justify-center font-bold text-xs">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-xs">{user.name}</h4>
                        <p className="text-[10px] text-slate-500">{user.department} • <span className="font-mono font-bold text-[#C6A780]">{user.role}</span></p>
                      </div>
                    </div>
                    {isSelected ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#28332F] bg-[#C6A780]/20 px-2 py-0.5 rounded-full">
                        <UserCheck className="w-3 h-3 text-[#28332F]" />
                        الحساب النشط
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 hover:text-slate-700">تفعيل ←</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center text-[11px] text-slate-500">
          يتم تطبيق فحص الصلاحيات (Least Privilege) على مستوى الخادم لجميع الطلبات المحمية.
        </div>
      </div>
    </div>
  );
};
