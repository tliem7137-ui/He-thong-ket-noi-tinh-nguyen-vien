import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
  email_not_found: {
    title: 'Email không tồn tại',
    desc: 'Địa chỉ email này chưa được đăng ký trong hệ thống. Vui lòng kiểm tra lại.'
  },
  invalid_otp: {
    title: 'Mã xác minh không đúng',
    desc: 'Mã xác minh bạn nhập không chính xác. Vui lòng thử lại.'
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

// ---- Trạng thái màn hình ----
// 'login' | 'forgot_email' | 'forgot_otp' | 'forgot_success'
const SCREEN = {
  LOGIN: 'login',
  FORGOT_EMAIL: 'forgot_email',
  FORGOT_OTP: 'forgot_otp',
  FORGOT_SUCCESS: 'forgot_success'
};

export const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
  const { login, setUserRole, setCurrentUser, showToast, volunteers, organizations } = useApp();

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

  if (!isOpen) return null;

  const resetAll = () => {
    setEmail('');
    setPassword('');
    setErrorCode('');
    setLoading(false);
    setScreen(SCREEN.LOGIN);
    setForgotEmail('');
    setForgotOtp('');
    setForgotError('');
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

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
      // Fallback demo: always pass
      setScreen(SCREEN.FORGOT_OTP);
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
        setUserRole(data.role);
        setCurrentUser(data.user);
        showToast(`Xác minh thành công! Chào mừng ${data.user.fullName || data.user.name}`, 'success');
        setScreen(SCREEN.FORGOT_SUCCESS);
        setTimeout(() => {
          handleClose();
        }, 1200);
      } else {
        setForgotError(data.error || 'invalid_otp');
      }
    } catch {
      // Demo fallback: OTP 123456 always works
      if (forgotOtp === '123456') {
        const matched = roleTab === 'volunteer'
          ? (volunteers.find(v => v.email.toLowerCase() === forgotEmail.toLowerCase()) || volunteers[0])
          : (organizations.find(o => o.email.toLowerCase() === forgotEmail.toLowerCase()) || organizations[0]);
        setUserRole(roleTab);
        setCurrentUser(matched);
        showToast(`Xác minh thành công! Chào mừng ${matched.fullName || matched.name}`, 'success');
        setScreen(SCREEN.FORGOT_SUCCESS);
        setTimeout(() => { handleClose(); }, 1200);
      } else {
        setForgotError('invalid_otp');
      }
    }
    setForgotLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden animate-scale-up">

        {/* ===== HEADER ===== */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            {screen !== SCREEN.LOGIN && (
              <button
                onClick={() => { setScreen(SCREEN.LOGIN); setForgotError(''); }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer mr-1"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                {screen === SCREEN.LOGIN && 'Đăng Nhập Hệ Thống'}
                {screen === SCREEN.FORGOT_EMAIL && 'Khôi Phục Quyền Truy Cập'}
                {screen === SCREEN.FORGOT_OTP && 'Xác Minh Danh Tính'}
                {screen === SCREEN.FORGOT_SUCCESS && 'Xác Minh Thành Công'}
              </h3>
              <p className="text-xs text-slate-500">Cổng Kết Nối Tình Nguyện Viên V-Connect</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ===== ROLE TABS (chỉ hiện ở màn login) ===== */}
        {screen === SCREEN.LOGIN && (
          <div className="flex border-b border-slate-200 bg-slate-100/70 p-1 m-4 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleRoleSelect('volunteer')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                roleTab === 'volunteer' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Tình Nguyện Viên</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('organization')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                roleTab === 'organization' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
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

        {/* ===== MÀNINH ĐĂNG NHẬP ===== */}
        {screen === SCREEN.LOGIN && (
          <form onSubmit={handleLoginSubmit} className="p-5 pt-0 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email đăng nhập:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập địa chỉ email của bạn..."
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu:</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? 'Đang xác thực...' : 'Đăng Nhập'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Không thể đăng nhập? */}
            <button
              type="button"
              onClick={() => { setScreen(SCREEN.FORGOT_EMAIL); setForgotEmail(email); setForgotError(''); }}
              className="w-full text-xs text-slate-500 hover:text-emerald-600 font-medium flex items-center justify-center gap-1.5 cursor-pointer pt-0.5 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Không thể đăng nhập?
            </button>
          </form>
        )}

        {/* ===== MÀN NHẬP EMAIL KHÔI PHỤC ===== */}
        {screen === SCREEN.FORGOT_EMAIL && (
          <form onSubmit={handleForgotEmailSubmit} className="p-5 pt-2 space-y-4">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>Nhập địa chỉ email đã đăng ký. Chúng tôi sẽ gửi mã xác minh để khôi phục quyền truy cập.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email đã đăng ký:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={forgotLoading}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{forgotLoading ? 'Đang kiểm tra...' : 'Tiếp Tục Xác Minh'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ===== MÀN NHẬP OTP ===== */}
        {screen === SCREEN.FORGOT_OTP && (
          <form onSubmit={handleForgotOtpSubmit} className="p-5 pt-2 space-y-4">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
              <KeyRound className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Mã xác minh đã được gửi!</p>
                <p className="mt-0.5">Vui lòng kiểm tra hộp thư của <span className="font-bold">{forgotEmail}</span> và nhập mã 6 chữ số.</p>
                <p className="mt-1 text-emerald-600 font-medium">📌 Demo: Mã mặc định là <span className="font-mono font-bold bg-emerald-100 px-1 rounded">123456</span></p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mã xác minh (6 chữ số):</label>
              <input
                type="text"
                required
                maxLength={6}
                value={forgotOtp}
                onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="_ _ _ _ _ _"
                className="w-full text-center text-lg font-mono font-bold py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 tracking-[0.5em]"
              />
            </div>

            <button
              type="submit"
              disabled={forgotLoading || forgotOtp.length < 6}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{forgotLoading ? 'Đang xác minh...' : 'Xác Minh & Truy Cập'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ===== MÀN THÀNH CÔNG ===== */}
        {screen === SCREEN.FORGOT_SUCCESS && (
          <div className="p-8 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="font-bold text-slate-800">Xác minh thành công!</p>
            <p className="text-xs text-slate-500">Đang chuyển hướng vào tài khoản của bạn...</p>
          </div>
        )}

        {/* ===== FOOTER ===== */}
        {screen === SCREEN.LOGIN && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-600">
            Chưa có tài khoản?{' '}
            <button
              type="button"
              onClick={() => { handleClose(); onSwitchToRegister(); }}
              className="text-emerald-600 hover:text-emerald-700 font-bold underline cursor-pointer"
            >
              Đăng ký tham gia ngay
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
