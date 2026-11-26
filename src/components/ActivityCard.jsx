import React from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, MapPin, Users, Clock, Award, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

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
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <CheckCircle2 className="w-3 h-3 text-slate-500" />
          Đã Hoàn Thành
        </span>
      );
    }
    if (activity.status === 'full' || activity.volunteersRegistered >= activity.volunteersNeeded) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Users className="w-3 h-3 text-amber-500" />
          Đã Đủ Số Lượng
        </span>
      );
    }
    if (activity.approvalStatus === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          <AlertCircle className="w-3 h-3" />
          Chờ Admin Duyệt
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
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
    <div className="group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Banner with Badges */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={activity.banner || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop&q=80'}
          alt={activity.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-black/20" />

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="bg-white/90 backdrop-blur-md text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-xs">
            {activity.categoryName}
          </span>
          <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-xs">
            <Award className="w-3 h-3 text-amber-300" />
            +{activity.hoursEarned}h Công
          </span>
        </div>

        <div className="absolute top-3 right-3">
          {getStatusBadge()}
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-1.5 truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-medium truncate drop-shadow-sm">{activity.organizationName}</span>
          </div>
        </div>
      </div>

      {/* Body content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3
            onClick={() => onSelect(activity)}
            className="font-bold text-slate-800 text-base leading-snug hover:text-emerald-600 transition-colors cursor-pointer line-clamp-2 mb-2"
          >
            {activity.title}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
            {activity.description}
          </p>

          {/* Meta details */}
          <div className="space-y-1.5 text-xs text-slate-600 mb-4 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{formattedDate(activity.startDate)} {activity.endDate && `đến ${formattedDate(activity.endDate)}`}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate">{activity.locationName} - {activity.specificAddress}</span>
            </div>
          </div>
        </div>

        <div>
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
              <span>Đã đăng ký: <strong>{activity.volunteersRegistered}/{activity.volunteersNeeded} TNV</strong></span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progressPercent >= 100 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            {myReg ? (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                myReg.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                myReg.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {myReg.status === 'approved' ? '✓ Đã được duyệt' :
                 myReg.status === 'pending' ? '⏳ Chờ duyệt' : 'Đã từ chối'}
              </span>
            ) : (
              <span className="text-xs text-slate-400">
                Tuyển {activity.volunteersNeeded} người
              </span>
            )}

            <button
              onClick={() => onSelect(activity)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white transition-all shadow-2xs hover:shadow-md cursor-pointer"
            >
              Xem Chi Tiết
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
