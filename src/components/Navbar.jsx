import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
  Shield,
  Sliders,
  FolderTree,
  MessageSquare,
  ChevronDown
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, onOpenLogin, onOpenRegister, onOpenCreateActivity }) => {
  const { userRole, currentUser, logout, notifications } = useApp();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifModalOpen, setNotifModalOpen] = useState(false);

  // Unread notifications
  const userNotifications = notifications.filter((n) => {
    if (userRole === 'admin') return n.userId === 'admin';
    return n.userId === currentUser?.id;
  });
  const unreadCount = userNotifications.filter((n) => !n.read).length;

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 bg-clip-text text-transparent">
                  V-Connect
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Cổng Kết Nối Tình Nguyện
                </span>
              </div>
            </div>

            {/* Navigation links based on role */}
            <div className="hidden lg:flex items-center gap-1">
              {/* Guest Nav */}
              {userRole === 'guest' && (
                <>
                  <button
                    onClick={() => setActiveTab('home')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'home' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:text-emerald-600'
                    }`}
                  >
                    Trang Chủ
                  </button>
                  <button
                    onClick={() => setActiveTab('explore')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'explore' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:text-emerald-600'
                    }`}
                  >
                    Tìm Kiếm Hoạt Động
                  </button>
                  <button
                    onClick={() => setActiveTab('organizations')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'organizations' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:text-emerald-600'
                    }`}
                  >
                    Đơn Vị Tổ Chức
                  </button>
                  <button
                    onClick={() => setActiveTab('about')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'about' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:text-emerald-600'
                    }`}
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
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                      activeTab === 'dashboard' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600 hover:text-emerald-600'
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                    <span>Tổng Quan</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('explore')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                      activeTab === 'explore' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600 hover:text-emerald-600'
                    }`}
                  >
                    <HeartHandshake className="w-4 h-4" />
                    <span>Tìm Hoạt Động</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('registrations')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                      activeTab === 'registrations' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600 hover:text-emerald-600'
                    }`}
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>Đã Đăng Ký</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('calendar')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                      activeTab === 'calendar' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600 hover:text-emerald-600'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Lịch Của Tôi</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                      activeTab === 'history' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600 hover:text-emerald-600'
                    }`}
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
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                      activeTab === 'org_dashboard' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:text-blue-600'
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    <span>Tổng Quan</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('org_activities')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                      activeTab === 'org_activities' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:text-blue-600'
                    }`}
                  >
                    <FolderTree className="w-4 h-4" />
                    <span>QL Hoạt Động</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('org_registrations')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                      activeTab === 'org_registrations' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:text-blue-600'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Duyệt Tình Nguyện Viên</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('org_attendance')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                      activeTab === 'org_attendance' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:text-blue-600'
                    }`}
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
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'admin_dashboard' ? 'bg-purple-100 text-purple-800 font-semibold' : 'text-slate-600 hover:text-purple-700'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setActiveTab('admin_approvals')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'admin_approvals' ? 'bg-purple-100 text-purple-800 font-semibold' : 'text-slate-600 hover:text-purple-700'
                    }`}
                  >
                    Phê Duyệt
                  </button>
                  <button
                    onClick={() => setActiveTab('admin_users')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'admin_users' ? 'bg-purple-100 text-purple-800 font-semibold' : 'text-slate-600 hover:text-purple-700'
                    }`}
                  >
                    Người Dùng
                  </button>
                  <button
                    onClick={() => setActiveTab('admin_activities')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'admin_activities' ? 'bg-purple-100 text-purple-800 font-semibold' : 'text-slate-600 hover:text-purple-700'
                    }`}
                  >
                    Hoạt Động
                  </button>
                  <button
                    onClick={() => setActiveTab('admin_categories')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'admin_categories' ? 'bg-purple-100 text-purple-800 font-semibold' : 'text-slate-600 hover:text-purple-700'
                    }`}
                  >
                    Danh Mục & Vị Trí
                  </button>
                  <button
                    onClick={() => setActiveTab('admin_feedback')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'admin_feedback' ? 'bg-purple-100 text-purple-800 font-semibold' : 'text-slate-600 hover:text-purple-700'
                    }`}
                  >
                    Đánh Giá & Khiếu Nại
                  </button>
                  <button
                    onClick={() => setActiveTab('admin_settings')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'admin_settings' ? 'bg-purple-100 text-purple-800 font-semibold' : 'text-slate-600 hover:text-purple-700'
                    }`}
                  >
                    Cài Đặt
                  </button>
                </>
              )}
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2.5">
              {/* Organization Quick Create Button */}
              {userRole === 'organization' && (
                <button
                  onClick={onOpenCreateActivity}
                  className="hidden sm:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm shadow-blue-500/20 transition-all hover:scale-102"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Tạo Hoạt Động Mới</span>
                </button>
              )}

              {/* Notification Bell */}
              {userRole !== 'guest' && (
                <button
                  onClick={() => setNotifModalOpen(true)}
                  className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                  title="Thông báo"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>
              )}

              {/* User Avatar & Dropdown or Login buttons */}
              {userRole === 'guest' ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenLogin}
                    className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
                  >
                    Đăng Nhập
                  </button>
                  <button
                    onClick={onOpenRegister}
                    className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-600/20 transition-all hover:scale-102"
                  >
                    Đăng Ký
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <img
                      src={currentUser?.avatar || currentUser?.logo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30"
                    />
                    <div className="hidden md:block text-left text-xs leading-tight">
                      <div className="font-semibold text-slate-800 max-w-[120px] truncate">
                        {currentUser?.fullName || currentUser?.name || 'Quản Trị Viên'}
                      </div>
                      <div className="text-[10px] text-slate-400 capitalize">
                        {userRole === 'volunteer' ? 'Tình nguyện viên' : userRole === 'organization' ? 'Đơn vị Tổ chức' : 'Quản trị viên'}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Profile Dropdown */}
                  {profileDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-100 py-1.5 z-50 animate-scale-up"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {currentUser?.fullName || currentUser?.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{currentUser?.email}</div>
                      </div>

                      {userRole === 'volunteer' && (
                        <>
                          <button
                            onClick={() => setActiveTab('profile')}
                            className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2"
                          >
                            <User className="w-4 h-4 text-slate-400" />
                            <span>Hồ Sơ Cá Nhân & Kỹ Năng</span>
                          </button>
                          <button
                            onClick={() => setActiveTab('history')}
                            className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2"
                          >
                            <Award className="w-4 h-4 text-slate-400" />
                            <span>Giấy Chứng Nhận ({currentUser?.totalHours || 0}h)</span>
                          </button>
                          <button
                            onClick={() => setActiveTab('feedback')}
                            className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2"
                          >
                            <MessageSquare className="w-4 h-4 text-slate-400" />
                            <span>Gửi Phản Hồi / Khiếu Nại</span>
                          </button>
                        </>
                      )}

                      {userRole === 'organization' && (
                        <>
                          <button
                            onClick={() => setActiveTab('org_profile')}
                            className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
                          >
                            <Building className="w-4 h-4 text-slate-400" />
                            <span>Thông Tin Tổ Chức</span>
                          </button>
                          <button
                            onClick={onOpenCreateActivity}
                            className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
                          >
                            <PlusCircle className="w-4 h-4 text-slate-400" />
                            <span>Tạo Hoạt Động Mới</span>
                          </button>
                        </>
                      )}

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
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
