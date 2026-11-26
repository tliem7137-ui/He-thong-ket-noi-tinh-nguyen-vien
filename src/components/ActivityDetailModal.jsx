import React, { useState, useCallback } from 'react';
import { useApp } from '../context/useApp';
import { useModalClose } from '../hooks/useModalClose';
import {
  X,
  Calendar,
  MapPin,
  Users,
  Award,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Star,
  Send,
  AlertTriangle
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
  const [actionError, setActionError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const handleClose = useCallback(() => {
    setActionError('');
    setReviewError('');
    setShowReviewForm(false);
    onClose();
  }, [onClose]);

  const { handleBackdropClick } = useModalClose(isOpen && !!activity, handleClose);

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

  const getActivityStatusLabel = (status) => {
    switch (status) {
      case 'recruiting':
        return { text: 'Đang mở đăng ký', cls: 'bg-[#e8f2ed] text-[#0d530e] border-[#0d530e]/25' };
      case 'completed':
        return { text: 'Đã kết thúc', cls: 'bg-[#f5f9f7] text-[#5a6b5c] border-[#d2d2d7]' };
      case 'cancelled':
        return { text: 'Đã bị hủy', cls: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'pending_approval':
        return { text: 'Chờ Admin duyệt', cls: 'bg-[#fef8e6] text-[#8a6100] border-[#eaae1a]/45' };
      case 'rejected':
        return { text: 'Bị từ chối', cls: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return { text: 'Đã đủ số lượng', cls: 'bg-[#fef8e6] text-[#8a6100] border-[#eaae1a]/45' };
    }
  };
  const statusInfo = getActivityStatusLabel(activity.status);

  const handleRegister = async () => {
    if (userRole === 'guest') {
      onOpenLogin();
      return;
    }
    setActionError('');
    setSubmitting(true);
    const res = await registerForActivity(activity.id, message);
    setSubmitting(false);
    if (res?.success) {
      setMessage('');
    } else if (res?.error) {
      setActionError(res.error);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setReviewError('');
    setSubmitting(true);
    const res = await submitActivityReview(activity.id, reviewRating, reviewComment);
    setSubmitting(false);
    if (res?.success) {
      setShowReviewForm(false);
      setReviewComment('');
    } else if (res?.error) {
      setReviewError(res.error);
    }
  };

  return (
    <div onClick={handleBackdropClick} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d1f16]/65 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-[0_24px_60px_rgba(13,31,22,0.3)] border border-[#0d530e]/15 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-up my-auto">
        {/* Banner with close button */}
        <div className="relative h-60 shrink-0 bg-[#0d1f16]">
          <img
            src={activity.banner || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop&q=80'}
            alt={activity.title}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a2d0b] via-[#0d530e]/45 to-transparent" />

          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/65 text-white flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="bg-white/95 text-[#0d530e] font-bold text-xs px-3.5 py-1 rounded-full shadow-xs">
              {activity.categoryName}
            </span>
            <span className="bg-[#eaae1a] text-[#14251c] font-bold text-xs px-3.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
              <Award className="w-3.5 h-3.5" />
              +{activity.hoursEarned} Giờ công chứng nhận
            </span>
          </div>

          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#f6c453] font-medium mb-1">
              <ShieldCheck className="w-4 h-4 text-[#eaae1a]" />
              <span>{activity.organizationName}</span>
              {avgRating && (
                <span className="flex items-center gap-1 bg-white/15 text-[#f6c453] px-2.5 py-0.5 rounded-full text-[11px] font-bold backdrop-blur-xs">
                  <Star className="w-3 h-3 fill-[#eaae1a] text-[#eaae1a]" />
                  {avgRating} ({activityReviews.length} đánh giá)
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold leading-snug drop-shadow-xs">
              {activity.title}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Progress bar info */}
          <div className="bg-[#f7f9f7] p-4 rounded-2xl border border-[#0d530e]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-2/3">
              <div className="flex justify-between text-xs font-semibold text-[#1f2d20] mb-1.5">
                <span>Tiến độ tuyển tình nguyện viên:</span>
                <span className="text-[#0d530e]">{activity.volunteersRegistered}/{activity.volunteersNeeded} người ({progressPercent}%)</span>
              </div>
              <div className="w-full h-2.5 bg-[#e8f2ed] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    progressPercent >= 100 ? 'bg-[#eaae1a]' : 'bg-[#0d530e]'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className={`px-3.5 py-1.5 rounded-full border ${statusInfo.cls}`}>
                {statusInfo.text}
              </span>
            </div>
          </div>

          {/* Key metadata grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#f7f9f7] border border-[#e8f2ed]">
              <Calendar className="w-4 h-4 text-[#0d530e] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#1f2d20] block">Thời gian diễn ra:</span>
                <span className="text-[#555555]">
                  {new Date(activity.startDate).toLocaleString('vi-VN')} đến {new Date(activity.endDate).toLocaleString('vi-VN')}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#f7f9f7] border border-[#e8f2ed]">
              <MapPin className="w-4 h-4 text-[#d49b11] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#1f2d20] block">Địa điểm tập trung:</span>
                <span className="text-[#555555]">{activity.locationName} - {activity.specificAddress}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-bold text-[#0d530e] mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#d49b11]" />
              Mô tả chi tiết hoạt động
            </h4>
            <p className="text-xs sm:text-sm text-[#445447] leading-relaxed whitespace-pre-line bg-white p-4 rounded-2xl border border-[#e8f2ed]">
              {activity.description}
            </p>
          </div>

          {/* Requirements and Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#fef8e6]/80 p-4 rounded-2xl border border-[#eaae1a]/35">
              <h5 className="text-xs font-bold text-[#735104] mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#d49b11]" />
                Yêu cầu đối với TNV
              </h5>
              <p className="text-xs text-[#6d4c05] leading-relaxed">{activity.requirements}</p>
            </div>

            <div className="bg-[#f5f9f7] p-4 rounded-2xl border border-[#0d530e]/20">
              <h5 className="text-xs font-bold text-[#0d530e] mb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#0d530e]" />
                Quyền lợi được hưởng
              </h5>
              <p className="text-xs text-[#2d5543] leading-relaxed">{activity.benefits}</p>
            </div>
          </div>

          {/* Registration Section */}
          <div className="border-t border-[#e8f2ed] pt-5">
            <h4 className="text-sm font-bold text-[#0d530e] mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0d530e]" />
              Trạng thái &amp; Đăng ký tham gia
            </h4>

            {userRole === 'guest' ? (
              <div className="bg-[#f5f9f7] p-5 rounded-2xl border border-[#0d530e]/15 text-center">
                <p className="text-xs text-[#555555] mb-3.5">
                  Bạn cần đăng nhập bằng tài khoản Tình nguyện viên để đăng ký tham gia hoạt động này.
                </p>
                <button
                  onClick={onOpenLogin}
                  className="vv-btn-primary px-6 py-2.5 text-xs font-bold shadow-sm cursor-pointer"
                >
                  Đăng Nhập Ngay
                </button>
              </div>
            ) : isVolunteer ? (
              myReg ? (
                <div className="p-4 rounded-2xl bg-[#f5f9f7] border border-[#0d530e]/20 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#1f2d20]">Trạng thái đăng ký của bạn:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        myReg.status === 'approved' ? 'bg-[#0d530e] text-white' :
                        myReg.status === 'pending' ? 'bg-[#eaae1a] text-[#14251c]' : 'bg-rose-600 text-white'
                      }`}>
                        {myReg.status === 'approved' ? '✓ Đã Được Chấp Thuận' :
                         myReg.status === 'pending' ? '⏳ Đang Chờ Xét Duyệt' : 'Bị Từ Chối'}
                      </span>
                    </div>

                    {(myReg.status === 'pending' || (myReg.status === 'approved' && myReg.attendanceStatus === 'not_yet')) && (
                      <button
                        onClick={() => cancelRegistration(myReg.id)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline cursor-pointer"
                      >
                        Hủy đăng ký
                      </button>
                    )}
                  </div>

                  {myReg.status === 'rejected' && myReg.orgRejectReason && (
                    <p className="text-xs text-rose-700 font-medium">Lý do: {myReg.orgRejectReason}</p>
                  )}

                  {myReg.status === 'approved' && !myReg.confirmedByVolunteer && (
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-xl border border-[#0d530e]/15">
                      <span className="text-xs text-[#445447]">Tổ chức yêu cầu bạn xác nhận tham gia trước ngày diễn ra:</span>
                      <button
                        onClick={() => confirmVolunteerAttendance(myReg.id)}
                        className="vv-btn-forest px-4 py-1.5 font-semibold text-xs cursor-pointer"
                      >
                        Xác nhận sẽ tham gia
                      </button>
                    </div>
                  )}

                  {myReg.status === 'approved' && myReg.confirmedByVolunteer && (
                    <div className="text-xs text-[#0d530e] font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#0d530e]" />
                      <span>Bạn đã xác nhận sẽ tham gia. Vui lòng có mặt đúng giờ!</span>
                    </div>
                  )}

                  {myReg.attendanceStatus === 'present' && (
                    <div className="vv-cta-banner text-white p-3.5 rounded-2xl text-xs flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Award className="w-5 h-5 text-[#eaae1a]" />
                        <div>
                          <strong className="block">Đã điểm danh Có mặt!</strong>
                          <span className="text-[#e2f0e9]">Xác nhận: +{myReg.hoursConfirmed} giờ công tình nguyện vào hồ sơ.</span>
                        </div>
                      </div>
                      {!myReg.ratedByVolunteer && (
                        <button
                          onClick={() => setShowReviewForm(true)}
                          className="vv-btn-gold font-bold px-4 py-1.5 text-xs cursor-pointer"
                        >
                          Đánh giá hoạt động
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[#f7f9f7] p-4 rounded-2xl border border-[#0d530e]/15 space-y-3">
                  {actionError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{actionError}</span>
                    </div>
                  )}
                  <label className="block text-xs font-semibold text-[#1f2d20]">
                    Lời nhắn gửi đến Đơn vị Tổ chức (Kinh nghiệm, lý do đăng ký...):
                  </label>
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="VD: Em đã có kinh nghiệm tham gia các hoạt động thiện nguyện tương tự và cam kết tuân thủ nội quy..."
                    className="vv-input w-full text-xs p-3"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-[#5a6b5c]">
                      Yêu cầu đăng ký sẽ được gửi đến Ban tổ chức xét duyệt.
                    </span>
                    <button
                      onClick={handleRegister}
                      disabled={submitting || activity.status !== 'recruiting'}
                      className="vv-btn-primary px-6 py-2.5 text-xs font-bold disabled:opacity-50 shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {submitting ? 'Đang gửi...' : 'Gửi Đăng Ký Tham Gia'}
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="bg-[#f7f9f7] p-3.5 rounded-xl text-xs text-[#5a6b5c] border border-[#e8f2ed]">
                Bạn đang xem chi tiết hoạt động dưới quyền {userRole === 'organization' ? 'Đơn vị Tổ chức' : 'Admin'}.
              </div>
            )}
          </div>

          {/* Rating Modal/Form */}
          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="bg-[#fef8e6] p-4 rounded-2xl border border-[#eaae1a]/45 space-y-3">
              <h5 className="text-xs font-bold text-[#735104] flex items-center gap-1.5">
                <Star className="w-4 h-4 text-[#eaae1a] fill-[#eaae1a]" />
                Đánh giá hoạt động sau khi tham gia
              </h5>
              {reviewError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {reviewError}
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#1f2d20] font-medium">Chấm điểm:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= reviewRating ? 'fill-[#eaae1a] text-[#eaae1a]' : 'text-[#d2d2d7]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-[#735104]">({reviewRating}/5 sao)</span>
              </div>
              <textarea
                rows={2}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Chia sẻ nhận xét của bạn về khâu tổ chức, hậu cần và ý nghĩa của hoạt động..."
                className="vv-input w-full text-xs p-3"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-1.5 text-xs text-[#5a6b5c] hover:text-[#1f2d20] cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="vv-btn-gold px-5 py-1.5 text-xs font-bold disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {submitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                </button>
              </div>
            </form>
          )}

          {/* Reviews List */}
          {activityReviews.length > 0 && (
            <div className="border-t border-[#e8f2ed] pt-5">
              <h4 className="text-sm font-bold text-[#0d530e] mb-3 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-[#eaae1a] fill-[#eaae1a]" />
                Nhận xét từ các tình nguyện viên ({activityReviews.length})
              </h4>
              <div className="space-y-3">
                {activityReviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-[#f7f9f7] border border-[#e8f2ed] text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-[#0d530e]">{rev.volunteerName}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-[#eaae1a] text-[#eaae1a]" />
                        ))}
                      </div>
                    </div>
                    <p className="text-[#555555] italic">&quot;{rev.comment}&quot;</p>
                    <span className="text-[10px] text-[#609f84] mt-1.5 block">{rev.createdAt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-[#e8f2ed] bg-[#f5f9f7] flex items-center justify-between">
          <span className="text-xs text-[#5a6b5c]">Mã hoạt động: {activity.id}</span>
          <button
            onClick={handleClose}
            className="px-5 py-2 text-xs font-semibold text-[#0d530e] bg-white hover:bg-[#e8f2ed] border border-[#0d530e]/20 rounded-full transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
