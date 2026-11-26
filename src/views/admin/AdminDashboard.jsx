import React, { useState } from 'react';
import { useApp } from '../../context/useApp';
import { useModalClose } from '../../hooks/useModalClose';
import {
  Shield,
  Users,
  Lock,
  Unlock,
  Trash2,
  FolderTree,
  MapPin,
  MessageSquare,
  Bell,
  Settings,
  BarChart3,
  TrendingUp,
  Clock,
  Send,
  Search,
  RotateCcw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const AdminSettingsForm = ({ settings, onSave }) => {
  const [sysApprovalDays, setSysApprovalDays] = useState(settings?.defaultApprovalDays || 3);
  const [sysMaxRegistrations, setSysMaxRegistrations] = useState(settings?.maxRegistrationsPerVolunteer || 5);
  const [sysGuidelines, setSysGuidelines] = useState(settings?.generalGuidelines || '');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    onSave({
      defaultApprovalDays: Number(sysApprovalDays),
      maxRegistrationsPerVolunteer: Number(sysMaxRegistrations),
      generalGuidelines: sysGuidelines
    });
  };

  return (
    <div className="vv-card p-6 sm:p-8 space-y-6">
      <div>
        <h3 className="font-bold text-[#0d530e] text-lg flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#0d530e]" />
          Cấu Hình Tham Số Hệ Thống (Chức năng 16 Admin)
        </h3>
        <p className="text-xs text-[#5a6b5c] mt-0.5">
          Điều chỉnh thời gian duyệt mặc định, giới hạn lượt đăng ký và quy chế chung
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-4 text-xs max-w-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-[#1f2d20] mb-1.5">Thời gian duyệt mặc định (ngày)</label>
            <input
              type="number"
              min="1"
              max="14"
              value={sysApprovalDays}
              onChange={(e) => setSysApprovalDays(e.target.value)}
              className="vv-input w-full p-2.5"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#1f2d20] mb-1.5">Số lượt đăng ký tối đa / TNV</label>
            <input
              type="number"
              min="1"
              max="20"
              value={sysMaxRegistrations}
              onChange={(e) => setSysMaxRegistrations(e.target.value)}
              className="vv-input w-full p-2.5"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-[#1f2d20] mb-1.5">Quy định &amp; Đạo đức thiện nguyện chung</label>
          <textarea
            rows={4}
            value={sysGuidelines}
            onChange={(e) => setSysGuidelines(e.target.value)}
            className="vv-input w-full p-2.5"
          />
        </div>

        <button
          type="submit"
          className="vv-btn-primary px-7 py-2.5 font-bold shadow-sm cursor-pointer"
        >
          Lưu Cấu Hình Hệ Thống
        </button>
      </form>
    </div>
  );
};

export const AdminDashboard = ({
  activeSubTab = 'overview',
  setActiveSubTab,
  onSelectActivity
}) => {
  const {
    volunteers,
    organizations,
    activities,
    registrations,
    categories,
    locations,
    feedbacks,
    reviews,
    settings,
    approveUser,
    rejectUser,
    toggleUserLock,
    deleteUser,
    approveActivity,
    rejectActivity,
    requestActivityEdit,
    deleteActivityByAdmin,
    addCategory,
    deleteCategory,
    addLocation,
    deleteLocation,
    resolveFeedback,
    sendSystemBroadcast,
    updateSystemSettings,
    resetToInitialData
  } = useApp();

  // Pending lists
  const pendingVolunteers = volunteers.filter((v) => v.status === 'pending');
  const pendingOrganizations = organizations.filter((o) => o.status === 'pending');
  const pendingActivities = activities.filter((a) => a.approvalStatus === 'pending');

  // Broadcast modal state
  const [broadcastTarget, setBroadcastTarget] = useState('all');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');

  // Category & Location states
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newLocName, setNewLocName] = useState('');
  const [newLocCode, setNewLocCode] = useState('');

  // Reason dialog state (Reject or Request Edit)
  const [reasonDialogData, setReasonDialogData] = useState(null);
  const [reasonInput, setReasonInput] = useState('');

  // Confirm dangerous action dialog state (Delete or Reset)
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Resolve feedback dialog state
  const [resolveFbDialog, setResolveFbDialog] = useState(null);
  const [resolveAdminNote, setResolveAdminNote] = useState('');
  const [resolveSaving, setResolveSaving] = useState(false);

  // Search & filter states for Users & Activities tabs
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [actSearch, setActSearch] = useState('');
  const [actApprovalFilter, setActApprovalFilter] = useState('all');

  const closeReasonDialog = () => {
    setReasonDialogData(null);
    setReasonInput('');
  };

  const closeConfirmDialog = () => {
    setConfirmDialog(null);
  };

  const closeResolveFbDialog = () => {
    setResolveFbDialog(null);
    setResolveAdminNote('');
  };

  const { handleBackdropClick: handleReasonBackdrop } = useModalClose(!!reasonDialogData, closeReasonDialog);
  const { handleBackdropClick: handleConfirmBackdrop } = useModalClose(!!confirmDialog, closeConfirmDialog);
  const { handleBackdropClick: handleResolveFbBackdrop } = useModalClose(!!resolveFbDialog, closeResolveFbDialog);

  // Metrics
  const totalCertifiedHours = volunteers.reduce((acc, v) => acc + (v.totalHours || 0), 0);
  const avgSystemRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1)
    : '5.0';

  const matchesUserStatus = (status, filter, isOrg) => {
    if (filter === 'all') return true;
    if (filter === 'active_or_approved') return isOrg ? status === 'active' : status === 'approved';
    return status === filter;
  };

  const filteredVolunteers = volunteers.filter((vol) => {
    const q = userSearch.trim().toLowerCase();
    const matchText =
      !q ||
      (vol.fullName || '').toLowerCase().includes(q) ||
      (vol.email || '').toLowerCase().includes(q) ||
      (vol.phone || '').toLowerCase().includes(q);
    return matchText && matchesUserStatus(vol.status, userStatusFilter, false);
  });

  const filteredOrganizations = organizations.filter((org) => {
    const q = userSearch.trim().toLowerCase();
    const matchText =
      !q ||
      (org.name || '').toLowerCase().includes(q) ||
      (org.email || '').toLowerCase().includes(q) ||
      (org.phone || '').toLowerCase().includes(q) ||
      (org.licenseNumber || '').toLowerCase().includes(q) ||
      (org.representative || '').toLowerCase().includes(q);
    return matchText && matchesUserStatus(org.status, userStatusFilter, true);
  });

  const filteredActivities = activities.filter((act) => {
    const q = actSearch.trim().toLowerCase();
    const matchText =
      !q ||
      (act.title || '').toLowerCase().includes(q) ||
      (act.organizationName || '').toLowerCase().includes(q) ||
      (act.locationName || '').toLowerCase().includes(q) ||
      (act.categoryName || '').toLowerCase().includes(q);
    const matchApproval = actApprovalFilter === 'all' || act.approvalStatus === actApprovalFilter;
    return matchText && matchApproval;
  });

  const getFeedbackTargetLabel = (targetType) => {
    switch (targetType) {
      case 'system':
        return 'Hệ thống';
      case 'organization':
        return 'Đơn vị tổ chức';
      case 'activity':
        return 'Hoạt động / Điểm danh';
      default:
        return targetType;
    }
  };

  const handleConfirmReason = () => {
    if (!reasonDialogData || !reasonInput.trim()) return;
    const trimmed = reasonInput.trim();
    if (reasonDialogData.mode === 'request_edit') {
      requestActivityEdit(reasonDialogData.id, trimmed);
    } else if (reasonDialogData.type === 'vol') {
      rejectUser(reasonDialogData.id, 'volunteer', trimmed);
    } else if (reasonDialogData.type === 'org') {
      rejectUser(reasonDialogData.id, 'organization', trimmed);
    } else if (reasonDialogData.type === 'act') {
      rejectActivity(reasonDialogData.id, trimmed);
    }
    closeReasonDialog();
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog || confirmLoading) return;
    setConfirmLoading(true);
    try {
      if (confirmDialog.action === 'delete_vol') {
        await deleteUser(confirmDialog.id, 'volunteer');
      } else if (confirmDialog.action === 'delete_org') {
        await deleteUser(confirmDialog.id, 'organization');
      } else if (confirmDialog.action === 'delete_act') {
        await deleteActivityByAdmin(confirmDialog.id);
      } else if (confirmDialog.action === 'delete_cat') {
        await deleteCategory(confirmDialog.id);
      } else if (confirmDialog.action === 'delete_loc') {
        await deleteLocation(confirmDialog.id);
      } else if (confirmDialog.action === 'reset') {
        await resetToInitialData();
      }
    } finally {
      setConfirmLoading(false);
      closeConfirmDialog();
    }
  };

  const handleConfirmResolveFeedback = async (e) => {
    e.preventDefault();
    if (!resolveFbDialog || resolveSaving) return;
    setResolveSaving(true);
    const res = await resolveFeedback(resolveFbDialog.id, resolveAdminNote.trim());
    setResolveSaving(false);
    if (res?.success) {
      closeResolveFbDialog();
    }
  };

  const handleBroadcastSubmit = (e) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMsg.trim()) return;
    sendSystemBroadcast(broadcastTarget, broadcastTitle, broadcastMsg);
    setBroadcastTitle('');
    setBroadcastMsg('');
  };

  const handleAddCategorySubmit = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory(newCatName.trim(), 'Heart', newCatDesc.trim());
    setNewCatName('');
    setNewCatDesc('');
  };

  const handleAddLocationSubmit = (e) => {
    e.preventDefault();
    if (!newLocName.trim()) return;
    addLocation(newLocName.trim(), newLocCode.trim().toUpperCase() || 'TP');
    setNewLocName('');
    setNewLocCode('');
  };

  const getApprovalBadge = (approvalStatus) => {
    switch (approvalStatus) {
      case 'approved':
        return { text: 'Đã duyệt', cls: 'bg-[#e8f2ed] text-[#0d530e]' };
      case 'need_edit':
        return { text: 'Cần chỉnh sửa', cls: 'bg-orange-100 text-orange-800' };
      case 'rejected':
        return { text: 'Từ chối', cls: 'bg-rose-100 text-rose-800' };
      default:
        return { text: 'Chờ duyệt', cls: 'bg-[#fef8e6] text-[#8a6100]' };
    }
  };

  const settingsKey = `${settings?.defaultApprovalDays ?? 3}-${settings?.maxRegistrationsPerVolunteer ?? 5}-${settings?.generalGuidelines ?? ''}`;

  const tabClass = (isActive) =>
    `px-3.5 py-2 rounded-full transition-all whitespace-nowrap cursor-pointer ${
      isActive ? 'bg-[#0d530e] text-white shadow-xs' : 'text-[#5a6b5c] hover:text-[#0d530e] hover:bg-[#f5f9f7]'
    }`;

  return (
    <div className="space-y-7 pb-16">
      {/* Admin Title & KPI Cards (Volunteer Vietnam Deep Forest Banner) */}
      <div className="vv-footer-bg text-white rounded-3xl overflow-hidden shadow-[0_18px_40px_rgba(13,31,22,0.22)] border border-[#eaae1a]/25">
        <div className="h-[3px] w-full vv-footer-accent" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/12">
            <div>
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-[#eaae1a]/15 border border-[#eaae1a]/45 flex items-center justify-center text-[#eaae1a] shadow-md shrink-0">
                  <Shield className="w-5 h-5" />
                </span>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Bảng Quản Trị Hệ Thống (Admin Control Panel)</h1>
              </div>
              <p className="text-xs text-[#b9cdc0] mt-1.5">
                Giám sát, phê duyệt, quản lý toàn bộ dữ liệu và cấu hình hệ thống V-Connect (Quy trình 8)
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(pendingVolunteers.length > 0 || pendingOrganizations.length > 0 || pendingActivities.length > 0) && (
                <span className="bg-[#eaae1a]/18 text-[#f6c453] border border-[#eaae1a]/40 text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#eaae1a]" />
                  <span>
                    {pendingVolunteers.length + pendingOrganizations.length + pendingActivities.length} mục chờ duyệt
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Top KPI Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 pt-6 text-xs">
            <div className="bg-white/6 backdrop-blur-xs p-4 rounded-2xl border border-white/12">
              <span className="text-[#b9cdc0] block mb-1">Tình Nguyện Viên</span>
              <div className="text-2xl font-extrabold text-white">{volunteers.length}</div>
              <span className="text-[11px] text-[#f6c453] mt-1 block">
                {pendingVolunteers.length} chờ duyệt
              </span>
            </div>

            <div className="bg-white/6 backdrop-blur-xs p-4 rounded-2xl border border-white/12">
              <span className="text-[#b9cdc0] block mb-1">Đơn Vị Tổ Chức</span>
              <div className="text-2xl font-extrabold text-white">{organizations.length}</div>
              <span className="text-[11px] text-[#f6c453] mt-1 block">
                {pendingOrganizations.length} chờ xác minh
              </span>
            </div>

            <div className="bg-white/6 backdrop-blur-xs p-4 rounded-2xl border border-white/12">
              <span className="text-[#b9cdc0] block mb-1">Tổng Hoạt Động</span>
              <div className="text-2xl font-extrabold text-white">{activities.length}</div>
              <span className="text-[11px] text-[#f6c453] mt-1 block">
                {pendingActivities.length} chờ duyệt nội dung
              </span>
            </div>

            <div className="bg-white/6 backdrop-blur-xs p-4 rounded-2xl border border-white/12">
              <span className="text-[#b9cdc0] block mb-1">Tổng Giờ Công Cấp</span>
              <div className="text-2xl font-extrabold text-[#f6c453]">{totalCertifiedHours}h</div>
              <span className="text-[11px] text-[#b9cdc0] mt-1 block">Đã được chứng nhận</span>
            </div>

            <div className="bg-white/6 backdrop-blur-xs p-4 rounded-2xl border border-white/12">
              <span className="text-[#b9cdc0] block mb-1">Lượt Đăng Ký Hệ Thống</span>
              <div className="text-2xl font-extrabold text-white">{registrations.length}</div>
              <span className="text-[11px] text-[#b9cdc0] mt-1 block">Trên toàn hệ thống</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="vv-card p-1.5 flex flex-wrap items-center text-xs font-semibold gap-1">
        <button onClick={() => setActiveSubTab('overview')} className={tabClass(activeSubTab === 'overview')}>
          Dashboard &amp; Thống Kê
        </button>
        <button
          onClick={() => setActiveSubTab('approvals')}
          className={`${tabClass(activeSubTab === 'approvals')} flex items-center gap-1.5`}
        >
          <span>Hàng Đợi Phê Duyệt</span>
          {pendingVolunteers.length + pendingOrganizations.length + pendingActivities.length > 0 && (
            <span className="bg-[#eaae1a] text-[#14251c] font-extrabold px-2 py-0.2 rounded-full text-[10px]">
              {pendingVolunteers.length + pendingOrganizations.length + pendingActivities.length}
            </span>
          )}
        </button>
        <button onClick={() => setActiveSubTab('users')} className={tabClass(activeSubTab === 'users')}>
          Quản Lý Người Dùng
        </button>
        <button onClick={() => setActiveSubTab('activities')} className={tabClass(activeSubTab === 'activities')}>
          Toàn Bộ Hoạt Động
        </button>
        <button
          onClick={() => setActiveSubTab('categories_locations')}
          className={tabClass(activeSubTab === 'categories_locations')}
        >
          Danh Mục &amp; Địa Điểm
        </button>
        <button
          onClick={() => setActiveSubTab('feedback')}
          className={`${tabClass(activeSubTab === 'feedback')} flex items-center gap-1.5`}
        >
          <span>Đánh Giá &amp; Khiếu Nại</span>
          {feedbacks.filter((f) => f.status === 'pending').length > 0 && (
            <span className="bg-rose-600 text-white px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              {feedbacks.filter((f) => f.status === 'pending').length}
            </span>
          )}
        </button>
        <button onClick={() => setActiveSubTab('broadcast')} className={tabClass(activeSubTab === 'broadcast')}>
          Thông Báo Toàn Máy Chủ
        </button>
        <button onClick={() => setActiveSubTab('settings')} className={tabClass(activeSubTab === 'settings')}>
          Cấu Hình Hệ Thống
        </button>
      </div>

      {/* TAB 1: OVERVIEW & STATS */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="vv-card p-6 space-y-4">
            <h3 className="font-bold text-[#0d530e] text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#0d530e]" />
              Phân Bổ Hoạt Động Theo Danh Mục
            </h3>
            <div className="space-y-3.5 text-xs">
              {categories.map((c) => {
                const count = activities.filter((a) => a.categoryId === c.id).length;
                const percent = activities.length ? Math.round((count / activities.length) * 100) : 0;
                return (
                  <div key={c.id}>
                    <div className="flex justify-between text-[#1f2d20] font-medium mb-1">
                      <span>{c.name}</span>
                      <span className="text-[#0d530e] font-semibold">{count} hoạt động ({percent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-[#e8f2ed] rounded-full overflow-hidden">
                      <div className="h-full bg-[#0d530e] rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="vv-card p-6 space-y-4">
            <h3 className="font-bold text-[#0d530e] text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#0d530e]" />
              Tình Trạng Vận Hành Hệ Thống
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#f7f9f7] border border-[#e8f2ed] flex items-center justify-between">
                <span className="text-[#5a6b5c]">Tỷ lệ duyệt tài khoản TNV:</span>
                <span className="font-bold text-[#0d530e]">
                  {volunteers.length ? Math.round(((volunteers.length - pendingVolunteers.length) / volunteers.length) * 100) : 100}%
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#f7f9f7] border border-[#e8f2ed] flex items-center justify-between">
                <span className="text-[#5a6b5c]">Tổ chức đã xác minh pháp lý:</span>
                <span className="font-bold text-[#0d530e]">
                  {organizations.filter((o) => o.status === 'active').length}/{organizations.length} đơn vị
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#f7f9f7] border border-[#e8f2ed] flex items-center justify-between">
                <span className="text-[#5a6b5c]">Tỷ lệ tham gia thực tế (Attendance):</span>
                <span className="font-bold text-[#0d530e]">
                  {registrations.length ? Math.round((registrations.filter((r) => r.attendanceStatus === 'present').length / registrations.length) * 100) : 0}%
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#f7f9f7] border border-[#e8f2ed] flex items-center justify-between">
                <span className="text-[#5a6b5c]">Đánh giá trung bình toàn hệ thống:</span>
                <span className="font-bold text-[#b8840a]">{avgSystemRating} / 5.0 ⭐ ({reviews.length} đánh giá)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APPROVALS QUEUE */}
      {activeSubTab === 'approvals' && (
        <div className="vv-card p-6 sm:p-8 space-y-8">
          <div>
            <h3 className="font-bold text-[#0d530e] text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#d49b11]" />
              Hàng Đợi Phê Duyệt Hồ Sơ &amp; Hoạt Động Mới
            </h3>
            <p className="text-xs text-[#5a6b5c] mt-0.5">
              Duyệt tài khoản TNV mới (Quy trình 1.7), xác minh pháp lý tổ chức (Quy trình 1.7) và kiểm duyệt hoạt động (Quy trình 3.8)
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#1f2d20] uppercase tracking-wider flex items-center gap-2">
              <span>Hoạt động chờ kiểm duyệt nội dung</span>
              <span className="bg-[#fef8e6] text-[#8a6100] px-2.5 py-0.5 rounded-full border border-[#eaae1a]/40">{pendingActivities.length}</span>
            </h4>

            {pendingActivities.length === 0 ? (
              <p className="text-xs text-[#5a6b5c] italic">Không có hoạt động nào đang chờ duyệt.</p>
            ) : (
              pendingActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-4 rounded-2xl border border-[#eaae1a]/40 bg-[#fef8e6]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold bg-[#eaae1a] text-[#14251c] px-2.5 py-0.5 rounded-full">
                      {act.organizationName}
                    </span>
                    <h5 className="font-bold text-sm text-[#1f2d20] mt-1">{act.title}</h5>
                    <p className="text-[#445447]">
                      📅 {new Date(act.startDate).toLocaleDateString('vi-VN')} • 📍 {act.locationName} - {act.specificAddress}
                    </p>
                    <p className="text-[#5a6b5c] line-clamp-1">{act.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => approveActivity(act.id)}
                      className="vv-btn-forest px-4 py-2 font-bold cursor-pointer"
                    >
                      Phê Duyệt Công Khai
                    </button>
                    <button
                      onClick={() => {
                        setReasonInput('');
                        setReasonDialogData({ mode: 'request_edit', type: 'act', id: act.id, name: act.title });
                      }}
                      className="vv-btn-gold px-3.5 py-2 font-bold cursor-pointer"
                    >
                      Yêu Cầu Sửa
                    </button>
                    <button
                      onClick={() => {
                        setReasonInput('');
                        setReasonDialogData({ mode: 'reject', type: 'act', id: act.id, name: act.title });
                      }}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-full border border-rose-200 cursor-pointer"
                    >
                      Từ Chối
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-3 pt-4 border-t border-[#e8f2ed]">
            <h4 className="text-xs font-bold text-[#1f2d20] uppercase tracking-wider flex items-center gap-2">
              <span>Hồ sơ tổ chức chờ xác minh pháp lý</span>
              <span className="bg-[#e8f2ed] text-[#0d530e] px-2.5 py-0.5 rounded-full">{pendingOrganizations.length}</span>
            </h4>

            {pendingOrganizations.length === 0 ? (
              <p className="text-xs text-[#5a6b5c] italic">Không có tổ chức nào chờ duyệt.</p>
            ) : (
              pendingOrganizations.map((org) => (
                <div
                  key={org.id}
                  className="p-4 rounded-2xl border border-[#0d530e]/20 bg-[#f5f9f7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm text-[#0d530e]">{org.name}</h5>
                    <p className="text-[#445447]">
                      Số GP/Quyết định: <strong>{org.licenseNumber}</strong> • Đại diện: <strong>{org.representative}</strong>
                    </p>
                    <p className="text-[#5a6b5c]">Email: {org.email} • SĐT: {org.phone}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => approveUser(org.id, 'organization')}
                      className="vv-btn-forest px-4 py-2 font-bold cursor-pointer"
                    >
                      Xác Minh Pháp Lý
                    </button>
                    <button
                      onClick={() => {
                        setReasonInput('');
                        setReasonDialogData({ mode: 'reject', type: 'org', id: org.id, name: org.name });
                      }}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-full border border-rose-200 cursor-pointer"
                    >
                      Từ Chối
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-3 pt-4 border-t border-[#e8f2ed]">
            <h4 className="text-xs font-bold text-[#1f2d20] uppercase tracking-wider flex items-center gap-2">
              <span>Tài khoản tình nguyện viên mới chờ duyệt</span>
              <span className="bg-[#e8f2ed] text-[#0d530e] px-2.5 py-0.5 rounded-full">{pendingVolunteers.length}</span>
            </h4>

            {pendingVolunteers.length === 0 ? (
              <p className="text-xs text-[#5a6b5c] italic">Không có tình nguyện viên nào chờ duyệt.</p>
            ) : (
              pendingVolunteers.map((vol) => (
                <div
                  key={vol.id}
                  className="p-4 rounded-2xl border border-[#0d530e]/20 bg-[#f5f9f7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm text-[#0d530e]">{vol.fullName}</h5>
                    <p className="text-[#445447]">Email: {vol.email} • SĐT: {vol.phone}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {vol.skills?.map((s) => (
                        <span key={s} className="bg-white border border-[#0d530e]/15 text-[#2d5543] px-2 py-0.5 rounded-full text-[10px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => approveUser(vol.id, 'volunteer')}
                      className="vv-btn-forest px-4 py-2 font-bold cursor-pointer"
                    >
                      Phê Duyệt Tài Khoản
                    </button>
                    <button
                      onClick={() => {
                        setReasonInput('');
                        setReasonDialogData({ mode: 'reject', type: 'vol', id: vol.id, name: vol.fullName });
                      }}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-full border border-rose-200 cursor-pointer"
                    >
                      Từ Chối
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: USER MANAGEMENT */}
      {activeSubTab === 'users' && (
        <div className="vv-card p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="font-bold text-[#0d530e] text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0d530e]" />
              Quản Lý Người Dùng &amp; Phân Quyền (Chức năng 3 &amp; 5 của Admin)
            </h3>
            <p className="text-xs text-[#5a6b5c] mt-0.5">
              Kiểm tra thông tin, khóa tài khoản vi phạm (có cảnh báo ràng buộc) hoặc xóa tài khoản
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-[#437b62] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Tìm theo họ tên, tên tổ chức, email, SĐT, số giấy phép..."
                className="vv-input w-full pl-10 pr-3 py-2.5"
              />
            </div>

            <select
              value={userStatusFilter}
              onChange={(e) => setUserStatusFilter(e.target.value)}
              className="vv-input p-2.5 font-medium"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active_or_approved">Hoạt động / Đã xác minh</option>
              <option value="pending">Chờ duyệt</option>
              <option value="locked">Đã bị khóa</option>
              <option value="rejected">Bị từ chối</option>
            </select>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#1f2d20] uppercase">
              Danh sách Tình nguyện viên ({filteredVolunteers.length}/{volunteers.length})
            </h4>
            <div className="overflow-x-auto rounded-2xl border border-[#e8f2ed]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f5f9f7] text-[#2d5543] border-b border-[#e8f2ed]">
                  <tr>
                    <th className="p-3.5">Họ tên / Email</th>
                    <th className="p-3.5">Số điện thoại</th>
                    <th className="p-3.5">Giờ công</th>
                    <th className="p-3.5">Trạng thái</th>
                    <th className="p-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8f2ed] bg-white">
                  {filteredVolunteers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-[#5a6b5c] italic">
                        Không có tình nguyện viên nào phù hợp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  ) : (
                    filteredVolunteers.map((vol) => (
                      <tr key={vol.id} className="hover:bg-[#f7f9f7]">
                        <td className="p-3.5">
                          <div className="font-bold text-[#1f2d20]">{vol.fullName}</div>
                          <div className="text-[11px] text-[#5a6b5c]">{vol.email}</div>
                        </td>
                        <td className="p-3.5 text-[#445447]">{vol.phone}</td>
                        <td className="p-3.5 font-bold text-[#0d530e]">{vol.totalHours || 0} giờ</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            vol.status === 'approved' ? 'bg-[#e8f2ed] text-[#0d530e]' :
                            vol.status === 'locked' ? 'bg-rose-100 text-rose-800' :
                            vol.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-[#fef8e6] text-[#8a6100]'
                          }`}>
                            {vol.status === 'approved' ? 'Hoạt động' :
                             vol.status === 'locked' ? 'Đã bị khóa' :
                             vol.status === 'rejected' ? 'Bị từ chối' : 'Chờ duyệt'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => toggleUserLock(vol.id, 'volunteer')}
                            className={`p-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                              vol.status === 'locked' ? 'bg-[#e8f2ed] text-[#0d530e]' : 'bg-[#fef8e6] text-[#8a6100]'
                            }`}
                            title={vol.status === 'locked' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                          >
                            {vol.status === 'locked' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() =>
                              setConfirmDialog({
                                action: 'delete_vol',
                                id: vol.id,
                                title: 'Xác nhận xóa tài khoản Tình nguyện viên',
                                description: `Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "${vol.fullName}" (${vol.email})? Các dữ liệu đăng ký liên quan có thể bị ảnh hưởng.`,
                                confirmLabel: 'Xóa Tài Khoản'
                              })
                            }
                            className="p-1.5 rounded-full text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Xóa tài khoản"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-[#e8f2ed]">
            <h4 className="text-xs font-bold text-[#1f2d20] uppercase">
              Danh sách Đơn vị Tổ chức ({filteredOrganizations.length}/{organizations.length})
            </h4>
            <div className="overflow-x-auto rounded-2xl border border-[#e8f2ed]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f5f9f7] text-[#2d5543] border-b border-[#e8f2ed]">
                  <tr>
                    <th className="p-3.5">Tên tổ chức / Giấy phép</th>
                    <th className="p-3.5">Người đại diện</th>
                    <th className="p-3.5">Loại hình</th>
                    <th className="p-3.5">Trạng thái</th>
                    <th className="p-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8f2ed] bg-white">
                  {filteredOrganizations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-[#5a6b5c] italic">
                        Không có đơn vị tổ chức nào phù hợp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  ) : (
                    filteredOrganizations.map((org) => (
                      <tr key={org.id} className="hover:bg-[#f7f9f7]">
                        <td className="p-3.5">
                          <div className="font-bold text-[#1f2d20]">{org.name}</div>
                          <div className="text-[11px] text-[#5a6b5c]">GP: {org.licenseNumber}</div>
                        </td>
                        <td className="p-3.5 text-[#445447]">{org.representative} ({org.phone})</td>
                        <td className="p-3.5 text-[#5a6b5c]">{org.type}</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            org.status === 'active' ? 'bg-[#e8f2ed] text-[#0d530e]' :
                            org.status === 'locked' || org.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-[#fef8e6] text-[#8a6100]'
                          }`}>
                            {org.status === 'active' ? 'Đã xác minh' :
                             org.status === 'locked' ? 'Bị khóa' :
                             org.status === 'rejected' ? 'Bị từ chối' : 'Chờ xác minh'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => toggleUserLock(org.id, 'organization')}
                            className={`p-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                              org.status === 'locked' ? 'bg-[#e8f2ed] text-[#0d530e]' : 'bg-[#fef8e6] text-[#8a6100]'
                            }`}
                            title={org.status === 'locked' ? 'Mở khóa' : 'Khóa tổ chức'}
                          >
                            {org.status === 'locked' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() =>
                              setConfirmDialog({
                                action: 'delete_org',
                                id: org.id,
                                title: 'Xác nhận xóa Đơn vị Tổ chức',
                                description: `Bạn có chắc chắn muốn xóa vĩnh viễn tổ chức "${org.name}" (GP: ${org.licenseNumber})? Lưu ý: Tổ chức đang có hoạt động sẽ bị chặn xóa theo ràng buộc dữ liệu.`,
                                confirmLabel: 'Xóa Tổ Chức'
                              })
                            }
                            className="p-1.5 rounded-full text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Xóa tổ chức"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ALL ACTIVITIES MANAGEMENT */}
      {activeSubTab === 'activities' && (
        <div className="vv-card p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="font-bold text-[#0d530e] text-lg">Quản Lý Toàn Bộ Hoạt Động (Chức năng 7 Admin)</h3>
            <p className="text-xs text-[#5a6b5c] mt-0.5">
              Kiểm tra nội dung, xóa hoạt động vi phạm (tự động gửi thông báo đến các TNV đã đăng ký)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-[#437b62] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={actSearch}
                onChange={(e) => setActSearch(e.target.value)}
                placeholder="Tìm theo tên hoạt động, đơn vị tổ chức, địa điểm, danh mục..."
                className="vv-input w-full pl-10 pr-3 py-2.5"
              />
            </div>

            <select
              value={actApprovalFilter}
              onChange={(e) => setActApprovalFilter(e.target.value)}
              className="vv-input p-2.5 font-medium"
            >
              <option value="all">Tất cả trạng thái duyệt ({activities.length})</option>
              <option value="approved">Đã duyệt</option>
              <option value="pending">Chờ duyệt</option>
              <option value="need_edit">Cần chỉnh sửa</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-10 text-[#5a6b5c] text-xs space-y-2">
                <p>Không tìm thấy hoạt động phù hợp với bộ lọc hiện tại.</p>
                <button
                  type="button"
                  onClick={() => {
                    setActSearch('');
                    setActApprovalFilter('all');
                  }}
                  className="text-[#0d530e] hover:text-[#d49b11] hover:underline font-semibold cursor-pointer"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            ) : (
              filteredActivities.map((act) => {
                const badge = getApprovalBadge(act.approvalStatus);
                return (
                  <div
                    key={act.id}
                    className="p-4 rounded-2xl border border-[#0d530e]/15 bg-[#f7f9f7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-[#5a6b5c]">[{act.categoryName}]</span>
                        <span className="font-bold text-[#1b5e3a]">{act.organizationName}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge.cls}`}>
                          {badge.text}
                        </span>
                        {act.status === 'cancelled' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            Đã hủy
                          </span>
                        )}
                        {act.status === 'completed' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e8f2ed] text-[#5a6b5c]">
                            Đã hoàn thành
                          </span>
                        )}
                      </div>
                      <h4
                        onClick={() => onSelectActivity(act)}
                        className="font-bold text-sm text-[#0d530e] hover:text-[#d49b11] cursor-pointer"
                      >
                        {act.title}
                      </h4>
                      <p className="text-[#5a6b5c] mt-0.5">
                        📍 {act.locationName} • 👥 {act.volunteersRegistered}/{act.volunteersNeeded} TNV • ⏰ +{act.hoursEarned}h
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onSelectActivity(act)}
                        className="px-4 py-1.5 bg-white text-[#0d530e] font-semibold rounded-full border border-[#0d530e]/25 hover:bg-[#e8f2ed] cursor-pointer"
                      >
                        Xem
                      </button>
                      <button
                        onClick={() =>
                          setConfirmDialog({
                            action: 'delete_act',
                            id: act.id,
                            title: 'Xác nhận gỡ bỏ hoạt động',
                            description: `Bạn có chắc chắn muốn gỡ bỏ hoạt động "${act.title}" của ${act.organizationName}? Toàn bộ TNV đã đăng ký sẽ nhận được thông báo hủy.`,
                            confirmLabel: 'Gỡ Bỏ Hoạt Động'
                          })
                        }
                        className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-full border border-rose-200 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Gỡ Bỏ</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 5: CATEGORIES & LOCATIONS */}
      {activeSubTab === 'categories_locations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="vv-card p-6 space-y-4">
            <h3 className="font-bold text-[#0d530e] text-base flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-[#0d530e]" />
              Quản Lý Danh Mục Lĩnh Vực (Chức năng 10)
            </h3>
            <p className="text-xs text-[#5a6b5c]">
              Ràng buộc an toàn: Không cho phép xóa danh mục đang có hoạt động sử dụng.
            </p>

            <form onSubmit={handleAddCategorySubmit} className="space-y-2.5 text-xs">
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Tên danh mục mới (VD: Cứu hộ động vật...)"
                className="vv-input w-full p-2.5"
              />
              <input
                type="text"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="Mô tả danh mục..."
                className="vv-input w-full p-2.5"
              />
              <button
                type="submit"
                className="vv-btn-primary w-full py-2.5 font-bold cursor-pointer"
              >
                + Thêm Danh Mục
              </button>
            </form>

            <div className="space-y-2 pt-2">
              {categories.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-[#f7f9f7] border border-[#e8f2ed] flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-[#1f2d20]">{c.name}</strong>
                    <p className="text-[11px] text-[#5a6b5c]">{c.description}</p>
                  </div>
                  <button
                    onClick={() =>
                      setConfirmDialog({
                        action: 'delete_cat',
                        id: c.id,
                        title: 'Xác nhận xóa danh mục lĩnh vực',
                        description: `Bạn có chắc chắn muốn xóa danh mục "${c.name}"? Danh mục đang được gán cho hoạt động sẽ không thể xóa.`,
                        confirmLabel: 'Xóa Danh Mục'
                      })
                    }
                    className="text-rose-500 hover:text-rose-700 p-1.5 rounded-full hover:bg-rose-50 cursor-pointer"
                    title="Xóa danh mục"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="vv-card p-6 space-y-4">
            <h3 className="font-bold text-[#0d530e] text-base flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#d49b11]" />
              Quản Lý Địa Điểm / Tỉnh Thành (Chức năng 11)
            </h3>
            <p className="text-xs text-[#5a6b5c]">
              Phân vùng phục vụ cho việc tìm kiếm hoạt động theo khu vực.
            </p>

            <form onSubmit={handleAddLocationSubmit} className="flex gap-2 text-xs">
              <input
                type="text"
                required
                value={newLocName}
                onChange={(e) => setNewLocName(e.target.value)}
                placeholder="Tên Tỉnh/Thành..."
                className="vv-input flex-1 p-2.5"
              />
              <input
                type="text"
                value={newLocCode}
                onChange={(e) => setNewLocCode(e.target.value)}
                placeholder="Mã (HN, HCM...)"
                className="vv-input w-24 p-2.5"
              />
              <button
                type="submit"
                className="vv-btn-forest px-5 py-2 font-bold cursor-pointer"
              >
                Thêm
              </button>
            </form>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {locations.map((l) => (
                <div key={l.id} className="p-3 rounded-xl bg-[#f7f9f7] border border-[#e8f2ed] flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-[#1f2d20]">{l.name}</strong>
                    <span className="text-[10px] text-[#5a6b5c] block">{l.code}</span>
                  </div>
                  <button
                    onClick={() =>
                      setConfirmDialog({
                        action: 'delete_loc',
                        id: l.id,
                        title: 'Xác nhận xóa địa điểm',
                        description: `Bạn có chắc chắn muốn xóa địa điểm "${l.name}" (${l.code})? Địa điểm đang có hoạt động sử dụng sẽ không thể xóa.`,
                        confirmLabel: 'Xóa Địa Điểm'
                      })
                    }
                    className="text-rose-500 hover:text-rose-700 p-1.5 rounded-full hover:bg-rose-50 cursor-pointer"
                    title="Xóa địa điểm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: FEEDBACK & REVIEWS */}
      {activeSubTab === 'feedback' && (
        <div className="vv-card p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="font-bold text-[#0d530e] text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#0d530e]" />
              Quản Lý Đánh Giá &amp; Khiếu Nại Của Người Dùng (Chức năng 13)
            </h3>
            <p className="text-xs text-[#5a6b5c] mt-0.5">
              Xem xét phản ánh của tình nguyện viên, đánh dấu đã xử lý và gửi ghi chú phản hồi
            </p>
          </div>

          <div className="space-y-3">
            {feedbacks.length === 0 ? (
              <p className="text-xs text-[#5a6b5c] italic">Chưa có ý kiến phản hồi nào.</p>
            ) : (
              feedbacks.map((fb) => {
                const isResolved = fb.status === 'resolved';
                return (
                  <div key={fb.id} className="p-4 rounded-2xl bg-[#f7f9f7] border border-[#0d530e]/15 text-xs space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-[#1f2d20] text-sm">{fb.title}</span>
                        <span className="text-[#5a6b5c] ml-2">
                          Gửi bởi: <strong className="text-[#0d530e]">{fb.volunteerName}</strong> ({fb.volunteerEmail})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] bg-white border border-[#0d530e]/20 text-[#0d530e] font-bold px-2.5 py-0.5 rounded-full">
                          Loại: {getFeedbackTargetLabel(fb.targetType)}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isResolved ? 'bg-[#e8f2ed] text-[#0d530e]' : 'bg-[#fef8e6] text-[#8a6100]'
                        }`}>
                          {isResolved ? '✓ Đã xử lý' : '⏳ Chờ xử lý'}
                        </span>
                      </div>
                    </div>

                    <p className="text-[#445447] bg-white p-3.5 rounded-xl border border-[#e8f2ed]">{fb.content}</p>

                    {isResolved && (
                      <div className="p-3.5 rounded-xl bg-[#e8f2ed]/75 border border-[#0d530e]/20 text-[#1f2d20] space-y-0.5">
                        <div className="font-bold text-[#0d530e] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0d530e]" />
                          <span>Phản hồi xử lý từ Ban Quản trị</span>
                          {fb.resolvedAt && (
                            <span className="font-normal text-[10px] text-[#437b62] ml-1">({fb.resolvedAt})</span>
                          )}
                        </div>
                        <p>{fb.adminNote || 'Đã tiếp nhận và hoàn tất xử lý.'}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-[#5a6b5c]">Gửi lúc: {fb.createdAt}</span>
                      {!isResolved && (
                        <button
                          onClick={() => {
                            setResolveAdminNote('');
                            setResolveFbDialog(fb);
                          }}
                          className="vv-btn-forest px-4 py-1.5 font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đánh Dấu Đã Xử Lý</span>
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

      {/* TAB 7: BROADCAST NOTIFICATIONS */}
      {activeSubTab === 'broadcast' && (
        <div className="vv-card p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="font-bold text-[#0d530e] text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#0d530e]" />
              Gửi Thông Báo Hệ Thống (Chức năng 12 Admin)
            </h3>
            <p className="text-xs text-[#5a6b5c] mt-0.5">
              Phát thông điệp quan trọng, chính sách mới hoặc cảnh báo tới người dùng toàn hệ thống
            </p>
          </div>

          <form onSubmit={handleBroadcastSubmit} className="space-y-4 text-xs max-w-xl">
            <div>
              <label className="block font-semibold text-[#1f2d20] mb-1.5">Đối tượng nhận thông báo:</label>
              <select
                value={broadcastTarget}
                onChange={(e) => setBroadcastTarget(e.target.value)}
                className="vv-input w-full p-2.5 font-medium"
              >
                <option value="all">Tất cả người dùng (TNV &amp; Tổ chức)</option>
                <option value="volunteers">Chỉ Tình nguyện viên</option>
                <option value="organizations">Chỉ Đơn vị Tổ chức</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#1f2d20] mb-1.5">Tiêu đề thông báo *</label>
              <input
                type="text"
                required
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="VD: Cập nhật quy định xác thực giờ công tình nguyện..."
                className="vv-input w-full p-2.5"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1f2d20] mb-1.5">Nội dung chi tiết *</label>
              <textarea
                rows={4}
                required
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                placeholder="Nội dung thông báo phát toàn server..."
                className="vv-input w-full p-2.5"
              />
            </div>

            <button
              type="submit"
              className="vv-btn-primary px-7 py-2.5 font-bold shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Phát Thông Báo Toàn Máy Chủ</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 8: SYSTEM SETTINGS */}
      {activeSubTab === 'settings' && (
        <div className="space-y-6">
          <AdminSettingsForm
            key={settingsKey}
            settings={settings}
            onSave={updateSystemSettings}
          />

          <div className="bg-white rounded-2xl p-6 border border-rose-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-bold text-[#1f2d20] text-base flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                  Khôi Phục Dữ Liệu Mẫu (Demo)
                </h3>
                <p className="text-xs text-[#5a6b5c]">
                  Đặt lại toàn bộ tài khoản, hoạt động, lượt đăng ký, phản hồi và cấu hình về dữ liệu mẫu ban đầu của hệ thống.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setConfirmDialog({
                    action: 'reset',
                    title: 'Khôi phục dữ liệu mẫu hệ thống?',
                    description:
                      'Toàn bộ dữ liệu hiện tại (hoạt động, tài khoản mới, đăng ký, điểm danh, cấu hình) sẽ được đặt lại về dữ liệu mẫu ban đầu. Hành động này không thể hoàn tác.',
                    confirmLabel: 'Khôi Phục Dữ Liệu Mẫu'
                  })
                }
                className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-full border border-rose-200 text-xs flex items-center gap-1.5 shrink-0 self-start sm:self-center cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Khôi Phục Dữ Liệu Mẫu</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reason Dialog (Reject or Request Edit) */}
      {reasonDialogData && (
        <div
          onClick={handleReasonBackdrop}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d1f16]/65 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#0d530e]/15 space-y-4 text-xs animate-scale-up">
            <h4 className="font-bold text-sm text-[#1f2d20]">
              {reasonDialogData.mode === 'request_edit'
                ? `Yêu cầu chỉnh sửa hoạt động: ${reasonDialogData.name}`
                : `Nhập lý do từ chối ${reasonDialogData.name}`}
            </h4>
            <p className="text-[#5a6b5c]">
              {reasonDialogData.mode === 'request_edit'
                ? 'Nhập các nội dung cần đơn vị tổ chức bổ sung hoặc chỉnh sửa trước khi gửi duyệt lại.'
                : 'Lý do sẽ được thông báo chính thức đến người dùng / tổ chức.'}
            </p>
            <div>
              <textarea
                rows={3}
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                placeholder={
                  reasonDialogData.mode === 'request_edit'
                    ? 'VD: Cần bổ sung thông tin chi tiết về hậu cần và phương tiện di chuyển...'
                    : 'VD: Thông tin hồ sơ chưa đầy đủ hoặc không hợp lệ...'
                }
                className="vv-input w-full p-3"
              />
              {!reasonInput.trim() && (
                <p className="text-[11px] text-rose-600 mt-1">
                  Vui lòng nhập nội dung lý do trước khi xác nhận.
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeReasonDialog}
                className="px-4 py-2 text-[#5a6b5c] hover:text-[#1f2d20] cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmReason}
                disabled={!reasonInput.trim()}
                className={`px-5 py-2 font-bold rounded-full cursor-pointer disabled:cursor-not-allowed ${
                  reasonDialogData.mode === 'request_edit'
                    ? 'vv-btn-gold disabled:opacity-45'
                    : 'bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white'
                }`}
              >
                {reasonDialogData.mode === 'request_edit' ? 'Gửi Yêu Cầu Sửa' : 'Xác Nhận Từ Chối'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dangerous Action Dialog (Delete / Reset) */}
      {confirmDialog && (
        <div
          onClick={handleConfirmBackdrop}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d1f16]/65 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#0d530e]/15 space-y-4 text-xs animate-scale-up">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-[#1f2d20]">{confirmDialog.title}</h4>
                <p className="text-[#555555] leading-relaxed">{confirmDialog.description}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeConfirmDialog}
                disabled={confirmLoading}
                className="px-4 py-2 text-[#5a6b5c] hover:text-[#1f2d20] font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={confirmLoading}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white font-bold rounded-full cursor-pointer"
              >
                {confirmLoading ? 'Đang xử lý...' : confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Feedback Dialog */}
      {resolveFbDialog && (
        <div
          onClick={handleResolveFbBackdrop}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d1f16]/65 backdrop-blur-xs"
        >
          <form
            onSubmit={handleConfirmResolveFeedback}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#0d530e]/15 space-y-4 text-xs animate-scale-up"
          >
            <h4 className="font-bold text-sm text-[#0d530e] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#0d530e]" />
              <span>Đánh Dấu Đã Xử Lý Phản Hồi</span>
            </h4>
            <div className="p-3.5 rounded-xl bg-[#f7f9f7] border border-[#e8f2ed] space-y-1">
              <div className="font-bold text-[#1f2d20]">{resolveFbDialog.title}</div>
              <p className="text-[#5a6b5c]">Người gửi: {resolveFbDialog.volunteerName}</p>
            </div>
            <div>
              <label className="block font-semibold text-[#1f2d20] mb-1">
                Ghi chú phản hồi gửi tới người dùng (tùy chọn)
              </label>
              <textarea
                rows={3}
                value={resolveAdminNote}
                onChange={(e) => setResolveAdminNote(e.target.value)}
                placeholder="VD: Ban Quản trị đã kiểm tra và điều chỉnh lại thông tin theo phản ánh của bạn..."
                className="vv-input w-full p-3"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeResolveFbDialog}
                disabled={resolveSaving}
                className="px-4 py-2 text-[#5a6b5c] hover:text-[#1f2d20] font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={resolveSaving}
                className="vv-btn-forest px-5 py-2 font-bold disabled:opacity-50 cursor-pointer"
              >
                {resolveSaving ? 'Đang lưu...' : 'Xác Nhận Đã Xử Lý'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
