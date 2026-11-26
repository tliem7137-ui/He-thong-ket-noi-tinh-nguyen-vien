import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/useApp';
import { ActivityCard } from '../../components/ActivityCard';
import {
  Search,
  Award,
  Users,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Compass
} from 'lucide-react';

export const HomeGuest = ({ activeTab = 'home', onSelectActivity, onOpenRegister }) => {
  const { activities, categories, locations, organizations } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    const sectionMap = {
      explore: 'search-section',
      organizations: 'orgs-section',
      about: 'workflow-section'
    };
    const targetId = sectionMap[activeTab];
    if (targetId) {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    } else if (activeTab === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  // Filter approved public activities
  const publicActivities = activities.filter((a) => a.approvalStatus === 'approved' && a.status !== 'cancelled');

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
    <div className="w-full">
      {/* 1. Full-Bleed Hero Section with Angled Forest-Green Scrim (-100deg) */}
      <section className="relative overflow-hidden min-h-[520px] sm:min-h-[580px] flex items-center bg-[#0d530e]">
        <img
          src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1600&auto=format&fit=crop&q=85"
          alt="Cộng đồng tình nguyện V-Connect"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 vv-hero-scrim" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
          <div className="max-w-2xl space-y-6 text-white">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/12 border border-[#eaae1a]/45 text-[#f6c453] text-xs font-bold tracking-wide uppercase backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#eaae1a]" />
              <span>Nền Tảng Kết Nối Tình Nguyện Viên Quốc Gia</span>
            </div>

            <h1 className="text-3xl sm:text-[44px] font-semibold leading-[1.2] tracking-tight text-white drop-shadow-xs">
              Chung Tay Góp Sức,{' '}
              <span className="text-[#f6c453] font-bold sm:whitespace-nowrap">
                Lan Tỏa Giá Trị
              </span>{' '}
              <span className="sm:whitespace-nowrap">Cho Cộng Đồng</span>
            </h1>

            <p className="text-white/90 text-sm sm:text-base leading-relaxed">
              Cầu nối chính thức giữa các Tình nguyện viên nhiệt huyết và các Tổ chức xã hội uy tín.
              Đăng ký tham gia hoạt động, điểm danh minh bạch và nhận Chứng nhận giờ công tình nguyện điện tử.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={onOpenRegister}
                className="vv-btn-gold px-7 py-3.5 font-bold text-sm shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <span>Trở Thành Tình Nguyện Viên</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-7 py-3.5 rounded-full bg-white/12 hover:bg-white/22 text-white font-semibold text-sm border-[1.5px] border-white/55 backdrop-blur-xs transition-all cursor-pointer"
              >
                Khám Phá Các Hoạt Động
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Incredible Numbers KPI Band (#f7f9f7 with soft decorative circles) */}
      <section className="relative overflow-hidden bg-[#f7f9f7] py-14 sm:py-16 border-b border-[#0d530e]/8">
        <div className="pointer-events-none absolute -top-20 -right-16 w-64 h-64 rounded-full bg-[#388e3c]/5" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-[#388e3c]/4" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div className="vv-stat-card p-6 text-center">
              <span className="block text-3xl sm:text-4xl font-extrabold text-[#0d530e] tracking-tight">1,250+</span>
              <span className="text-xs sm:text-sm font-medium text-[#5a6b5c] mt-1.5 block">Tình nguyện viên</span>
            </div>
            <div className="vv-stat-card p-6 text-center">
              <span className="block text-3xl sm:text-4xl font-extrabold text-[#0d530e] tracking-tight">85+</span>
              <span className="text-xs sm:text-sm font-medium text-[#5a6b5c] mt-1.5 block">Tổ chức xã hội</span>
            </div>
            <div className="vv-stat-card p-6 text-center">
              <span className="block text-3xl sm:text-4xl font-extrabold text-[#0d530e] tracking-tight">460+</span>
              <span className="text-xs sm:text-sm font-medium text-[#5a6b5c] mt-1.5 block">Hoạt động thiện nguyện</span>
            </div>
            <div className="vv-stat-card p-6 text-center">
              <span className="block text-3xl sm:text-4xl font-extrabold text-[#0d530e] tracking-tight">18,500+</span>
              <span className="text-xs sm:text-sm font-medium text-[#5a6b5c] mt-1.5 block">Giờ công được cấp</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Workflow Infographic Band (Crisp White) */}
      <section id="workflow-section" className="bg-white py-16 sm:py-20 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#d49b11] uppercase tracking-widest">Chu Trình Hoạt Động</span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#0d530e] mt-2 tracking-tight">
              Quy Trình Nghiệp Vụ Chuẩn Hóa
            </h2>
            <div className="w-14 h-[3px] rounded-full vv-gold-underline mx-auto mt-3.5 mb-3" />
            <p className="text-sm text-[#555555]">
              Quy trình khép kín từ đăng ký đến xác nhận giờ công theo chuẩn đề tài
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            {[
              { step: '01', title: 'Tìm Hoạt Động', desc: 'Chọn hoạt động theo năng lực & thời gian', icon: Search },
              { step: '02', title: 'Đăng Ký Tham Gia', desc: 'Kiểm tra slot & không trùng lịch', icon: Calendar },
              { step: '03', title: 'Tổ Chức Xét Duyệt', desc: 'Đánh giá hồ sơ & gửi thông báo', icon: ShieldCheck },
              { step: '04', title: 'Tham Gia Hoạt Động', desc: 'Thực hiện nhiệm vụ thiện nguyện', icon: Users },
              { step: '05', title: 'Tổ Chức Điểm Danh', desc: 'Ghi nhận Có mặt / Vắng mặt', icon: CheckCircle2 },
              { step: '06', title: 'Xác Nhận Giờ Công', desc: 'Cấp chứng nhận điện tử & đánh giá', icon: Award }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="vv-card p-5 flex flex-col items-center hover:-translate-y-1 hover:border-[#0d530e]/35 transition-all duration-200"
                >
                  <span className="text-[11px] font-extrabold text-[#d49b11] tracking-wider mb-2">{item.step}</span>
                  <div className="w-12 h-12 rounded-full bg-[#e8f2ed] text-[#0d530e] flex items-center justify-center mb-3 border border-[#0d530e]/15">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs sm:text-[13px] font-bold text-[#1f2d20] mb-1.5">{item.title}</h4>
                  <p className="text-[11px] text-[#5a6b5c] leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Search & Explore Activities Band (Soft Mint Gradient) */}
      <section id="search-section" className="vv-section-mint py-16 sm:py-20 scroll-mt-20 border-y border-[#0d530e]/8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#d49b11] uppercase tracking-widest">Chương Trình Thiện Nguyện</span>
              <h2 className="text-3xl sm:text-4xl font-semibold text-[#0d530e] mt-1.5 tracking-tight">
                Khám Phá Các Hoạt Động Tình Nguyện
              </h2>
              <p className="text-sm text-[#555555] mt-1.5">
                Tìm kiếm theo từ khóa, lĩnh vực, tỉnh thành và tình trạng tiếp nhận
              </p>
            </div>
            <span className="text-xs font-bold text-[#0d530e] bg-white px-4 py-2 rounded-full border border-[#0d530e]/20 shadow-xs shrink-0">
              Tìm thấy {filteredActivities.length} hoạt động phù hợp
            </span>
          </div>

          {/* Filters bar */}
          <div className="vv-card p-5 space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-[#437b62] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nhập tên hoạt động, địa điểm hoặc đơn vị tổ chức..."
                className="vv-input w-full pl-11 pr-4 py-3 text-xs sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#1f2d20] mb-1.5">Lĩnh vực hoạt động:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="vv-input w-full px-3.5 py-2.5 text-xs sm:text-[13px]"
                >
                  <option value="all">Tất cả các lĩnh vực</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1f2d20] mb-1.5">Địa điểm (Tỉnh/TP):</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="vv-input w-full px-3.5 py-2.5 text-xs sm:text-[13px]"
                >
                  <option value="all">Tất cả các tỉnh thành</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1f2d20] mb-1.5">Trạng thái đăng ký:</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="vv-input w-full px-3.5 py-2.5 text-xs sm:text-[13px]"
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
            <div className="vv-card text-center py-16 px-8">
              <Compass className="w-12 h-12 text-[#609f84] mx-auto mb-3 opacity-60" />
              <h3 className="font-bold text-[#1f2d20] text-base">Không tìm thấy hoạt động nào phù hợp</h3>
              <p className="text-xs text-[#5a6b5c] mt-1.5">Hãy thử xóa bộ lọc tìm kiếm hoặc từ khóa để xem thêm kết quả.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedLocation('all');
                  setSelectedStatus('all');
                }}
                className="mt-5 vv-btn-outline px-5 py-2 text-xs font-bold cursor-pointer"
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
        </div>
      </section>

      {/* 5. Verified Organizations Shelf (Volunteer Vietnam Forest Green Callout Banner) */}
      <section id="orgs-section" className="bg-white py-16 sm:py-20 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="vv-cta-banner relative overflow-hidden text-white rounded-3xl p-8 sm:p-12 shadow-[0_18px_42px_rgba(13,83,14,0.18)]">
            <div className="pointer-events-none absolute -top-24 -right-20 w-72 h-72 rounded-full bg-[#eaae1a]/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-white/8 blur-2xl" />

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-9">
                <div>
                  <span className="inline-block px-3.5 py-1 rounded-full bg-white/10 border border-[#eaae1a]/40 text-xs font-bold text-[#f6c453] uppercase tracking-widest mb-3">
                    Đơn Vị Đồng Hành
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Các Tổ Chức Thiện Nguyện Tiêu Biểu
                  </h2>
                  <p className="text-xs sm:text-sm text-[#e2f0e9] mt-1.5">
                    Tất cả tổ chức đều được Ban Quản trị xác thực tư cách pháp nhân
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {organizations
                  .filter((o) => o.status === 'active')
                  .map((org) => (
                    <div
                      key={org.id}
                      className="p-5 rounded-2xl bg-white/8 backdrop-blur-xs border border-white/18 hover:bg-white/14 hover:border-[#eaae1a]/60 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-3.5 mb-3.5">
                          <img
                            src={org.logo}
                            alt={org.name}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-[#eaae1a]/70 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-white line-clamp-1">{org.name}</h4>
                            <span className="text-[11px] text-[#f6c453] font-medium flex items-center gap-1 mt-0.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#eaae1a] shrink-0" />
                              <span className="truncate">Đã xác minh ({org.licenseNumber})</span>
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-[#e2f0e9]/90 line-clamp-2 leading-relaxed mb-4">
                          {org.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/15 text-[11px] text-[#b9cdc0] flex items-center justify-between gap-2">
                        <span className="truncate">{org.address.split(',')[org.address.split(',').length - 1]}</span>
                        <span className="text-[#f6c453] font-semibold shrink-0">{org.type}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
