import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ActivityCard } from '../../components/ActivityCard';
import {
  Search,
  Filter,
  HeartHandshake,
  Award,
  Users,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Compass
} from 'lucide-react';

export const HomeGuest = ({ onSelectActivity, onOpenRegister, onOpenLogin }) => {
  const { activities, categories, locations, organizations } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Filter approved public activities
  const publicActivities = activities.filter((a) => a.approvalStatus === 'approved');

  const filteredActivities = publicActivities.filter((act) => {
    const matchesSearch =
      act.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.organizationName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || act.categoryId === selectedCategory;
    const matchesLocation = selectedLocation === 'all' || act.locationId === selectedLocation;
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'recruiting' && act.status === 'recruiting') ||
      (selectedStatus === 'full' && act.status === 'full') ||
      (selectedStatus === 'completed' && act.status === 'completed');

    return matchesSearch && matchesCategory && matchesLocation && matchesStatus;
  });

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-8 sm:p-14 shadow-2xl border border-emerald-800/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_50%)]" />
        <div className="relative max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nền Tảng Kết Nối Tình Nguyện Viên Quốc Gia</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight">
            Chung Tay Góp Sức,{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              Lan Tỏa Giá Trị
            </span>{' '}
            Cho Cộng Đồng
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Cầu nối chính thức giữa các Tình nguyện viên nhiệt huyết và các Tổ chức xã hội uy tín. 
            Đăng ký tham gia hoạt động, điểm danh minh bạch và nhận Chứng nhận giờ công tình nguyện điện tử.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenRegister}
              className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-103 flex items-center gap-2 cursor-pointer"
            >
              <span>Trở Thành Tình Nguyện Viên</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const searchEl = document.getElementById('search-section');
                searchEl?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-md transition-all cursor-pointer"
            >
              Khám Phá Các Hoạt Động
            </button>
          </div>
        </div>

        {/* Floating KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-10 mt-6 border-t border-emerald-800/40">
          <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <span className="block text-2xl font-black text-emerald-400">1,250+</span>
            <span className="text-xs text-slate-400">Tình nguyện viên</span>
          </div>
          <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <span className="block text-2xl font-black text-teal-300">85+</span>
            <span className="text-xs text-slate-400">Tổ chức xã hội</span>
          </div>
          <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <span className="block text-2xl font-black text-amber-400">460+</span>
            <span className="text-xs text-slate-400">Hoạt động thiện nguyện</span>
          </div>
          <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <span className="block text-2xl font-black text-sky-400">18,500+</span>
            <span className="text-xs text-slate-400">Giờ công được cấp</span>
          </div>
        </div>
      </section>

      {/* Workflow Infographic: Chu trình tổng thể từ báo cáo */}
      <section className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Chu Trình Hoạt Động</span>
          <h2 className="text-2xl font-bold text-slate-800 mt-1">Quy Trình Nghiệp Vụ Chuẩn Hóa</h2>
          <p className="text-xs text-slate-500 mt-1">
            Quy trình khép kín từ đăng ký đến xác nhận giờ công theo chuẩn đề tài
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          {[
            { step: '01', title: 'Tìm Hoạt Động', desc: 'Chọn hoạt động theo năng lực & thời gian', icon: Search, color: 'text-emerald-600 bg-emerald-50' },
            { step: '02', title: 'Đăng Ký Tham Gia', desc: 'Kiểm tra slot & không trùng lịch', icon: Calendar, color: 'text-teal-600 bg-teal-50' },
            { step: '03', title: 'Tổ Chức Xét Duyệt', desc: 'Đánh giá hồ sơ & gửi thông báo', icon: ShieldCheck, color: 'text-blue-600 bg-blue-50' },
            { step: '04', title: 'Tham Gia Hoạt Động', desc: 'Thực hiện nhiệm vụ thiện nguyện', icon: Users, color: 'text-indigo-600 bg-indigo-50' },
            { step: '05', title: 'Tổ Chức Điểm Danh', desc: 'Ghi nhận Có mặt / Vắng mặt', icon: CheckCircle2, color: 'text-purple-600 bg-purple-50' },
            { step: '06', title: 'Xác Nhận Giờ Công', desc: 'Cấp chứng nhận điện tử & đánh giá', icon: Award, color: 'text-amber-600 bg-amber-50' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col items-center">
                <span className="text-[10px] font-extrabold text-slate-400 mb-1">{item.step}</span>
                <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mb-2`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 mb-1">{item.title}</h4>
                <p className="text-[11px] text-slate-500 leading-tight">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Search & Filter Section */}
      <section id="search-section" className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Khám Phá Các Hoạt Động Tình Nguyện</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tìm kiếm theo từ khóa, lĩnh vực, tỉnh thành và tình trạng tiếp nhận
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
            Tìm thấy {filteredActivities.length} hoạt động phù hợp
          </span>
        </div>

        {/* Filters bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nhập tên hoạt động, địa điểm hoặc đơn vị tổ chức..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs bg-slate-50/50"
            />
          </div>

          {/* Dropdown selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Category */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Lĩnh vực hoạt động:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Tất cả các lĩnh vực</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Địa điểm (Tỉnh/TP):</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Tất cả các tỉnh thành</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Trạng thái đăng ký:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="recruiting">Đang tuyển tình nguyện viên</option>
                <option value="full">Đã đủ số lượng</option>
                <option value="completed">Đã kết thúc</option>
              </select>
            </div>
          </div>
        </div>

        {/* Activity Cards Grid */}
        {filteredActivities.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8">
            <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-base">Không tìm thấy hoạt động nào phù hợp</h3>
            <p className="text-xs text-slate-400 mt-1">Hãy thử xóa bộ lọc tìm kiếm hoặc từ khóa để xem thêm kết quả.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedLocation('all');
                setSelectedStatus('all');
              }}
              className="mt-4 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Xóa Tất Cả Bộ Lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((act) => (
              <ActivityCard
                key={act.id}
                activity={act}
                onSelect={onSelectActivity}
              />
            ))}
          </div>
        )}
      </section>

      {/* Verified Organizations Shelf */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Đơn Vị Đồng Hành</span>
            <h2 className="text-2xl font-bold mt-1">Các Tổ Chức Thiện Nguyện Tiêu Biểu</h2>
            <p className="text-xs text-slate-400 mt-1">Tất cả tổ chức đều được Ban Quản trị xác thực tư cách pháp nhân</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {organizations
            .filter((o) => o.status === 'active')
            .map((org) => (
              <div
                key={org.id}
                className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 hover:border-emerald-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={org.logo}
                      alt={org.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/30"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-white line-clamp-1">{org.name}</h4>
                      <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Đã xác minh ({org.licenseNumber})
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
                    {org.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-700 text-[11px] text-slate-400 flex items-center justify-between">
                  <span className="truncate">{org.address.split(',')[org.address.split(',').length - 1]}</span>
                  <span className="text-emerald-400 font-semibold">{org.type}</span>
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
};
