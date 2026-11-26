import React, { useState, useCallback } from 'react';
import { useApp } from '../context/useApp';
import { useModalClose } from '../hooks/useModalClose';
import {
  X, Lock, Mail, Shield, AlertCircle, ArrowRight,
  KeyRound, ChevronDown, ChevronUp
} from 'lucide-react';

const ERROR_MESSAGES = {
  invalid_credentials: {
    title: 'Đăng nhập không thành công',
    desc: 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại thông tin đăng nhập.'
  },
  rate_limited: {
    title: 'Yêu cầu đăng nhập tạm thời bị hạn chế',
    desc: 'Hệ thống hiện không thể xử lý yêu cầu đăng nhập của bạn. Vui lòng thử lại sau.\n\nNếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ bộ phận hỗ trợ.'
  },
  server_unreachable: {
    title: 'Không thể kết nối máy chủ',
    desc: 'Vui lòng kiểm tra Backend API (http://localhost:5000) đã được khởi chạy chưa.'
  }
};

const ErrorBox = ({ code }) => {
  const info = ERROR_MESSAGES[code] || { title: 'Lỗi xác thực', desc: code };
  return (
    <div className="mx-5 mt-3 p-3 rounded-xl bg-rose-950/60 border border-rose-400/35 text-rose-100 text-xs flex items-start gap-2">
      <AlertCircle className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
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

  const resetAll = useCallback(() => {
    setEmail('');
    setPassword('');
    setErrorCode('');
    setLoading(false);
    setShowRecovery(false);
    setRecoveryCode('');
  }, []);

  const handleClose = useCallback(() => {
    resetAll();
    onClose();
  }, [resetAll, onClose]);

  const { handleBackdropClick } = useModalClose(isOpen, handleClose);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorCode('');
    setLoading(true);

    const finalPassword = showRecovery ? recoveryCode : password;
    const result = await login(email, finalPassword, 'admin');
    setLoading(false);

    if (result.success) {
      resetAll();
      onClose();
    } else {
      setErrorCode(result.errorCode || 'invalid_credentials');
    }
  };

  return (
    <div onClick={handleBackdropClick} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07120c]/75 backdrop-blur-xs">
      <div className="vv-footer-bg text-white rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.45)] border border-[#eaae1a]/30 max-w-md w-full overflow-hidden animate-scale-up">
        <div className="h-[3px] w-full vv-footer-accent" />

        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#eaae1a]/15 border border-[#eaae1a]/45 text-[#eaae1a] flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Cổng Quản Trị Hệ Thống</h3>
              <p className="text-[11px] text-[#b9cdc0]">V-Connect Administration Gateway</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-[#b9cdc0] hover:text-white rounded-full hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Warning Notice */}
        <div className="mx-5 mt-4 p-3 rounded-xl bg-white/6 border border-[#eaae1a]/25 text-[#e2f0e9] text-xs">
          Khu vực hạn chế chỉ dành cho Quản trị viên có thẩm quyền kiểm duyệt và điều hành hệ thống.
        </div>

        {/* Error */}
        {errorCode && <ErrorBox code={errorCode} />}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#e2f0e9] mb-1.5">Email Quản trị viên:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#eaae1a]/80 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vconnect.vn"
                className="w-full text-xs pl-10 pr-3.5 py-3 rounded-xl border border-white/18 focus:outline-none focus:border-[#eaae1a] focus:ring-2 focus:ring-[#eaae1a]/25 bg-white/8 text-white placeholder:text-[#8fa99a]"
              />
            </div>
          </div>

          {!showRecovery ? (
            <div>
              <label className="block font-semibold text-[#e2f0e9] mb-1.5">Mật khẩu bảo mật:</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#eaae1a]/80 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required={!showRecovery}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-10 pr-3.5 py-3 rounded-xl border border-white/18 focus:outline-none focus:border-[#eaae1a] focus:ring-2 focus:ring-[#eaae1a]/25 bg-white/8 text-white placeholder:text-[#8fa99a]"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block font-semibold text-[#f6c453] mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                Mã Khôi Phục Dự Phòng:
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#eaae1a] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required={showRecovery}
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                  placeholder="VCADM-XXXX-XXXXXXXX"
                  className="w-full text-xs pl-10 pr-3.5 py-3 rounded-xl border border-[#eaae1a]/50 focus:outline-none focus:ring-2 focus:ring-[#eaae1a]/35 bg-white/8 text-[#fef8e6] placeholder:text-[#8fa99a] font-mono tracking-wider"
                />
              </div>
              <p className="text-[10px] text-[#b9cdc0] mt-1.5">
                📌 Demo: Mã dự phòng là <span className="font-mono text-[#f6c453] font-bold">VCADM-2026-RECOVERY</span>
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="vv-btn-gold w-full mt-2 py-3 font-bold disabled:opacity-50 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? 'Đang xác thực bảo mật...' : 'Xác Thực & Truy Cập Bảng Quản Trị'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Toggle recovery code */}
          <button
            type="button"
            onClick={() => { setShowRecovery(!showRecovery); setErrorCode(''); }}
            className="w-full text-[11px] text-[#b9cdc0] hover:text-[#f6c453] font-medium flex items-center justify-center gap-1.5 cursor-pointer pt-1 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
            {showRecovery ? 'Dùng mật khẩu thường' : 'Dùng mã khôi phục dự phòng'}
            {showRecovery ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </form>

        {/* Footer */}
        <div className="p-4 bg-black/25 border-t border-white/10 text-center text-[11px] text-[#8fa99a]">
          Mọi phiên truy cập quản trị viên đều được ghi log bảo mật trên máy chủ.
        </div>
      </div>
    </div>
  );
};
