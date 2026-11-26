import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  initialCategories,
  initialLocations,
  initialOrganizations,
  initialVolunteers,
  initialActivities,
  initialRegistrations,
  initialReviews,
  initialVolunteerEvaluations,
  initialNotifications,
  initialFeedbacks,
  initialSystemSettings
} from '../data/initialData';
import confetti from 'canvas-confetti';

const AppContext = createContext();

const STORAGE_KEYS = {
  CURRENT_USER: 'vconnect_current_user',
  CURRENT_ROLE: 'vconnect_current_role'
};

const getStored = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

const setStored = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
};

// API base path (proxied by Vite to http://localhost:5000 in dev)
const API_BASE = '/api';

export const AppProvider = ({ children }) => {
  // State initialized from initialData and synchronized with backend API
  const [categories, setCategories] = useState(initialCategories);
  const [locations, setLocations] = useState(initialLocations);
  const [organizations, setOrganizations] = useState(initialOrganizations);
  const [volunteers, setVolunteers] = useState(initialVolunteers);
  const [activities, setActivities] = useState(initialActivities);
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [reviews, setReviews] = useState(initialReviews);
  const [volunteerEvaluations, setVolunteerEvaluations] = useState(initialVolunteerEvaluations);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [feedbacks, setFeedbacks] = useState(initialFeedbacks);
  const [settings, setSettings] = useState(initialSystemSettings);

  const [backendOnline, setBackendOnline] = useState(false);

  // Current session - defaults strictly to guest
  const [userRole, setUserRole] = useState(() => {
    const savedUser = getStored(STORAGE_KEYS.CURRENT_USER, null);
    if (!savedUser) return 'guest';
    return getStored(STORAGE_KEYS.CURRENT_ROLE, 'guest');
  });
  const [currentUser, setCurrentUser] = useState(() => getStored(STORAGE_KEYS.CURRENT_USER, null));

  // Reset any legacy mock session to guest on first load of this update
  useEffect(() => {
    const legacyCleaned = localStorage.getItem('vconnect_v2_guest_default');
    if (!legacyCleaned) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_ROLE);
      localStorage.setItem('vconnect_v2_guest_default', 'true');
      setUserRole('guest');
      setCurrentUser(null);
    }
  }, []);

  // UI helpers: Toasts
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync session to localStorage
  useEffect(() => { setStored(STORAGE_KEYS.CURRENT_ROLE, userRole); }, [userRole]);
  useEffect(() => { setStored(STORAGE_KEYS.CURRENT_USER, currentUser); }, [currentUser]);

  // Sync full data from Backend on initial mount
  const syncWithBackend = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/bootstrap`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          if (d.categories) setCategories(d.categories);
          if (d.locations) setLocations(d.locations);
          if (d.organizations) setOrganizations(d.organizations);
          if (d.volunteers) setVolunteers(d.volunteers);
          if (d.activities) setActivities(d.activities);
          if (d.registrations) setRegistrations(d.registrations);
          if (d.reviews) setReviews(d.reviews);
          if (d.volunteerEvaluations) setVolunteerEvaluations(d.volunteerEvaluations);
          if (d.notifications) setNotifications(d.notifications);
          if (d.feedbacks) setFeedbacks(d.feedbacks);
          if (d.settings) setSettings(d.settings);
          setBackendOnline(true);
        }
      }
    } catch (e) {
      // Backend not yet reachable or in standalone mode
      setBackendOnline(false);
    }
  }, []);

  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  // Keep currentUser synced
  useEffect(() => {
    if (!currentUser) return;
    if (userRole === 'volunteer') {
      const updated = volunteers.find((v) => v.id === currentUser.id);
      if (updated) setCurrentUser(updated);
    } else if (userRole === 'organization') {
      const updated = organizations.find((o) => o.id === currentUser.id);
      if (updated) setCurrentUser(updated);
    }
  }, [volunteers, organizations, userRole]);

  // Quick switch user
  const quickSwitchUser = (role, targetId) => {
    if (role === 'guest') {
      setUserRole('guest');
      setCurrentUser(null);
      showToast('Đã chuyển sang chế độ Khách vãng lai', 'info');
      return;
    }
    if (role === 'admin') {
      setUserRole('admin');
      setCurrentUser({
        id: 'admin',
        fullName: 'Quản Trị Viên Hệ Thống',
        email: 'admin@vconnect.vn',
        role: 'admin'
      });
      showToast('Đã chuyển sang quyền Quản trị viên (Admin)', 'info');
      return;
    }
    if (role === 'volunteer') {
      const vol = volunteers.find((v) => v.id === targetId) || volunteers[0];
      setUserRole('volunteer');
      setCurrentUser(vol);
      showToast(`Đã chuyển sang Tình nguyện viên: ${vol.fullName}`, 'info');
      return;
    }
    if (role === 'organization') {
      const org = organizations.find((o) => o.id === targetId) || organizations[0];
      setUserRole('organization');
      setCurrentUser(org);
      showToast(`Đã chuyển sang Tổ chức: ${org.name}`, 'info');
      return;
    }
  };

  const logout = () => {
    setUserRole('guest');
    setCurrentUser(null);
    showToast('Đã đăng xuất khỏi hệ thống', 'info');
  };

  // Login handler with Backend API
  const login = async (email, password, expectedRole) => {
    try {
      const endpoint = expectedRole === 'admin' ? `${API_BASE}/auth/admin-login` : `${API_BASE}/auth/login`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: expectedRole })
      });
      const data = await res.json();
      if (res.status === 429) {
        return { success: false, errorCode: 'rate_limited', error: 'rate_limited' };
      }
      if (res.ok && data.success) {
        setUserRole(data.role);
        setCurrentUser(data.user);
        showToast(`Đăng nhập thành công! Chào mừng ${data.user.fullName || data.user.name}`, 'success');
        return { success: true };
      } else {
        const errorCode = data.error || 'invalid_credentials';
        return { success: false, errorCode, error: errorCode };
      }
    } catch (e) {
      // Fallback local logic
      if (expectedRole === 'admin') {
        const ADMIN_RECOVERY = 'VCADM-2026-RECOVERY';
        if ((email === 'admin@vconnect.vn' && password === 'admin123') || password === ADMIN_RECOVERY) {
          quickSwitchUser('admin');
          return { success: true };
        }
        return { success: false, errorCode: 'invalid_credentials', error: 'invalid_credentials' };
      }
      if (expectedRole === 'volunteer') {
        const vol = volunteers.find((v) => v.email.toLowerCase() === email.toLowerCase());
        if (!vol || (vol.password && vol.password !== password)) return { success: false, errorCode: 'invalid_credentials', error: 'invalid_credentials' };
        if (vol.status === 'locked') return { success: false, errorCode: 'account_locked', error: 'account_locked' };
        if (vol.status === 'pending') return { success: false, errorCode: 'account_pending', error: 'account_pending' };
        setUserRole('volunteer');
        setCurrentUser(vol);
        return { success: true };
      }
      if (expectedRole === 'organization') {
        const org = organizations.find((o) => o.email.toLowerCase() === email.toLowerCase());
        if (!org || (org.password && org.password !== password)) return { success: false, errorCode: 'invalid_credentials', error: 'invalid_credentials' };
        if (org.status === 'locked') return { success: false, errorCode: 'account_locked', error: 'account_locked' };
        if (org.status === 'pending') return { success: false, errorCode: 'account_pending', error: 'account_pending' };
        setUserRole('organization');
        setCurrentUser(org);
        return { success: true };
      }
      return { success: false, errorCode: 'invalid_credentials', error: 'Lỗi kết nối tới máy chủ.' };
    }
  };

  // Register Volunteer with Backend API
  const registerVolunteer = async (formData) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register-volunteer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVolunteers((prev) => [data.volunteer, ...prev]);
        showToast('Đăng ký tài khoản thành công! Hồ sơ đang ở trạng thái Chờ duyệt bởi Admin.', 'info');
        syncWithBackend();
        return { success: true, volunteer: data.volunteer };
      } else {
        return { success: false, error: data.error };
      }
    } catch (e) {
      // Fallback
      const newVol = {
        id: `vol-${Date.now()}`,
        ...formData,
        status: 'pending',
        totalHours: 0,
        completedActivitiesCount: 0,
        ratingAvg: 0,
        registeredAt: new Date().toISOString().split('T')[0]
      };
      setVolunteers((prev) => [newVol, ...prev]);
      showToast('Đăng ký tài khoản thành công! Hồ sơ đang Chờ duyệt.', 'info');
      return { success: true, volunteer: newVol };
    }
  };

  // Register Organization with Backend API
  const registerOrganization = async (formData) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register-organization`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrganizations((prev) => [data.organization, ...prev]);
        showToast('Hồ sơ tổ chức đã được nộp! Vui lòng chờ Ban Quản trị xác minh pháp lý.', 'info');
        syncWithBackend();
        return { success: true, organization: data.organization };
      } else {
        return { success: false, error: data.error };
      }
    } catch (e) {
      const newOrg = {
        id: `org-${Date.now()}`,
        ...formData,
        status: 'pending',
        verifiedAt: null
      };
      setOrganizations((prev) => [newOrg, ...prev]);
      showToast('Hồ sơ tổ chức đã được nộp! Đang chờ xác minh.', 'info');
      return { success: true, organization: newOrg };
    }
  };

  // Notifications
  const markNotificationAsRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'POST' });
    } catch (e) {}
  };

  const markAllNotificationsAsRead = async (targetUserId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.userId === targetUserId ? { ...n, read: true } : n))
    );
    try {
      await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUserId })
      });
    } catch (e) {}
  };

  // Activities
  const createActivity = async (data) => {
    if (!currentUser || userRole !== 'organization') {
      return { success: false, error: 'Chỉ tổ chức mới có quyền tạo hoạt động!' };
    }
    try {
      const res = await fetch(`${API_BASE}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          organizationId: currentUser.id,
          organizationName: currentUser.name
        })
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setActivities((prev) => [resData.activity, ...prev]);
        showToast('Tạo hoạt động thành công! Đang chờ Quản trị viên duyệt để công khai.', 'success');
        syncWithBackend();
        return { success: true, activity: resData.activity };
      } else {
        return { success: false, error: resData.error };
      }
    } catch (e) {
      return { success: false, error: 'Lỗi máy chủ khi tạo hoạt động' };
    }
  };

  const updateActivity = async (id, data) => {
    try {
      await fetch(`${API_BASE}/activities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (e) {}
    setActivities((prev) => prev.map((act) => (act.id === id ? { ...act, ...data } : act)));
    showToast('Đã cập nhật thông tin hoạt động!', 'success');
    return { success: true };
  };

  const cancelActivity = async (id, reason) => {
    try {
      await fetch(`${API_BASE}/activities/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
    } catch (e) {}
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'cancelled', cancelReason: reason } : a))
    );
    syncWithBackend();
    showToast('Đã hủy hoạt động và thông báo tới TNV.', 'warning');
  };

  const toggleActivityRecruiting = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/activities/${id}/toggle-recruiting`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setActivities((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: data.status } : a))
        );
        showToast(`Đã chuyển trạng thái sang: ${data.status === 'recruiting' ? 'Đang tuyển' : 'Đã đóng tuyển'}`, 'info');
      }
    } catch (e) {}
  };

  // Registrations (Quy trình 4 & 5)
  const registerForActivity = async (activityId, message = '') => {
    if (!currentUser || userRole !== 'volunteer') {
      return { success: false, error: 'Vui lòng đăng nhập với vai trò Tình nguyện viên!' };
    }
    if (currentUser.status !== 'approved') {
      return { success: false, error: 'Tài khoản chưa được duyệt, chưa thể đăng ký!' };
    }

    try {
      const res = await fetch(`${API_BASE}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId,
          volunteerId: currentUser.id,
          message
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRegistrations((prev) => [data.registration, ...prev]);
        showToast('Đăng ký tham gia thành công! Đang chờ Ban tổ chức xét duyệt.', 'success');
        syncWithBackend();
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Không thể đăng ký.' };
      }
    } catch (e) {
      return { success: false, error: 'Lỗi máy chủ khi đăng ký.' };
    }
  };

  const cancelRegistration = async (regId) => {
    try {
      await fetch(`${API_BASE}/registrations/${regId}/cancel`, { method: 'POST' });
      setRegistrations((prev) =>
        prev.map((r) => (r.id === regId ? { ...r, status: 'cancelled' } : r))
      );
      syncWithBackend();
      showToast('Đã hủy đăng ký hoạt động.', 'info');
    } catch (e) {}
  };

  const approveRegistration = async (regId) => {
    try {
      const res = await fetch(`${API_BASE}/registrations/${regId}/approve`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === regId ? data.registration : r))
        );
        syncWithBackend();
        showToast('Đã duyệt tình nguyện viên thành công!', 'success');
      }
    } catch (e) {}
  };

  const rejectRegistration = async (regId, reason) => {
    try {
      const res = await fetch(`${API_BASE}/registrations/${regId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === regId ? data.registration : r))
        );
        syncWithBackend();
        showToast('Đã gửi thông báo từ chối tới tình nguyện viên.', 'info');
      }
    } catch (e) {}
  };

  const confirmVolunteerAttendance = async (regId) => {
    try {
      await fetch(`${API_BASE}/registrations/${regId}/confirm-attendance`, { method: 'POST' });
      setRegistrations((prev) =>
        prev.map((r) => (r.id === regId ? { ...r, confirmedByVolunteer: true } : r))
      );
      showToast('Đã xác nhận sẵn sàng tham gia hoạt động!', 'success');
    } catch (e) {}
  };

  // Điểm danh & Ghi nhận giờ công (Quy trình 6)
  const markAttendance = async (regId, status) => {
    try {
      const res = await fetch(`${API_BASE}/registrations/${regId}/mark-attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === regId ? data.registration : r))
        );
        if (data.volunteer) {
          setVolunteers((prev) =>
            prev.map((v) => (v.id === data.volunteer.id ? data.volunteer : v))
          );
        }
        if (status === 'present') {
          try {
            confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
          } catch (e) {}
          showToast(`Đã điểm danh CÓ MẶT (+${data.registration.hoursConfirmed}h công)!`, 'success');
        } else {
          showToast('Đã ghi nhận VẮNG MẶT.', 'info');
        }
        syncWithBackend();
      }
    } catch (e) {}
  };

  const completeActivity = async (activityId) => {
    try {
      await fetch(`${API_BASE}/activities/${activityId}/complete`, { method: 'POST' });
      setActivities((prev) =>
        prev.map((a) => (a.id === activityId ? { ...a, status: 'completed' } : a))
      );
      showToast('Hoạt động đã kết thúc và chuyển sang trạng thái Hoàn thành!', 'success');
      syncWithBackend();
    } catch (e) {}
  };

  // Reviews & Evaluations (Quy trình 7)
  const submitActivityReview = async (activityId, rating, comment) => {
    if (!currentUser || userRole !== 'volunteer') return { success: false, error: 'Cần quyền TNV' };
    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId,
          volunteerId: currentUser.id,
          rating,
          comment
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReviews((prev) => [data.review, ...prev]);
        setRegistrations((prev) =>
          prev.map((r) =>
            r.activityId === activityId && r.volunteerId === currentUser.id
              ? { ...r, ratedByVolunteer: true }
              : r
          )
        );
        try {
          confetti({ particleCount: 50, spread: 50 });
        } catch (e) {}
        showToast('Cảm ơn bạn đã gửi đánh giá quý báu!', 'success');
        syncWithBackend();
        return { success: true };
      }
    } catch (e) {}
    return { success: false, error: 'Lỗi gửi đánh giá.' };
  };

  const submitVolunteerEvaluation = async (activityId, volunteerId, rating, feedback) => {
    try {
      const res = await fetch(`${API_BASE}/evaluations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId,
          volunteerId,
          organizationId: currentUser?.id,
          rating,
          feedback
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVolunteerEvaluations((prev) => [data.evaluation, ...prev]);
        showToast('Đã gửi đánh giá cho tình nguyện viên!', 'success');
        syncWithBackend();
        return { success: true };
      }
    } catch (e) {}
    return { success: false, error: 'Lỗi gửi đánh giá.' };
  };

  const submitFeedback = async (title, content, targetType = 'system') => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE}/feedbacks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteerId: currentUser.id,
          volunteerName: currentUser.fullName || currentUser.name,
          volunteerEmail: currentUser.email,
          targetType,
          title,
          content
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbacks((prev) => [data.feedback, ...prev]);
        showToast('Phản hồi của bạn đã được gửi tới Ban Quản trị!', 'success');
        syncWithBackend();
        return { success: true };
      }
    } catch (e) {}
  };

  // Admin Operations (Quy trình 8)
  const approveUser = async (userId, role) => {
    try {
      const endpoint = role === 'volunteer' ? `/volunteers/${userId}/approve` : `/organizations/${userId}/approve`;
      await fetch(`${API_BASE}${endpoint}`, { method: 'POST' });
      showToast('Đã phê duyệt tài khoản thành công!', 'success');
      syncWithBackend();
    } catch (e) {}
  };

  const rejectUser = async (userId, role, reason) => {
    try {
      const endpoint = role === 'volunteer' ? `/volunteers/${userId}/reject` : `/organizations/${userId}/reject`;
      await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      showToast('Đã từ chối tài khoản.', 'warning');
      syncWithBackend();
    } catch (e) {}
  };

  const toggleUserLock = async (userId, role) => {
    try {
      const endpoint = role === 'volunteer' ? `/volunteers/${userId}/toggle-lock` : `/organizations/${userId}/toggle-lock`;
      const res = await fetch(`${API_BASE}${endpoint}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Đã ${data.status === 'locked' ? 'khóa' : 'mở khóa'} tài khoản.`, 'info');
        syncWithBackend();
      }
    } catch (e) {}
  };

  const deleteUser = async (userId, role) => {
    try {
      const endpoint = role === 'volunteer' ? `/volunteers/${userId}` : `/organizations/${userId}`;
      await fetch(`${API_BASE}${endpoint}`, { method: 'DELETE' });
      showToast('Đã xóa tài khoản khỏi hệ thống.', 'info');
      syncWithBackend();
    } catch (e) {}
  };

  const approveActivity = async (activityId) => {
    try {
      await fetch(`${API_BASE}/activities/${activityId}/approve`, { method: 'POST' });
      showToast('Đã phê duyệt hoạt động công khai!', 'success');
      syncWithBackend();
    } catch (e) {}
  };

  const rejectActivity = async (activityId, reason) => {
    try {
      await fetch(`${API_BASE}/activities/${activityId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      showToast('Đã từ chối kiểm duyệt hoạt động.', 'warning');
      syncWithBackend();
    } catch (e) {}
  };

  const requestActivityEdit = async (activityId, reason) => {
    try {
      await fetch(`${API_BASE}/activities/${activityId}/request-edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      showToast('Đã gửi yêu cầu chỉnh sửa tới Tổ chức!', 'info');
      syncWithBackend();
    } catch (e) {}
  };

  const deleteActivityByAdmin = async (activityId) => {
    try {
      await fetch(`${API_BASE}/activities/${activityId}`, { method: 'DELETE' });
      showToast('Đã gỡ bỏ hoạt động khỏi hệ thống.', 'info');
      syncWithBackend();
    } catch (e) {}
  };

  // Categories & Locations
  const addCategory = async (name, icon, description) => {
    try {
      await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, icon, description })
      });
      showToast(`Đã thêm danh mục: "${name}"`, 'success');
      syncWithBackend();
    } catch (e) {}
  };

  const deleteCategory = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Không thể xóa danh mục!');
        return;
      }
      showToast('Đã xóa danh mục thành công.', 'info');
      syncWithBackend();
    } catch (e) {}
  };

  const addLocation = async (name, code) => {
    try {
      await fetch(`${API_BASE}/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code })
      });
      showToast(`Đã thêm địa điểm "${name}"`, 'success');
      syncWithBackend();
    } catch (e) {}
  };

  const deleteLocation = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/locations/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Không thể xóa địa điểm!');
        return;
      }
      showToast('Đã xóa địa điểm thành công.', 'info');
      syncWithBackend();
    } catch (e) {}
  };

  // System Broadcast & Notices
  const sendSystemBroadcast = async (targetGroup, title, message) => {
    try {
      const res = await fetch(`${API_BASE}/notifications/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetGroup, title, message })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Đã phát thông báo hệ thống tới ${data.count} người dùng!`, 'success');
        syncWithBackend();
      }
    } catch (e) {}
  };

  const sendActivityNotificationToVolunteers = async (activityId, title, message) => {
    try {
      const res = await fetch(`${API_BASE}/notifications/send-activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityId, title, message })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Đã gửi thông báo đến ${data.count} tình nguyện viên!`, 'success');
        syncWithBackend();
      }
    } catch (e) {}
  };

  const updateSystemSettings = async (newSettings) => {
    try {
      await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      showToast('Đã lưu cấu hình tham số hệ thống!', 'success');
      syncWithBackend();
    } catch (e) {}
  };

  const updateVolunteerProfile = async (id, data) => {
    try {
      await fetch(`${API_BASE}/volunteers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      showToast('Đã cập nhật hồ sơ cá nhân thành công!', 'success');
      syncWithBackend();
    } catch (e) {}
  };

  const updateOrgProfile = async (id, data) => {
    try {
      await fetch(`${API_BASE}/organizations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      showToast('Đã cập nhật thông tin tổ chức thành công!', 'success');
      syncWithBackend();
    } catch (e) {}
  };

  const resetToInitialData = async () => {
    if (window.confirm('Bạn có chắc chắn muốn đặt lại toàn bộ dữ liệu mẫu ban đầu của hệ thống trên máy chủ?')) {
      try {
        await fetch(`${API_BASE}/system/reset`, { method: 'POST' });
      } catch (e) {}
      localStorage.clear();
      await syncWithBackend();
      setUserRole('volunteer');
      setCurrentUser(initialVolunteers[0]);
      showToast('Đã khôi phục toàn bộ dữ liệu mẫu ban đầu trên Backend và Frontend!', 'info');
    }
  };

  return (
    <AppContext.Provider
      value={{
        categories,
        locations,
        organizations,
        volunteers,
        activities,
        registrations,
        reviews,
        volunteerEvaluations,
        notifications,
        feedbacks,
        settings,
        userRole,
        currentUser,
        toasts,
        backendOnline,

        setUserRole,
        setCurrentUser,
        quickSwitchUser,
        login,
        logout,
        registerVolunteer,
        registerOrganization,
        showToast,
        removeToast,
        markNotificationAsRead,
        markAllNotificationsAsRead,

        createActivity,
        updateActivity,
        cancelActivity,
        toggleActivityRecruiting,

        registerForActivity,
        cancelRegistration,
        approveRegistration,
        rejectRegistration,
        confirmVolunteerAttendance,

        markAttendance,
        completeActivity,

        submitActivityReview,
        submitVolunteerEvaluation,
        submitFeedback,

        approveUser,
        rejectUser,
        toggleUserLock,
        deleteUser,
        approveActivity,
        rejectActivity,
        requestActivityEdit,
        deleteActivityByAdmin,
        addCategory,
        deleteCategory,
        addLocation,
        deleteLocation,
        sendSystemBroadcast,
        sendActivityNotificationToVolunteers,
        updateSystemSettings,

        updateVolunteerProfile,
        updateOrgProfile,
        resetToInitialData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
