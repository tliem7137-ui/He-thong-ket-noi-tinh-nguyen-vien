import React from 'react';
import { useApp } from '../context/useApp';
import { useModalClose } from '../hooks/useModalClose';
import { Bell, Check, CheckCheck, Clock, X, Info, AlertTriangle, AlertCircle } from 'lucide-react';

export const NotificationModal = ({ isOpen, onClose }) => {
  const { notifications, currentUser, userRole, markNotificationAsRead, markAllNotificationsAsRead } = useApp();
  const { handleBackdropClick } = useModalClose(isOpen, onClose);

  if (!isOpen) return null;

  const userNotifications = notifications.filter((n) => {
    if (userRole === 'admin') return n.userId === 'admin';
    return n.userId === currentUser?.id;
  });

  const unreadCount = userNotifications.filter((n) => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <Check className="w-4 h-4 text-[#0d530e]" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-[#d49b11]" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      default:
        return <Info className="w-4 h-4 text-[#437b62]" />;
    }
  };

  return (
    <div onClick={handleBackdropClick} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d1f16]/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-[0_24px_60px_rgba(13,31,22,0.25)] border border-[#0d530e]/15 max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-4 px-5 border-b border-[#e8f2ed] flex items-center justify-between bg-[#f5f9f7]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#e8f2ed] border border-[#0d530e]/20 text-[#0d530e] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#0d530e]">Thông Báo Của Bạn</h3>
              <p className="text-xs text-[#5a6b5c]">
                {unreadCount > 0 ? `Bạn có ${unreadCount} thông báo chưa đọc` : 'Bạn đã đọc hết thông báo'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllNotificationsAsRead(userRole === 'admin' ? 'admin' : currentUser?.id)}
                className="text-xs text-[#0d530e] hover:bg-[#e8f2ed] font-semibold px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
                title="Đánh dấu tất cả đã đọc"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Đọc tất cả</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[#5a6b5c] hover:text-[#0d530e] rounded-full hover:bg-[#e8f2ed] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {userNotifications.length === 0 ? (
            <div className="text-center py-12 text-[#5a6b5c]">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-35 text-[#437b62]" />
              <p className="text-sm">Chưa có thông báo nào.</p>
            </div>
          ) : (
            userNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationAsRead(n.id)}
                className={`cursor-pointer group flex items-start gap-3 p-3.5 rounded-2xl border transition-all ${
                  n.read
                    ? 'bg-white border-[#e8f2ed] hover:bg-[#f7f9f7]'
                    : 'bg-[#f5f9f7] hover:bg-[#e8f2ed]/80 border-[#0d530e]/20'
                }`}
              >
                <div className="mt-0.5 p-1.5 rounded-full bg-white border border-[#e8f2ed] shadow-2xs shrink-0">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-xs sm:text-sm font-semibold truncate ${n.read ? 'text-[#445447]' : 'text-[#0d530e]'}`}>
                      {n.title}
                    </h4>
                    <span className="text-[11px] text-[#5a6b5c] shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(n.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-xs text-[#555555] mt-1 leading-relaxed">
                    {n.message}
                  </p>
                </div>
                {!n.read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#eaae1a] shrink-0 self-center"></span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#f5f9f7] border-t border-[#e8f2ed] text-center">
          <button
            onClick={onClose}
            className="text-xs text-[#5a6b5c] hover:text-[#0d530e] font-semibold py-1 px-4 rounded-full cursor-pointer"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
