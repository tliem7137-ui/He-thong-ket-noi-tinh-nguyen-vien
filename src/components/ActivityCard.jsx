import React from 'react';
import { useApp } from '../context/useApp';
import { Calendar, MapPin, Users, Award, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const ActivityCard = ({ activity, onSelect }) => {
  const { userRole, currentUser, registrations } = useApp();

  const isVolunteer = userRole === 'volunteer';
  const myReg = isVolunteer
    ? registrations.find((r) => r.activityId === activity.id && r.volunteerId === currentUser?.id && r.status !== 'cancelled')
    : null;

  const progressPercent = Math.min(100, Math.round((activity.volunteersRegistered / activity.volunteersNeeded) * 100));

  const getStatusBadge = () => {
    if (activity.status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/95 text-[#5a6b5c] border border-[#d2d2d7] shadow-xs">
          <CheckCircle2 className="w-3 h-3 text-[#5a6b5c]" />
          Đã Hoàn Thành
        </span>
      );
    }
    if (activity.status === 'full' || activity.volunteersRegistered >= activity.volunteersNeeded) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#fef8e6] text-[#8a6100] border border-[#eaae1a]/50 shadow-xs">
          <Users className="w-3 h-3 text-[#d49b11]" />
          Đã Đủ Số Lượng
        </span>
      );
    }
    if (activity.approvalStatus === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#fef8e6] text-[#8a6100] border border-[#eaae1a]/50 shadow-xs">
          <AlertCircle className="w-3 h-3 text-[#d49b11]" />
          Chờ Admin Duyệt
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#e8f2ed]/95 text-[#0d530e] border border-[#0d530e]/20 shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-[#0d530e] animate-pulse"></span>
        Đang Tuyển TNV
      </span>
    );
  };

  const formattedDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="group vv-card hover:shadow-[0_16px_34px_rgba(13,83,14,0.14)] hover:border-[#0d530e]/35 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
      {/* 3:2 Banner with Badges matching Volunteer Vietnam Program Cards */}
      <div className="relative aspect-[3/2] overflow-hidden bg-[#e8f2ed]">
        <img
          src={activity.banner || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop&q=80'}
          alt={activity.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a2d0b]/80 via-transparent to-black/15" />

        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <span className="bg-white/95 backdrop-blur-xs text-[#0d530e] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs truncate min-w-0">
            {activity.categoryName}
          </span>
          <div className="shrink-0">
            {getStatusBadge()}
          </div>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 text-white text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <ShieldCheck className="w-3.5 h-3.5 text-[#f6c453] shrink-0" />
            <span className="font-medium truncate drop-shadow-xs">{activity.organizationName}</span>
          </div>
          <span className="bg-[#eaae1a] text-[#14251c] text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs shrink-0">
            <Award className="w-3 h-3" />
            +{activity.hoursEarned}h Công
          </span>
        </div>
      </div>

      {/* Body content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3
            onClick={() => onSelect(activity)}
            className="font-semibold text-[#0d530e] text-base leading-snug group-hover:text-[#d49b11] transition-colors cursor-pointer line-clamp-2 mb-2"
          >
            {activity.title}
          </h3>

          <p className="text-xs text-[#555555] line-clamp-2 mb-3.5 leading-relaxed">
            {activity.description}
          </p>

          {/* Meta details */}
          <div className="space-y-1.5 text-xs text-[#445447] mb-4 bg-[#f7f9f7] p-3 rounded-xl border border-[#e8f2ed]">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#0d530e] shrink-0" />
              <span>{formattedDate(activity.startDate)} {activity.endDate && `đến ${formattedDate(activity.endDate)}`}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#d49b11] shrink-0" />
              <span className="truncate">{activity.locationName} - {activity.specificAddress}</span>
            </div>
          </div>
        </div>

        <div>
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-[11px] font-medium text-[#5a6b5c] mb-1.5">
              <span>Đã đăng ký: <strong className="text-[#1f2d20]">{activity.volunteersRegistered}/{activity.volunteersNeeded} TNV</strong></span>
              <span className="font-semibold text-[#0d530e]">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#e8f2ed] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progressPercent >= 100 ? 'bg-[#eaae1a]' : 'bg-[#0d530e]'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#e8f2ed]">
            {myReg ? (
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                myReg.status === 'approved' ? 'bg-[#e8f2ed] text-[#0d530e]' :
                myReg.status === 'pending' ? 'bg-[#fef8e6] text-[#8a6100]' : 'bg-rose-100 text-rose-800'
              }`}>
                {myReg.status === 'approved' ? '✓ Đã được duyệt' :
                 myReg.status === 'pending' ? '⏳ Chờ duyệt' : 'Đã từ chối'}
              </span>
            ) : (
              <span className="text-xs text-[#5a6b5c]">
                Tuyển {activity.volunteersNeeded} người
              </span>
            )}

            <button
              onClick={() => onSelect(activity)}
              className="px-4 py-1.5 rounded-full text-xs font-bold border-[1.5px] border-[#0d530e] text-[#0d530e] bg-white hover:bg-[#0d530e] hover:text-white transition-all cursor-pointer"
            >
              Xem Chi Tiết
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
