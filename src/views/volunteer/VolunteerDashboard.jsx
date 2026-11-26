import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ActivityCard } from '../../components/ActivityCard';
import { CertificateModal } from '../../components/CertificateModal';
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  Heart,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Star,
  User,
  Users,
  X,
  AlertTriangle,
  Lock
} from 'lucide-react';

export const VolunteerDashboard = ({
  activeSubTab = 'overview',
  setActiveSubTab,
  onSelectActivity
}) => {
  const {
    currentUser,
    activities,
    registrations,
    reviews,
    volunteerEvaluations,
    cancelRegistration,
    confirmVolunteerAttendance,
    updateVolunteerProfile,
    submitFeedback
  } = useApp();

  const [selectedCertReg, setSelectedCertReg] = useState(null);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackTarget, setFeedbackTarget] = useState('system');

  // Edit Profile States
  const [editFullName, setEditFullName] = useState(currentUser?.fullName || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editAddress, setEditAddress] = useState(currentUser?.address || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editSkills, setEditSkills] = useState(currentUser?.skills || []);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // My registrations
  const myRegistrations = registrations.filter(
    (r) => r.volunteerId === currentUser?.id && r.status !== 'cancelled'
  );

  const pendingRegs = myRegistrations.filter((r) => r.status === 'pending');
  const approvedRegs = myRegistrations.filter((r) => r.status === 'approved' && r.attendanceStatus !== 'present');
  const completedRegs = myRegistrations.filter((r) => r.attendanceStatus === 'present');
  const rejectedRegs = registrations.filter(
    (r) => r.volunteerId === currentUser?.id && r.status === 'rejected'
  );

  // Volunteer evaluations from organizations
  const myEvaluations = volunteerEvaluations.filter((e) => e.volunteerId === currentUser?.id);

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
    updateVolunteerProfile(currentUser.id, {
      fullName: editFullName,
      phone: editPhone,
      address: editAddress,
      bio: editBio,
      skills: editSkills
    });
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackTitle.trim() || !feedbackContent.trim()) return;
    submitFeedback(feedbackTitle, feedbackContent, feedbackTarget);
    setFeedbackTitle('');
    setFeedbackContent('');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Account Pending Banner if user is not approved */}
      {currentUser?.status === 'pending' && (
        <div className="bg-amber-500/10 border-2 border-amber-500/30 p-4 rounded-2xl flex items-start gap-3 text-amber-900 text-xs">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-sm text-amber-900">Tài Khoản Đang Chờ Quản Trị Viên Phê Duyệt</h4>
            <p className="mt-0.5 text-amber-800 leading-relaxed">
              Tài khoản của bạn vừa được khởi tạo và đang trong danh sách chờ duyệt bởi Ban Quản trị. 
              Bạn có thể cập nhật hồ sơ cá nhân và tìm hiểu các hoạt động. Sau khi được duyệt, bạn sẽ có thể đăng ký tham gia các chiến dịch.
            </p>
          </div>
        </div>
      )}

      {/* Profile Header & KPI Cards */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser?.fullName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-emerald-500/20 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {currentUser?.fullName}
                </h1>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  currentUser?.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {currentUser?.status === 'approved' ? '✓ Đã Xác Thực' : '⏳ Chờ Duyệt'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{currentUser?.email} • {currentUser?.phone}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {currentUser?.skills?.map((s) => (
                  <span key={s} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('profile')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              Chỉnh Sửa Hồ Sơ
            </button>
            <button
              onClick={() => setActiveSubTab('feedback')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
            >
              Gửi Phản Hồi
            </button>
          </div>
        </div>

        {/* 4 KPIs for Volunteer */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/80">
            <div className="flex items-center justify-between text-emerald-700 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Tổng Giờ Công</span>
              <Award className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-black text-slate-800">
              {currentUser?.totalHours || 0} <span className="text-sm font-semibold text-slate-500">giờ</span>
            </div>
            <span className="text-[11px] text-emerald-700 mt-1 block">Đã được tổ chức xác nhận</span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/80">
            <div className="flex items-center justify-between text-blue-700 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Đã Hoàn Thành</span>
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-black text-slate-800">
              {completedRegs.length} <span className="text-sm font-semibold text-slate-500">hoạt động</span>
            </div>
            <span className="text-[11px] text-blue-700 mt-1 block">Điểm danh có mặt đầy đủ</span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100/80">
            <div className="flex items-center justify-between text-purple-700 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Đánh Giá Từ BTC</span>
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <div className="text-3xl font-black text-slate-800">
              {currentUser?.ratingAvg ? `${currentUser.ratingAvg}/5.0` : '5.0/5.0'}
            </div>
            <span className="text-[11px] text-purple-700 mt-1 block">Từ {myEvaluations.length} lượt đánh giá</span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100/80">
            <div className="flex items-center justify-between text-amber-700 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Đang Chờ / Sắp Tới</span>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-black text-slate-800">
              {pendingRegs.length + approvedRegs.length} <span className="text-sm font-semibold text-slate-500">chiến dịch</span>
            </div>
            <span className="text-[11px] text-amber-700 mt-1 block">
              {approvedRegs.length} đã duyệt, {pendingRegs.length} chờ duyệt
            </span>
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white p-1 rounded-2xl shadow-xs overflow-x-auto text-xs font-semibold gap-1">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'overview' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Tổng Quan Hoạt Động
        </button>
        <button
          onClick={() => setActiveSubTab('my_activities')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'my_activities' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Đã Đăng Ký</span>
          <span className="bg-emerald-500/30 px-1.5 py-0.2 rounded-full text-[10px]">
            {myRegistrations.length}
          </span>
        </button>
        <button
          onClick={() => setActiveSubTab('calendar')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'calendar' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Lịch Trình Tình Nguyện
        </button>
        <button
          onClick={() => setActiveSubTab('history_cert')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'history_cert' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Chứng Nhận Giờ Công ({currentUser?.totalHours || 0}h)</span>
        </button>
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'profile' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Hồ Sơ & Kỹ Năng
        </button>
        <button
          onClick={() => setActiveSubTab('feedback')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'feedback' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Phản Hồi & Khiếu Nại
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Upcoming Approved Activities */}
          {approvedRegs.length > 0 && (
            <div className="bg-emerald-50/70 rounded-3xl p-6 border border-emerald-200/80">
              <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                Hoạt Động Sắp Tới Đã Được Chấp Thuận
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {approvedRegs.map((reg) => {
                  const act = activities.find((a) => a.id === reg.activityId);
                  return (
                    <div key={reg.id} className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs space-y-3">
                      <div>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          Đã Duyệt Tham Gia
                        </span>
                        <h4 className="font-bold text-sm text-slate-800 mt-1 line-clamp-1">{reg.activityTitle}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          <span>{act ? act.locationName : 'Việt Nam'} - {act?.specificAddress}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                        {reg.confirmedByVolunteer ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Đã xác nhận sẵn sàng
                          </span>
                        ) : (
                          <button
                            onClick={() => confirmVolunteerAttendance(reg.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-colors"
                          >
                            Xác nhận sẽ tham gia
                          </button>
                        )}

                        <button
                          onClick={() => act && onSelectActivity(act)}
                          className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold underline"
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

          {/* Evaluations from Organizations */}
          {myEvaluations.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
              <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                Nhận Xét & Đánh Giá Từ Đơn Vị Tổ Chức ({myEvaluations.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {myEvaluations.map((ev) => (
                  <div key={ev.id} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Đơn vị tổ chức đánh giá</span>
                      <div className="flex gap-0.5 text-amber-400">
                        {Array.from({ length: ev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-700 italic">"{ev.feedback}"</p>
                    <span className="text-[10px] text-slate-400 block pt-1">{ev.createdAt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Activities Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Hoạt Động Gợi Ý Cho Bạn</h3>
                <p className="text-xs text-slate-500">Dựa trên các lĩnh vực quan tâm và kỹ năng trong hồ sơ</p>
              </div>
              <button
                onClick={() => setActiveSubTab('explore')}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-bold"
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
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Danh Sách Hoạt Động Của Bạn</h3>
            <p className="text-xs text-slate-500">
              Quản lý các trạng thái đăng ký: Chờ duyệt, Đã duyệt, Hoàn thành và Từ chối
            </p>
          </div>

          <div className="space-y-3">
            {myRegistrations.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Bạn chưa đăng ký hoạt động nào. Hãy khám phá và tham gia ngay!
              </div>
            ) : (
              myRegistrations.map((reg) => {
                const act = activities.find((a) => a.id === reg.activityId);
                return (
                  <div
                    key={reg.id}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          reg.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          reg.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {reg.status === 'approved' ? '✓ Đã Duyệt' :
                           reg.status === 'pending' ? '⏳ Chờ Xét Duyệt' : 'Bị Từ Chối'}
                        </span>
                        {reg.attendanceStatus === 'present' && (
                          <span className="text-[11px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">
                            ✓ Có Mặt (+{reg.hoursConfirmed}h)
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">Đăng ký ngày {reg.registeredDate}</span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-800">{reg.activityTitle}</h4>
                      <p className="text-xs text-slate-500">Lời nhắn: "{reg.message}"</p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {reg.status === 'pending' && (
                        <button
                          onClick={() => cancelRegistration(reg.id)}
                          className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-semibold border border-rose-200 transition-colors cursor-pointer"
                        >
                          Hủy Đăng Ký
                        </button>
                      )}

                      {reg.attendanceStatus === 'present' && (
                        <button
                          onClick={() => setSelectedCertReg(reg)}
                          className="px-3 py-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Xem Chứng Nhận</span>
                        </button>
                      )}

                      <button
                        onClick={() => act && onSelectActivity(act)}
                        className="px-3 py-1.5 text-xs bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-semibold border border-slate-200 transition-colors cursor-pointer"
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
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Lịch Trình Hoạt Động Đã Đăng Ký
            </h3>
            <p className="text-xs text-slate-500">
              Giúp bạn quản lý thời gian biểu và phòng ngừa xung đột lịch trình (Quy trình 4c)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myRegistrations.map((reg) => {
              const act = activities.find((a) => a.id === reg.activityId);
              return (
                <div key={reg.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {act ? new Date(act.startDate).toLocaleDateString('vi-VN') : 'Đang cập nhật'}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      reg.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {reg.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">{reg.activityTitle}</h4>
                  <div className="text-xs text-slate-500 space-y-1">
                    <p>📍 {act?.locationName} - {act?.specificAddress}</p>
                    <p>⏰ {act ? `${new Date(act.startDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${new Date(act.endDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : ''}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: HISTORY & CERTIFICATE */}
      {activeSubTab === 'history_cert' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Hồ Sơ Giờ Công & Giấy Chứng Nhận Điện Tử
              </h3>
              <p className="text-xs text-slate-500">
                Lưu trữ minh bạch toàn bộ các hoạt động đã tham gia và được điểm danh
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl text-xs font-bold text-amber-900">
              Tổng tích lũy: {currentUser?.totalHours || 0} Giờ Công
            </div>
          </div>

          {completedRegs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Chưa có hoạt động nào được xác nhận hoàn thành. Hãy tham gia và nhận điểm danh từ Ban tổ chức!
            </div>
          ) : (
            <div className="space-y-3">
              {completedRegs.map((reg) => {
                const act = activities.find((a) => a.id === reg.activityId);
                return (
                  <div
                    key={reg.id}
                    className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-md">
                          +{reg.hoursConfirmed} Giờ Công
                        </span>
                        <span className="text-xs text-slate-500">{act?.organizationName}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-800">{reg.activityTitle}</h4>
                      <span className="text-[11px] text-slate-400">Tham gia thành công vào {reg.registeredDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedCertReg(reg)}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <Award className="w-4 h-4" />
                        <span>Xem & In Giấy Chứng Nhận</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PROFILE EDIT */}
      {activeSubTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              Quản Lý Hồ Sơ Cá Nhân & Kỹ Năng
            </h3>
            <p className="text-xs text-slate-500">
              Hồ sơ đầy đủ giúp đơn vị tổ chức dễ dàng đánh giá mức độ phù hợp khi xét duyệt đăng ký
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs max-w-2xl">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Họ và tên</label>
              <input
                type="text"
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Địa chỉ thường trú</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kỹ năng chuyên môn & tình nguyện</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {editSkills.map((s) => (
                  <span key={s} className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5">
                    {s}
                    <button type="button" onClick={() => handleRemoveSkill(s)} className="text-emerald-700 hover:text-emerald-900">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  placeholder="Thêm kỹ năng: Dạy tiếng Anh, Quay phim, Lái xe..."
                  className="flex-1 p-2 rounded-xl border border-slate-200 bg-slate-50/50"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold"
                >
                  Thêm
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Giới thiệu ngắn (Bio)</label>
              <textarea
                rows={3}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Lưu Thay Đổi Hồ Sơ
            </button>
          </form>
        </div>
      )}

      {/* TAB 6: FEEDBACK & COMPLAINTS */}
      {activeSubTab === 'feedback' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              Gửi Ý Kiến Phản Hồi / Khiếu Nại (Chức năng 14)
            </h3>
            <p className="text-xs text-slate-500">
              Góp ý về hệ thống, phản ánh chất lượng tổ chức hoặc báo cáo vấn đề trong quá trình tham gia hoạt động
            </p>
          </div>

          <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs max-w-xl">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Loại phản ánh:</label>
              <select
                value={feedbackTarget}
                onChange={(e) => setFeedbackTarget(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50"
              >
                <option value="system">Góp ý phát triển hệ thống V-Connect</option>
                <option value="organization">Phản ánh về Đơn vị tổ chức</option>
                <option value="activity">Khiếu nại về công tác tổ chức / điểm danh</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tiêu đề phản ánh *</label>
              <input
                type="text"
                required
                value={feedbackTitle}
                onChange={(e) => setFeedbackTitle(e.target.value)}
                placeholder="VD: Cần cập nhật lại số giờ công hoạt động..."
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nội dung chi tiết *</label>
              <textarea
                rows={4}
                required
                value={feedbackContent}
                onChange={(e) => setFeedbackContent(e.target.value)}
                placeholder="Mô tả cụ thể sự việc, thời gian và đề xuất hướng xử lý..."
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all cursor-pointer"
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
