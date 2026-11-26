import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Check, CheckCheck, Clock, X, Info, AlertTriangle, AlertCircle } from 'lucide-react';

export const NotificationModal = ({ isOpen, onClose }) => {
  const { notifications, currentUser, userRole, markNotificationAsRead, markAllNotificationsAsRead } = useApp();

  if (!isOpen) return null;

  const userNotifications = notifications.filter((n) => {
    if (userRole === 'admin') return n.userId === 'admin';
    return n.userId === currentUser?.id;
  });

  const unreadCount = userNotifications.filter((n) => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <Check className="w-4 h-4 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      default:
        return <Info className="w-4 h-4 text-sky-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Thông Báo Của Bạn</h3>
              <p className="text-xs text-slate-500">
                {unreadCount > 0 ? `Bạn có ${unreadCount} thông báo chưa đọc` : 'Bạn đã đọc hết thông báo'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllNotificationsAsRead(userRole === 'admin' ? 'admin' : currentUser?.id)}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-1"
                title="Đánh dấu tất cả đã đọc"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Đọc tất cả</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 divide-y divide-slate-100">
          {userNotifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Chưa có thông báo nào.</p>
            </div>
          ) : (
            userNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationAsRead(n.id)}
                className={`pt-2.5 first:pt-0 cursor-pointer group flex items-start gap-3 p-3 rounded-xl transition-all ${
                  n.read ? 'bg-white hover:bg-slate-50' : 'bg-emerald-50/50 hover:bg-emerald-50/80 border border-emerald-100'
                }`}
              >
                <div className="mt-0.5 p-1 rounded-md bg-white border border-slate-100 shadow-2xs shrink-0">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-sm font-semibold truncate ${n.read ? 'text-slate-700' : 'text-slate-900'}`}>
                      {n.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(n.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {n.message}
                  </p>
                </div>
                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 self-center"></span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-600 hover:text-slate-800 font-medium py-1 px-4"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
