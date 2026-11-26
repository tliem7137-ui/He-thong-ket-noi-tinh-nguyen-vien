import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X, Lock, Mail, Shield, AlertCircle, ArrowRight,
  KeyRound, ChevronDown, ChevronUp, CheckCircle2
} from 'lucide-react';

const ERROR_MESSAGES = {
  invalid_credentials: {
    title: 'Đăng nhập không thành công',
    desc: 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại thông tin đăng nhập.'
  },
  rate_limited: {
    title: 'Yêu cầu đăng nhập tạm thời bị hạn chế',
    desc: 'Hệ thống hiện không thể xử lý yêu cầu đăng nhập của bạn. Vui lòng thử lại sau.\n\nNếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ bộ phận hỗ trợ.'
  }
};

const ErrorBox = ({ code }) => {
  const info = ERROR_MESSAGES[code] || { title: 'Lỗi xác thực', desc: code };
  return (
    <div className="mx-5 mt-3 p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2">
      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
      <div>
        <p className="font-bold">{info.title}</p>
        <p className="mt-0.5 whitespace-pre-line leading-relaxed">{info.desc}</p>
      </div>
    </div>
  );
};

export const AdminLoginModal = ({ isOpen, onClose }) => {
  const { login } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');

  if (!isOpen) return null;

  const resetAll = () => {
    setEmail('');
    setPassword('');
    setErrorCode('');
    setLoading(false);
    setShowRecovery(false);
    setRecoveryCode('');
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorCode('');
    setLoading(true);

    const finalPassword = showRecovery ? recoveryCode : password;

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: finalPassword })
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok && data.success) {
        const result = await login(email, finalPassword, 'admin');
        if (result.success) {
          resetAll();
          onClose();
        } else {
          setErrorCode(result.errorCode || 'invalid_credentials');
        }
      } else if (res.status === 429) {
        setErrorCode('rate_limited');
      } else {
        setErrorCode('invalid_credentials');
      }
    } catch {
      // Fallback: use context login directly
      setLoading(false);
      const result = await login(email, finalPassword, 'admin');
      if (result.success) {
        resetAll();
        onClose();
      } else {
        setErrorCode(result.errorCode || 'invalid_credentials');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-slate-900 text-white rounded-3xl shadow-2xl border border-purple-500/30 max-w-md w-full overflow-hidden animate-scale-up">

        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-purple-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Cổng Quản Trị Hệ Thống</h3>
              <p className="text-[11px] text-purple-300/70">V-Connect Administration Gateway</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Warning Notice */}
        <div className="mx-5 mt-4 p-3 rounded-xl bg-purple-900/20 border border-purple-500/20 text-purple-200 text-xs">
          Khu vực hạn chế chỉ dành cho Quản trị viên có thẩm quyền kiểm duyệt và điều hành hệ thống.
        </div>

        {/* Error */}
        {errorCode && <ErrorBox code={errorCode} />}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Email Quản trị viên:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vconnect.vn"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-800/80 text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          {!showRecovery ? (
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Mật khẩu bảo mật:</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required={!showRecovery}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-800/80 text-white placeholder:text-slate-500"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                Mã Khôi Phục Dự Phòng:
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-amber-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required={showRecovery}
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                  placeholder="VCADM-XXXX-XXXXXXXX"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-amber-600/50 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-800/80 text-amber-100 placeholder:text-slate-500 font-mono tracking-wider"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                📌 Demo: Mã dự phòng là <span className="font-mono text-amber-400 font-bold">VCADM-2026-RECOVERY</span>
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-2.5 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? 'Đang xác thực bảo mật...' : 'Xác Thực & Truy Cập Bảng Quản Trị'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Toggle recovery code */}
          <button
            type="button"
            onClick={() => { setShowRecovery(!showRecovery); setErrorCode(''); }}
            className="w-full text-[11px] text-slate-500 hover:text-amber-400 font-medium flex items-center justify-center gap-1.5 cursor-pointer pt-1 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
            {showRecovery ? 'Dùng mật khẩu thường' : 'Dùng mã khôi phục dự phòng'}
            {showRecovery ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </form>

        {/* Footer */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 text-center text-[11px] text-slate-500">
          Mọi phiên truy cập quản trị viên đều được ghi log bảo mật trên máy chủ.
        </div>
      </div>
    </div>
  );
};
