import React from 'react';
import { HeartHandshake, ShieldCheck, Mail, Phone, MapPin, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="font-bold text-base text-white">V-Connect</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Hệ thống kết nối tình nguyện viên toàn diện, hỗ trợ quản lý hoạt động, điểm danh và xác nhận giờ công thiện nguyện minh bạch.
            </p>
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4" />
              <span>Chứng nhận giờ công chính thức</span>
            </div>
          </div>

          {/* Col 2: Core modules */}
          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">5 Chức Năng Cốt Lõi</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>• Quản lý tài khoản & hồ sơ người dùng</li>
              <li>• Quản lý tổ chức & hoạt động tình nguyện</li>
              <li>• Quản lý đăng ký & xét duyệt tình nguyện viên</li>
              <li>• Quản lý quá trình tham gia & điểm danh</li>
              <li>• Quản lý & xác nhận giờ công tình nguyện</li>
            </ul>
          </div>

          {/* Col 3: Target groups */}
          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Đối Tượng Phục Vụ</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>• Tình nguyện viên (Hồ sơ, đăng ký, giờ công, lịch trình)</li>
              <li>• Đơn vị Tổ chức (Đăng tải hoạt động, duyệt TNV, điểm danh)</li>
              <li>• Quản trị viên (Kiểm duyệt, quản lý danh mục, báo cáo KPI)</li>
              <li>• Khách vãng lai (Tìm kiếm & khám phá cơ hội thiện nguyện)</li>
            </ul>
          </div>

          {/* Col 4: Contact & Support */}
          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Liên Hệ Ban Quản Trị</h4>
            <div className="space-y-2 text-[11px]">
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>support@vconnect.vn</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>1900 6868 (8:00 - 18:00)</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Hà Nội & TP. Hồ Chí Minh, Việt Nam</span>
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 Đồ Án Hệ Thống Kết Nối Tình Nguyện Viên. Bảo lưu mọi quyền.
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-slate-400">
              <span>Thiết kế cho cộng đồng với</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
