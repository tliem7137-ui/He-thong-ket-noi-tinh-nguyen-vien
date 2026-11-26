import React, { useState } from 'react';
import { useApp } from '../../context/useApp';
import { ActivityCard } from '../../components/ActivityCard';
import { CertificateModal } from '../../components/CertificateModal';
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
  Star,
  User,
  Lock
} from 'lucide-react';

const VolunteerProfileSection = ({ currentUser, onSaveProfile, onChangePassword }) => {
  const [editFullName, setEditFullName] = useState(currentUser?.fullName || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editAddress, setEditAddress] = useState(currentUser?.address || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editSkills, setEditSkills] = useState(currentUser?.skills || []);
  const [newSkillInput, setNewSkillInput] = useState('');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !editSkills.includes(newSkillInput.trim())) {
      setEditSkills([...editSkills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setEditSkills(editSkills.filter((s) => s !== skill));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    onSaveProfile(currentUser.id, {
      fullName: editFullName,
      phone: editPhone,
      address: editAddress,
      bio: editBio,
      skills: editSkills
    });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError('');
    if (newPassword.length < 6) {
      setPwdError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setPwdSaving(true);
    const res = await onChangePassword(oldPassword, newPassword);
    setPwdSaving(false);
    if (res?.success) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else if (res?.error) {
      setPwdError(res.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="vv-card p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="font-bold text-[#0d530e] text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-[#0d530e]" />
            Quản Lý Hồ Sơ Cá Nhân &amp; Kỹ Năng
          </h3>
          <p className="text-xs text-[#5a6b5c] mt-0.5">
            Hồ sơ đầy đủ giúp đơn vị tổ chức dễ dàng đánh giá mức độ phù hợp khi xét duyệt đăng ký
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs max-w-2xl">
          <div>
            <label className="block font-semibold text-[#1f2d20] mb-1.5">Họ và tên</label>
            <input
              type="text"
              value={editFullName}
              onChange={(e) => setEditFullName(e.target.value)}
              className="vv-input w-full p-2.5"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#1f2d20] mb-1.5">Số điện thoại</label>
              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="vv-input w-full p-2.5"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1f2d20] mb-1.5">Địa chỉ thường trú</label>
              <input
                type="text"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="vv-input w-full p-2.5"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#1f2d20] mb-1.5">Kỹ năng chuyên môn &amp; tình nguyện</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {editSkills.map((s) => (
                <span key={s} className="bg-[#e8f2ed] text-[#0d530e] px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-[#0d530e]/15">
                  {s}
                  <button type="button" onClick={() => handleRemoveSkill(s)} className="text-[#437b62] hover:text-[#0d530e] cursor-pointer">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Thêm kỹ năng: Dạy tiếng Anh, Quay phim, Lái xe..."
                className="vv-input flex-1 px-3 py-2"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="vv-btn-forest px-5 py-2 font-bold cursor-pointer"
              >
                Thêm
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#1f2d20] mb-1.5">Giới thiệu ngắn (Bio)</label>
            <textarea
              rows={3}
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              className="vv-input w-full p-2.5"
            />
          </div>

          <button
            type="submit"
            className="vv-btn-primary px-7 py-2.5 font-bold shadow-sm cursor-pointer"
          >
            Lưu Thay Đổi Hồ Sơ
          </button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="vv-card p-6 sm:p-8 space-y-4">
        <div>
          <h3 className="font-bold text-[#0d530e] text-base flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#0d530e]" />
            Đổi Mật Khẩu Đăng Nhập
          </h3>
          <p className="text-xs text-[#5a6b5c] mt-0.5">Cập nhật mật khẩu định kỳ để bảo vệ tài khoản của bạn</p>
        </div>

        {pwdError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs max-w-md">
            {pwdError}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs max-w-md">
          <div>
            <label className="block font-semibold text-[#1f2d20] mb-1">Mật khẩu hiện tại *</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              className="vv-input w-full p-2.5"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#1f2d20] mb-1">Mật khẩu mới *</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                className="vv-input w-full p-2.5"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1f2d20] mb-1">Xác nhận mật khẩu *</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                className="vv-input w-full p-2.5"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={pwdSaving}
            className="vv-btn-forest px-6 py-2.5 font-bold disabled:opacity-50 shadow-sm cursor-pointer"
          >
            {pwdSaving ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
};

export const VolunteerDashboard = ({
  activeSubTab = 'overview',
  setActiveSubTab,
  onSelectActivity
}) => {
  const {
    currentUser,
    activities,
    registrations,
    volunteerEvaluations,
    cancelRegistration,
    confirmVolunteerAttendance,
    updateVolunteerProfile,
    changePassword,
    submitFeedback
  } = useApp();

  const [selectedCertReg, setSelectedCertReg] = useState(null);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackTarget, setFeedbackTarget] = useState('system');

  // My registrations
  const myRegistrations = registrations.filter(
    (r) => r.volunteerId === currentUser?.id && r.status !== 'cancelled'
  );

  const pendingRegs = myRegistrations.filter((r) => r.status === 'pending');
  const approvedRegs = myRegistrations.filter((r) => r.status === 'approved' && r.attendanceStatus !== 'present');
  const completedRegs = myRegistrations.filter((r) => r.attendanceStatus === 'present');

  // Active calendar registrations (exclude rejected, sort by activity startDate)
  const calendarRegs = myRegistrations
    .filter((r) => r.status === 'pending' || r.status === 'approved')
    .sort((a, b) => {
      const actA = activities.find((act) => act.id === a.activityId);
      const actB = activities.find((act) => act.id === b.activityId);
      const timeA = actA ? new Date(actA.startDate).getTime() : 0;
      const timeB = actB ? new Date(actB.startDate).getTime() : 0;
      return timeA - timeB;
    });

  // Volunteer evaluations from organizations
  const myEvaluations = volunteerEvaluations.filter((e) => e.volunteerId === currentUser?.id);

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackTitle.trim() || !feedbackContent.trim()) return;
    submitFeedback(feedbackTitle, feedbackContent, feedbackTarget);
    setFeedbackTitle('');
    setFeedbackContent('');
  };

  return (
    <div className="space-y-7 pb-16">
      {/* Account Pending Banner if user is not approved */}
      {currentUser?.status === 'pending' && (
        <div className="bg-[#fef8e6] border border-[#eaae1a]/50 p-4 rounded-2xl flex items-start gap-3 text-[#735104] text-xs">
          <Clock className="w-5 h-5 text-[#d49b11] shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-sm text-[#735104]">Tài Khoản Đang Chờ Quản Trị Viên Phê Duyệt</h4>
            <p className="mt-0.5 text-[#6d4c05] leading-relaxed">
              Tài khoản của bạn vừa được khởi tạo và đang trong danh sách chờ duyệt bởi Ban Quản trị.
              Bạn có thể cập nhật hồ sơ cá nhân và tìm hiểu các hoạt động. Sau khi được duyệt, bạn sẽ có thể đăng ký tham gia các chiến dịch.
            </p>
          </div>
        </div>
      )}

      {/* Profile Header & KPI Cards */}
      <div className="vv-card overflow-hidden">
        <div className="h-1.5 w-full vv-cta-banner" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#e8f2ed]">
            <div className="flex items-center gap-4">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={currentUser?.fullName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-[3px] ring-[#0d530e] shadow-md"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#0d530e]">
                    {currentUser?.fullName}
                  </h1>
                  <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full ${
                    currentUser?.status === 'approved'
                      ? 'bg-[#e8f2ed] text-[#0d530e] border border-[#0d530e]/20'
                      : 'bg-[#fef8e6] text-[#8a6100] border border-[#eaae1a]/40'
                  }`}>
                    {currentUser?.status === 'approved' ? '✓ Đã Xác Thực' : '⏳ Chờ Duyệt'}
                  </span>
                </div>
                <p className="text-xs text-[#5a6b5c] mt-1">{currentUser?.email} • {currentUser?.phone}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {currentUser?.skills?.map((s) => (
                    <span key={s} className="bg-[#f5f9f7] text-[#2d5543] border border-[#0d530e]/12 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setActiveSubTab('profile')}
                className="vv-btn-outline px-4 py-2 text-xs font-bold cursor-pointer"
              >
                Chỉnh Sửa Hồ Sơ
              </button>
              <button
                onClick={() => setActiveSubTab('feedback')}
                className="vv-btn-primary px-4 py-2.5 text-xs font-bold shadow-xs cursor-pointer"
              >
                Gửi Phản Hồi
              </button>
            </div>
          </div>

          {/* 4 KPIs styled as Incredible Numbers */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
            <div className="vv-stat-card p-5">
              <div className="flex items-center justify-between text-[#5a6b5c] mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider">Tổng Giờ Công</span>
                <Award className="w-5 h-5 text-[#eaae1a]" />
              </div>
              <div className="text-3xl font-extrabold text-[#0d530e]">
                {currentUser?.totalHours || 0} <span className="text-sm font-semibold text-[#5a6b5c]">giờ</span>
              </div>
              <span className="text-[11px] text-[#437b62] mt-1 block">Đã được tổ chức xác nhận</span>
            </div>

            <div className="vv-stat-card p-5">
              <div className="flex items-center justify-between text-[#5a6b5c] mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider">Đã Hoàn Thành</span>
                <CheckCircle2 className="w-5 h-5 text-[#0d530e]" />
              </div>
              <div className="text-3xl font-extrabold text-[#0d530e]">
                {completedRegs.length} <span className="text-sm font-semibold text-[#5a6b5c]">hoạt động</span>
              </div>
              <span className="text-[11px] text-[#437b62] mt-1 block">Điểm danh có mặt đầy đủ</span>
            </div>

            <div className="vv-stat-card p-5">
              <div className="flex items-center justify-between text-[#5a6b5c] mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider">Đánh Giá Từ BTC</span>
                <Star className="w-5 h-5 text-[#eaae1a] fill-[#eaae1a]" />
              </div>
              <div className="text-3xl font-extrabold text-[#0d530e]">
                {currentUser?.ratingAvg ? `${currentUser.ratingAvg}/5.0` : '5.0/5.0'}
              </div>
              <span className="text-[11px] text-[#437b62] mt-1 block">Từ {myEvaluations.length} lượt đánh giá</span>
            </div>

            <div className="vv-stat-card p-5">
              <div className="flex items-center justify-between text-[#5a6b5c] mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider">Đang Chờ / Sắp Tới</span>
                <Clock className="w-5 h-5 text-[#d49b11]" />
              </div>
              <div className="text-3xl font-extrabold text-[#0d530e]">
                {pendingRegs.length + approvedRegs.length} <span className="text-sm font-semibold text-[#5a6b5c]">chiến dịch</span>
              </div>
              <span className="text-[11px] text-[#437b62] mt-1 block">
                {approvedRegs.length} đã duyệt, {pendingRegs.length} chờ duyệt
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="vv-card p-1.5 flex overflow-x-auto text-xs font-semibold gap-1">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2.5 rounded-full transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'overview' ? 'bg-[#0d530e] text-white shadow-xs' : 'text-[#5a6b5c] hover:text-[#0d530e] hover:bg-[#f5f9f7]'
          }`}
        >
          Tổng Quan Hoạt Động
        </button>
        <button
          onClick={() => setActiveSubTab('my_activities')}
          className={`px-4 py-2.5 rounded-full transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'my_activities' ? 'bg-[#0d530e] text-white shadow-xs' : 'text-[#5a6b5c] hover:text-[#0d530e] hover:bg-[#f5f9f7]'
          }`}
        >
          <span>Đã Đăng Ký</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            activeSubTab === 'my_activities' ? 'bg-[#eaae1a] text-[#14251c]' : 'bg-[#e8f2ed] text-[#0d530e]'
          }`}>
            {myRegistrations.length}
          </span>
        </button>
        <button
          onClick={() => setActiveSubTab('calendar')}
          className={`px-4 py-2.5 rounded-full transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'calendar' ? 'bg-[#0d530e] text-white shadow-xs' : 'text-[#5a6b5c] hover:text-[#0d530e] hover:bg-[#f5f9f7]'
          }`}
        >
          Lịch Trình Tình Nguyện
        </button>
        <button
          onClick={() => setActiveSubTab('history_cert')}
          className={`px-4 py-2.5 rounded-full transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'history_cert' ? 'bg-[#0d530e] text-white shadow-xs' : 'text-[#5a6b5c] hover:text-[#0d530e] hover:bg-[#f5f9f7]'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Chứng Nhận Giờ Công ({currentUser?.totalHours || 0}h)</span>
        </button>
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`px-4 py-2.5 rounded-full transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'profile' ? 'bg-[#0d530e] text-white shadow-xs' : 'text-[#5a6b5c] hover:text-[#0d530e] hover:bg-[#f5f9f7]'
          }`}
        >
          Hồ Sơ &amp; Kỹ Năng
        </button>
        <button
          onClick={() => setActiveSubTab('feedback')}
          className={`px-4 py-2.5 rounded-full transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'feedback' ? 'bg-[#0d530e] text-white shadow-xs' : 'text-[#5a6b5c] hover:text-[#0d530e] hover:bg-[#f5f9f7]'
          }`}
        >
          Phản Hồi &amp; Khiếu Nại
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {approvedRegs.length > 0 && (
            <div className="vv-section-mint rounded-2xl p-6 border border-[#0d530e]/20">
              <h3 className="font-bold text-[#0d530e] text-base mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#0d530e]" />
                Hoạt Động Sắp Tới Đã Được Chấp Thuận
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {approvedRegs.map((reg) => {
                  const act = activities.find((a) => a.id === reg.activityId);
                  return (
                    <div key={reg.id} className="bg-white p-4 rounded-2xl border border-[#0d530e]/15 shadow-xs space-y-3">
                      <div>
                        <span className="text-[11px] font-bold text-[#0d530e] bg-[#e8f2ed] px-2.5 py-0.5 rounded-full">
                          Đã Duyệt Tham Gia
                        </span>
                        <h4 className="font-bold text-sm text-[#1f2d20] mt-1.5 line-clamp-1">{reg.activityTitle}</h4>
                        <p className="text-xs text-[#5a6b5c] mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#d49b11]" />
                          <span>{act ? act.locationName : 'Việt Nam'} - {act?.specificAddress}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2.5 border-t border-[#e8f2ed]">
                        {reg.confirmedByVolunteer ? (
                          <span className="text-[#0d530e] font-semibold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Đã xác nhận sẵn sàng
                          </span>
                        ) : (
                          <button
                            onClick={() => confirmVolunteerAttendance(reg.id)}
                            className="vv-btn-forest px-4 py-1.5 font-semibold text-xs cursor-pointer"
                          >
                            Xác nhận sẽ tham gia
                          </button>
                        )}

                        <button
                          onClick={() => act && onSelectActivity(act)}
                          className="text-xs text-[#0d530e] hover:text-[#d49b11] font-semibold underline cursor-pointer"
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {myEvaluations.length > 0 && (
            <div className="vv-card p-6">
              <h3 className="font-bold text-[#0d530e] text-base mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-[#eaae1a] fill-[#eaae1a]" />
                Nhận Xét &amp; Đánh Giá Từ Đơn Vị Tổ Chức ({myEvaluations.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {myEvaluations.map((ev) => (
                  <div key={ev.id} className="p-4 rounded-2xl bg-[#f7f9f7] border border-[#0d530e]/15 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0d530e]">Đơn vị tổ chức đánh giá</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: ev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-[#eaae1a] text-[#eaae1a]" />
                        ))}
                      </div>
                    </div>
                    <p className="text-[#555555] italic">&quot;{ev.feedback}&quot;</p>
                    <span className="text-[10px] text-[#609f84] block pt-1">{ev.createdAt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-[#0d530e] text-lg">Hoạt Động Gợi Ý Cho Bạn</h3>
                <p className="text-xs text-[#5a6b5c]">Dựa trên các lĩnh vực quan tâm và kỹ năng trong hồ sơ</p>
              </div>
              <button
                onClick={() => setActiveSubTab('explore')}
                className="text-xs text-[#0d530e] hover:text-[#d49b11] font-bold cursor-pointer transition-colors"
              >
                Xem tất cả hoạt động →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activities
                .filter((a) => a.approvalStatus === 'approved' && a.status === 'recruiting')
                .slice(0, 3)
                .map((act) => (
                  <ActivityCard key={act.id} activity={act} onSelect={onSelectActivity} />
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY REGISTRATIONS */}
      {activeSubTab === 'my_activities' && (
        <div className="vv-card p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="font-bold text-[#0d530e] text-lg">Danh Sách Hoạt Động Của Bạn</h3>
            <p className="text-xs text-[#5a6b5c] mt-0.5">
              Quản lý các trạng thái đăng ký: Chờ duyệt, Đã duyệt, Hoàn thành và Từ chối
            </p>
          </div>

          <div className="space-y-3">
            {myRegistrations.length === 0 ? (
              <div className="text-center py-12 text-[#5a6b5c] text-xs">
                Bạn chưa đăng ký hoạt động nào. Hãy khám phá và tham gia ngay!
              </div>
            ) : (
              myRegistrations.map((reg) => {
                const act = activities.find((a) => a.id === reg.activityId);
                return (
                  <div
                    key={reg.id}
                    className="p-4 rounded-2xl border border-[#e8f2ed] bg-[#f7f9f7] hover:bg-[#f2f7f4] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          reg.status === 'approved' ? 'bg-[#e8f2ed] text-[#0d530e]' :
                          reg.status === 'pending' ? 'bg-[#fef8e6] text-[#8a6100]' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {reg.status === 'approved' ? '✓ Đã Duyệt' :
                           reg.status === 'pending' ? '⏳ Chờ Xét Duyệt' : 'Bị Từ Chối'}
                        </span>
                        {reg.attendanceStatus === 'present' && (
                          <span className="text-[11px] font-bold bg-[#0d530e] text-white px-2.5 py-0.5 rounded-full">
                            ✓ Có Mặt (+{reg.hoursConfirmed}h)
                          </span>
                        )}
                        <span className="text-[11px] text-[#5a6b5c]">Đăng ký ngày {reg.registeredDate}</span>
                      </div>

                      <h4 className="font-bold text-sm text-[#1f2d20]">{reg.activityTitle}</h4>
                      <p className="text-xs text-[#555555]">Lời nhắn: &quot;{reg.message}&quot;</p>
                      {reg.status === 'rejected' && reg.orgRejectReason && (
                        <p className="text-[11px] text-rose-600 font-medium">Lý do từ chối: {reg.orgRejectReason}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-end sm:self-center shrink-0">
                      {(reg.status === 'pending' || (reg.status === 'approved' && reg.attendanceStatus === 'not_yet')) && (
                        <button
                          onClick={() => cancelRegistration(reg.id)}
                          className="px-3.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-full font-semibold border border-rose-200 transition-colors cursor-pointer"
                        >
                          Hủy Đăng Ký
                        </button>
                      )}

                      {reg.attendanceStatus === 'present' && (
                        <button
                          onClick={() => setSelectedCertReg(reg)}
                          className="vv-btn-gold px-3.5 py-1.5 text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Xem Chứng Nhận</span>
                        </button>
                      )}

                      <button
                        onClick={() => act && onSelectActivity(act)}
                        className="px-4 py-1.5 text-xs bg-white hover:bg-[#e8f2ed] text-[#0d530e] rounded-full font-semibold border border-[#0d530e]/25 transition-colors cursor-pointer"
                      >
                        Chi Tiết
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CALENDAR */}
      {activeSubTab === 'calendar' && (
        <div className="vv-card p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="font-bold text-[#0d530e] text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#0d530e]" />
              Lịch Trình Hoạt Động Đã Đăng Ký
            </h3>
            <p className="text-xs text-[#5a6b5c] mt-0.5">
              Giúp bạn quản lý thời gian biểu và phòng ngừa xung đột lịch trình (Quy trình 4c)
            </p>
          </div>

          {calendarRegs.length === 0 ? (
            <div className="text-center py-12 text-[#5a6b5c] text-xs">
              Chưa có hoạt động nào trong lịch trình sắp tới.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {calendarRegs.map((reg) => {
                const act = activities.find((a) => a.id === reg.activityId);
                return (
                  <div key={reg.id} className="p-4 rounded-2xl border border-[#0d530e]/15 bg-[#f7f9f7] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#0d530e] flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {act ? new Date(act.startDate).toLocaleDateString('vi-VN') : 'Đang cập nhật'}
                      </span>
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        reg.status === 'approved' ? 'bg-[#e8f2ed] text-[#0d530e]' : 'bg-[#fef8e6] text-[#8a6100]'
                      }`}>
                        {reg.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-[#1f2d20]">{reg.activityTitle}</h4>
                    <div className="text-xs text-[#555555] space-y-1">
                      <p>📍 {act?.locationName} - {act?.specificAddress}</p>
                      <p>⏰ {act ? `${new Date(act.startDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${new Date(act.endDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : ''}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: HISTORY & CERTIFICATE */}
      {activeSubTab === 'history_cert' && (
        <div className="vv-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-[#0d530e] text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-[#d49b11]" />
                Hồ Sơ Giờ Công &amp; Giấy Chứng Nhận Điện Tử
              </h3>
              <p className="text-xs text-[#5a6b5c] mt-0.5">
                Lưu trữ minh bạch toàn bộ các hoạt động đã tham gia và được điểm danh
              </p>
            </div>
            <div className="bg-[#fef8e6] border border-[#eaae1a]/45 px-4 py-2 rounded-full text-xs font-bold text-[#735104]">
              Tổng tích lũy: {currentUser?.totalHours || 0} Giờ Công
            </div>
          </div>

          {completedRegs.length === 0 ? (
            <div className="text-center py-12 text-[#5a6b5c] text-xs">
              Chưa có hoạt động nào được xác nhận hoàn thành. Hãy tham gia và nhận điểm danh từ Ban tổ chức!
            </div>
          ) : (
            <div className="space-y-3">
              {completedRegs.map((reg) => {
                const act = activities.find((a) => a.id === reg.activityId);
                return (
                  <div
                    key={reg.id}
                    className="p-4 rounded-2xl border border-[#0d530e]/20 bg-[#f5f9f7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold bg-[#0d530e] text-white px-2.5 py-0.5 rounded-full">
                          +{reg.hoursConfirmed} Giờ Công
                        </span>
                        <span className="text-xs text-[#5a6b5c]">{act?.organizationName}</span>
                      </div>
                      <h4 className="font-bold text-sm text-[#1f2d20]">{reg.activityTitle}</h4>
                      <span className="text-[11px] text-[#5a6b5c]">Tham gia thành công vào {reg.registeredDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedCertReg(reg)}
                        className="vv-btn-gold px-5 py-2 font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Award className="w-4 h-4" />
                        <span>Xem &amp; In Giấy Chứng Nhận</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PROFILE EDIT & PASSWORD */}
      {activeSubTab === 'profile' && (
        <VolunteerProfileSection
          key={currentUser?.id || 'vol-profile'}
          currentUser={currentUser}
          onSaveProfile={updateVolunteerProfile}
          onChangePassword={changePassword}
        />
      )}

      {/* TAB 6: FEEDBACK & COMPLAINTS */}
      {activeSubTab === 'feedback' && (
        <div className="vv-card p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="font-bold text-[#0d530e] text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#0d530e]" />
              Gửi Ý Kiến Phản Hồi / Khiếu Nại (Chức năng 14)
            </h3>
            <p className="text-xs text-[#5a6b5c] mt-0.5">
              Góp ý về hệ thống, phản ánh chất lượng tổ chức hoặc báo cáo vấn đề trong quá trình tham gia hoạt động
            </p>
          </div>

          <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs max-w-xl">
            <div>
              <label className="block font-semibold text-[#1f2d20] mb-1.5">Loại phản ánh:</label>
              <select
                value={feedbackTarget}
                onChange={(e) => setFeedbackTarget(e.target.value)}
                className="vv-input w-full p-2.5"
              >
                <option value="system">Góp ý phát triển hệ thống V-Connect</option>
                <option value="organization">Phản ánh về Đơn vị tổ chức</option>
                <option value="activity">Khiếu nại về công tác tổ chức / điểm danh</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#1f2d20] mb-1.5">Tiêu đề phản ánh *</label>
              <input
                type="text"
                required
                value={feedbackTitle}
                onChange={(e) => setFeedbackTitle(e.target.value)}
                placeholder="VD: Cần cập nhật lại số giờ công hoạt động..."
                className="vv-input w-full p-2.5"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1f2d20] mb-1.5">Nội dung chi tiết *</label>
              <textarea
                rows={4}
                required
                value={feedbackContent}
                onChange={(e) => setFeedbackContent(e.target.value)}
                placeholder="Mô tả cụ thể sự việc, thời gian và đề xuất hướng xử lý..."
                className="vv-input w-full p-2.5"
              />
            </div>

            <button
              type="submit"
              className="vv-btn-primary px-7 py-2.5 font-bold shadow-sm cursor-pointer"
            >
              Gửi Phản Hồi Tới Ban Quản Trị
            </button>
          </form>
        </div>
      )}

      {/* Certificate Modal */}
      {selectedCertReg && (
        <CertificateModal
          registration={selectedCertReg}
          activity={activities.find((a) => a.id === selectedCertReg.activityId)}
          volunteer={currentUser}
          isOpen={!!selectedCertReg}
          onClose={() => setSelectedCertReg(null)}
        />
      )}
    </div>
  );
};
