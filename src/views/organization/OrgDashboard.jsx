import React, { useState } from 'react';
import { useApp } from '../../context/useApp';
import { useModalClose } from '../../hooks/useModalClose';
import {
  Building,
  PlusCircle,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Star,
  FileText,
  TrendingUp,
  Lock,
  Edit3,
  Search,
  AlertTriangle
} from 'lucide-react';

const OrgProfileSection = ({ currentUser, onSaveProfile, onChangePassword }) => {
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editAddress, setEditAddress] = useState(currentUser?.address || '');
  const [editRepresentative, setEditRepresentative] = useState(currentUser?.representative || '');
  const [editWebsite, setEditWebsite] = useState(currentUser?.website || '');
  const [editDescription, setEditDescription] = useState(currentUser?.description || '');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);

  const handleOrgProfileSave = (e) => {
    e.preventDefault();
    onSaveProfile(currentUser.id, {
      name: editName,
      phone: editPhone,
      address: editAddress,
      representative: editRepresentative,
      website: editWebsite,
      description: editDescription
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
            <Building className="w-5 h-5 text-[#1b5e3a]" />
            Thông Tin Đơn Vị Tổ Chức (Chức năng 4)
          </h3>
          <p className="text-xs text-[#5a6b5c] mt-0.5">
            Thông tin công khai giúp tạo dựng uy tín với cộng đồng tình nguyện viên
          </p>
        </div>

        <form onSubmit={handleOrgProfileSave} className="space-y-4 text-xs max-w-2xl">
          <div>
            <label className="block font-semibold text-[#1f2d20] mb-1.5">Tên tổ chức</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="vv-input w-full p-2.5"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#1f2d20] mb-1.5">Người đại diện</label>
              <input
                type="text"
                value={editRepresentative}
                onChange={(e) => setEditRepresentative(e.target.value)}
                className="vv-input w-full p-2.5"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1f2d20] mb-1.5">Số điện thoại liên hệ</label>
              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="vv-input w-full p-2.5"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#1f2d20] mb-1.5">Địa chỉ trụ sở</label>
            <input
              type="text"
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
              className="vv-input w-full p-2.5"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#1f2d20] mb-1.5">Website</label>
            <input
              type="text"
              value={editWebsite}
              onChange={(e) => setEditWebsite(e.target.value)}
              className="vv-input w-full p-2.5"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#1f2d20] mb-1.5">Mô tả tôn chỉ &amp; mục tiêu</label>
            <textarea
              rows={3}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="vv-input w-full p-2.5"
            />
          </div>

          <button
            type="submit"
            className="vv-btn-primary px-7 py-2.5 font-bold shadow-sm cursor-pointer"
          >
            Lưu Thông Tin Tổ Chức
          </button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="vv-card p-6 sm:p-8 space-y-4">
        <div>
          <h3 className="font-bold text-[#0d530e] text-base flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#1b5e3a]" />
            Đổi Mật Khẩu Tài Khoản Tổ Chức
          </h3>
          <p className="text-xs text-[#5a6b5c] mt-0.5">Bảo vệ tài khoản quản lý chiến dịch của đơn vị</p>
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

export const OrgDashboard = ({
  activeSubTab = 'overview',
  setActiveSubTab,
  onOpenCreateActivity,
  onEditActivity,
  onSelectActivity
}) => {
  const {
    currentUser,
    activities,
    registrations,
    volunteers,
    reviews,
    cancelActivity,
    toggleActivityRecruiting,
    approveRegistration,
    rejectRegistration,
    markAttendance,
    completeActivity,
    submitVolunteerEvaluation,
    updateOrgProfile,
    changePassword,
    sendActivityNotificationToVolunteers
  } = useApp();

  // Selected state for dialogs
  const [selectedActivityForAttendance, setSelectedActivityForAttendance] = useState(null);
  const [selectedVolForEval, setSelectedVolForEval] = useState(null);
  const [evalRating, setEvalRating] = useState(5);
  const [evalComment, setEvalComment] = useState('Bạn tham gia rất nhiệt tình và trách nhiệm.');

  const [selectedActForNotify, setSelectedActForNotify] = useState(null);
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyContent, setNotifyContent] = useState('');

  const [rejectModalData, setRejectModalData] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const [cancelModalAct, setCancelModalAct] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // Search & filter state for Registrations tab
  const [regSearch, setRegSearch] = useState('');
  const [regActivityFilter, setRegActivityFilter] = useState('all');
  const [regStatusFilter, setRegStatusFilter] = useState('all');

  const closeRejectModal = () => {
    setRejectModalData(null);
    setRejectReason('');
  };

  const closeCancelModal = () => {
    setCancelModalAct(null);
    setCancelReason('');
  };

  const closeNotifyModal = () => {
    setSelectedActForNotify(null);
    setNotifyTitle('');
    setNotifyContent('');
  };

  const closeEvalModal = () => {
    setSelectedVolForEval(null);
    setEvalComment('Bạn tham gia rất nhiệt tình và trách nhiệm.');
  };

  const { handleBackdropClick: handleRejectBackdrop } = useModalClose(!!rejectModalData, closeRejectModal);
  const { handleBackdropClick: handleCancelBackdrop } = useModalClose(!!cancelModalAct, closeCancelModal);
  const { handleBackdropClick: handleNotifyBackdrop } = useModalClose(!!selectedActForNotify, closeNotifyModal);
  const { handleBackdropClick: handleEvalBackdrop } = useModalClose(!!selectedVolForEval, closeEvalModal);

  // Filter activities belonging to current organization
  const orgActivities = activities.filter((a) => a.organizationId === currentUser?.id);
  const orgActivityIds = orgActivities.map((a) => a.id);

  // Filter registrations belonging to this organization's activities
  const orgRegistrations = registrations.filter((r) => orgActivityIds.includes(r.activityId));
  const pendingRegs = orgRegistrations.filter((r) => r.status === 'pending');
  const approvedRegs = orgRegistrations.filter((r) => r.status === 'approved');
  const presentRegs = orgRegistrations.filter((r) => r.attendanceStatus === 'present');

  const filteredOrgRegistrations = orgRegistrations.filter((reg) => {
    const q = regSearch.trim().toLowerCase();
    const matchSearch =
      !q ||
      (reg.volunteerName || '').toLowerCase().includes(q) ||
      (reg.volunteerEmail || '').toLowerCase().includes(q) ||
      (reg.volunteerPhone || '').toLowerCase().includes(q) ||
      (reg.activityTitle || '').toLowerCase().includes(q);
    const matchActivity = regActivityFilter === 'all' || reg.activityId === regActivityFilter;
    const matchStatus = regStatusFilter === 'all' || reg.status === regStatusFilter;
    return matchSearch && matchActivity && matchStatus;
  });

  // Reviews received by this organization
  const orgReviews = reviews.filter((r) => r.organizationId === currentUser?.id);
  const orgAvgRating = orgReviews.length
    ? (orgReviews.reduce((acc, r) => acc + r.rating, 0) / orgReviews.length).toFixed(1)
    : '5.0';

  const approvalRate = orgRegistrations.length
    ? Math.round((approvedRegs.length / orgRegistrations.length) * 100)
    : 0;

  const getActivityStatusBadge = (act) => {
    switch (act.status) {
      case 'recruiting':
        return { text: 'Đang tuyển TNV', cls: 'bg-[#e8f2ed] text-[#0d530e] border border-[#0d530e]/20' };
      case 'completed':
        return { text: 'Đã hoàn thành', cls: 'bg-[#f5f9f7] text-[#5a6b5c] border border-[#d2d2d7]' };
      case 'cancelled':
        return { text: 'Đã hủy', cls: 'bg-rose-50 text-rose-700 border border-rose-200' };
      case 'pending_approval':
        return { text: 'Chưa mở tuyển', cls: 'bg-[#fef8e6] text-[#8a6100] border border-[#eaae1a]/45' };
      case 'rejected':
        return { text: 'Không được duyệt', cls: 'bg-rose-50 text-rose-700 border border-rose-200' };
      default:
        return { text: 'Đã đủ / Đóng tuyển', cls: 'bg-[#fef8e6] text-[#8a6100] border border-[#eaae1a]/45' };
    }
  };

  const getRegStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return { text: '✓ Đã Duyệt', cls: 'bg-[#e8f2ed] text-[#0d530e]', note: '✓ Đã gửi thông báo chấp thuận' };
      case 'pending':
        return { text: '⏳ Chờ Duyệt', cls: 'bg-[#fef8e6] text-[#8a6100]', note: '' };
      case 'cancelled':
        return { text: 'TNV Đã Hủy', cls: 'bg-[#f5f9f7] text-[#5a6b5c]', note: 'TNV đã tự hủy đăng ký' };
      default:
        return { text: 'Bị Từ Chối', cls: 'bg-rose-100 text-rose-800', note: 'Đã từ chối' };
    }
  };

  const handleSendNotification = (e) => {
    e.preventDefault();
    if (!notifyTitle.trim() || !notifyContent.trim() || !selectedActForNotify) return;
    sendActivityNotificationToVolunteers(selectedActForNotify.id, notifyTitle, notifyContent);
    closeNotifyModal();
  };

  const handleConfirmReject = () => {
    if (!rejectModalData || !rejectReason.trim()) return;
    rejectRegistration(rejectModalData.regId, rejectReason.trim());
    closeRejectModal();
  };

  const handleConfirmCancelActivity = () => {
    if (!cancelModalAct || !cancelReason.trim()) return;
    cancelActivity(cancelModalAct.id, cancelReason.trim());
    closeCancelModal();
  };

  const handleEvalSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVolForEval) return;
    const res = await submitVolunteerEvaluation(
      selectedVolForEval.activityId,
      selectedVolForEval.volunteer.id,
      evalRating,
      evalComment
    );
    if (res?.success) {
      closeEvalModal();
    }
  };

  return (
    <div className="space-y-7 pb-16">
      {/* Account Pending Banner if Org is not verified */}
      {currentUser?.status === 'pending' && (
        <div className="bg-[#fef8e6] border border-[#eaae1a]/50 p-4 rounded-2xl flex items-start gap-3 text-[#735104] text-xs">
          <Clock className="w-5 h-5 text-[#d49b11] shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-sm text-[#735104]">Hồ Sơ Tổ Chức Đang Chờ Admin Xác Minh Pháp Lý</h4>
            <p className="mt-0.5 text-[#6d4c05] leading-relaxed">
              Theo Quy trình 1, Đơn vị tổ chức cần được Admin kiểm tra giấy chứng nhận/giấy phép thành lập ({currentUser?.licenseNumber})
              để đảm bảo tính pháp lý trước khi các hoạt động tạo ra được phê duyệt công khai.
            </p>
          </div>
        </div>
      )}

      {/* Org Header Card */}
      <div className="vv-card overflow-hidden">
        <div className="h-1.5 w-full vv-gold-underline" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#e8f2ed]">
            <div className="flex items-center gap-4">
              <img
                src={currentUser?.logo || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=150&auto=format&fit=crop&q=80'}
                alt={currentUser?.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-[3px] ring-[#1b5e3a] shadow-md"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#0d530e]">
                    {currentUser?.name}
                  </h1>
                  <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full ${
                    currentUser?.status === 'active'
                      ? 'bg-[#e8f2ed] text-[#0d530e] border border-[#0d530e]/20'
                      : 'bg-[#fef8e6] text-[#8a6100] border border-[#eaae1a]/45'
                  }`}>
                    {currentUser?.status === 'active' ? '✓ Đã Xác Minh' : '⏳ Chờ Duyệt'}
                  </span>
                </div>
                <p className="text-xs text-[#5a6b5c] mt-1">
                  Đại diện: <strong className="text-[#1f2d20]">{currentUser?.representative}</strong> • Giấy phép: {currentUser?.licenseNumber}
                </p>
                <p className="text-xs text-[#555555] mt-1 line-clamp-1">{currentUser?.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={onOpenCreateActivity}
                className="vv-btn-primary px-5 py-2.5 text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Tạo Hoạt Động Mới</span>
              </button>
              <button
                onClick={() => setActiveSubTab('profile')}
                className="vv-btn-outline px-4 py-2 text-xs font-bold cursor-pointer"
              >
                Sửa Thông Tin
              </button>
            </div>
          </div>

          {/* 4 KPIs for Organization */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
            <div className="vv-stat-card p-5">
              <div className="flex items-center justify-between text-[#5a6b5c] mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider">Tổng Hoạt Động</span>
                <FileText className="w-5 h-5 text-[#1b5e3a]" />
              </div>
              <div className="text-3xl font-extrabold text-[#0d530e]">
                {orgActivities.length} <span className="text-sm font-semibold text-[#5a6b5c]">chiến dịch</span>
              </div>
              <span className="text-[11px] text-[#437b62] mt-1 block">Do đơn vị khởi xướng</span>
            </div>

            <div className="vv-stat-card p-5">
              <div className="flex items-center justify-between text-[#5a6b5c] mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider">Lượt TNV Đăng Ký</span>
                <Users className="w-5 h-5 text-[#0d530e]" />
              </div>
              <div className="text-3xl font-extrabold text-[#0d530e]">
                {orgRegistrations.length} <span className="text-sm font-semibold text-[#5a6b5c]">lượt</span>
              </div>
              <span className="text-[11px] text-[#437b62] mt-1 block">
                {pendingRegs.length} lượt đang chờ duyệt
              </span>
            </div>

            <div className="vv-stat-card p-5">
              <div className="flex items-center justify-between text-[#5a6b5c] mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider">Tỷ Lệ Duyệt &amp; Tham Gia</span>
                <TrendingUp className="w-5 h-5 text-[#437b62]" />
              </div>
              <div className="text-3xl font-extrabold text-[#0d530e]">
                {approvalRate}% <span className="text-sm font-semibold text-[#5a6b5c]">duyệt</span>
              </div>
              <span className="text-[11px] text-[#437b62] mt-1 block">
                {presentRegs.length} TNV đã điểm danh có mặt
              </span>
            </div>

            <div className="vv-stat-card p-5">
              <div className="flex items-center justify-between text-[#5a6b5c] mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider">Điểm Đánh Giá TB</span>
                <Star className="w-5 h-5 text-[#eaae1a] fill-[#eaae1a]" />
              </div>
              <div className="text-3xl font-extrabold text-[#0d530e]">
                {orgAvgRating}/5.0
              </div>
              <span className="text-[11px] text-[#437b62] mt-1 block">Từ {orgReviews.length} lượt nhận xét TNV</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="vv-card p-1.5 flex overflow-x-auto text-xs font-semibold gap-1">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2.5 rounded-full transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'overview' ? 'bg-[#1b5e3a] text-white shadow-xs' : 'text-[#5a6b5c] hover:text-[#0d530e] hover:bg-[#f5f9f7]'
          }`}
        >
          Tổng Quan
        </button>
        <button
          onClick={() => setActiveSubTab('activities')}
          className={`px-4 py-2.5 rounded-full transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'activities' ? 'bg-[#1b5e3a] text-white shadow-xs' : 'text-[#5a6b5c] hover:text-[#0d530e] hover:bg-[#f5f9f7]'
          }`}
        >
          <span>Danh Sách Hoạt Động</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            activeSubTab === 'activities' ? 'bg-[#eaae1a] text-[#14251c]' : 'bg-[#e8f2ed] text-[#0d530e]'
          }`}>
            {orgActivities.length}
          </span>
        </button>
        <button
          onClick={() => setActiveSubTab('registrations')}
          className={`px-4 py-2.5 rounded-full transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'registrations' ? 'bg-[#1b5e3a] text-white shadow-xs' : 'text-[#5a6b5c] hover:text-[#0d530e] hover:bg-[#f5f9f7]'
          }`}
        >
          <span>Xét Duyệt TNV</span>
          {pendingRegs.length > 0 && (
            <span className="bg-[#eaae1a] text-[#14251c] font-extrabold px-2 py-0.2 rounded-full text-[10px]">
              {pendingRegs.length} mới
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('attendance')}
          className={`px-4 py-2.5 rounded-full transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'attendance' ? 'bg-[#1b5e3a] text-white shadow-xs' : 'text-[#5a6b5c] hover:text-[#0d530e] hover:bg-[#f5f9f7]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Điểm Danh &amp; Xác Nhận Giờ Công</span>
        </button>
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`px-4 py-2.5 rounded-full transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'profile' ? 'bg-[#1b5e3a] text-white shadow-xs' : 'text-[#5a6b5c] hover:text-[#0d530e] hover:bg-[#f5f9f7]'
          }`}
        >
          Thông Tin Tổ Chức
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {pendingRegs.length > 0 && (
            <div className="bg-[#fef8e6]/80 p-6 rounded-2xl border border-[#eaae1a]/45">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#d49b11]" />
                  <h3 className="font-bold text-[#735104] text-base">
                    Có {pendingRegs.length} Yêu Cầu Đăng Ký Đang Chờ Xét Duyệt (Quy trình 5)
                  </h3>
                </div>
                <button
                  onClick={() => setActiveSubTab('registrations')}
                  className="text-xs font-bold text-[#0d530e] hover:text-[#d49b11] underline cursor-pointer"
                >
                  Xử lý tất cả →
                </button>
              </div>

              <div className="space-y-2.5">
                {pendingRegs.slice(0, 3).map((reg) => (
                  <div
                    key={reg.id}
                    className="bg-white p-4 rounded-2xl border border-[#eaae1a]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#1f2d20]">{reg.volunteerName} ({reg.volunteerEmail})</div>
                      <div className="text-[#5a6b5c]">Hoạt động: <strong className="text-[#0d530e]">{reg.activityTitle}</strong></div>
                      <div className="text-[#555555] italic mt-0.5">&quot;{reg.message}&quot;</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => approveRegistration(reg.id)}
                        className="vv-btn-forest px-4 py-1.5 font-bold cursor-pointer"
                      >
                        Duyệt
                      </button>
                      <button
                        onClick={() => {
                          setRejectReason('');
                          setRejectModalData({ regId: reg.id, volName: reg.volunteerName });
                        }}
                        className="px-4 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-full border border-rose-200 cursor-pointer"
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {orgReviews.length > 0 && (
            <div className="vv-card p-6">
              <h3 className="font-bold text-[#0d530e] text-base mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-[#eaae1a] fill-[#eaae1a]" />
                Đánh Giá Gần Đây Từ Tình Nguyện Viên
              </h3>
              <div className="space-y-3">
                {orgReviews.map((r) => (
                  <div key={r.id} className="p-4 rounded-2xl bg-[#f7f9f7] border border-[#e8f2ed] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0d530e]">{r.volunteerName}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-[#eaae1a] text-[#eaae1a]" />
                        ))}
                      </div>
                    </div>
                    <span className="text-[11px] text-[#609f84] block">{r.activityTitle} • {r.createdAt}</span>
                    <p className="text-[#555555] italic pt-1">&quot;{r.comment}&quot;</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVITIES MANAGEMENT */}
      {activeSubTab === 'activities' && (
        <div className="vv-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-[#0d530e] text-lg">Quản Lý Các Hoạt Động Đã Tạo</h3>
              <p className="text-xs text-[#5a6b5c] mt-0.5">
                Thêm, chỉnh sửa, hủy hoạt động, đóng/mở đăng ký sớm và gửi thông báo tới TNV
              </p>
            </div>
            <button
              onClick={onOpenCreateActivity}
              className="vv-btn-primary px-5 py-2.5 font-bold text-xs flex items-center gap-1.5 self-start cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tạo Mới</span>
            </button>
          </div>

          <div className="space-y-4">
            {orgActivities.length === 0 ? (
              <div className="text-center py-12 text-[#5a6b5c] text-xs">
                Tổ chức chưa tạo hoạt động nào. Hãy bấm &quot;Tạo Mới&quot; để đăng tải chiến dịch!
              </div>
            ) : (
              orgActivities.map((act) => {
                const statusBadge = getActivityStatusBadge(act);
                const canManageLive =
                  act.approvalStatus === 'approved' &&
                  (act.status === 'recruiting' || act.status === 'full');
                const canEdit = act.status !== 'completed' && act.status !== 'cancelled';

                return (
                  <div
                    key={act.id}
                    className="p-5 rounded-2xl border border-[#0d530e]/15 bg-[#f7f9f7] hover:bg-[#f2f7f4] transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          act.approvalStatus === 'approved' ? 'bg-[#e8f2ed] text-[#0d530e]' :
                          act.approvalStatus === 'pending' ? 'bg-[#fef8e6] text-[#8a6100]' :
                          act.approvalStatus === 'need_edit' ? 'bg-orange-100 text-orange-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {act.approvalStatus === 'approved' ? '✓ Admin Đã Duyệt' :
                           act.approvalStatus === 'pending' ? '⏳ Chờ Admin Duyệt' :
                           act.approvalStatus === 'need_edit' ? 'Cần Chỉnh Sửa' : 'Bị Từ Chối'}
                        </span>

                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${statusBadge.cls}`}>
                          {statusBadge.text}
                        </span>

                        <span className="text-xs text-[#5a6b5c]">
                          {act.categoryName} • <strong className="text-[#0d530e]">+{act.hoursEarned}h công</strong>
                        </span>
                      </div>

                      <h4
                        onClick={() => onSelectActivity(act)}
                        className="font-bold text-base text-[#0d530e] hover:text-[#d49b11] transition-colors cursor-pointer"
                      >
                        {act.title}
                      </h4>

                      <div className="text-xs text-[#555555] flex flex-wrap gap-4">
                        <span>📅 {new Date(act.startDate).toLocaleDateString('vi-VN')}</span>
                        <span>📍 {act.locationName} - {act.specificAddress}</span>
                        <span>👥 Đã đăng ký: <strong className="text-[#1f2d20]">{act.volunteersRegistered}/{act.volunteersNeeded} TNV</strong></span>
                      </div>

                      {act.editReason && (
                        <div className="mt-2 p-3 rounded-xl bg-[#fef8e6] border border-[#eaae1a]/45 text-[#735104] text-xs flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-[#d49b11] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Yêu cầu chỉnh sửa từ Admin: </span>
                            <span>{act.editReason}</span>
                          </div>
                        </div>
                      )}

                      {act.rejectReason && (
                        <div className="mt-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Lý do từ chối từ Admin: </span>
                            <span>{act.rejectReason}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {canEdit && (
                        <button
                          onClick={() => onEditActivity?.(act)}
                          className={`px-3.5 py-1.5 text-xs font-bold rounded-full flex items-center gap-1 cursor-pointer transition-all ${
                            act.approvalStatus === 'need_edit'
                              ? 'vv-btn-gold shadow-xs'
                              : 'bg-white hover:bg-[#e8f2ed] text-[#0d530e] border border-[#0d530e]/25'
                          }`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{act.approvalStatus === 'need_edit' ? 'Sửa & Gửi Duyệt Lại' : 'Chỉnh Sửa'}</span>
                        </button>
                      )}

                      {act.approvalStatus === 'approved' && act.status !== 'cancelled' && (
                        <button
                          onClick={() => setSelectedActForNotify(act)}
                          className="px-3.5 py-1.5 text-xs bg-[#e8f2ed] hover:bg-[#d7e9e0] text-[#0d530e] font-semibold rounded-full border border-[#0d530e]/20 flex items-center gap-1 cursor-pointer"
                          title="Gửi thông báo tới toàn bộ TNV của hoạt động này"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Gửi Thông Báo</span>
                        </button>
                      )}

                      {canManageLive && (
                        <button
                          onClick={() => toggleActivityRecruiting(act.id)}
                          className="px-3.5 py-1.5 text-xs bg-white hover:bg-[#f5f9f7] text-[#445447] font-semibold rounded-full border border-[#d2d2d7] cursor-pointer"
                        >
                          {act.status === 'recruiting' ? 'Đóng Tuyển' : 'Mở Tuyển Lại'}
                        </button>
                      )}

                      {canManageLive && (
                        <button
                          onClick={() => completeActivity(act.id)}
                          className="vv-btn-forest px-4 py-1.5 text-xs font-semibold shadow-xs cursor-pointer"
                        >
                          Kết Thúc Hoạt Động
                        </button>
                      )}

                      {act.status !== 'completed' && act.status !== 'cancelled' && act.status !== 'rejected' && (
                        <button
                          onClick={() => {
                            setCancelReason('');
                            setCancelModalAct(act);
                          }}
                          className="px-3.5 py-1.5 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-full border border-rose-200 cursor-pointer"
                        >
                          Hủy Hoạt Động
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: REGISTRATIONS MANAGEMENT */}
      {activeSubTab === 'registrations' && (
        <div className="vv-card p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="font-bold text-[#0d530e] text-lg">Quản Lý Đăng Ký &amp; Xét Duyệt TNV (Quy trình 5)</h3>
            <p className="text-xs text-[#5a6b5c] mt-0.5">
              Đánh giá hồ sơ tình nguyện viên, xem kỹ năng, lịch sử và quyết định duyệt hoặc từ chối
            </p>
          </div>

          {orgRegistrations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="relative">
                <Search className="w-4 h-4 text-[#437b62] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={regSearch}
                  onChange={(e) => setRegSearch(e.target.value)}
                  placeholder="Tìm theo tên, email, SĐT TNV..."
                  className="vv-input w-full pl-10 pr-3 py-2.5"
                />
              </div>

              <select
                value={regActivityFilter}
                onChange={(e) => setRegActivityFilter(e.target.value)}
                className="vv-input p-2.5 font-medium"
              >
                <option value="all">Tất cả chiến dịch ({orgActivities.length})</option>
                {orgActivities.map((act) => (
                  <option key={act.id} value={act.id}>{act.title}</option>
                ))}
              </select>

              <select
                value={regStatusFilter}
                onChange={(e) => setRegStatusFilter(e.target.value)}
                className="vv-input p-2.5 font-medium"
              >
                <option value="all">Tất cả trạng thái ({orgRegistrations.length})</option>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="rejected">Bị từ chối</option>
                <option value="cancelled">TNV đã hủy</option>
              </select>
            </div>
          )}

          <div className="space-y-3">
            {orgRegistrations.length === 0 ? (
              <div className="text-center py-12 text-[#5a6b5c] text-xs">
                Chưa có tình nguyện viên nào đăng ký vào các hoạt động của bạn.
              </div>
            ) : filteredOrgRegistrations.length === 0 ? (
              <div className="text-center py-10 text-[#5a6b5c] text-xs space-y-2">
                <p>Không tìm thấy lượt đăng ký phù hợp với bộ lọc hiện tại.</p>
                <button
                  type="button"
                  onClick={() => {
                    setRegSearch('');
                    setRegActivityFilter('all');
                    setRegStatusFilter('all');
                  }}
                  className="text-[#0d530e] hover:text-[#d49b11] hover:underline font-semibold cursor-pointer"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            ) : (
              filteredOrgRegistrations.map((reg) => {
                const vol = volunteers.find((v) => v.id === reg.volunteerId);
                const regBadge = getRegStatusBadge(reg.status);
                return (
                  <div
                    key={reg.id}
                    className="p-4 rounded-2xl border border-[#0d530e]/15 bg-[#f7f9f7] hover:bg-[#f2f7f4] transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${regBadge.cls}`}>
                          {regBadge.text}
                        </span>
                        <span className="font-bold text-sm text-[#1f2d20]">{reg.volunteerName}</span>
                        <span className="text-xs text-[#5a6b5c]">({reg.volunteerEmail} • {reg.volunteerPhone})</span>
                      </div>

                      <div className="text-xs text-[#445447]">
                        Hoạt động: <strong className="text-[#0d530e]">{reg.activityTitle}</strong>
                      </div>

                      <div className="text-xs text-[#555555]">
                        Lời nhắn: <em>&quot;{reg.message}&quot;</em>
                      </div>

                      {vol && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5 items-center">
                          <span className="text-[10px] text-[#5a6b5c] mr-0.5">Kỹ năng:</span>
                          {vol.skills?.map((s) => (
                            <span key={s} className="bg-white border border-[#0d530e]/15 text-[#2d5543] px-2 py-0.5 rounded-full text-[10px] font-medium">
                              {s}
                            </span>
                          ))}
                          <span className="text-[10px] text-[#0d530e] font-bold ml-1">
                            (Đã tích lũy {vol.totalHours || 0}h công)
                          </span>
                        </div>
                      )}

                      {reg.status === 'rejected' && reg.orgRejectReason && (
                        <p className="text-[11px] text-rose-600 font-medium">Lý do từ chối: {reg.orgRejectReason}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      {reg.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => approveRegistration(reg.id)}
                            className="vv-btn-forest px-5 py-2 font-bold text-xs shadow-xs cursor-pointer"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => {
                              setRejectReason('');
                              setRejectModalData({ regId: reg.id, volName: reg.volunteerName });
                            }}
                            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-full text-xs border border-rose-200 cursor-pointer"
                          >
                            Từ Chối
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-[#5a6b5c]">{regBadge.note}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ATTENDANCE & HOURS CONFIRMATION */}
      {activeSubTab === 'attendance' && (
        <div className="vv-card p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="font-bold text-[#0d530e] text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#0d530e]" />
              Điểm Danh &amp; Xác Nhận Giờ Công Tình Nguyện (Quy trình 6)
            </h3>
            <p className="text-xs text-[#5a6b5c] mt-0.5">
              Ghi nhận tình nguyện viên Có mặt / Vắng mặt. Khi đánh dấu Có mặt, hệ thống tự động cộng giờ công vào hồ sơ và cấp chứng chỉ!
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1f2d20] mb-1.5">
              Chọn hoạt động cần điểm danh:
            </label>
            <select
              value={selectedActivityForAttendance?.id || 'all'}
              onChange={(e) => {
                const found = orgActivities.find((a) => a.id === e.target.value);
                setSelectedActivityForAttendance(found || null);
              }}
              className="vv-input w-full sm:w-1/2 p-2.5 text-xs font-medium"
            >
              <option value="all">-- Xem tất cả TNV đã được duyệt --</option>
              {orgActivities.map((act) => (
                <option key={act.id} value={act.id}>{act.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {approvedRegs
              .filter((r) => !selectedActivityForAttendance || r.activityId === selectedActivityForAttendance.id)
              .map((reg) => {
                const vol = volunteers.find((v) => v.id === reg.volunteerId) || {
                  id: reg.volunteerId,
                  fullName: reg.volunteerName
                };
                const act = activities.find((a) => a.id === reg.activityId);
                const isAttendanceLocked = act?.status === 'completed' || act?.status === 'cancelled';
                const isPresent = reg.attendanceStatus === 'present';
                const isAbsent = reg.attendanceStatus === 'absent';

                return (
                  <div
                    key={reg.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isPresent ? 'bg-[#f5f9f7] border-[#0d530e]/25' :
                      isAbsent ? 'bg-rose-50/70 border-rose-200' : 'bg-[#f7f9f7] border-[#e8f2ed]'
                    }`}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-[#1f2d20]">{reg.volunteerName}</span>
                        {reg.confirmedByVolunteer && (
                          <span className="text-[10px] bg-[#e8f2ed] text-[#0d530e] font-bold px-2.5 py-0.5 rounded-full">
                            Đã xác nhận sẵn sàng
                          </span>
                        )}
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          isPresent ? 'bg-[#0d530e] text-white' :
                          isAbsent ? 'bg-rose-600 text-white' : 'bg-[#e8f2ed] text-[#5a6b5c]'
                        }`}>
                          {isPresent ? `✓ Có Mặt (+${reg.hoursConfirmed}h)` :
                           isAbsent ? '✗ Vắng Mặt' : 'Chưa điểm danh'}
                        </span>
                      </div>
                      <p className="text-xs text-[#445447] mt-1">Chiến dịch: <strong className="text-[#0d530e]">{reg.activityTitle}</strong></p>
                      <p className="text-xs text-[#5a6b5c]">SĐT: {reg.volunteerPhone} • Email: {reg.volunteerEmail}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {isAttendanceLocked ? (
                        <span className="px-4 py-2 rounded-full text-xs font-semibold bg-white text-[#5a6b5c] border border-[#d2d2d7] flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-[#5a6b5c]" />
                          <span>Đã chốt điểm danh</span>
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => markAttendance(reg.id, 'present')}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                              isPresent
                                ? 'bg-[#0d530e] text-white shadow-sm ring-2 ring-[#437b62]/40'
                                : 'bg-white hover:bg-[#e8f2ed] text-[#0d530e] border border-[#0d530e]/35'
                            }`}
                          >
                            ✓ Có Mặt
                          </button>

                          <button
                            onClick={() => markAttendance(reg.id, 'absent')}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                              isAbsent
                                ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400'
                                : 'bg-white hover:bg-rose-50 text-rose-700 border border-rose-300'
                            }`}
                          >
                            ✗ Vắng Mặt
                          </button>
                        </>
                      )}

                      {isPresent && (
                        reg.ratedByOrg ? (
                          <span className="px-3.5 py-2 rounded-full text-xs font-bold bg-[#fef8e6] text-[#8a6100] border border-[#eaae1a]/45">
                            ✓ Đã Đánh Giá
                          </span>
                        ) : (
                          <button
                            onClick={() => setSelectedVolForEval({ volunteer: vol, activityId: reg.activityId })}
                            className="vv-btn-gold px-4 py-2 text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5" />
                            <span>Đánh Giá TNV</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 5: ORG PROFILE & PASSWORD */}
      {activeSubTab === 'profile' && (
        <OrgProfileSection
          key={currentUser?.id || 'org-profile'}
          currentUser={currentUser}
          onSaveProfile={updateOrgProfile}
          onChangePassword={changePassword}
        />
      )}

      {/* Reject Reason Modal */}
      {rejectModalData && (
        <div
          onClick={handleRejectBackdrop}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d1f16]/65 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#0d530e]/15 space-y-4 text-xs animate-scale-up">
            <h4 className="font-bold text-sm text-[#1f2d20]">
              Nhập lý do từ chối TNV {rejectModalData.volName} (Quy trình 5.6)
            </h4>
            <p className="text-[#5a6b5c]">
              Lý do này sẽ được gửi trực tiếp đến hộp thư thông báo của tình nguyện viên.
            </p>
            <div>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="VD: Rất tiếc đợt này đã đủ số lượng TNV có chuyên môn phù hợp..."
                className="vv-input w-full p-3"
              />
              {!rejectReason.trim() && (
                <p className="text-[11px] text-rose-600 mt-1">Vui lòng nhập lý do từ chối trước khi xác nhận.</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeRejectModal}
                className="px-4 py-2 text-[#5a6b5c] hover:text-[#1f2d20] font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim()}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 disabled:cursor-not-allowed text-white font-bold rounded-full cursor-pointer"
              >
                Xác Nhận Từ Chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Activity Modal */}
      {cancelModalAct && (
        <div
          onClick={handleCancelBackdrop}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d1f16]/65 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#0d530e]/15 space-y-4 text-xs animate-scale-up">
            <div className="flex justify-between items-start gap-2">
              <h4 className="font-bold text-sm text-[#1f2d20] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Hủy Hoạt Động: {cancelModalAct.title}</span>
              </h4>
              <button type="button" onClick={closeCancelModal} className="cursor-pointer">
                <XCircle className="w-5 h-5 text-[#5a6b5c]" />
              </button>
            </div>
            <p className="text-[#5a6b5c]">
              Hệ thống sẽ tự động gửi thông báo hủy kèm lý do này đến toàn bộ tình nguyện viên đã đăng ký.
            </p>
            <div>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="VD: Điều kiện thời tiết xấu không đảm bảo an toàn cho TNV..."
                className="vv-input w-full p-3"
              />
              {!cancelReason.trim() && (
                <p className="text-[11px] text-rose-600 mt-1">Vui lòng nhập lý do hủy hoạt động trước khi xác nhận.</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeCancelModal}
                className="px-4 py-2 text-[#5a6b5c] hover:text-[#1f2d20] font-semibold cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelActivity}
                disabled={!cancelReason.trim()}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 disabled:cursor-not-allowed text-white font-bold rounded-full cursor-pointer"
              >
                Xác Nhận Hủy Hoạt Động
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Notification Modal */}
      {selectedActForNotify && (
        <div
          onClick={handleNotifyBackdrop}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d1f16]/65 backdrop-blur-xs"
        >
          <form onSubmit={handleSendNotification} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#0d530e]/15 space-y-4 text-xs animate-scale-up">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-sm text-[#0d530e] flex items-center gap-1.5">
                <Send className="w-4 h-4 text-[#0d530e]" />
                Gửi Thông Báo Tới TNV Hoạt Động (Chức năng 11)
              </h4>
              <button type="button" onClick={closeNotifyModal} className="cursor-pointer">
                <XCircle className="w-5 h-5 text-[#5a6b5c]" />
              </button>
            </div>
            <p className="text-[#5a6b5c]">
              Chiến dịch: <strong className="text-[#1f2d20]">{selectedActForNotify.title}</strong>
            </p>
            <div>
              <label className="block font-semibold text-[#1f2d20] mb-1">Tiêu đề thông báo *</label>
              <input
                type="text"
                required
                value={notifyTitle}
                onChange={(e) => setNotifyTitle(e.target.value)}
                placeholder="VD: Dặn dò giờ giấc tập trung, trang phục..."
                className="vv-input w-full p-2.5"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1f2d20] mb-1">Nội dung chi tiết *</label>
              <textarea
                rows={4}
                required
                value={notifyContent}
                onChange={(e) => setNotifyContent(e.target.value)}
                placeholder="Nội dung nhắc nhở, hướng dẫn cụ thể..."
                className="vv-input w-full p-2.5"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeNotifyModal}
                className="px-4 py-2 text-[#5a6b5c] cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="vv-btn-primary px-6 py-2 font-bold shadow-xs cursor-pointer"
              >
                Phát Thông Báo
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Evaluate Volunteer Modal */}
      {selectedVolForEval && (
        <div
          onClick={handleEvalBackdrop}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d1f16]/65 backdrop-blur-xs"
        >
          <form onSubmit={handleEvalSubmit} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#0d530e]/15 space-y-4 text-xs animate-scale-up">
            <h4 className="font-bold text-sm text-[#0d530e] flex items-center gap-1.5">
              <Star className="w-4 h-4 text-[#eaae1a] fill-[#eaae1a]" />
              Đánh Giá Tình Nguyện Viên {selectedVolForEval.volunteer?.fullName} (Chức năng 13)
            </h4>
            <p className="text-[#5a6b5c]">
              Đánh giá này sẽ được lưu trữ vĩnh viễn vào hồ sơ uy tín của tình nguyện viên.
            </p>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#1f2d20]">Chấm điểm:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEvalRating(star)}
                    className="hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-5 h-5 ${star <= evalRating ? 'fill-[#eaae1a] text-[#eaae1a]' : 'text-[#d2d2d7]'}`}
                    />
                  </button>
                ))}
              </div>
              <span className="font-bold text-[#8a6100]">({evalRating}/5 sao)</span>
            </div>

            <div>
              <label className="block font-semibold text-[#1f2d20] mb-1">Nhận xét về thái độ, tinh thần đóng góp *</label>
              <textarea
                rows={3}
                required
                value={evalComment}
                onChange={(e) => setEvalComment(e.target.value)}
                className="vv-input w-full p-2.5"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeEvalModal}
                className="px-4 py-2 text-[#5a6b5c] cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="vv-btn-gold px-6 py-2 font-bold shadow-xs cursor-pointer"
              >
                Lưu Đánh Giá
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
