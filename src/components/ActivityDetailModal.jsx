import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Calendar,
  MapPin,
  Users,
  Award,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Star,
  Send,
  AlertTriangle,
  Building,
  Heart
} from 'lucide-react';

export const ActivityDetailModal = ({ activity, isOpen, onClose, onOpenLogin }) => {
  const {
    userRole,
    currentUser,
    registrations,
    registerForActivity,
    cancelRegistration,
    confirmVolunteerAttendance,
    reviews,
    submitActivityReview
  } = useApp();

  const [message, setMessage] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  if (!isOpen || !activity) return null;

  const isVolunteer = userRole === 'volunteer';
  const myReg = isVolunteer
    ? registrations.find(
        (r) => r.activityId === activity.id && r.volunteerId === currentUser?.id && r.status !== 'cancelled'
      )
    : null;

  const activityReviews = reviews.filter((r) => r.activityId === activity.id);
  const avgRating = activityReviews.length
    ? (activityReviews.reduce((acc, r) => acc + r.rating, 0) / activityReviews.length).toFixed(1)
    : null;

  const progressPercent = Math.min(100, Math.round((activity.volunteersRegistered / activity.volunteersNeeded) * 100));

  const handleRegister = () => {
    if (userRole === 'guest') {
      onOpenLogin();
      return;
    }
    const res = registerForActivity(activity.id, message);
    if (res.success) {
      setMessage('');
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    const res = submitActivityReview(activity.id, reviewRating, reviewComment);
    if (res.success) {
      setShowReviewForm(false);
      setReviewComment('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-up my-auto">
        {/* Banner with close button */}
        <div className="relative h-60 shrink-0 bg-slate-900">
          <img
            src={activity.banner || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop&q=80'}
            alt={activity.title}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute top-4 left-4 flex gap-2">
            <span className="bg-emerald-600/90 text-white font-bold text-xs px-3 py-1 rounded-full backdrop-blur-md">
              {activity.categoryName}
            </span>
            <span className="bg-amber-500/90 text-white font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1 backdrop-blur-md">
              <Award className="w-3.5 h-3.5" />
              +{activity.hoursEarned} Giờ công chứng nhận
            </span>
          </div>

          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="flex items-center gap-2 text-xs text-emerald-300 font-medium mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>{activity.organizationName}</span>
              {avgRating && (
                <span className="flex items-center gap-1 bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-md text-[11px] font-bold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {avgRating} ({activityReviews.length} đánh giá)
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold leading-snug drop-shadow-md">
              {activity.title}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Progress bar info */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-2/3">
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Tiến độ tuyển tình nguyện viên:</span>
                <span className="text-emerald-700">{activity.volunteersRegistered}/{activity.volunteersNeeded} người ({progressPercent}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    progressPercent >= 100 ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className={`px-3 py-1.5 rounded-xl border ${
                activity.status === 'recruiting'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : activity.status === 'completed'
                  ? 'bg-slate-100 text-slate-700 border-slate-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {activity.status === 'recruiting' ? 'Đang mở đăng ký' :
                 activity.status === 'completed' ? 'Đã kết thúc' : 'Đã đủ số lượng'}
              </span>
            </div>
          </div>

          {/* Key metadata grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
              <Calendar className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-700 block">Thời gian diễn ra:</span>
                <span className="text-slate-600">
                  {new Date(activity.startDate).toLocaleString('vi-VN')} đến {new Date(activity.endDate).toLocaleString('vi-VN')}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-700 block">Địa điểm tập trung:</span>
                <span className="text-slate-600">{activity.locationName} - {activity.specificAddress}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Mô tả chi tiết hoạt động
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-slate-100">
              {activity.description}
            </p>
          </div>

          {/* Requirements and Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
              <h5 className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Yêu cầu đối với TNV
              </h5>
              <p className="text-xs text-amber-800/90 leading-relaxed">{activity.requirements}</p>
            </div>

            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
              <h5 className="text-xs font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                Quyền lợi được hưởng
              </h5>
              <p className="text-xs text-emerald-800/90 leading-relaxed">{activity.benefits}</p>
            </div>
          </div>

          {/* Registration Section */}
          <div className="border-t border-slate-100 pt-5">
            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              Trạng thái & Đăng ký tham gia
            </h4>

            {userRole === 'guest' ? (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <p className="text-xs text-slate-600 mb-3">
                  Bạn cần đăng nhập bằng tài khoản Tình nguyện viên để đăng ký tham gia hoạt động này.
                </p>
                <button
                  onClick={onOpenLogin}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
                >
                  Đăng Nhập Ngay
                </button>
              </div>
            ) : isVolunteer ? (
              myReg ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-900">Trạng thái đăng ký của bạn:</span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        myReg.status === 'approved' ? 'bg-emerald-600 text-white' :
                        myReg.status === 'pending' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
                      }`}>
                        {myReg.status === 'approved' ? '✓ Đã Được Chấp Thuận' :
                         myReg.status === 'pending' ? '⏳ Đang Chờ Xét Duyệt' : 'Bị Từ Chối'}
                      </span>
                    </div>

                    {myReg.status === 'pending' && (
                      <button
                        onClick={() => cancelRegistration(myReg.id)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline cursor-pointer"
                      >
                        Hủy đăng ký
                      </button>
                    )}
                  </div>

                  {myReg.status === 'approved' && !myReg.confirmedByVolunteer && (
                    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-100">
                      <span className="text-xs text-slate-700">Tổ chức yêu cầu bạn xác nhận tham gia trước ngày diễn ra:</span>
                      <button
                        onClick={() => confirmVolunteerAttendance(myReg.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-colors"
                      >
                        Xác nhận sẽ tham gia
                      </button>
                    </div>
                  )}

                  {myReg.status === 'approved' && myReg.confirmedByVolunteer && (
                    <div className="text-xs text-emerald-800 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Bạn đã xác nhận sẽ tham gia. Vui lòng có mặt đúng giờ!</span>
                    </div>
                  )}

                  {/* Attendance status */}
                  {myReg.attendanceStatus === 'present' && (
                    <div className="bg-emerald-600 text-white p-3 rounded-xl text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-300" />
                        <div>
                          <strong className="block">Đã điểm danh Có mặt!</strong>
                          <span>Xác nhận: +{myReg.hoursConfirmed} giờ công tình nguyện vào hồ sơ.</span>
                        </div>
                      </div>
                      {!myReg.ratedByVolunteer && (
                        <button
                          onClick={() => setShowReviewForm(true)}
                          className="bg-white text-emerald-700 font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                        >
                          Đánh giá hoạt động
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <label className="block text-xs font-semibold text-slate-700">
                    Lời nhắn gửi đến Đơn vị Tổ chức (Kinh nghiệm, lý do đăng ký...):
                  </label>
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="VD: Em đã có kinh nghiệm tham gia các hoạt động thiện nguyện tương tự và cam kết tuân thủ nội quy..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">
                      Yêu cầu đăng ký sẽ được gửi đến Ban tổ chức xét duyệt.
                    </span>
                    <button
                      onClick={handleRegister}
                      disabled={activity.status !== 'recruiting'}
                      className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Gửi Đăng Ký Tham Gia
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-500">
                Bạn đang xem chi tiết hoạt động dưới quyền {userRole === 'organization' ? 'Đơn vị Tổ chức' : 'Admin'}.
              </div>
            )}
          </div>

          {/* Rating Modal/Form */}
          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-3">
              <h5 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                Đánh giá hoạt động sau khi tham gia
              </h5>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-700 font-medium">Chấm điểm:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-800">({reviewRating}/5 sao)</span>
              </div>
              <textarea
                rows={2}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Chia sẻ nhận xét của bạn về khâu tổ chức, hậu cần và ý nghĩa của hoạt động..."
                className="w-full text-xs p-3 rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
                >
                  Gửi Đánh Giá
                </button>
              </div>
            </form>
          )}

          {/* Reviews List */}
          {activityReviews.length > 0 && (
            <div className="border-t border-slate-100 pt-5">
              <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                Nhận xét từ các tình nguyện viên ({activityReviews.length})
              </h4>
              <div className="space-y-2.5">
                {activityReviews.map((rev) => (
                  <div key={rev.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-slate-800">{rev.volunteerName}</span>
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 italic">"{rev.comment}"</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">{rev.createdAt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">Mã hoạt động: {activity.id}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
