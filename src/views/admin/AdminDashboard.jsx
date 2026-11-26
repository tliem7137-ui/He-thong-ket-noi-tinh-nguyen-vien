import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  Users,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Trash2,
  Edit,
  FolderTree,
  MapPin,
  MessageSquare,
  Bell,
  Settings,
  BarChart3,
  TrendingUp,
  FileCheck2,
  Clock,
  Sparkles,
  Send,
  Eye,
  Award,
  Layers
} from 'lucide-react';

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
    sendSystemBroadcast,
    updateSystemSettings
  } = useApp();

  // Pending lists
  const pendingVolunteers = volunteers.filter((v) => v.status === 'pending');
  const pendingOrganizations = organizations.filter((o) => o.status === 'pending');
  const pendingActivities = activities.filter((a) => a.approvalStatus === 'pending');

  // Broadcast modal state
  const [broadcastTarget, setBroadcastTarget] = useState('all');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');

  // Category & Location modal states
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newLocName, setNewLocName] = useState('');
  const [newLocCode, setNewLocCode] = useState('');

  // Reject dialog states
  const [rejectDialogData, setRejectDialogData] = useState(null); // { type: 'vol'|'org'|'act', id, name }
  const [reasonInput, setReasonInput] = useState('');

  // Settings states
  const [sysApprovalDays, setSysApprovalDays] = useState(settings?.defaultApprovalDays || 3);
  const [sysMaxRegistrations, setSysMaxRegistrations] = useState(settings?.maxRegistrationsPerVolunteer || 5);
  const [sysGuidelines, setSysGuidelines] = useState(settings?.generalGuidelines || '');

  // Total Certified Hours
  const totalCertifiedHours = volunteers.reduce((acc, v) => acc + (v.totalHours || 0), 0);

  const handleConfirmReject = () => {
    if (!rejectDialogData) return;
    if (rejectDialogData.type === 'vol') {
      rejectUser(rejectDialogData.id, 'volunteer', reasonInput);
    } else if (rejectDialogData.type === 'org') {
      rejectUser(rejectDialogData.id, 'organization', reasonInput);
    } else if (rejectDialogData.type === 'act') {
      rejectActivity(rejectDialogData.id, reasonInput);
    }
    setRejectDialogData(null);
    setReasonInput('');
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

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSystemSettings({
      defaultApprovalDays: Number(sysApprovalDays),
      maxRegistrationsPerVolunteer: Number(sysMaxRegistrations),
      generalGuidelines: sysGuidelines
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Admin Title & KPI Cards */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-800/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md">
                <Shield className="w-4 h-4" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold">Bảng Quản Trị Hệ Thống (Admin Control Panel)</h1>
            </div>
            <p className="text-xs text-purple-200/80 mt-1">
              Giám sát, phê duyệt, quản lý toàn bộ dữ liệu và cấu hình hệ thống V-Connect (Quy trình 8)
            </p>
          </div>

          <div className="flex items-center gap-2">
            {(pendingVolunteers.length > 0 || pendingOrganizations.length > 0 || pendingActivities.length > 0) && (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {pendingVolunteers.length + pendingOrganizations.length + pendingActivities.length} mục chờ duyệt
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Top KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 pt-6 text-xs">
          <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <span className="text-slate-400 block mb-1">Tình Nguyện Viên</span>
            <div className="text-2xl font-black text-emerald-400">{volunteers.length}</div>
            <span className="text-[11px] text-slate-300 mt-1 block">
              {pendingVolunteers.length} chờ duyệt
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <span className="text-slate-400 block mb-1">Đơn Vị Tổ Chức</span>
            <div className="text-2xl font-black text-blue-400">{organizations.length}</div>
            <span className="text-[11px] text-slate-300 mt-1 block">
              {pendingOrganizations.length} chờ xác minh
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <span className="text-slate-400 block mb-1">Tổng Hoạt Động</span>
            <div className="text-2xl font-black text-purple-400">{activities.length}</div>
            <span className="text-[11px] text-slate-300 mt-1 block">
              {pendingActivities.length} chờ duyệt nội dung
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <span className="text-slate-400 block mb-1">Tổng Giờ Công Cấp</span>
            <div className="text-2xl font-black text-amber-400">{totalCertifiedHours}h</div>
            <span className="text-[11px] text-slate-300 mt-1 block">Đã được chứng nhận</span>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <span className="text-slate-400 block mb-1">Lượt Đăng Ký Hệ Thống</span>
            <div className="text-2xl font-black text-teal-400">{registrations.length}</div>
            <span className="text-[11px] text-slate-300 mt-1 block">Trên toàn hệ thống</span>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white p-1 rounded-2xl shadow-xs overflow-x-auto text-xs font-semibold gap-1">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'overview' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Dashboard & Thống Kê
        </button>
        <button
          onClick={() => setActiveSubTab('approvals')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'approvals' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Hàng Đợi Phê Duyệt</span>
          {pendingVolunteers.length + pendingOrganizations.length + pendingActivities.length > 0 && (
            <span className="bg-amber-500 text-white px-2 py-0.2 rounded-full text-[10px] animate-pulse">
              {pendingVolunteers.length + pendingOrganizations.length + pendingActivities.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'users' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Quản Lý Người Dùng
        </button>
        <button
          onClick={() => setActiveSubTab('activities')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'activities' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Toàn Bộ Hoạt Động
        </button>
        <button
          onClick={() => setActiveSubTab('categories_locations')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'categories_locations' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Danh Mục & Địa Điểm
        </button>
        <button
          onClick={() => setActiveSubTab('feedback')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'feedback' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Đánh Giá & Khiếu Nại</span>
          {feedbacks.filter((f) => f.status === 'pending').length > 0 && (
            <span className="bg-rose-500 text-white px-1.5 py-0.2 rounded-full text-[10px]">
              {feedbacks.filter((f) => f.status === 'pending').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('broadcast')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'broadcast' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Thông Báo Toàn Máy Chủ
        </button>
        <button
          onClick={() => setActiveSubTab('settings')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'settings' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Cấu Hình Hệ Thống
        </button>
      </div>

      {/* TAB 1: OVERVIEW & STATS */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart Breakdown by Category */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Phân Bổ Hoạt Động Theo Danh Mục
            </h3>
            <div className="space-y-3 text-xs">
              {categories.map((c) => {
                const count = activities.filter((a) => a.categoryId === c.id).length;
                const percent = activities.length ? Math.round((count / activities.length) * 100) : 0;
                return (
                  <div key={c.id}>
                    <div className="flex justify-between text-slate-700 font-medium mb-1">
                      <span>{c.name}</span>
                      <span>{count} hoạt động ({percent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick System Status & Health */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Tình Trạng Vận Hành Hệ Thống
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-600">Tỷ lệ duyệt tài khoản TNV:</span>
                <span className="font-bold text-emerald-600">
                  {volunteers.length ? Math.round(((volunteers.length - pendingVolunteers.length) / volunteers.length) * 100) : 100}%
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-600">Tổ chức đã xác minh pháp lý:</span>
                <span className="font-bold text-blue-600">
                  {organizations.filter((o) => o.status === 'active').length}/{organizations.length} đơn vị
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-600">Tỷ lệ tham gia thực tế (Attendance):</span>
                <span className="font-bold text-purple-600">
                  {registrations.length ? Math.round((registrations.filter((r) => r.attendanceStatus === 'present').length / registrations.length) * 100) : 0}%
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-600">Đánh giá trung bình toàn hệ thống:</span>
                <span className="font-bold text-amber-600">4.9 / 5.0 ⭐</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APPROVALS QUEUE (Quy trình 1, 3) */}
      {activeSubTab === 'approvals' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-8">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Hàng Đợi Phê Duyệt Hồ Sơ & Hoạt Động Mới
            </h3>
            <p className="text-xs text-slate-500">
              Duyệt tài khoản TNV mới (Quy trình 1.7), xác minh pháp lý tổ chức (Quy trình 1.7) và kiểm duyệt hoạt động (Quy trình 3.8)
            </p>
          </div>

          {/* 1. Pending Activities */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <span>Hoạt động chờ kiểm duyệt nội dung</span>
              <span className="bg-amber-100 text-amber-800 px-2 py-0.2 rounded-full">{pendingActivities.length}</span>
            </h4>

            {pendingActivities.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Không có hoạt động nào đang chờ duyệt.</p>
            ) : (
              pendingActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-4 rounded-2xl border border-amber-200/70 bg-amber-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">
                      {act.organizationName}
                    </span>
                    <h5 className="font-bold text-sm text-slate-800">{act.title}</h5>
                    <p className="text-slate-600">
                      📅 {new Date(act.startDate).toLocaleDateString('vi-VN')} • 📍 {act.locationName} - {act.specificAddress}
                    </p>
                    <p className="text-slate-500 line-clamp-1">{act.description}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => approveActivity(act.id)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                    >
                      Phê Duyệt Công Khai
                    </button>
                    <button
                      onClick={() => requestActivityEdit(act.id, 'Cần bổ sung thông tin chi tiết về hậu cần và phương tiện di chuyển')}
                      className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-xl"
                    >
                      Yêu Cầu Sửa
                    </button>
                    <button
                      onClick={() => setRejectDialogData({ type: 'act', id: act.id, name: act.title })}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200"
                    >
                      Từ Chối
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 2. Pending Organizations */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <span>Hồ sơ tổ chức chờ xác minh pháp lý</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-0.2 rounded-full">{pendingOrganizations.length}</span>
            </h4>

            {pendingOrganizations.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Không có tổ chức nào chờ duyệt.</p>
            ) : (
              pendingOrganizations.map((org) => (
                <div
                  key={org.id}
                  className="p-4 rounded-2xl border border-blue-200/70 bg-blue-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm text-slate-800">{org.name}</h5>
                    <p className="text-slate-600">
                      Số GP/Quyết định: <strong>{org.licenseNumber}</strong> • Đại diện: <strong>{org.representative}</strong>
                    </p>
                    <p className="text-slate-500">Email: {org.email} • SĐT: {org.phone}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => approveUser(org.id, 'organization')}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                    >
                      Xác Minh Pháp Lý
                    </button>
                    <button
                      onClick={() => setRejectDialogData({ type: 'org', id: org.id, name: org.name })}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200"
                    >
                      Từ Chối
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 3. Pending Volunteers */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <span>Tài khoản tình nguyện viên mới chờ duyệt</span>
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full">{pendingVolunteers.length}</span>
            </h4>

            {pendingVolunteers.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Không có tình nguyện viên nào chờ duyệt.</p>
            ) : (
              pendingVolunteers.map((vol) => (
                <div
                  key={vol.id}
                  className="p-4 rounded-2xl border border-emerald-200/70 bg-emerald-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm text-slate-800">{vol.fullName}</h5>
                    <p className="text-slate-600">Email: {vol.email} • SĐT: {vol.phone}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {vol.skills?.map((s) => (
                        <span key={s} className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded text-[10px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => approveUser(vol.id, 'volunteer')}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                    >
                      Phê Duyệt Tài Khoản
                    </button>
                    <button
                      onClick={() => setRejectDialogData({ type: 'vol', id: vol.id, name: vol.fullName })}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200"
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

      {/* TAB 3: USER MANAGEMENT (Khóa / Mở khóa / Xóa) */}
      {activeSubTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Quản Lý Người Dùng & Phân Quyền (Chức năng 3 & 5 của Admin)
            </h3>
            <p className="text-xs text-slate-500">
              Kiểm tra thông tin, khóa tài khoản vi phạm (có cảnh báo ràng buộc) hoặc xóa tài khoản
            </p>
          </div>

          {/* Volunteers List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase">Danh sách Tình nguyện viên ({volunteers.length})</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-100 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Họ tên / Email</th>
                    <th className="p-3">Số điện thoại</th>
                    <th className="p-3">Giờ công</th>
                    <th className="p-3">Trạng thái</th>
                    <th className="p-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {volunteers.map((vol) => (
                    <tr key={vol.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-bold text-slate-800">{vol.fullName}</div>
                        <div className="text-[11px] text-slate-400">{vol.email}</div>
                      </td>
                      <td className="p-3 text-slate-600">{vol.phone}</td>
                      <td className="p-3 font-bold text-emerald-600">{vol.totalHours || 0} giờ</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          vol.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          vol.status === 'locked' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {vol.status === 'approved' ? 'Hoạt động' :
                           vol.status === 'locked' ? 'Đã bị khóa' : 'Chờ duyệt'}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        <button
                          onClick={() => toggleUserLock(vol.id, 'volunteer')}
                          className={`p-1.5 rounded-lg text-xs font-semibold ${
                            vol.status === 'locked' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                          title={vol.status === 'locked' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                        >
                          {vol.status === 'locked' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => deleteUser(vol.id, 'volunteer')}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                          title="Xóa tài khoản"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Organizations List */}
          <div className="space-y-3 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase">Danh sách Đơn vị Tổ chức ({organizations.length})</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-100 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Tên tổ chức / Giấy phép</th>
                    <th className="p-3">Người đại diện</th>
                    <th className="p-3">Loại hình</th>
                    <th className="p-3">Trạng thái</th>
                    <th className="p-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {organizations.map((org) => (
                    <tr key={org.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-bold text-slate-800">{org.name}</div>
                        <div className="text-[11px] text-slate-400">GP: {org.licenseNumber}</div>
                      </td>
                      <td className="p-3 text-slate-600">{org.representative} ({org.phone})</td>
                      <td className="p-3 text-slate-500">{org.type}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          org.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          org.status === 'locked' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {org.status === 'active' ? 'Đã xác minh' :
                           org.status === 'locked' ? 'Bị khóa' : 'Chờ xác minh'}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        <button
                          onClick={() => toggleUserLock(org.id, 'organization')}
                          className={`p-1.5 rounded-lg text-xs font-semibold ${
                            org.status === 'locked' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                          title={org.status === 'locked' ? 'Mở khóa' : 'Khóa tổ chức'}
                        >
                          {org.status === 'locked' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => deleteUser(org.id, 'organization')}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                          title="Xóa tổ chức"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ALL ACTIVITIES MANAGEMENT */}
      {activeSubTab === 'activities' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Quản Lý Toàn Bộ Hoạt Động (Chức năng 7 Admin)</h3>
            <p className="text-xs text-slate-500">
              Kiểm tra nội dung, xóa hoạt động vi phạm (tự động gửi thông báo đến các TNV đã đăng ký)
            </p>
          </div>

          <div className="space-y-3">
            {activities.map((act) => (
              <div
                key={act.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-500">[{act.categoryName}]</span>
                    <span className="font-bold text-blue-700">{act.organizationName}</span>
                    <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                      act.approvalStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {act.approvalStatus === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                    </span>
                  </div>
                  <h4
                    onClick={() => onSelectActivity(act)}
                    className="font-bold text-sm text-slate-800 hover:text-purple-600 cursor-pointer"
                  >
                    {act.title}
                  </h4>
                  <p className="text-slate-500">
                    📍 {act.locationName} • 👥 {act.volunteersRegistered}/{act.volunteersNeeded} TNV • ⏰ +{act.hoursEarned}h
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onSelectActivity(act)}
                    className="px-3 py-1.5 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-slate-100"
                  >
                    Xem
                  </button>
                  <button
                    onClick={() => deleteActivityByAdmin(act.id)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl border border-rose-200 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Gỡ Bỏ</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: CATEGORIES & LOCATIONS (Quy trình 8 ngoại lệ 6a) */}
      {activeSubTab === 'categories_locations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Categories */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-purple-600" />
              Quản Lý Danh Mục Lĩnh Vực (Chức năng 10)
            </h3>
            <p className="text-xs text-slate-500">
              Ràng buộc an toàn: Không cho phép xóa danh mục đang có hoạt động sử dụng.
            </p>

            <form onSubmit={handleAddCategorySubmit} className="space-y-2 text-xs">
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Tên danh mục mới (VD: Cứu hộ động vật...)"
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
              <input
                type="text"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="Mô tả danh mục..."
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
              <button
                type="submit"
                className="w-full py-2 bg-purple-600 text-white font-bold rounded-xl"
              >
                + Thêm Danh Mục
              </button>
            </form>

            <div className="space-y-2 pt-2">
              {categories.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-slate-800">{c.name}</strong>
                    <p className="text-[11px] text-slate-500">{c.description}</p>
                  </div>
                  <button
                    onClick={() => deleteCategory(c.id)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                    title="Xóa danh mục"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-500" />
              Quản Lý Địa Điểm / Tỉnh Thành (Chức năng 11)
            </h3>
            <p className="text-xs text-slate-500">
              Phân vùng phục vụ cho việc tìm kiếm hoạt động theo khu vực.
            </p>

            <form onSubmit={handleAddLocationSubmit} className="flex gap-2 text-xs">
              <input
                type="text"
                required
                value={newLocName}
                onChange={(e) => setNewLocName(e.target.value)}
                placeholder="Tên Tỉnh/Thành..."
                className="flex-1 p-2.5 rounded-xl border border-slate-200"
              />
              <input
                type="text"
                value={newLocCode}
                onChange={(e) => setNewLocCode(e.target.value)}
                placeholder="Mã (HN, HCM...)"
                className="w-24 p-2.5 rounded-xl border border-slate-200"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl"
              >
                Thêm
              </button>
            </form>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {locations.map((l) => (
                <div key={l.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-slate-800">{l.name}</strong>
                    <span className="text-[10px] text-slate-400 block">{l.code}</span>
                  </div>
                  <button
                    onClick={() => deleteLocation(l.id)}
                    className="text-rose-500 hover:text-rose-700 p-1"
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
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              Quản Lý Đánh Giá & Khiếu Nại Của Người Dùng (Chức năng 13)
            </h3>
            <p className="text-xs text-slate-500">
              Xem xét phản ánh của tình nguyện viên và giám sát chất lượng các tổ chức
            </p>
          </div>

          <div className="space-y-3">
            {feedbacks.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Chưa có ý kiến phản hồi nào.</p>
            ) : (
              feedbacks.map((fb) => (
                <div key={fb.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{fb.title}</span>
                      <span className="text-slate-500 ml-2">Gửi bởi: <strong>{fb.volunteerName}</strong> ({fb.volunteerEmail})</span>
                    </div>
                    <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-md">
                      Loại: {fb.targetType}
                    </span>
                  </div>
                  <p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-100">{fb.content}</p>
                  <span className="text-[10px] text-slate-400 block">{fb.createdAt}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 7: BROADCAST NOTIFICATIONS */}
      {activeSubTab === 'broadcast' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-600" />
              Gửi Thông Báo Hệ Thống (Chức năng 12 Admin)
            </h3>
            <p className="text-xs text-slate-500">
              Phát thông điệp quan trọng, chính sách mới hoặc cảnh báo tới người dùng toàn hệ thống
            </p>
          </div>

          <form onSubmit={handleBroadcastSubmit} className="space-y-4 text-xs max-w-xl">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Đối tượng nhận thông báo:</label>
              <select
                value={broadcastTarget}
                onChange={(e) => setBroadcastTarget(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
              >
                <option value="all">Tất cả người dùng (TNV & Tổ chức)</option>
                <option value="volunteers">Chỉ Tình nguyện viên</option>
                <option value="organizations">Chỉ Đơn vị Tổ chức</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tiêu đề thông báo *</label>
              <input
                type="text"
                required
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="VD: Cập nhật quy định xác thực giờ công tình nguyện..."
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nội dung chi tiết *</label>
              <textarea
                rows={4}
                required
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                placeholder="Nội dung thông báo phát toàn server..."
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Phát Thông Báo Toàn Máy Chủ</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 8: SYSTEM SETTINGS (Chức năng 16) */}
      {activeSubTab === 'settings' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" />
              Cấu Hình Tham Số Hệ Thống (Chức năng 16 Admin)
            </h3>
            <p className="text-xs text-slate-500">
              Điều chỉnh thời gian duyệt mặc định, giới hạn lượt đăng ký và quy chế chung
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs max-w-xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Thời gian duyệt mặc định (ngày)</label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={sysApprovalDays}
                  onChange={(e) => setSysApprovalDays(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số lượt đăng ký tối đa / TNV</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={sysMaxRegistrations}
                  onChange={(e) => setSysMaxRegistrations(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quy định & Đạo đức thiện nguyện chung</label>
              <textarea
                rows={4}
                value={sysGuidelines}
                onChange={(e) => setSysGuidelines(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm cursor-pointer"
            >
              Lưu Cấu Hình Hệ Thống
            </button>
          </form>
        </div>
      )}

      {/* Reject Reason Dialog */}
      {rejectDialogData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 text-xs">
            <h4 className="font-bold text-sm text-slate-900">
              Nhập lý do từ chối {rejectDialogData.name}
            </h4>
            <p className="text-slate-500">
              Lý do sẽ được thông báo chính thức đến người dùng / tổ chức.
            </p>
            <textarea
              rows={3}
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              placeholder="VD: Thông tin hồ sơ chưa đầy đủ hoặc không hợp lệ..."
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectDialogData(null)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
              >
                Xác Nhận Từ Chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
