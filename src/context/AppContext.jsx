import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { AppContext } from './useApp';

const STORAGE_KEYS = {
  CURRENT_USER: 'vconnect_current_user',
  CURRENT_ROLE: 'vconnect_current_role',
  AUTH_TOKEN: 'vconnect_auth_token',
  SESSION_VERSION: 'vconnect_v3_token_session'
};

const getStored = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const setStored = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // Ignore storage quota errors
  }
};

const loadInitialSession = () => {
  try {
    const versionOk = localStorage.getItem(STORAGE_KEYS.SESSION_VERSION);
    if (!versionOk) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_ROLE);
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.setItem(STORAGE_KEYS.SESSION_VERSION, 'true');
      return { role: 'guest', user: null, token: '' };
    }
    const savedUser = getStored(STORAGE_KEYS.CURRENT_USER, null);
    const savedRole = getStored(STORAGE_KEYS.CURRENT_ROLE, 'guest');
    const savedToken = getStored(STORAGE_KEYS.AUTH_TOKEN, '');
    if (!savedUser || !savedToken || savedRole === 'guest') {
      return { role: 'guest', user: null, token: '' };
    }
    return { role: savedRole, user: savedUser, token: savedToken };
  } catch {
    return { role: 'guest', user: null, token: '' };
  }
};

const stripPassword = (entity) => {
  if (!entity || typeof entity !== 'object') return entity;
  const { password: _password, ...safe } = entity;
  return safe;
};

// API base path (proxied by Vite to http://localhost:5000 in dev)
const API_BASE = '/api';

export const AppProvider = ({ children }) => {
  const [categories, setCategories] = useState(initialCategories);
  const [locations, setLocations] = useState(initialLocations);
  const [organizations, setOrganizations] = useState(() => initialOrganizations.map(stripPassword));
  const [volunteers, setVolunteers] = useState(() => initialVolunteers.map(stripPassword));
  const [activities, setActivities] = useState(initialActivities);
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [reviews, setReviews] = useState(initialReviews);
  const [volunteerEvaluations, setVolunteerEvaluations] = useState(initialVolunteerEvaluations);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [feedbacks, setFeedbacks] = useState(initialFeedbacks);
  const [settings, setSettings] = useState(initialSystemSettings);

  const [backendOnline, setBackendOnline] = useState(false);

  const [initialSession] = useState(loadInitialSession);
  const [userRole, setUserRole] = useState(initialSession.role);
  const [sessionUser, setSessionUser] = useState(initialSession.user);
  const [authToken, setAuthToken] = useState(initialSession.token);

  // Derive synced currentUser without cascading setState-in-effect
  const currentUser = useMemo(() => {
    if (!sessionUser) return null;
    if (userRole === 'volunteer') {
      return volunteers.find((v) => v.id === sessionUser.id) || sessionUser;
    }
    if (userRole === 'organization') {
      return organizations.find((o) => o.id === sessionUser.id) || sessionUser;
    }
    return sessionUser;
  }, [sessionUser, userRole, volunteers, organizations]);

  const setCurrentUser = useCallback((user) => {
    setSessionUser(user);
  }, []);

  const setSession = useCallback((role, user, token = '') => {
    setUserRole(role);
    setSessionUser(user);
    setAuthToken(token);
  }, []);

  // UI helpers: Toasts
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync session to localStorage
  useEffect(() => {
    setStored(STORAGE_KEYS.CURRENT_ROLE, userRole);
  }, [userRole]);
  useEffect(() => {
    setStored(STORAGE_KEYS.CURRENT_USER, currentUser);
  }, [currentUser]);
  useEffect(() => {
    setStored(STORAGE_KEYS.AUTH_TOKEN, authToken);
  }, [authToken]);

  const applyBootstrapData = useCallback((d) => {
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
  }, []);

  const syncWithBackend = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/bootstrap`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          applyBootstrapData(json.data);
          setBackendOnline(true);
        }
      }
    } catch {
      setBackendOnline(false);
    }
  }, [applyBootstrapData]);

  // Initial load from backend
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/bootstrap`);
        if (res.ok && active) {
          const json = await res.json();
          if (json.success && json.data && active) {
            applyBootstrapData(json.data);
            setBackendOnline(true);
          }
        }
      } catch {
        if (active) setBackendOnline(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [applyBootstrapData]);

  // Authenticated fetch helper
  const apiFetch = useCallback(
    (path, options = {}) => {
      const headers = { ...(options.headers || {}) };
      if (options.body && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }
      return fetch(`${API_BASE}${path}`, { ...options, headers });
    },
    [authToken]
  );

  const logout = useCallback(() => {
    setUserRole('guest');
    setSessionUser(null);
    setAuthToken('');
    showToast('Đã đăng xuất khỏi hệ thống', 'info');
  }, [showToast]);

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
        setSession(data.role, data.user, data.token || '');
        showToast(`Đăng nhập thành công! Chào mừng ${data.user.fullName || data.user.name}`, 'success');
        syncWithBackend();
        return { success: true };
      }
      const errorCode = data.error || 'invalid_credentials';
      return { success: false, errorCode, error: errorCode };
    } catch {
      return { success: false, errorCode: 'server_unreachable', error: 'Không thể kết nối tới máy chủ.' };
    }
  };

  // Change password for volunteer / organization
  const changePassword = async (oldPassword, newPassword) => {
    try {
      const res = await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Đổi mật khẩu thành công!', 'success');
        return { success: true };
      }
      const errMsg = data.error || 'Không thể đổi mật khẩu.';
      showToast(errMsg, 'error');
      return { success: false, error: errMsg };
    } catch {
      return { success: false, error: 'Lỗi kết nối tới máy chủ.' };
    }
  };

  // Notifications
  const markNotificationAsRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'POST' });
    } catch {
      // Ignore network failure on read marker
    }
  };

  const markAllNotificationsAsRead = async (targetUserId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.userId === targetUserId ? { ...n, read: true } : n))
    );
    try {
      await apiFetch('/notifications/read-all', {
        method: 'POST',
        body: JSON.stringify({ userId: targetUserId })
      });
    } catch {
      // Ignore network failure on read marker
    }
  };

  // Activities
  const createActivity = async (data) => {
    if (!currentUser || userRole !== 'organization') {
      return { success: false, error: 'Chỉ tổ chức mới có quyền tạo hoạt động!' };
    }
    try {
      const res = await apiFetch('/activities', {
        method: 'POST',
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
      }
      return { success: false, error: resData.error || 'Không thể tạo hoạt động.' };
    } catch {
      return { success: false, error: 'Lỗi máy chủ khi tạo hoạt động.' };
    }
  };

  const updateActivity = async (id, data) => {
    try {
      const res = await apiFetch(`/activities/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setActivities((prev) => prev.map((act) => (act.id === id ? resData.activity : act)));
        showToast(
          resData.resubmitted
            ? 'Đã cập nhật hoạt động và gửi lại Quản trị viên kiểm duyệt!'
            : 'Đã cập nhật thông tin hoạt động!',
          'success'
        );
        syncWithBackend();
        return { success: true, activity: resData.activity };
      }
      showToast(resData.error || 'Không thể cập nhật hoạt động.', 'error');
      return { success: false, error: resData.error };
    } catch {
      showToast('Lỗi máy chủ khi cập nhật hoạt động.', 'error');
      return { success: false, error: 'Lỗi kết nối.' };
    }
  };

  const cancelActivity = async (id, reason) => {
    try {
      const res = await apiFetch(`/activities/${id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActivities((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: 'cancelled', cancelReason: reason } : a))
        );
        syncWithBackend();
        showToast('Đã hủy hoạt động và thông báo tới TNV.', 'warning');
      } else {
        showToast(data.error || 'Không thể hủy hoạt động.', 'error');
      }
    } catch {
      showToast('Lỗi máy chủ khi hủy hoạt động.', 'error');
    }
  };

  const toggleActivityRecruiting = async (id) => {
    try {
      const res = await apiFetch(`/activities/${id}/toggle-recruiting`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setActivities((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: data.status } : a))
        );
        showToast(`Đã chuyển trạng thái sang: ${data.status === 'recruiting' ? 'Đang tuyển' : 'Đã đóng tuyển'}`, 'info');
      } else {
        showToast(data.error || 'Không thể đổi trạng thái tuyển.', 'error');
      }
    } catch {
      showToast('Lỗi máy chủ khi cập nhật trạng thái tuyển.', 'error');
    }
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
      const res = await apiFetch('/registrations', {
        method: 'POST',
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
      }
      const errMsg = data.error || 'Không thể đăng ký.';
      showToast(errMsg, 'error');
      return { success: false, error: errMsg };
    } catch {
      return { success: false, error: 'Lỗi máy chủ khi đăng ký.' };
    }
  };

  const cancelRegistration = async (regId) => {
    try {
      const res = await apiFetch(`/registrations/${regId}/cancel`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === regId ? { ...r, status: 'cancelled' } : r))
        );
        syncWithBackend();
        showToast('Đã hủy đăng ký hoạt động.', 'info');
      } else {
        showToast(data.error || 'Không thể hủy đăng ký.', 'error');
      }
    } catch {
      showToast('Lỗi máy chủ khi hủy đăng ký.', 'error');
    }
  };

  const approveRegistration = async (regId) => {
    try {
      const res = await apiFetch(`/registrations/${regId}/approve`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === regId ? data.registration : r))
        );
        syncWithBackend();
        showToast('Đã duyệt tình nguyện viên thành công!', 'success');
      } else {
        showToast(data.error || 'Không thể duyệt đăng ký.', 'error');
      }
    } catch {
      showToast('Lỗi máy chủ khi duyệt đăng ký.', 'error');
    }
  };

  const rejectRegistration = async (regId, reason) => {
    try {
      const res = await apiFetch(`/registrations/${regId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === regId ? data.registration : r))
        );
        syncWithBackend();
        showToast('Đã gửi thông báo từ chối tới tình nguyện viên.', 'info');
      } else {
        showToast(data.error || 'Không thể từ chối đăng ký.', 'error');
      }
    } catch {
      showToast('Lỗi máy chủ khi từ chối đăng ký.', 'error');
    }
  };

  const confirmVolunteerAttendance = async (regId) => {
    try {
      const res = await apiFetch(`/registrations/${regId}/confirm-attendance`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === regId ? { ...r, confirmedByVolunteer: true } : r))
        );
        showToast('Đã xác nhận sẵn sàng tham gia hoạt động!', 'success');
      } else {
        showToast(data.error || 'Không thể xác nhận tham gia.', 'error');
      }
    } catch {
      showToast('Lỗi máy chủ khi xác nhận tham gia.', 'error');
    }
  };

  // Điểm danh & Ghi nhận giờ công (Quy trình 6)
  const markAttendance = async (regId, status) => {
    try {
      const res = await apiFetch(`/registrations/${regId}/mark-attendance`, {
        method: 'POST',
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
          } catch {
            // Ignore confetti errors
          }
          showToast(`Đã điểm danh CÓ MẶT (+${data.registration.hoursConfirmed}h công)!`, 'success');
        } else {
          showToast('Đã ghi nhận VẮNG MẶT.', 'info');
        }
        syncWithBackend();
      } else {
        showToast(data.error || 'Không thể điểm danh.', 'error');
      }
    } catch {
      showToast('Lỗi máy chủ khi điểm danh.', 'error');
    }
  };

  const completeActivity = async (activityId) => {
    try {
      const res = await apiFetch(`/activities/${activityId}/complete`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setActivities((prev) =>
          prev.map((a) => (a.id === activityId ? { ...a, status: 'completed' } : a))
        );
        showToast('Hoạt động đã kết thúc và chuyển sang trạng thái Hoàn thành!', 'success');
        syncWithBackend();
      } else {
        showToast(data.error || 'Không thể kết thúc hoạt động.', 'error');
      }
    } catch {
      showToast('Lỗi máy chủ khi kết thúc hoạt động.', 'error');
    }
  };

  // Reviews & Evaluations (Quy trình 7)
  const submitActivityReview = async (activityId, rating, comment) => {
    if (!currentUser || userRole !== 'volunteer') return { success: false, error: 'Cần quyền TNV' };
    try {
      const res = await apiFetch('/reviews', {
        method: 'POST',
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
        } catch {
          // Ignore confetti errors
        }
        showToast('Cảm ơn bạn đã gửi đánh giá quý báu!', 'success');
        syncWithBackend();
        return { success: true };
      }
      const errMsg = data.error || 'Không thể gửi đánh giá.';
      showToast(errMsg, 'error');
      return { success: false, error: errMsg };
    } catch {
      return { success: false, error: 'Lỗi gửi đánh giá.' };
    }
  };

  const submitVolunteerEvaluation = async (activityId, volunteerId, rating, feedback) => {
    try {
      const res = await apiFetch('/evaluations', {
        method: 'POST',
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
      const errMsg = data.error || 'Không thể gửi đánh giá.';
      showToast(errMsg, 'error');
      return { success: false, error: errMsg };
    } catch {
      return { success: false, error: 'Lỗi gửi đánh giá.' };
    }
  };

  const submitFeedback = async (title, content, targetType = 'system') => {
    if (!currentUser) return { success: false };
    try {
      const res = await apiFetch('/feedbacks', {
        method: 'POST',
        body: JSON.stringify({
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
      showToast(data.error || 'Không thể gửi phản hồi.', 'error');
      return { success: false };
    } catch {
      showToast('Lỗi máy chủ khi gửi phản hồi.', 'error');
      return { success: false };
    }
  };

  // Admin Operations (Quy trình 8)
  const approveUser = async (userId, role) => {
    try {
      const endpoint = role === 'volunteer' ? `/volunteers/${userId}/approve` : `/organizations/${userId}/approve`;
      const res = await apiFetch(endpoint, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Đã phê duyệt tài khoản thành công!', 'success');
        syncWithBackend();
      } else {
        showToast(data.error || 'Không thể phê duyệt tài khoản.', 'error');
      }
    } catch {
      showToast('Lỗi máy chủ khi phê duyệt tài khoản.', 'error');
    }
  };

  const rejectUser = async (userId, role, reason) => {
    try {
      const endpoint = role === 'volunteer' ? `/volunteers/${userId}/reject` : `/organizations/${userId}/reject`;
      const res = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Đã từ chối tài khoản.', 'warning');
        syncWithBackend();
      } else {
        showToast(data.error || 'Không thể từ chối tài khoản.', 'error');
      }
    } catch {
      showToast('Lỗi máy chủ khi từ chối tài khoản.', 'error');
    }
  };

  const toggleUserLock = async (userId, role) => {
    try {
      const endpoint = role === 'volunteer' ? `/volunteers/${userId}/toggle-lock` : `/organizations/${userId}/toggle-lock`;
      const res = await apiFetch(endpoint, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Đã ${data.status === 'locked' ? 'khóa' : 'mở khóa'} tài khoản.`, 'info');
        syncWithBackend();
      } else {
        showToast(data.error || 'Không thể đổi trạng thái khóa.', 'error');
      }
    } catch {
      showToast('Lỗi máy chủ khi đổi trạng thái khóa.', 'error');
    }
  };

  const deleteUser = async (userId, role) => {
    try {
      const endpoint = role === 'volunteer' ? `/volunteers/${userId}` : `/organizations/${userId}`;
      const res = await apiFetch(endpoint, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Đã xóa tài khoản khỏi hệ thống.', 'info');
        syncWithBackend();
      } else {
        showToast(data.error || 'Không thể xóa tài khoản.', 'error');
      }
    } catch {
      showToast('Lỗi máy chủ khi xóa tài khoản.', 'error');
    }
  };

  const approveActivity = async (activityId) => {
    try {
      const res = await apiFetch(`/activities/${activityId}/approve`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Đã phê duyệt hoạt động công khai!', 'success');
        syncWithBackend();
      } else {
        showToast(data.error || 'Không thể phê duyệt hoạt động.', 'error');
      }
    } catch {
      showToast('Lỗi máy chủ khi phê duyệt hoạt động.', 'error');
    }
  };

  const rejectActivity = async (activityId, reason) => {
    try {
      const res = await apiFetch(`/activities/${activityId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Đã từ chối kiểm duyệt hoạt động.', 'warning');
        syncWithBackend();
      } else {
        showToast(data.error || 'Không thể từ chối hoạt động.', 'error');
      }
    } catch {
      showToast('Lỗi máy chủ khi từ chối hoạt động.', 'error');
    }
  };

  const requestActivityEdit = async (activityId, reason) => {
    try {
      const res = await apiFetch(`/activities/${activityId}/request-edit`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Đã gửi yêu cầu chỉnh sửa tới Tổ chức!', 'info');
        syncWithBackend();
      } else {
        showToast(data.error || 'Không thể gửi yêu cầu chỉnh sửa.', 'error');
      }
    } catch {
      showToast('Lỗi máy chủ khi gửi yêu cầu chỉnh sửa.', 'error');
    }
  };

  const deleteActivityByAdmin = async (activityId) => {
    try {
      const res = await apiFetch(`/activities/${activityId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Đã gỡ bỏ hoạt động khỏi hệ thống.', 'info');
        syncWithBackend();
      } else {
        showToast(data.error || 'Không thể gỡ bỏ hoạt động.', 'error');
      }
    } catch {
      showToast('Lỗi máy chủ khi gỡ bỏ hoạt động.', 'error');
    }
  };

  // Categories & Locations
  const addCategory = async (name, icon, description) => {
    try {
      const res = await apiFetch('/categories', {
        method: 'POST',
        body: JSON.stringify({ name, icon, description })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Đã thêm danh mục: "${name}"`, 'success');
        syncWithBackend();
      } else {
        showToast(data.error || 'Không thể thêm danh mục.', 'error');
      }
    } catch {
      showToast('Lỗi máy chủ khi thêm danh mục.', 'error');
    }
  };

  const deleteCategory = async (id) => {
    try {
      const res = await apiFetch(`/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.error || 'Không thể xóa danh mục!', 'error');
        return;
      }
      showToast('Đã xóa danh mục thành công.', 'info');
      syncWithBackend();
    } catch {
      showToast('Lỗi máy chủ khi xóa danh mục.', 'error');
    }
  };

  const addLocation = async (name, code) => {
    try {
      const res = await apiFetch('/locations', {
        method: 'POST',
        body: JSON.stringify({ name, code })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Đã thêm địa điểm "${name}"`, 'success');
        syncWithBackend();
      } else {
        showToast(data.error || 'Không thể thêm địa điểm.', 'error');
      }
    } catch {
      showToast('Lỗi máy chủ khi thêm địa điểm.', 'error');
    }
  };

  const deleteLocation = async (id) => {
    try {
      const res = await apiFetch(`/locations/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.error || 'Không thể xóa địa điểm!', 'error');
        return;
      }
      showToast('Đã xóa địa điểm thành công.', 'info');
      syncWithBackend();
    } catch {
      showToast('Lỗi máy chủ khi xóa địa điểm.', 'error');
    }
  };

  // System Broadcast & Notices
  const sendSystemBroadcast = async (targetGroup, title, message) => {
    try {
      const res = await apiFetch('/notifications/broadcast', {
        method: 'POST',
        body: JSON.stringify({ targetGroup, title, message })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Đã phát thông báo hệ thống tới ${data.count} người dùng!`, 'success');
        syncWithBackend();
      } else {
        showToast(data.error || 'Không thể phát thông báo hệ thống.', 'error');
      }
    } catch {
      showToast('Lỗi máy chủ khi phát thông báo.', 'error');
    }
  };

  const sendActivityNotificationToVolunteers = async (activityId, title, message) => {
    try {
      const res = await apiFetch('/notifications/send-activity', {
        method: 'POST',
        body: JSON.stringify({ activityId, title, message })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Đã gửi thông báo đến ${data.count} tình nguyện viên!`, 'success');
        syncWithBackend();
      } else {
        showToast(data.error || 'Không thể gửi thông báo.', 'error');
      }
    } catch {
      showToast('Lỗi máy chủ khi gửi thông báo.', 'error');
    }
  };

  const updateSystemSettings = async (newSettings) => {
    try {
      const res = await apiFetch('/settings', {
        method: 'PUT',
        body: JSON.stringify(newSettings)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Đã lưu cấu hình tham số hệ thống!', 'success');
        syncWithBackend();
      } else {
        showToast(data.error || 'Không thể lưu cấu hình.', 'error');
      }
    } catch {
      showToast('Lỗi máy chủ khi lưu cấu hình.', 'error');
    }
  };

  const updateVolunteerProfile = async (id, data) => {
    try {
      const res = await apiFetch(`/volunteers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast('Đã cập nhật hồ sơ cá nhân thành công!', 'success');
        syncWithBackend();
      } else {
        showToast(resData.error || 'Không thể cập nhật hồ sơ.', 'error');
      }
    } catch {
      showToast('Lỗi máy chủ khi cập nhật hồ sơ.', 'error');
    }
  };

  const updateOrgProfile = async (id, data) => {
    try {
      const res = await apiFetch(`/organizations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast('Đã cập nhật thông tin tổ chức thành công!', 'success');
        syncWithBackend();
      } else {
        showToast(resData.error || 'Không thể cập nhật thông tin tổ chức.', 'error');
      }
    } catch {
      showToast('Lỗi máy chủ khi cập nhật thông tin tổ chức.', 'error');
    }
  };

  const resolveFeedback = async (id, adminNote = '') => {
    try {
      const res = await apiFetch(`/feedbacks/${id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ adminNote })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbacks((prev) => prev.map((f) => (f.id === id ? data.feedback : f)));
        showToast('Đã đánh dấu xử lý phản hồi và gửi thông báo tới người dùng!', 'success');
        syncWithBackend();
        return { success: true };
      }
      showToast(data.error || 'Không thể xử lý phản hồi.', 'error');
      return { success: false, error: data.error };
    } catch {
      showToast('Lỗi máy chủ khi xử lý phản hồi.', 'error');
      return { success: false };
    }
  };

  const resetToInitialData = async () => {
    try {
      const res = await apiFetch('/system/reset', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.error || 'Chỉ Quản trị viên mới có thể đặt lại dữ liệu hệ thống.', 'error');
        return { success: false };
      }
      await syncWithBackend();
      if (userRole !== 'admin') {
        setSession('guest', null, '');
      }
      showToast('Đã khôi phục toàn bộ dữ liệu mẫu ban đầu trên Backend và Frontend!', 'info');
      return { success: true };
    } catch {
      showToast('Lỗi máy chủ khi khôi phục dữ liệu.', 'error');
      return { success: false };
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
        setSession,
        setVolunteers,
        setOrganizations,
        syncWithBackend,
        login,
        logout,
        changePassword,
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
        resolveFeedback,

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
