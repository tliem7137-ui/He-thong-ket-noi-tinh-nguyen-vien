import React, { useRef } from 'react';
import { Award, CheckCircle, Download, Printer, ShieldCheck, X, Sparkles } from 'lucide-react';

export const CertificateModal = ({ registration, activity, volunteer, isOpen, onClose }) => {
  const certificateRef = useRef(null);

  if (!isOpen || !registration || !volunteer) return null;

  const hours = registration.hoursConfirmed || activity?.hoursEarned || 4;
  const issueDate = new Date().toLocaleDateString('vi-VN');
  const certCode = `VCN-CERT-${registration.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full flex flex-col overflow-hidden animate-scale-up my-auto print:shadow-none print:border-none print:max-w-none">
        {/* Header toolbar */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Award className="w-4 h-4 text-amber-500" />
            <span>CHỨNG NHẬN ĐIỆN TỬ CHÍNH THỨC</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Chứng Nhận</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Canvas */}
        <div ref={certificateRef} className="p-8 sm:p-12 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 relative">
          {/* Ornate border frame */}
          <div className="border-4 border-double border-amber-600/60 p-6 sm:p-8 rounded-2xl relative text-center">
            {/* Corner ornaments */}
            <div className="absolute top-2 left-2 text-amber-600 text-xs">❖</div>
            <div className="absolute top-2 right-2 text-amber-600 text-xs">❖</div>
            <div className="absolute bottom-2 left-2 text-amber-600 text-xs">❖</div>
            <div className="absolute bottom-2 right-2 text-amber-600 text-xs">❖</div>

            {/* Top emblem */}
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 mb-4 ring-4 ring-amber-100">
              <Award className="w-9 h-9" />
            </div>

            <p className="text-[11px] font-bold tracking-widest text-amber-800 uppercase mb-1">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-4">
              HỆ THỐNG KẾT NỐI TÌNH NGUYỆN VIÊN (V-CONNECT)
            </p>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-serif tracking-tight mb-2 uppercase">
              GIẤY CHỨNG NHẬN
            </h1>
            <h2 className="text-sm font-semibold text-amber-700 tracking-wide uppercase mb-6">
              HOÀN THÀNH GIỜ CÔNG TÌNH NGUYỆN XÃ HỘI
            </h2>

            <p className="text-xs text-slate-500 mb-2">Chứng nhận tình nguyện viên:</p>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 border-b-2 border-amber-400 inline-block px-4 pb-1 mb-4 font-serif">
              {volunteer.fullName}
            </h3>

            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed mb-4">
              Đã tham gia tích cực, cống hiến tâm sức và hoàn thành xuất sắc nhiệm vụ trong chiến dịch:
            </p>

            <div className="bg-amber-100/40 p-3 rounded-xl border border-amber-200/60 max-w-lg mx-auto mb-5">
              <h4 className="text-sm font-bold text-emerald-900 mb-1">
                {registration.activityTitle || activity?.title}
              </h4>
              <p className="text-[11px] text-slate-600">
                Đơn vị tổ chức: <strong>{activity?.organizationName || 'Ban Tổ Chức Hoạt Động'}</strong>
              </p>
            </div>

            <div className="inline-flex items-center gap-2 bg-emerald-600 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-full shadow-md mb-8">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>GHI NHẬN: {hours} GIỜ CÔNG TÌNH NGUYỆN CHÍNH THỨC</span>
            </div>

            {/* Signature & Seal section */}
            <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-200 text-left">
              <div>
                <span className="block text-slate-400 text-[10px]">MÃ XÁC THỰC:</span>
                <span className="font-mono font-bold text-slate-800 text-[11px]">{certCode}</span>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Đã kiểm định trên Blockchain/Hệ thống</span>
                </div>
              </div>

              <div className="text-right">
                <span className="block text-slate-500 text-[11px] italic">Ngày cấp: {issueDate}</span>
                <span className="block font-bold text-slate-800 text-xs mt-1">ĐẠI DIỆN ĐƠN VỊ TỔ CHỨC</span>
                <div className="mt-2 text-rose-600 font-serif font-bold text-sm tracking-wider inline-block border-2 border-rose-500/80 rounded-lg px-2 py-0.5 rotate-[-5deg]">
                  [ ĐÃ ĐIỂM DANH & XÁC NHẬN ]
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500 print:hidden">
          Giấy chứng nhận được lưu trữ vĩnh viễn trên hồ sơ điện tử của Tình nguyện viên.
        </div>
      </div>
    </div>
  );
};
