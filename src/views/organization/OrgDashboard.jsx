import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building,
  PlusCircle,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Award,
  Send,
  Star,
  FileText,
  Calendar,
  MapPin,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  Edit,
  Trash2
} from 'lucide-react';

export const OrgDashboard = ({
  activeSubTab = 'overview',
  setActiveSubTab,
  onOpenCreateActivity,
  onSelectActivity
}) => {
  const {
    currentUser,
    activities,
    registrations,
    volunteers,
    reviews,
    volunteerEvaluations,
    updateActivity,
    cancelActivity,
    toggleActivityRecruiting,
    approveRegistration,
    rejectRegistration,
    markAttendance,
    completeActivity,
    submitVolunteerEvaluation,
    updateOrgProfile,
    sendActivityNotificationToVolunteers
  } = useApp();

  // Selected state for dialogs
  const [selectedActivityForAttendance, setSelectedActivityForAttendance] = useState(null);
  const [selectedVolForEval, setSelectedVolForEval] = useState(null); // { volunteer, activityId }
  const [evalRating, setEvalRating] = useState(5);
  const [evalComment, setEvalComment] = useState('Bạn tham gia rất nhiệt tình và trách nhiệm.');

  const [selectedActForNotify, setSelectedActForNotify] = useState(null);
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyContent, setNotifyContent] = useState('');

  const [rejectModalData, setRejectModalData] = useState(null); // { regId, volName }
  const [rejectReason, setRejectReason] = useState('');

  // Organization profile edit state
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editAddress, setEditAddress] = useState(currentUser?.address || '');
  const [editRepresentative, setEditRepresentative] = useState(currentUser?.representative || '');
  const [editWebsite, setEditWebsite] = useState(currentUser?.website || '');
  const [editDescription, setEditDescription] = useState(currentUser?.description || '');

  // Filter activities belonging to current organization
  const orgActivities = activities.filter((a) => a.organizationId === currentUser?.id);
  const orgActivityIds = orgActivities.map((a) => a.id);

  // Filter registrations belonging to this organization's activities
  const orgRegistrations = registrations.filter((r) => orgActivityIds.includes(r.activityId));
  const pendingRegs = orgRegistrations.filter((r) => r.status === 'pending');
  const approvedRegs = orgRegistrations.filter((r) => r.status === 'approved');
  const presentRegs = orgRegistrations.filter((r) => r.attendanceStatus === 'present');

  // Reviews received by this organization
  const orgReviews = reviews.filter((r) => r.organizationId === currentUser?.id);
  const orgAvgRating = orgReviews.length
    ? (orgReviews.reduce((acc, r) => acc + r.rating, 0) / orgReviews.length).toFixed(1)
    : '5.0';

  const approvalRate = orgRegistrations.length
    ? Math.round((approvedRegs.length / orgRegistrations.length) * 100)
    : 0;

  const handleOrgProfileSave = (e) => {
    e.preventDefault();
    updateOrgProfile(currentUser.id, {
      name: editName,
      phone: editPhone,
      address: editAddress,
      representative: editRepresentative,
      website: editWebsite,
      description: editDescription
    });
  };

  const handleSendNotification = (e) => {
    e.preventDefault();
    if (!notifyTitle.trim() || !notifyContent.trim() || !selectedActForNotify) return;
    sendActivityNotificationToVolunteers(selectedActForNotify.id, notifyTitle, notifyContent);
    setSelectedActForNotify(null);
    setNotifyTitle('');
    setNotifyContent('');
  };

  const handleConfirmReject = () => {
    if (!rejectModalData) return;
    rejectRegistration(rejectModalData.regId, rejectReason);
    setRejectModalData(null);
    setRejectReason('');
  };

  const handleEvalSubmit = (e) => {
    e.preventDefault();
    if (!selectedVolForEval) return;
    submitVolunteerEvaluation(
      selectedVolForEval.activityId,
      selectedVolForEval.volunteer.id,
      evalRating,
      evalComment
    );
    setSelectedVolForEval(null);
    setEvalComment('Bạn tham gia rất nhiệt tình và trách nhiệm.');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Account Pending Banner if Org is not verified */}
      {currentUser?.status === 'pending' && (
        <div className="bg-amber-500/10 border-2 border-amber-500/30 p-4 rounded-2xl flex items-start gap-3 text-amber-900 text-xs">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-sm text-amber-900">Hồ Sơ Tổ Chức Đang Chờ Admin Xác Minh Pháp Lý</h4>
            <p className="mt-0.5 text-amber-800 leading-relaxed">
              Theo Quy trình 1, Đơn vị tổ chức cần được Admin kiểm tra giấy chứng nhận/giấy phép thành lập ({currentUser?.licenseNumber}) 
              để đảm bảo tính pháp lý trước khi các hoạt động tạo ra được phê duyệt công khai.
            </p>
          </div>
        </div>
      )}

      {/* Org Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <img
              src={currentUser?.logo || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser?.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-blue-500/20 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {currentUser?.name}
                </h1>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  currentUser?.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {currentUser?.status === 'active' ? '✓ Đã Xác Minh' : '⏳ Chờ Duyệt'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Đại diện: <strong>{currentUser?.representative}</strong> • Giấy phép: {currentUser?.licenseNumber}
              </p>
              <p className="text-xs text-slate-600 mt-1 line-clamp-1">{currentUser?.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenCreateActivity}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tạo Hoạt Động Mới</span>
            </button>
            <button
              onClick={() => setActiveSubTab('profile')}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Sửa Thông Tin
            </button>
          </div>
        </div>

        {/* 4 KPIs for Organization */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100/80">
            <div className="flex items-center justify-between text-blue-700 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Tổng Hoạt Động</span>
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-black text-slate-800">
              {orgActivities.length} <span className="text-sm font-semibold text-slate-500">chiến dịch</span>
            </div>
            <span className="text-[11px] text-blue-700 mt-1 block">Do đơn vị khởi xướng</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100/80">
            <div className="flex items-center justify-between text-emerald-700 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Lượt TNV Đăng Ký</span>
              <Users className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-3xl font-black text-slate-800">
              {orgRegistrations.length} <span className="text-sm font-semibold text-slate-500">lượt</span>
            </div>
            <span className="text-[11px] text-emerald-700 mt-1 block">
              {pendingRegs.length} lượt đang chờ duyệt
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100/80">
            <div className="flex items-center justify-between text-purple-700 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Tỷ Lệ Duyệt & Tham Gia</span>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-3xl font-black text-slate-800">
              {approvalRate}% <span className="text-sm font-semibold text-slate-500">duyệt</span>
            </div>
            <span className="text-[11px] text-purple-700 mt-1 block">
              {presentRegs.length} TNV đã điểm danh có mặt
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100/80">
            <div className="flex items-center justify-between text-amber-700 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Điểm Đánh Giá TB</span>
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
            <div className="text-3xl font-black text-slate-800">
              {orgAvgRating}/5.0
            </div>
            <span className="text-[11px] text-amber-700 mt-1 block">Từ {orgReviews.length} lượt nhận xét TNV</span>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 bg-white p-1 rounded-2xl shadow-xs overflow-x-auto text-xs font-semibold gap-1">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'overview' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Tổng Quan
        </button>
        <button
          onClick={() => setActiveSubTab('activities')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'activities' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Danh Sách Hoạt Động</span>
          <span className="bg-blue-500/30 px-1.5 py-0.2 rounded-full text-[10px]">
            {orgActivities.length}
          </span>
        </button>
        <button
          onClick={() => setActiveSubTab('registrations')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'registrations' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Xét Duyệt TNV</span>
          {pendingRegs.length > 0 && (
            <span className="bg-amber-500 text-white px-2 py-0.2 rounded-full text-[10px] animate-pulse">
              {pendingRegs.length} mới
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('attendance')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'attendance' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Điểm Danh & Xác Nhận Giờ Công</span>
        </button>
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'profile' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Thông Tin Tổ Chức
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Pending Registrations quick action */}
          {pendingRegs.length > 0 && (
            <div className="bg-amber-50/70 p-6 rounded-3xl border border-amber-200/80">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-slate-900 text-base">
                    Có {pendingRegs.length} Yêu Cầu Đăng Ký Đang Chờ Xét Duyệt (Quy trình 5)
                  </h3>
                </div>
                <button
                  onClick={() => setActiveSubTab('registrations')}
                  className="text-xs font-bold text-amber-800 underline"
                >
                  Xử lý tất cả →
                </button>
              </div>

              <div className="space-y-2.5">
                {pendingRegs.slice(0, 3).map((reg) => (
                  <div
                    key={reg.id}
                    className="bg-white p-3.5 rounded-2xl border border-amber-100 flex items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800">{reg.volunteerName} ({reg.volunteerEmail})</div>
                      <div className="text-slate-500">Hoạt động: <strong>{reg.activityTitle}</strong></div>
                      <div className="text-slate-600 italic mt-0.5">"{reg.message}"</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => approveRegistration(reg.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                      >
                        Duyệt
                      </button>
                      <button
                        onClick={() => setRejectModalData({ regId: reg.id, volName: reg.volunteerName })}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200"
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Reviews received */}
          {orgReviews.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
              <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                Đánh Giá Gần Đây Từ Tình Nguyện Viên
              </h3>
              <div className="space-y-3">
                {orgReviews.map((r) => (
                  <div key={r.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{r.volunteerName}</span>
                      <div className="flex gap-0.5 text-amber-400">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 block">{r.activityTitle} • {r.createdAt}</span>
                    <p className="text-slate-600 italic pt-1">"{r.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVITIES MANAGEMENT */}
      {activeSubTab === 'activities' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Quản Lý Các Hoạt Động Đã Tạo</h3>
              <p className="text-xs text-slate-500">
                Thêm, sửa, hủy hoạt động, đóng/mở đăng ký sớm và gửi thông báo tới TNV
              </p>
            </div>
            <button
              onClick={onOpenCreateActivity}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 self-start cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tạo Mới</span>
            </button>
          </div>

          <div className="space-y-4">
            {orgActivities.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Tổ chức chưa tạo hoạt động nào. Hãy bấm "Tạo Mới" để đăng tải chiến dịch!
              </div>
            ) : (
              orgActivities.map((act) => {
                const actRegs = orgRegistrations.filter((r) => r.activityId === act.id);
                return (
                  <div
                    key={act.id}
                    className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          act.approvalStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          act.approvalStatus === 'pending' ? 'bg-amber-100 text-amber-800' :
                          act.approvalStatus === 'need_edit' ? 'bg-orange-100 text-orange-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {act.approvalStatus === 'approved' ? '✓ Admin Đã Duyệt' :
                           act.approvalStatus === 'pending' ? '⏳ Chờ Admin Duyệt' :
                           act.approvalStatus === 'need_edit' ? 'Cần Chỉnh Sửa' : 'Bị Từ Chối'}
                        </span>

                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                          act.status === 'recruiting' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          act.status === 'completed' ? 'bg-slate-200 text-slate-700' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {act.status === 'recruiting' ? 'Đang tuyển TNV' :
                           act.status === 'completed' ? 'Đã hoàn thành' : 'Đã đủ / Đóng tuyển'}
                        </span>

                        <span className="text-xs text-slate-500">
                          {act.categoryName} • +{act.hoursEarned}h công
                        </span>
                      </div>

                      <h4
                        onClick={() => onSelectActivity(act)}
                        className="font-bold text-base text-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        {act.title}
                      </h4>

                      <div className="text-xs text-slate-500 flex flex-wrap gap-4">
                        <span>📅 {new Date(act.startDate).toLocaleDateString('vi-VN')}</span>
                        <span>📍 {act.locationName} - {act.specificAddress}</span>
                        <span>👥 Đã đăng ký: <strong>{act.volunteersRegistered}/{act.volunteersNeeded} TNV</strong></span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {/* Send notice to registered TNVs */}
                      <button
                        onClick={() => setSelectedActForNotify(act)}
                        className="px-3 py-1.5 text-xs bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold rounded-xl border border-sky-200 flex items-center gap-1 cursor-pointer"
                        title="Gửi thông báo tới toàn bộ TNV của hoạt động này"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Gửi Thông Báo</span>
                      </button>

                      {/* Toggle Recruiting */}
                      {act.status !== 'completed' && (
                        <button
                          onClick={() => toggleActivityRecruiting(act.id)}
                          className="px-3 py-1.5 text-xs bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-200 cursor-pointer"
                        >
                          {act.status === 'recruiting' ? 'Đóng Tuyển' : 'Mở Tuyển Lại'}
                        </button>
                      )}

                      {/* Mark Completed */}
                      {act.status !== 'completed' && (
                        <button
                          onClick={() => completeActivity(act.id)}
                          className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs cursor-pointer"
                        >
                          Kết Thúc Hoạt Động
                        </button>
                      )}

                      {/* Cancel Activity with reason */}
                      {act.status !== 'completed' && act.status !== 'cancelled' && (
                        <button
                          onClick={() => {
                            const reason = window.prompt('Nhập lý do hủy hoạt động (sẽ tự động thông báo tới tất cả TNV đã đăng ký):');
                            if (reason) cancelActivity(act.id, reason);
                          }}
                          className="px-3 py-1.5 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl border border-rose-200 cursor-pointer"
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
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Quản Lý Đăng Ký & Xét Duyệt TNV (Quy trình 5)</h3>
            <p className="text-xs text-slate-500">
              Đánh giá hồ sơ tình nguyện viên, xem kỹ năng, lịch sử và quyết định duyệt hoặc từ chối
            </p>
          </div>

          <div className="space-y-3">
            {orgRegistrations.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Chưa có tình nguyện viên nào đăng ký vào các hoạt động của bạn.
              </div>
            ) : (
              orgRegistrations.map((reg) => {
                const vol = volunteers.find((v) => v.id === reg.volunteerId);
                return (
                  <div
                    key={reg.id}
                    className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          reg.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          reg.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {reg.status === 'approved' ? '✓ Đã Duyệt' :
                           reg.status === 'pending' ? '⏳ Chờ Duyệt' : 'Bị Từ Chối'}
                        </span>
                        <span className="font-bold text-sm text-slate-900">{reg.volunteerName}</span>
                        <span className="text-xs text-slate-400">({reg.volunteerEmail} • {reg.volunteerPhone})</span>
                      </div>

                      <div className="text-xs text-slate-600">
                        Hoạt động: <strong>{reg.activityTitle}</strong>
                      </div>

                      <div className="text-xs text-slate-500">
                        Lời nhắn: <em>"{reg.message}"</em>
                      </div>

                      {vol && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="text-[10px] text-slate-400 mr-1">Kỹ năng:</span>
                          {vol.skills?.map((s) => (
                            <span key={s} className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded text-[10px]">
                              {s}
                            </span>
                          ))}
                          <span className="text-[10px] text-emerald-600 font-bold ml-2">
                            (Đã tích lũy {vol.totalHours || 0}h công)
                          </span>
                        </div>
                      )}

                      {reg.status === 'rejected' && (
                        <p className="text-[11px] text-rose-600 font-medium">Lý do từ chối: {reg.orgRejectReason}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      {reg.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => approveRegistration(reg.id)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => setRejectModalData({ regId: reg.id, volName: reg.volunteerName })}
                            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs border border-rose-200 cursor-pointer"
                          >
                            Từ Chối
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-slate-500">
                          {reg.status === 'approved' ? '✓ Đã gửi thông báo chấp thuận' : 'Đã từ chối'}
                        </span>
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
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Điểm Danh & Xác Nhận Giờ Công Tình Nguyện (Quy trình 6)
            </h3>
            <p className="text-xs text-slate-500">
              Ghi nhận tình nguyện viên Có mặt / Vắng mặt. Khi đánh dấu Có mặt, hệ thống tự động cộng giờ công vào hồ sơ và cấp chứng chỉ!
            </p>
          </div>

          {/* Select activity filter for attendance */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chọn hoạt động cần điểm danh:
            </label>
            <select
              value={selectedActivityForAttendance?.id || 'all'}
              onChange={(e) => {
                const found = orgActivities.find((a) => a.id === e.target.value);
                setSelectedActivityForAttendance(found || null);
              }}
              className="w-full sm:w-1/2 p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-medium"
            >
              <option value="all">-- Xem tất cả TNV đã được duyệt --</option>
              {orgActivities.map((act) => (
                <option key={act.id} value={act.id}>{act.title}</option>
              ))}
            </select>
          </div>

          {/* Attendance list */}
          <div className="space-y-3">
            {approvedRegs
              .filter((r) => !selectedActivityForAttendance || r.activityId === selectedActivityForAttendance.id)
              .map((reg) => {
                const vol = volunteers.find((v) => v.id === reg.volunteerId);
                const isPresent = reg.attendanceStatus === 'present';
                const isAbsent = reg.attendanceStatus === 'absent';

                return (
                  <div
                    key={reg.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isPresent ? 'bg-emerald-50/70 border-emerald-200' :
                      isAbsent ? 'bg-rose-50/70 border-rose-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{reg.volunteerName}</span>
                        {reg.confirmedByVolunteer && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.2 rounded-full">
                            Đã xác nhận sẵn sàng
                          </span>
                        )}
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          isPresent ? 'bg-emerald-600 text-white' :
                          isAbsent ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {isPresent ? `✓ Có Mặt (+${reg.hoursConfirmed}h)` :
                           isAbsent ? '✗ Vắng Mặt' : 'Chưa điểm danh'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">Chiến dịch: <strong>{reg.activityTitle}</strong></p>
                      <p className="text-xs text-slate-500">SĐT: {reg.volunteerPhone} • Email: {reg.volunteerEmail}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Mark Present */}
                      <button
                        onClick={() => markAttendance(reg.id, 'present')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isPresent
                            ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400'
                            : 'bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300'
                        }`}
                      >
                        ✓ Có Mặt
                      </button>

                      {/* Mark Absent */}
                      <button
                        onClick={() => markAttendance(reg.id, 'absent')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isAbsent
                            ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400'
                            : 'bg-white hover:bg-rose-50 text-rose-700 border border-rose-300'
                        }`}
                      >
                        ✗ Vắng Mặt
                      </button>

                      {/* Rate Volunteer (Chức năng 13 của Tổ chức) */}
                      {isPresent && (
                        <button
                          onClick={() => setSelectedVolForEval({ volunteer: vol, activityId: reg.activityId })}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5" />
                          <span>Đánh Giá TNV</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 5: ORG PROFILE */}
      {activeSubTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              Thông Tin Đơn Vị Tổ Chức (Chức năng 4)
            </h3>
            <p className="text-xs text-slate-500">
              Thông tin công khai giúp tạo dựng uy tín với cộng đồng tình nguyện viên
            </p>
          </div>

          <form onSubmit={handleOrgProfileSave} className="space-y-4 text-xs max-w-2xl">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tên tổ chức</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Người đại diện</label>
                <input
                  type="text"
                  value={editRepresentative}
                  onChange={(e) => setEditRepresentative(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số điện thoại liên hệ</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Địa chỉ trụ sở</label>
              <input
                type="text"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Website</label>
              <input
                type="text"
                value={editWebsite}
                onChange={(e) => setEditWebsite(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mô tả tôn chỉ & mục tiêu</label>
              <textarea
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Lưu Thông Tin Tổ Chức
            </button>
          </form>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 text-xs">
            <h4 className="font-bold text-sm text-slate-900">
              Nhập lý do từ chối TNV {rejectModalData.volName} (Quy trình 5.6)
            </h4>
            <p className="text-slate-500">
              Lý do này sẽ được gửi trực tiếp đến hộp thư thông báo của tình nguyện viên.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="VD: Rất tiếc đợt này đã đủ số lượng TNV có chuyên môn phù hợp..."
              className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 bg-slate-50"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectModalData(null)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
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

      {/* Send Notification Modal */}
      {selectedActForNotify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleSendNotification} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Send className="w-4 h-4 text-sky-600" />
                Gửi Thông Báo Tới TNV Hoạt Động (Chức năng 11)
              </h4>
              <button type="button" onClick={() => setSelectedActForNotify(null)}>
                <XCircle className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <p className="text-slate-500">
              Chiến dịch: <strong>{selectedActForNotify.title}</strong>
            </p>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tiêu đề thông báo *</label>
              <input
                type="text"
                required
                value={notifyTitle}
                onChange={(e) => setNotifyTitle(e.target.value)}
                placeholder="VD: Dặn dò giờ giấc tập trung, trang phục..."
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nội dung chi tiết *</label>
              <textarea
                rows={4}
                required
                value={notifyContent}
                onChange={(e) => setNotifyContent(e.target.value)}
                placeholder="Nội dung nhắc nhở, hướng dẫn cụ thể..."
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedActForNotify(null)}
                className="px-4 py-2 text-slate-600"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-xs"
              >
                Phát Thông Báo
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Evaluate Volunteer Modal */}
      {selectedVolForEval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleEvalSubmit} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 text-xs">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              Đánh Giá Tình Nguyện Viên {selectedVolForEval.volunteer?.fullName} (Chức năng 13)
            </h4>
            <p className="text-slate-500">
              Đánh giá này sẽ được lưu trữ vĩnh viễn vào hồ sơ uy tín của tình nguyện viên.
            </p>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Chấm điểm:</span>
              <div className="flex gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEvalRating(star)}
                    className="hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${star <= evalRating ? 'fill-amber-400' : 'text-slate-300'}`}
                    />
                  </button>
                ))}
              </div>
              <span className="font-bold text-amber-700">({evalRating}/5 sao)</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nhận xét về thái độ, tinh thần đóng góp *</label>
              <textarea
                rows={3}
                required
                value={evalComment}
                onChange={(e) => setEvalComment(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedVolForEval(null)}
                className="px-4 py-2 text-slate-600"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-xs"
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
