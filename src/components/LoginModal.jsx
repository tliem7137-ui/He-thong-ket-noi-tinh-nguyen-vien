import React, { useState, useCallback } from 'react';
import { useApp } from '../context/useApp';
import { useModalClose } from '../hooks/useModalClose';
import {
  X, Lock, Mail, User, Building2, AlertCircle, ArrowRight,
  HelpCircle, ShieldAlert, KeyRound, CheckCircle2, ChevronLeft
} from 'lucide-react';

// ----- Thông báo lỗi chuẩn -----
const ERROR_MESSAGES = {
  invalid_credentials: {
    title: 'Đăng nhập không thành công',
    desc: 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại thông tin đăng nhập.'
  },
  rate_limited: {
    title: 'Yêu cầu đăng nhập tạm thời bị hạn chế',
    desc: 'Hệ thống hiện không thể xử lý yêu cầu đăng nhập của bạn. Vui lòng thử lại sau.\n\nNếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ bộ phận hỗ trợ.'
  },
  account_locked: {
    title: 'Tài khoản bị khóa',
    desc: 'Tài khoản của bạn đã bị khóa do vi phạm chính sách. Vui lòng liên hệ hỗ trợ.'
  },
  account_pending: {
    title: 'Tài khoản chưa được duyệt',
    desc: 'Tài khoản đang trong trạng thái Chờ duyệt bởi Ban Quản trị. Vui lòng chờ email thông báo.'
  },
  account_rejected: {
    title: 'Tài khoản bị từ chối',
    desc: 'Hồ sơ tài khoản của bạn chưa được chấp thuận. Vui lòng liên hệ bộ phận hỗ trợ.'
  },
  email_not_found: {
    title: 'Email không tồn tại',
    desc: 'Địa chỉ email này chưa được đăng ký trong hệ thống. Vui lòng kiểm tra lại.'
  },
  invalid_otp: {
    title: 'Mã xác minh không đúng',
    desc: 'Mã xác minh bạn nhập không chính xác. Vui lòng thử lại.'
  },
  server_unreachable: {
    title: 'Không thể kết nối máy chủ',
    desc: 'Vui lòng kiểm tra Backend API (http://localhost:5000) đã được khởi chạy chưa.'
  }
};

const ErrorBox = ({ code, customMsg }) => {
  const info = ERROR_MESSAGES[code] || { title: 'Lỗi', desc: customMsg || code };
  return (
    <div className="mx-5 mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
      <div>
        <p className="font-bold">{info.title}</p>
        <p className="mt-0.5 whitespace-pre-line leading-relaxed">{info.desc}</p>
      </div>
    </div>
  );
};

const SCREEN = {
  LOGIN: 'login',
  FORGOT_EMAIL: 'forgot_email',
  FORGOT_OTP: 'forgot_otp',
  FORGOT_SUCCESS: 'forgot_success'
};

export const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
  const { login, setSession, showToast, syncWithBackend } = useApp();

  const [roleTab, setRoleTab] = useState('volunteer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [screen, setScreen] = useState(SCREEN.LOGIN);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const resetAll = useCallback(() => {
    setEmail('');
    setPassword('');
    setErrorCode('');
    setLoading(false);
    setScreen(SCREEN.LOGIN);
    setForgotEmail('');
    setForgotOtp('');
    setForgotError('');
  }, []);

  const handleClose = useCallback(() => {
    resetAll();
    onClose();
  }, [resetAll, onClose]);

  const { handleBackdropClick } = useModalClose(isOpen, handleClose);

  if (!isOpen) return null;

  const handleRoleSelect = (newRole) => {
    setRoleTab(newRole);
    setErrorCode('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorCode('');
    setLoading(true);
    const res = await login(email, password, roleTab);
    setLoading(false);
    if (res.success) {
      resetAll();
      onClose();
    } else {
      setErrorCode(res.errorCode || 'invalid_credentials');
    }
  };

  // --- Forgot: step 1 - nhập email ---
  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, role: roleTab })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setScreen(SCREEN.FORGOT_OTP);
      } else {
        setForgotError(data.error || 'email_not_found');
      }
    } catch {
      setForgotError('server_unreachable');
    }
    setForgotLoading(false);
  };

  // --- Forgot: step 2 - nhập OTP ---
  const handleForgotOtpSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp: forgotOtp, role: roleTab })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSession(data.role, data.user, data.token || '');
        syncWithBackend();
        showToast(`Xác minh thành công! Chào mừng ${data.user.fullName || data.user.name}`, 'success');
        setScreen(SCREEN.FORGOT_SUCCESS);
        setTimeout(() => {
          handleClose();
        }, 1200);
      } else {
        setForgotError(data.error || 'invalid_otp');
      }
    } catch {
      setForgotError('server_unreachable');
    }
    setForgotLoading(false);
  };

  return (
    <div onClick={handleBackdropClick} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d1f16]/65 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-[0_24px_60px_rgba(13,31,22,0.28)] border border-[#0d530e]/12 max-w-md w-full overflow-hidden animate-scale-up">

        {/* ===== HEADER ===== */}
        <div className="p-5 border-b border-[#e8f2ed] flex items-center justify-between bg-[#f5f9f7]">
          <div className="flex items-center gap-2">
            {screen !== SCREEN.LOGIN && (
              <button
                onClick={() => { setScreen(SCREEN.LOGIN); setForgotError(''); }}
                className="p-1.5 text-[#5a6b5c] hover:text-[#0d530e] rounded-full hover:bg-[#e8f2ed] cursor-pointer mr-1"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h3 className="font-bold text-[#0d530e] text-lg">
                {screen === SCREEN.LOGIN && 'Đăng Nhập Hệ Thống'}
                {screen === SCREEN.FORGOT_EMAIL && 'Khôi Phục Quyền Truy Cập'}
                {screen === SCREEN.FORGOT_OTP && 'Xác Minh Danh Tính'}
                {screen === SCREEN.FORGOT_SUCCESS && 'Xác Minh Thành Công'}
              </h3>
              <p className="text-xs text-[#5a6b5c]">Cổng Kết Nối Tình Nguyện Viên V-Connect</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 text-[#5a6b5c] hover:text-[#0d530e] rounded-full hover:bg-[#e8f2ed] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ===== ROLE TABS (chỉ hiện ở màn login) ===== */}
        {screen === SCREEN.LOGIN && (
          <div className="flex bg-[#f5f9f7] border border-[#0d530e]/12 p-1 m-5 rounded-full text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleRoleSelect('volunteer')}
              className={`flex-1 py-2.5 rounded-full flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                roleTab === 'volunteer' ? 'bg-[#0d530e] text-white shadow-xs' : 'text-[#5a6b5c] hover:text-[#0d530e]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Tình Nguyện Viên</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('organization')}
              className={`flex-1 py-2.5 rounded-full flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                roleTab === 'organization' ? 'bg-[#1b5e3a] text-white shadow-xs' : 'text-[#5a6b5c] hover:text-[#0d530e]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Đơn Vị Tổ Chức</span>
            </button>
          </div>
        )}

        {/* ===== LỖI ===== */}
        {screen === SCREEN.LOGIN && errorCode && <ErrorBox code={errorCode} />}
        {screen !== SCREEN.LOGIN && forgotError && <ErrorBox code={forgotError} />}

        {/* ===== MÀN HÌNH ĐĂNG NHẬP ===== */}
        {screen === SCREEN.LOGIN && (
          <form onSubmit={handleLoginSubmit} className="p-5 pt-0 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1f2d20] mb-1.5">Email đăng nhập:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#609f84] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập địa chỉ email của bạn..."
                  className="vv-input w-full text-xs pl-10 pr-3.5 py-3"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1f2d20] mb-1.5">Mật khẩu:</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#609f84] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="vv-input w-full text-xs pl-10 pr-3.5 py-3"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="vv-btn-primary w-full mt-2 py-3 text-xs font-bold disabled:opacity-50 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? 'Đang xác thực...' : 'Đăng Nhập'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => { setScreen(SCREEN.FORGOT_EMAIL); setForgotEmail(email); setForgotError(''); }}
              className="w-full text-xs text-[#5a6b5c] hover:text-[#0d530e] font-medium flex items-center justify-center gap-1.5 cursor-pointer pt-0.5 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Không thể đăng nhập?
            </button>
          </form>
        )}

        {/* ===== MÀN NHẬP EMAIL KHÔI PHỤC ===== */}
        {screen === SCREEN.FORGOT_EMAIL && (
          <form onSubmit={handleForgotEmailSubmit} className="p-5 pt-3 space-y-4">
            <div className="p-3.5 rounded-xl bg-[#fef8e6] border border-[#eaae1a]/40 text-[#735104] text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-[#d49b11] shrink-0 mt-0.5" />
              <span>Nhập địa chỉ email đã đăng ký. Chúng tôi sẽ gửi mã xác minh để khôi phục quyền truy cập.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1f2d20] mb-1.5">Email đã đăng ký:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#609f84] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="vv-input w-full text-xs pl-10 pr-3.5 py-3"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={forgotLoading}
              className="vv-btn-primary w-full py-3 text-xs font-bold disabled:opacity-50 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{forgotLoading ? 'Đang kiểm tra...' : 'Tiếp Tục Xác Minh'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ===== MÀN NHẬP OTP ===== */}
        {screen === SCREEN.FORGOT_OTP && (
          <form onSubmit={handleForgotOtpSubmit} className="p-5 pt-3 space-y-4">
            <div className="p-3.5 rounded-xl bg-[#f5f9f7] border border-[#0d530e]/20 text-[#1f2d20] text-xs flex items-start gap-2">
              <KeyRound className="w-4 h-4 text-[#0d530e] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#0d530e]">Mã xác minh đã được gửi!</p>
                <p className="mt-0.5 text-[#555555]">Vui lòng kiểm tra hộp thư của <span className="font-bold text-[#1c1c1c]">{forgotEmail}</span> và nhập mã 6 chữ số.</p>
                <p className="mt-1 text-[#0d530e] font-medium">📌 Demo: Mã mặc định là <span className="font-mono font-bold bg-[#e8f2ed] px-1.5 py-0.5 rounded">123456</span></p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1f2d20] mb-1.5">Mã xác minh (6 chữ số):</label>
              <input
                type="text"
                required
                maxLength={6}
                value={forgotOtp}
                onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="_ _ _ _ _ _"
                className="vv-input w-full text-center text-lg font-mono font-bold py-3 tracking-[0.5em]"
              />
            </div>

            <button
              type="submit"
              disabled={forgotLoading || forgotOtp.length < 6}
              className="vv-btn-primary w-full py-3 text-xs font-bold disabled:opacity-50 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{forgotLoading ? 'Đang xác minh...' : 'Xác Minh & Truy Cập'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ===== MÀN THÀNH CÔNG ===== */}
        {screen === SCREEN.FORGOT_SUCCESS && (
          <div className="p-8 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-[#e8f2ed] border border-[#0d530e]/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-[#0d530e]" />
            </div>
            <p className="font-bold text-[#0d530e]">Xác minh thành công!</p>
            <p className="text-xs text-[#5a6b5c]">Đang chuyển hướng vào tài khoản của bạn...</p>
          </div>
        )}

        {/* ===== FOOTER ===== */}
        {screen === SCREEN.LOGIN && (
          <div className="p-4 bg-[#f5f9f7] border-t border-[#e8f2ed] text-center text-xs text-[#5a6b5c]">
            Chưa có tài khoản?{' '}
            <button
              type="button"
              onClick={() => { handleClose(); onSwitchToRegister(); }}
              className="text-[#0d530e] hover:text-[#d49b11] font-bold underline cursor-pointer transition-colors"
            >
              Đăng ký tham gia ngay
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
