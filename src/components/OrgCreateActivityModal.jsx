import React, { useState } from 'react';
import { useApp } from '../context/useApp';
import { useModalClose } from '../hooks/useModalClose';
import { X, Plus, Edit3, Award, Users, AlertTriangle, Image as ImageIcon } from 'lucide-react';

const OrgActivityForm = ({ editingActivity, onClose }) => {
  const { categories, locations, createActivity, updateActivity } = useApp();
  const isEditing = !!editingActivity;

  const [title, setTitle] = useState(editingActivity?.title || '');
  const [categoryId, setCategoryId] = useState(editingActivity?.categoryId || categories[0]?.id || 'cat-1');
  const [locationId, setLocationId] = useState(editingActivity?.locationId || locations[0]?.id || 'loc-1');
  const [specificAddress, setSpecificAddress] = useState(editingActivity?.specificAddress || '');
  const [startDate, setStartDate] = useState(editingActivity?.startDate || '2026-12-10T08:00');
  const [endDate, setEndDate] = useState(editingActivity?.endDate || '2026-12-10T16:00');
  const [hoursEarned, setHoursEarned] = useState(editingActivity?.hoursEarned ?? 6);
  const [volunteersNeeded, setVolunteersNeeded] = useState(editingActivity?.volunteersNeeded ?? 25);
  const [description, setDescription] = useState(editingActivity?.description || '');
  const [requirements, setRequirements] = useState(
    editingActivity?.requirements || 'Tinh thần nhiệt tình, trách nhiệm, có mặt đúng giờ.'
  );
  const [benefits, setBenefits] = useState(
    editingActivity?.benefits || 'Được cấp Giấy chứng nhận giờ công tình nguyện, áo đồng phục, hỗ trợ ăn uống.'
  );
  const [banner, setBanner] = useState(
    editingActivity?.banner || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop&q=80'
  );
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const minVolunteers = isEditing ? Math.max(1, editingActivity.volunteersRegistered || 0) : 1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      setErrorMsg('Thời gian kết thúc phải diễn ra sau thời gian bắt đầu!');
      return;
    }
    if (Number(volunteersNeeded) < minVolunteers) {
      setErrorMsg(`Số lượng TNV cần tuyển không thể nhỏ hơn số lượng đã đăng ký (${minVolunteers})!`);
      return;
    }

    const payload = {
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
    };

    setSubmitting(true);
    const res = isEditing
      ? await updateActivity(editingActivity.id, payload)
      : await createActivity(payload);
    setSubmitting(false);

    if (res?.success) {
      onClose();
    } else {
      setErrorMsg(res?.error || (isEditing ? 'Không thể cập nhật hoạt động.' : 'Không thể tạo hoạt động.'));
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-[0_24px_60px_rgba(13,31,22,0.28)] border border-[#0d530e]/15 max-w-2xl w-full overflow-hidden animate-scale-up my-auto">
      {/* Header */}
      <div className="p-5 px-6 border-b border-[#e8f2ed] flex items-center justify-between bg-[#f5f9f7]">
        <div>
          <h3 className="font-bold text-[#0d530e] text-lg flex items-center gap-2">
            {isEditing ? (
              <Edit3 className="w-5 h-5 text-[#0d530e]" />
            ) : (
              <Plus className="w-5 h-5 text-[#0d530e]" />
            )}
            {isEditing ? 'Chỉnh Sửa Hoạt Động Tình Nguyện' : 'Đăng Ký Tạo Hoạt Động Tình Nguyện Mới'}
          </h3>
          <p className="text-xs text-[#5a6b5c] mt-0.5">
            {isEditing
              ? editingActivity.approvalStatus === 'need_edit' || editingActivity.approvalStatus === 'rejected'
                ? 'Sau khi lưu chỉnh sửa, hoạt động sẽ tự động gửi lại Ban Quản trị kiểm duyệt'
                : 'Cập nhật thông tin chi tiết cho chiến dịch tình nguyện của đơn vị'
              : 'Hoạt động sẽ được gửi tới Ban Quản trị để kiểm duyệt trước khi công khai'}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Đóng"
          className="p-1.5 text-[#5a6b5c] hover:text-[#0d530e] rounded-full hover:bg-[#e8f2ed] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {isEditing && (editingActivity.editReason || editingActivity.rejectReason) && (
        <div className="mx-6 mt-4 p-3.5 rounded-xl bg-[#fef8e6] border border-[#eaae1a]/45 text-[#735104] text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-[#d49b11] shrink-0 mt-0.5" />
          <div>
            <strong className="block">
              {editingActivity.approvalStatus === 'need_edit'
                ? 'Yêu cầu chỉnh sửa từ Quản trị viên:'
                : 'Lý do bị từ chối kiểm duyệt:'}
            </strong>
            <span>{editingActivity.editReason || editingActivity.rejectReason}</span>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 max-h-[75vh] overflow-y-auto space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-[#1f2d20] mb-1">Tên hoạt động / Chiến dịch *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: Chiến dịch Tiếp sức mùa thi 2026..."
            className="vv-input w-full p-2.5 font-medium"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[#1f2d20] mb-1">Lĩnh vực hoạt động *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="vv-input w-full p-2.5"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#1f2d20] mb-1">Tỉnh / Thành phố *</label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="vv-input w-full p-2.5"
            >
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-[#1f2d20] mb-1">Địa chỉ cụ thể / Điểm tập kết *</label>
          <input
            type="text"
            required
            value={specificAddress}
            onChange={(e) => setSpecificAddress(e.target.value)}
            placeholder="Số nhà, đường, trường học hoặc địa điểm tập trung"
            className="vv-input w-full p-2.5"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[#1f2d20] mb-1">Thời gian bắt đầu *</label>
            <input
              type="datetime-local"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="vv-input w-full p-2.5"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#1f2d20] mb-1">Thời gian kết thúc *</label>
            <input
              type="datetime-local"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="vv-input w-full p-2.5"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[#1f2d20] mb-1">Số lượng TNV cần tuyển *</label>
            <div className="relative">
              <Users className="w-4 h-4 text-[#609f84] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min={minVolunteers}
                required
                value={volunteersNeeded}
                onChange={(e) => setVolunteersNeeded(e.target.value)}
                className="vv-input w-full pl-9 pr-3 py-2.5"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#1f2d20] mb-1">Số giờ công tình nguyện cấp *</label>
            <div className="relative">
              <Award className="w-4 h-4 text-[#d49b11] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min="1"
                max="100"
                required
                value={hoursEarned}
                onChange={(e) => setHoursEarned(e.target.value)}
                className="vv-input w-full pl-9 pr-3 py-2.5"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-[#1f2d20] mb-1">Mô tả mục đích &amp; nội dung công việc *</label>
          <textarea
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Nêu rõ mục đích hoạt động, ý nghĩa cộng đồng và các nhiệm vụ cụ thể mà tình nguyện viên sẽ thực hiện..."
            className="vv-input w-full p-2.5"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[#1f2d20] mb-1">Yêu cầu đối với TNV</label>
            <textarea
              rows={2}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Độ tuổi, kỹ năng, sức khỏe, trang phục..."
              className="vv-input w-full p-2.5"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#1f2d20] mb-1">Quyền lợi &amp; Hỗ trợ</label>
            <textarea
              rows={2}
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              placeholder="Giấy chứng nhận, đồng phục, ăn uống, phương tiện di chuyển..."
              className="vv-input w-full p-2.5"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-[#1f2d20] mb-1">Link ảnh Banner hoạt động (URL)</label>
          <div className="relative">
            <ImageIcon className="w-4 h-4 text-[#609f84] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              value={banner}
              onChange={(e) => setBanner(e.target.value)}
              className="vv-input w-full pl-9 pr-3 py-2.5 text-[11px]"
            />
          </div>
        </div>

        <div className="pt-2 flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-full font-bold text-[#5a6b5c] bg-[#f5f9f7] hover:bg-[#e8f2ed] border border-[#0d530e]/15 transition-all cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="vv-btn-primary flex-1 py-3 font-bold disabled:opacity-50 shadow-sm cursor-pointer"
          >
            {submitting
              ? 'Đang lưu...'
              : isEditing
                ? editingActivity.approvalStatus === 'need_edit' || editingActivity.approvalStatus === 'rejected'
                  ? 'Lưu Chỉnh Sửa & Gửi Duyệt Lại'
                  : 'Lưu Thay Đổi Hoạt Động'
                : 'Gửi Yêu Cầu Phê Duyệt Tới Admin'}
          </button>
        </div>
      </form>
    </div>
  );
};

export const OrgCreateActivityModal = ({ isOpen, editingActivity = null, onClose }) => {
  const { handleBackdropClick } = useModalClose(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d1f16]/65 backdrop-blur-xs overflow-y-auto"
    >
      <OrgActivityForm
        key={editingActivity?.id || 'create-activity'}
        editingActivity={editingActivity}
        onClose={onClose}
      />
    </div>
  );
};
