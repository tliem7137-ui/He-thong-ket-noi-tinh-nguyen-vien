import React, { useRef } from 'react';
import { useModalClose } from '../hooks/useModalClose';
import { Award, Printer, ShieldCheck, X, Sparkles } from 'lucide-react';

const buildFallbackCertCode = (registration, activity) => {
  const cleanReg = String(registration?.id || 'REG').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const cleanAct = String(activity?.id || registration?.activityId || 'ACT').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return `VCN-CERT-${cleanReg}-${cleanAct}`;
};

const formatIssueDate = (rawDate) => {
  if (!rawDate) return '—';
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return rawDate;
  return parsed.toLocaleDateString('vi-VN');
};

export const CertificateModal = ({ registration, activity, volunteer, isOpen, onClose }) => {
  const certificateRef = useRef(null);
  const { handleBackdropClick } = useModalClose(isOpen && !!registration && !!volunteer, onClose);

  if (!isOpen || !registration || !volunteer) return null;

  const hours = registration.hoursConfirmed || activity?.hoursEarned || 4;
  const issueDate = formatIssueDate(registration.certificateIssuedAt || registration.registeredDate);
  const certCode = registration.certificateCode || buildFallbackCertCode(registration, activity);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div onClick={handleBackdropClick} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d1f16]/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl shadow-[0_24px_60px_rgba(13,31,22,0.32)] border border-[#0d530e]/15 max-w-2xl w-full flex flex-col overflow-hidden animate-scale-up my-auto print:shadow-none print:border-none print:max-w-none">
        {/* Header toolbar */}
        <div className="p-4 px-5 border-b border-[#e8f2ed] flex items-center justify-between bg-[#f5f9f7] print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0d530e]">
            <Award className="w-4 h-4 text-[#d49b11]" />
            <span>CHỨNG NHẬN ĐIỆN TỬ CHÍNH THỨC</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="vv-btn-forest px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Chứng Nhận</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#5a6b5c] hover:text-[#0d530e] rounded-full hover:bg-[#e8f2ed] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Canvas */}
        <div ref={certificateRef} className="p-8 sm:p-12 bg-gradient-to-b from-[#fef8e6]/60 via-white to-[#f5f9f7]/50 relative">
          {/* Ornate border frame */}
          <div className="border-4 border-double border-[#d49b11]/70 p-6 sm:p-8 rounded-2xl relative text-center">
            <div className="absolute top-2 left-2 text-[#d49b11] text-xs">❖</div>
            <div className="absolute top-2 right-2 text-[#d49b11] text-xs">❖</div>
            <div className="absolute bottom-2 left-2 text-[#d49b11] text-xs">❖</div>
            <div className="absolute bottom-2 right-2 text-[#d49b11] text-xs">❖</div>

            {/* Top emblem */}
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-[#d49b11] to-[#f6c453] text-white flex items-center justify-center shadow-lg shadow-[#eaae1a]/30 mb-4 ring-4 ring-[#fef8e6]">
              <Award className="w-9 h-9" />
            </div>

            <p className="text-[11px] font-bold tracking-widest text-[#8a6100] uppercase mb-1">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </p>
            <p className="text-[10px] text-[#5a6b5c] uppercase tracking-wider mb-4">
              HỆ THỐNG KẾT NỐI TÌNH NGUYỆN VIÊN (V-CONNECT)
            </p>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0d530e] font-serif tracking-tight mb-2 uppercase">
              GIẤY CHỨNG NHẬN
            </h1>
            <h2 className="text-sm font-semibold text-[#b8840a] tracking-wide uppercase mb-6">
              HOÀN THÀNH GIỜ CÔNG TÌNH NGUYỆN XÃ HỘI
            </h2>

            <p className="text-xs text-[#5a6b5c] mb-2">Chứng nhận tình nguyện viên:</p>
            <h3 className="text-xl sm:text-2xl font-bold text-[#1f2d20] border-b-2 border-[#eaae1a] inline-block px-4 pb-1 mb-4 font-serif">
              {volunteer.fullName}
            </h3>

            <p className="text-xs text-[#555555] max-w-md mx-auto leading-relaxed mb-4">
              Đã tham gia tích cực, cống hiến tâm sức và hoàn thành xuất sắc nhiệm vụ trong chiến dịch:
            </p>

            <div className="bg-[#f5f9f7] p-3.5 rounded-xl border border-[#0d530e]/20 max-w-lg mx-auto mb-5">
              <h4 className="text-sm font-bold text-[#0d530e] mb-1">
                {registration.activityTitle || activity?.title}
              </h4>
              <p className="text-[11px] text-[#5a6b5c]">
                Đơn vị tổ chức: <strong className="text-[#1f2d20]">{activity?.organizationName || 'Ban Tổ Chức Hoạt Động'}</strong>
              </p>
            </div>

            <div className="inline-flex items-center gap-2 bg-[#0d530e] text-white font-bold text-xs sm:text-sm px-5 py-2 rounded-full shadow-md mb-8">
              <Sparkles className="w-4 h-4 text-[#f6c453]" />
              <span>GHI NHẬN: {hours} GIỜ CÔNG TÌNH NGUYỆN CHÍNH THỨC</span>
            </div>

            {/* Signature & Seal section */}
            <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-[#e8f2ed] text-left">
              <div>
                <span className="block text-[#5a6b5c] text-[10px]">MÃ XÁC THỰC:</span>
                <span className="font-mono font-bold text-[#1f2d20] text-[11px]">{certCode}</span>
                <div className="flex items-center gap-1 text-[11px] text-[#0d530e] mt-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Đã xác thực trên Hệ thống V-Connect</span>
                </div>
              </div>

              <div className="text-right">
                <span className="block text-[#5a6b5c] text-[11px] italic">Ngày cấp: {issueDate}</span>
                <span className="block font-bold text-[#1f2d20] text-xs mt-1">ĐẠI DIỆN ĐƠN VỊ TỔ CHỨC</span>
                <div className="mt-2 text-rose-700 font-serif font-bold text-sm tracking-wider inline-block border-2 border-rose-600/80 rounded-lg px-2 py-0.5 rotate-[-5deg]">
                  [ ĐÃ ĐIỂM DANH &amp; XÁC NHẬN ]
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-[#f5f9f7] border-t border-[#e8f2ed] text-center text-[11px] text-[#5a6b5c] print:hidden">
          Giấy chứng nhận được lưu trữ vĩnh viễn trên hồ sơ điện tử của Tình nguyện viên.
        </div>
      </div>
    </div>
  );
};
