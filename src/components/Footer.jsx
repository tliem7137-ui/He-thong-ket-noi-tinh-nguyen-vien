import React from 'react';
import { HeartHandshake, ShieldCheck, Mail, Phone, MapPin, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="vv-footer-bg text-[#b9cdc0] relative text-xs">
      {/* Top 3px golden gradient accent matching Volunteer Vietnam */}
      <div className="h-[3px] w-full vv-footer-accent" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Col 1 */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3 text-white">
              <div className="w-11 h-11 rounded-full bg-white/10 border-2 border-white/85 flex items-center justify-center text-white shadow-md">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-lg text-white tracking-tight block leading-none">
                  V-Connect
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#eaae1a] font-semibold">
                  Volunteer Network
                </span>
              </div>
            </div>
            <p className="text-[#b9cdc0] leading-relaxed text-xs">
              Hệ thống kết nối tình nguyện viên toàn diện, hỗ trợ quản lý hoạt động, điểm danh và xác nhận giờ công thiện nguyện minh bạch.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-[#eaae1a]/30 text-[#f6c453] font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4 text-[#eaae1a]" />
              <span>Chứng nhận giờ công chính thức</span>
            </div>
          </div>

          {/* Col 2: Core modules */}
          <div>
            <h4 className="font-semibold text-white text-[15px] mb-2">5 Chức Năng Cốt Lõi</h4>
            <div className="w-[42px] h-[3px] rounded-full vv-gold-underline mb-4" />
            <ul className="space-y-2 text-xs text-[#b9cdc0]">
              <li className="flex items-start gap-2">
                <span className="text-[#eaae1a] font-bold">›</span>
                <span>Quản lý tài khoản &amp; hồ sơ người dùng</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#eaae1a] font-bold">›</span>
                <span>Quản lý tổ chức &amp; hoạt động tình nguyện</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#eaae1a] font-bold">›</span>
                <span>Quản lý đăng ký &amp; xét duyệt tình nguyện viên</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#eaae1a] font-bold">›</span>
                <span>Quản lý quá trình tham gia &amp; điểm danh</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#eaae1a] font-bold">›</span>
                <span>Quản lý &amp; xác nhận giờ công tình nguyện</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Target groups */}
          <div>
            <h4 className="font-semibold text-white text-[15px] mb-2">Đối Tượng Phục Vụ</h4>
            <div className="w-[42px] h-[3px] rounded-full vv-gold-underline mb-4" />
            <ul className="space-y-2 text-xs text-[#b9cdc0]">
              <li className="flex items-start gap-2">
                <span className="text-[#eaae1a] font-bold">›</span>
                <span>Tình nguyện viên (Hồ sơ, đăng ký, giờ công, lịch trình)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#eaae1a] font-bold">›</span>
                <span>Đơn vị Tổ chức (Đăng tải hoạt động, duyệt TNV, điểm danh)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#eaae1a] font-bold">›</span>
                <span>Quản trị viên (Kiểm duyệt, quản lý danh mục, báo cáo KPI)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#eaae1a] font-bold">›</span>
                <span>Khách vãng lai (Tìm kiếm &amp; khám phá cơ hội thiện nguyện)</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Support */}
          <div>
            <h4 className="font-semibold text-white text-[15px] mb-2">Liên Hệ Ban Quản Trị</h4>
            <div className="w-[42px] h-[3px] rounded-full vv-gold-underline mb-4" />
            <div className="space-y-3 text-xs text-[#b9cdc0]">
              <p className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-white/5 border border-[#eaae1a]/30 text-[#eaae1a] flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </span>
                <span>support@vconnect.vn</span>
              </p>
              <p className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-white/5 border border-[#eaae1a]/30 text-[#eaae1a] flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </span>
                <span>1900 6868 (8:00 - 18:00)</span>
              </p>
              <p className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-white/5 border border-[#eaae1a]/30 text-[#eaae1a] flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </span>
                <span>Hà Nội &amp; TP. Hồ Chí Minh, Việt Nam</span>
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#8fa99a]">
          <div>
            © 2026 Đồ Án Hệ Thống Kết Nối Tình Nguyện Viên. Bảo lưu mọi quyền.
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[#b9cdc0]">
              <span>Thiết kế cho cộng đồng với</span>
              <Heart className="w-3.5 h-3.5 text-[#eaae1a] fill-[#eaae1a] inline" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
