import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/useApp';
import { NotificationModal } from './NotificationModal';
import {
  HeartHandshake,
  Bell,
  LogOut,
  User,
  PlusCircle,
  Calendar,
  Award,
  Users,
  Compass,
  FileCheck2,
  CheckCircle,
  Building,
  FolderTree,
  MessageSquare,
  ChevronDown
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, onOpenLogin, onOpenRegister, onOpenCreateActivity }) => {
  const { userRole, currentUser, logout, notifications } = useApp();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  useEffect(() => {
    if (!profileDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setProfileDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [profileDropdownOpen]);

  const handleLogoClick = () => {
    if (userRole === 'volunteer') setActiveTab('dashboard');
    else if (userRole === 'organization') setActiveTab('org_dashboard');
    else if (userRole === 'admin') setActiveTab('admin_dashboard');
    else setActiveTab('home');
  };

  // Unread notifications
  const userNotifications = notifications.filter((n) => {
    if (userRole === 'admin') return n.userId === 'admin';
    return n.userId === currentUser?.id;
  });
  const unreadCount = userNotifications.filter((n) => !n.read).length;

  const navLinkClass = (isActive) =>
    `px-2.5 py-2 rounded-full text-[13px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
      isActive
        ? 'bg-[#e8f2ed] text-[#0d530e]'
        : 'text-[#333333] hover:text-[#0d530e] hover:bg-[#f5f9f7]'
    }`;

  const adminNavLinkClass = (isActive) =>
    `px-2.5 py-1.5 rounded-full text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
      isActive
        ? 'bg-[#0d530e] text-white shadow-xs'
        : 'text-[#333333] hover:text-[#0d530e] hover:bg-[#e8f2ed]'
    }`;

  return (
    <>
      <nav className="bg-white/98 backdrop-blur-md border-b border-[#0d530e]/10 shadow-[0_2px_12px_rgba(13,83,14,0.05)] sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 h-20">
            {/* Circular Emblem Logo matching Volunteer Vietnam */}
            <div className="flex items-center gap-2.5 cursor-pointer group shrink-0" onClick={handleLogoClick}>
              <div className="w-10 h-10 rounded-full bg-white border-2 border-[#0d530e] flex items-center justify-center text-[#0d530e] shadow-[0_4px_12px_rgba(13,83,14,0.12)] group-hover:bg-[#0d530e] group-hover:text-white transition-colors">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold text-[#0d530e] tracking-tight block leading-none">
                  V-Connect
                </span>
                <span className={`text-[9.5px] uppercase font-semibold tracking-wider text-[#5a6b5c] mt-1 ${
                  userRole === 'admin' || userRole === 'organization' ? 'hidden 2xl:block' : 'block'
                }`}>
                  Cổng Kết Nối Tình Nguyện
                </span>
              </div>
            </div>

            {/* Navigation links based on role */}
            <div className={`hidden lg:flex items-center ${userRole === 'admin' ? 'gap-0.5' : 'gap-1'}`}>
              {/* Guest Nav */}
              {userRole === 'guest' && (
                <>
                  <button
                    onClick={() => setActiveTab('home')}
                    className={navLinkClass(activeTab === 'home')}
                  >
                    Trang Chủ
                  </button>
                  <button
                    onClick={() => setActiveTab('explore')}
                    className={navLinkClass(activeTab === 'explore')}
                  >
                    Tìm Kiếm Hoạt Động
                  </button>
                  <button
                    onClick={() => setActiveTab('organizations')}
                    className={navLinkClass(activeTab === 'organizations')}
                  >
                    Đơn Vị Tổ Chức
                  </button>
                  <button
                    onClick={() => setActiveTab('about')}
                    className={navLinkClass(activeTab === 'about')}
                  >
                    Quy Trình & Giới Thiệu
                  </button>
                </>
              )}

              {/* Volunteer Nav */}
              {userRole === 'volunteer' && (
                <>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={navLinkClass(activeTab === 'dashboard')}
                  >
                    <Compass className="w-4 h-4" />
                    <span>Tổng Quan</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('explore')}
                    className={navLinkClass(activeTab === 'explore')}
                  >
                    <HeartHandshake className="w-4 h-4" />
                    <span>Tìm Hoạt Động</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('registrations')}
                    className={navLinkClass(activeTab === 'registrations')}
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>Đã Đăng Ký</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('calendar')}
                    className={navLinkClass(activeTab === 'calendar')}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Lịch Của Tôi</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={navLinkClass(activeTab === 'history')}
                  >
                    <Award className="w-4 h-4" />
                    <span>Lịch Sử & Giờ Công</span>
                  </button>
                </>
              )}

              {/* Organization Nav */}
              {userRole === 'organization' && (
                <>
                  <button
                    onClick={() => setActiveTab('org_dashboard')}
                    className={navLinkClass(activeTab === 'org_dashboard')}
                  >
                    <Building className="w-4 h-4" />
                    <span>Tổng Quan</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('org_activities')}
                    className={navLinkClass(activeTab === 'org_activities')}
                  >
                    <FolderTree className="w-4 h-4" />
                    <span>QL Hoạt Động</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('org_registrations')}
                    className={navLinkClass(activeTab === 'org_registrations')}
                  >
                    <Users className="w-4 h-4" />
                    <span>Duyệt Tình Nguyện Viên</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('org_attendance')}
                    className={navLinkClass(activeTab === 'org_attendance')}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Điểm Danh & Giờ Công</span>
                  </button>
                </>
              )}

              {/* Admin Nav */}
              {userRole === 'admin' && (
                <>
                  <button
                    onClick={() => setActiveTab('admin_dashboard')}
                    className={adminNavLinkClass(activeTab === 'admin_dashboard')}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setActiveTab('admin_approvals')}
                    className={adminNavLinkClass(activeTab === 'admin_approvals')}
                  >
                    Phê Duyệt
                  </button>
                  <button
                    onClick={() => setActiveTab('admin_users')}
                    className={adminNavLinkClass(activeTab === 'admin_users')}
                  >
                    Người Dùng
                  </button>
                  <button
                    onClick={() => setActiveTab('admin_activities')}
                    className={adminNavLinkClass(activeTab === 'admin_activities')}
                  >
                    Hoạt Động
                  </button>
                  <button
                    onClick={() => setActiveTab('admin_categories')}
                    className={adminNavLinkClass(activeTab === 'admin_categories')}
                  >
                    Danh Mục & Vị Trí
                  </button>
                  <button
                    onClick={() => setActiveTab('admin_feedback')}
                    className={adminNavLinkClass(activeTab === 'admin_feedback')}
                  >
                    Đánh Giá & Khiếu Nại
                  </button>
                  <button
                    onClick={() => setActiveTab('admin_broadcast')}
                    className={adminNavLinkClass(activeTab === 'admin_broadcast')}
                  >
                    Thông Báo
                  </button>
                  <button
                    onClick={() => setActiveTab('admin_settings')}
                    className={adminNavLinkClass(activeTab === 'admin_settings')}
                  >
                    Cài Đặt
                  </button>
                </>
              )}
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* Organization Quick Create Button */}
              {userRole === 'organization' && (
                <button
                  onClick={onOpenCreateActivity}
                  className="hidden sm:flex items-center gap-1.5 vv-btn-primary text-xs font-bold px-3.5 py-2 shadow-sm cursor-pointer whitespace-nowrap"
                >
                  <PlusCircle className="w-4 h-4 shrink-0" />
                  <span>Tạo Hoạt Động Mới</span>
                </button>
              )}

              {/* Notification Bell */}
              {userRole !== 'guest' && (
                <button
                  onClick={() => setNotifModalOpen(true)}
                  className="relative p-2.5 text-[#437b62] hover:text-[#0d530e] hover:bg-[#e8f2ed] rounded-full transition-colors cursor-pointer"
                  title="Thông báo"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#eaae1a] text-[10px] font-extrabold text-[#14251c] shadow-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>
              )}

              {/* User Avatar & Dropdown or Pill CTAs */}
              {userRole === 'guest' ? (
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={onOpenLogin}
                    className="vv-btn-outline px-5 py-2 text-xs sm:text-[13px] font-bold tracking-wide cursor-pointer"
                  >
                    Đăng Nhập
                  </button>
                  <button
                    onClick={onOpenRegister}
                    className="vv-btn-primary px-5 py-2.5 text-xs sm:text-[13px] font-bold tracking-wide shadow-sm cursor-pointer"
                  >
                    Đăng Ký
                  </button>
                </div>
              ) : (
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-[#f5f9f7] border border-transparent hover:border-[#0d530e]/15 transition-all cursor-pointer"
                  >
                    <img
                      src={currentUser?.avatar || currentUser?.logo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-[#0d530e]/35"
                    />
                    <div className="hidden xl:block text-left text-xs leading-tight">
                      <div className="font-semibold text-[#1f2d20] max-w-[96px] truncate">
                        {currentUser?.fullName || currentUser?.name || 'Quản Trị Viên'}
                      </div>
                      <div className="text-[10px] text-[#5a6b5c] capitalize">
                        {userRole === 'volunteer' ? 'Tình nguyện viên' : userRole === 'organization' ? 'Đơn vị Tổ chức' : 'Quản trị viên'}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[#5a6b5c]" />
                  </button>

                  {/* Profile Dropdown */}
                  {profileDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-60 rounded-2xl bg-white shadow-[0_14px_34px_rgba(13,83,14,0.14)] border border-[#0d530e]/15 py-1.5 z-50 animate-scale-up overflow-hidden"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <div className="px-4 py-3 border-b border-[#e8f2ed] bg-[#f5f9f7]">
                        <div className="text-xs font-bold text-[#0d530e] truncate">
                          {currentUser?.fullName || currentUser?.name}
                        </div>
                        <div className="text-[11px] text-[#5a6b5c] truncate">{currentUser?.email}</div>
                      </div>

                      {userRole === 'volunteer' && (
                        <>
                          <button
                            onClick={() => setActiveTab('profile')}
                            className="w-full text-left px-4 py-2.5 text-xs text-[#1c1c1c] hover:bg-[#f5f9f7] hover:text-[#0d530e] flex items-center gap-2.5 cursor-pointer"
                          >
                            <User className="w-4 h-4 text-[#437b62]" />
                            <span>Hồ Sơ Cá Nhân & Kỹ Năng</span>
                          </button>
                          <button
                            onClick={() => setActiveTab('history')}
                            className="w-full text-left px-4 py-2.5 text-xs text-[#1c1c1c] hover:bg-[#f5f9f7] hover:text-[#0d530e] flex items-center gap-2.5 cursor-pointer"
                          >
                            <Award className="w-4 h-4 text-[#eaae1a]" />
                            <span>Giấy Chứng Nhận ({currentUser?.totalHours || 0}h)</span>
                          </button>
                          <button
                            onClick={() => setActiveTab('feedback')}
                            className="w-full text-left px-4 py-2.5 text-xs text-[#1c1c1c] hover:bg-[#f5f9f7] hover:text-[#0d530e] flex items-center gap-2.5 cursor-pointer"
                          >
                            <MessageSquare className="w-4 h-4 text-[#437b62]" />
                            <span>Gửi Phản Hồi / Khiếu Nại</span>
                          </button>
                        </>
                      )}

                      {userRole === 'organization' && (
                        <>
                          <button
                            onClick={() => setActiveTab('org_profile')}
                            className="w-full text-left px-4 py-2.5 text-xs text-[#1c1c1c] hover:bg-[#f5f9f7] hover:text-[#0d530e] flex items-center gap-2.5 cursor-pointer"
                          >
                            <Building className="w-4 h-4 text-[#437b62]" />
                            <span>Thông Tin Tổ Chức</span>
                          </button>
                          <button
                            onClick={onOpenCreateActivity}
                            className="w-full text-left px-4 py-2.5 text-xs text-[#1c1c1c] hover:bg-[#f5f9f7] hover:text-[#0d530e] flex items-center gap-2.5 cursor-pointer"
                          >
                            <PlusCircle className="w-4 h-4 text-[#0d530e]" />
                            <span>Tạo Hoạt Động Mới</span>
                          </button>
                        </>
                      )}

                      <div className="border-t border-[#e8f2ed] my-1"></div>

                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2.5 text-xs text-rose-700 hover:bg-rose-50 flex items-center gap-2.5 font-semibold cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng Xuất</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Notification Modal */}
      <NotificationModal isOpen={notifModalOpen} onClose={() => setNotifModalOpen(false)} />
    </>
  );
};
