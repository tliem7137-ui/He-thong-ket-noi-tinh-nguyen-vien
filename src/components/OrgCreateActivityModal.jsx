import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Plus, Calendar, MapPin, Award, Users, AlertTriangle, Sparkles, Image as ImageIcon } from 'lucide-react';

export const OrgCreateActivityModal = ({ isOpen, onClose }) => {
  const { categories, locations, createActivity } = useApp();

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-1');
  const [locationId, setLocationId] = useState(locations[0]?.id || 'loc-1');
  const [specificAddress, setSpecificAddress] = useState('');
  const [startDate, setStartDate] = useState('2026-12-10T08:00');
  const [endDate, setEndDate] = useState('2026-12-10T16:00');
  const [hoursEarned, setHoursEarned] = useState(6);
  const [volunteersNeeded, setVolunteersNeeded] = useState(25);
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('Tinh thần nhiệt tình, trách nhiệm, có mặt đúng giờ.');
  const [benefits, setBenefits] = useState('Được cấp Giấy chứng nhận giờ công tình nguyện, áo đồng phục, hỗ trợ ăn uống.');
  const [banner, setBanner] = useState('https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop&q=80');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Check date logic (Quy trình 3b & 3c)
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      setErrorMsg('Thời gian kết thúc phải diễn ra sau thời gian bắt đầu!');
      return;
    }

    const res = createActivity({
      title,
      categoryId,
      locationId,
      specificAddress,
      startDate,
      endDate,
      hoursEarned: Number(hoursEarned),
      volunteersNeeded: Number(volunteersNeeded),
      description,
      requirements,
      benefits,
      banner
    });

    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Không thể tạo hoạt động.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full overflow-hidden animate-scale-up my-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Đăng Ký Tạo Hoạt Động Tình Nguyện Mới
            </h3>
            <p className="text-xs text-slate-500">
              Hoạt động sẽ được gửi tới Ban Quản trị để kiểm duyệt trước khi công khai
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[75vh] overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tên hoạt động / Chiến dịch *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Chiến dịch Tiếp sức mùa thi 2026..."
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50/50 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lĩnh vực hoạt động *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tỉnh / Thành phố *</label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Địa chỉ cụ thể / Điểm tập kết *</label>
            <input
              type="text"
              required
              value={specificAddress}
              onChange={(e) => setSpecificAddress(e.target.value)}
              placeholder="Số nhà, đường, trường học hoặc địa điểm tập trung"
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Thời gian bắt đầu *</label>
              <input
                type="datetime-local"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Thời gian kết thúc *</label>
              <input
                type="datetime-local"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Số lượng TNV cần tuyển *</label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="1"
                  required
                  value={volunteersNeeded}
                  onChange={(e) => setVolunteersNeeded(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Số giờ công tình nguyện cấp *</label>
              <div className="relative">
                <Award className="w-4 h-4 text-amber-500 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={hoursEarned}
                  onChange={(e) => setHoursEarned(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Mô tả mục đích & nội dung công việc *</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nêu rõ mục đích hoạt động, ý nghĩa cộng đồng và các nhiệm vụ cụ thể mà tình nguyện viên sẽ thực hiện..."
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Yêu cầu đối với TNV</label>
              <textarea
                rows={2}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Độ tuổi, kỹ năng, sức khỏe, trang phục..."
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quyền lợi & Hỗ trợ</label>
              <textarea
                rows={2}
                value={benefits}
                onChange={(e) => setBenefits(e.target.value)}
                placeholder="Giấy chứng nhận, đồng phục, ăn uống, phương tiện di chuyển..."
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Link ảnh Banner hoạt động (URL)</label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="url"
                value={banner}
                onChange={(e) => setBanner(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-[11px]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              Gửi Yêu Cầu Phê Duyệt Tới Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
