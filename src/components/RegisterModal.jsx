import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X, User, Building2, Check, AlertCircle, Sparkles, Mail, Phone,
  MapPin, Calendar, FileText, KeyRound, ArrowRight, CheckCircle2
} from 'lucide-react';

// screen: 'form' | 'otp' | 'success'
const SCREEN = { FORM: 'form', OTP: 'otp', SUCCESS: 'success' };

export const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { categories, setVolunteers, setOrganizations, showToast } = useApp();

  const [accountType, setAccountType] = useState('volunteer');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [screen, setScreen] = useState(SCREEN.FORM);
  const [successInfo, setSuccessInfo] = useState(null);

  // OTP state
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  // Pending form data to submit after OTP
  const [pendingData, setPendingData] = useState(null);

  // Volunteer fields
  const [volFullName, setVolFullName] = useState('');
  const [volEmail, setVolEmail] = useState('');
  const [volPhone, setVolPhone] = useState('');
  const [volDob, setVolDob] = useState('2004-05-10');
  const [volAddress, setVolAddress] = useState('');
  const [volSkills, setVolSkills] = useState(['Sơ cấp cứu cơ bản', 'Làm việc nhóm']);
  const [volNewSkill, setVolNewSkill] = useState('');
  const [volInterests, setVolInterests] = useState(['Bảo vệ Môi trường']);
  const [volBio, setVolBio] = useState('');

  // Organization fields
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('Tổ chức phi lợi nhuận (NGO)');
  const [orgRepresentative, setOrgRepresentative] = useState('');
  const [orgLicense, setOrgLicense] = useState('');
  const [orgEmail, setOrgEmail] = useState('');
  const [orgPhone, setOrgPhone] = useState('');
  const [orgAddress, setOrgAddress] = useState('');
  const [orgWebsite, setOrgWebsite] = useState('');
  const [orgDescription, setOrgDescription] = useState('');

  if (!isOpen) return null;

  const resetAll = () => {
    setScreen(SCREEN.FORM);
    setErrorMsg('');
    setOtp('');
    setOtpError('');
    setPendingData(null);
    setSuccessInfo(null);
    setLoading(false);
    setOtpLoading(false);
  };

  const handleClose = () => { resetAll(); onClose(); };

  const handleAddSkill = () => {
    if (volNewSkill.trim() && !volSkills.includes(volNewSkill.trim())) {
      setVolSkills([...volSkills, volNewSkill.trim()]);
      setVolNewSkill('');
    }
  };

  const handleRemoveSkill = (skill) => setVolSkills(volSkills.filter((s) => s !== skill));

  const toggleInterest = (interestName) => {
    if (volInterests.includes(interestName)) {
      setVolInterests(volInterests.filter((i) => i !== interestName));
    } else {
      setVolInterests([...volInterests, interestName]);
    }
  };

  // Step 1: Validate form then go to OTP screen
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const formData = accountType === 'volunteer'
      ? { fullName: volFullName, email: volEmail, phone: volPhone, dob: volDob, address: volAddress, skills: volSkills, interests: volInterests, bio: volBio }
      : { name: orgName, type: orgType, representative: orgRepresentative, licenseNumber: orgLicense, email: orgEmail, phone: orgPhone, address: orgAddress, website: orgWebsite, description: orgDescription };

    try {
      const endpoint = accountType === 'volunteer' ? '/api/auth/register-volunteer' : '/api/auth/register-organization';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok && data.success) {
        setPendingData(formData);
        setScreen(SCREEN.OTP);
      } else {
        setErrorMsg(data.error || 'Email này đã được sử dụng hoặc thông tin không hợp lệ.');
      }
    } catch {
      // Fallback: go to OTP screen directly
      setLoading(false);
      setPendingData(formData);
      setScreen(SCREEN.OTP);
    }
  };

  // Step 2: Verify OTP and register
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setOtpError('');
    setOtpLoading(true);

    try {
      const res = await fetch('/api/auth/verify-register-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp, pendingData, role: accountType })
      });
      const data = await res.json();
      setOtpLoading(false);
      if (res.ok && data.success) {
        if (accountType === 'volunteer' && data.volunteer) {
          setVolunteers((prev) => [data.volunteer, ...prev]);
          setSuccessInfo({ type: 'volunteer', name: data.volunteer.fullName, email: data.volunteer.email, autoLogin: true });
        } else {
          if (data.organization) setOrganizations((prev) => [data.organization, ...prev]);
          setSuccessInfo({ type: 'organization', name: pendingData.name, email: pendingData.email, autoLogin: false });
        }
        setScreen(SCREEN.SUCCESS);
      } else {
        setOtpError(data.error === 'invalid_otp' ? 'Mã xác minh không đúng. Vui lòng nhập mã thử nghiệm: 111111.' : (data.error || 'Có lỗi xảy ra.'));
      }
    } catch {
      setOtpLoading(false);
      // Demo fallback
      if (otp === '111111') {
        if (accountType === 'volunteer') {
          const newVol = {
            id: `vol-${Date.now()}`,
            fullName: volFullName,
            email: volEmail,
            password: '123456',
            phone: volPhone,
            dob: volDob,
            address: volAddress,
            skills: volSkills,
            interests: volInterests,
            status: 'approved',
            totalHours: 0,
            completedActivitiesCount: 0,
            ratingAvg: 0,
            registeredAt: new Date().toISOString().split('T')[0]
          };
          setVolunteers((prev) => [newVol, ...prev]);
        } else {
          const newOrg = {
            id: `org-${Date.now()}`,
            name: orgName,
            email: orgEmail,
            password: '123456',
            phone: orgPhone,
            address: orgAddress,
            representative: orgRepresentative,
            type: orgType,
            licenseNumber: orgLicense,
            status: 'pending'
          };
          setOrganizations((prev) => [newOrg, ...prev]);
        }
        setSuccessInfo({
          type: accountType,
          name: accountType === 'volunteer' ? volFullName : orgName,
          email: accountType === 'volunteer' ? volEmail : orgEmail,
          autoLogin: accountType === 'volunteer'
        });
        setScreen(SCREEN.SUCCESS);
      } else {
        setOtpError('Mã xác minh không đúng. Vui lòng nhập mã thử nghiệm: 111111.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden animate-scale-up my-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">
              {screen === SCREEN.FORM && 'Đăng Ký Tài Khoản Mới'}
              {screen === SCREEN.OTP && 'Xác Minh Email'}
              {screen === SCREEN.SUCCESS && 'Đăng Ký Thành Công!'}
            </h3>
            <p className="text-xs text-slate-500">Gia nhập cộng đồng tình nguyện V-Connect</p>
          </div>
          <button onClick={handleClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ===== MÀN OTP ===== */}
        {screen === SCREEN.OTP && (
          <form onSubmit={handleOtpSubmit} className="p-6 space-y-4">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
              <KeyRound className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Mã xác minh đã được gửi!</p>
                <p className="mt-0.5">Vui lòng kiểm tra hộp thư của email <span className="font-bold">{pendingData?.email}</span> và nhập mã 6 chữ số.</p>
                <p className="mt-1 text-emerald-600 font-medium">📌 Demo: Mã xác minh mặc định là <span className="font-mono font-bold bg-emerald-100 px-1 rounded">111111</span></p>
              </div>
            </div>

            {otpError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{otpError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mã xác minh (6 chữ số):</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="_ _ _ _ _ _"
                className="w-full text-center text-2xl font-mono font-bold py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 tracking-[0.5em]"
              />
            </div>

            {accountType === 'organization' && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                ⚠️ Lưu ý: Với Đơn vị Tổ chức, sau khi xác minh mã OTP, hồ sơ pháp lý vẫn sẽ ở trạng thái <strong>Chờ Ban Quản trị phê duyệt</strong> trước khi có thể đăng tải hoạt động.
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setScreen(SCREEN.FORM); setOtp(''); setOtpError(''); }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
              >
                Quay Lại
              </button>
              <button
                type="submit"
                disabled={otpLoading || otp.length < 6}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{otpLoading ? 'Đang xác minh...' : 'Xác Nhận & Hoàn Tất'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ===== MÀN SUCCESS ===== */}
        {screen === SCREEN.SUCCESS && successInfo && (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-800">Đăng Ký Thành Công!</h4>
            <div className={`p-4 rounded-2xl border text-xs text-left space-y-2 ${
              successInfo.type === 'volunteer' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <p className="font-semibold">Chào mừng {successInfo.name}!</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-700">
                {successInfo.type === 'volunteer' ? (
                  <>
                    <li>Tài khoản Tình nguyện viên đã được kích hoạt thành công.</li>
                    <li>Email: <strong>{successInfo.email}</strong></li>
                    <li>Bạn có thể đăng nhập ngay với mật khẩu mặc định <strong>123456</strong> để tham gia các hoạt động thiện nguyện.</li>
                  </>
                ) : (
                  <>
                    <li>Hồ sơ tổ chức đã xác minh email thành công.</li>
                    <li>Email: <strong>{successInfo.email}</strong></li>
                    <li>Tài khoản đang ở trạng thái <strong>"Chờ duyệt"</strong> bởi Ban Quản trị để xác minh pháp lý. Sau khi Admin phê duyệt, tổ chức có thể đăng nhập để quản lý hoạt động.</li>
                  </>
                )}
              </ul>
            </div>
            <button
              onClick={() => { handleClose(); onSwitchToLogin(); }}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all cursor-pointer"
            >
              Đi Đến Trang Đăng Nhập
            </button>
          </div>
        )}

        {/* ===== MÀN FORM ĐĂNG KÝ ===== */}
        {screen === SCREEN.FORM && (
          <div>
            {/* Account Type Selector */}
            <div className="flex border-b border-slate-200 bg-slate-100/70 p-1 m-4 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAccountType('volunteer')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  accountType === 'volunteer' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Tôi là Tình Nguyện Viên</span>
              </button>
              <button
                type="button"
                onClick={() => setAccountType('organization')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  accountType === 'organization' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Đơn Vị / Tổ Chức</span>
              </button>
            </div>

            {errorMsg && (
              <div className="mx-5 mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 pt-0 max-h-[60vh] overflow-y-auto space-y-3.5 text-xs">
              {accountType === 'volunteer' ? (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Họ và tên *</label>
                    <input
                      type="text"
                      required
                      value={volFullName}
                      onChange={(e) => setVolFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        value={volEmail}
                        onChange={(e) => setVolEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Số điện thoại *</label>
                      <input
                        type="tel"
                        required
                        value={volPhone}
                        onChange={(e) => setVolPhone(e.target.value)}
                        placeholder="0987654321"
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Ngày sinh</label>
                      <input
                        type="date"
                        value={volDob}
                        onChange={(e) => setVolDob(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Địa chỉ thường trú</label>
                      <input
                        type="text"
                        value={volAddress}
                        onChange={(e) => setVolAddress(e.target.value)}
                        placeholder="Quận/Huyện, Tỉnh/TP"
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kỹ năng sở trường</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {volSkills.map((s) => (
                        <span key={s} className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1">
                          {s}
                          <button type="button" onClick={() => handleRemoveSkill(s)} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">×</button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={volNewSkill}
                        onChange={(e) => setVolNewSkill(e.target.value)}
                        placeholder="Thêm kỹ năng: Sơ cấp cứu, Dạy học, Tiếng Anh..."
                        className="flex-1 p-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold cursor-pointer"
                      >
                        Thêm
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Lĩnh vực thiện nguyện quan tâm</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {categories.map((c) => (
                        <label
                          key={c.id}
                          className={`p-2 rounded-xl border text-[11px] font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                            volInterests.includes(c.name) ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={volInterests.includes(c.name)}
                            onChange={() => toggleInterest(c.name)}
                            className="rounded text-emerald-600"
                          />
                          <span className="truncate">{c.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Giới thiệu ngắn (Bio)</label>
                    <textarea
                      rows={2}
                      value={volBio}
                      onChange={(e) => setVolBio(e.target.value)}
                      placeholder="Chia sẻ lý do và mong muốn tham gia các hoạt động thiện nguyện..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tên tổ chức / Đơn vị *</label>
                    <input
                      type="text"
                      required
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="VD: Quỹ Vì Tầm Vóc Việt, CLB Tình Nguyện Trẻ..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Loại hình tổ chức</label>
                      <select
                        value={orgType}
                        onChange={(e) => setOrgType(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                      >
                        <option>Tổ chức phi lợi nhuận (NGO)</option>
                        <option>Tổ chức xã hội - nhân đạo</option>
                        <option>Câu lạc bộ sinh viên / Đoàn hội</option>
                        <option>Doanh nghiệp xã hội (CSR)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Số giấy phép / Quyết định *</label>
                      <input
                        type="text"
                        required
                        value={orgLicense}
                        onChange={(e) => setOrgLicense(e.target.value)}
                        placeholder="GP-892/BNV-2021 hoặc QĐ-CLB..."
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Người đại diện pháp lý *</label>
                      <input
                        type="text"
                        required
                        value={orgRepresentative}
                        onChange={(e) => setOrgRepresentative(e.target.value)}
                        placeholder="Họ tên người đại diện"
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Số điện thoại liên hệ *</label>
                      <input
                        type="tel"
                        required
                        value={orgPhone}
                        onChange={(e) => setOrgPhone(e.target.value)}
                        placeholder="02839998888"
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Email tổ chức *</label>
                      <input
                        type="email"
                        required
                        value={orgEmail}
                        onChange={(e) => setOrgEmail(e.target.value)}
                        placeholder="contact@organization.org"
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Website / Fanpage</label>
                      <input
                        type="url"
                        value={orgWebsite}
                        onChange={(e) => setOrgWebsite(e.target.value)}
                        placeholder="https://organization.vn"
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Địa chỉ trụ sở chính *</label>
                    <input
                      type="text"
                      required
                      value={orgAddress}
                      onChange={(e) => setOrgAddress(e.target.value)}
                      placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố"
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Mô tả tôn chỉ hoạt động</label>
                    <textarea
                      rows={2}
                      value={orgDescription}
                      onChange={(e) => setOrgDescription(e.target.value)}
                      placeholder="Giới thiệu sứ mệnh, các chương trình thiện nguyện đã và đang thực hiện..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 rounded-xl font-bold text-white shadow-md transition-all cursor-pointer ${
                  accountType === 'volunteer' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Đang gửi...' : 'Tiếp Tục Xác Minh Mã OTP'}
              </button>
            </form>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-600">
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToLogin();
                }}
                className="text-emerald-600 hover:text-emerald-700 font-bold underline cursor-pointer"
              >
                Đăng nhập ngay
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
