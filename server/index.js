import express from 'express';
import cors from 'cors';
import { getDB, saveDB, resetDB } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Helper to push notification
const createNotification = (db, { userId, title, message, type = 'info' }) => {
  const newNotif = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString()
  };
  db.notifications.unshift(newNotif);
  return newNotif;
};

// ==========================================
// 1. BOOTSTRAP & HEALTH
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

app.get('/api/bootstrap', (req, res) => {
  const db = getDB();
  res.json({ success: true, data: db });
});

app.post('/api/system/reset', (req, res) => {
  const db = resetDB();
  res.json({ success: true, message: 'Đã khôi phục dữ liệu ban đầu', data: db });
});

// ==========================================
// 2. AUTHENTICATION (Quy trình 1 & 2)
// ==========================================

// In-memory login attempt tracker { email -> { count, lockedUntil } }
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

const getAttemptKey = (email) => (email || '').toLowerCase().trim();

const checkRateLimit = (email) => {
  const key = getAttemptKey(email);
  const entry = loginAttempts.get(key);
  if (!entry) return { limited: false };
  if (entry.lockedUntil && Date.now() < entry.lockedUntil) {
    return { limited: true };
  }
  // Lock expired, clean up
  if (entry.lockedUntil && Date.now() >= entry.lockedUntil) {
    loginAttempts.delete(key);
  }
  return { limited: false };
};

const recordFailedAttempt = (email) => {
  const key = getAttemptKey(email);
  const entry = loginAttempts.get(key) || { count: 0, lockedUntil: null };
  entry.count += 1;
  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCK_DURATION_MS;

    // Gửi cảnh báo bảo mật tới Quản trị viên khi tài khoản bị khóa do nhập sai 5 lần
    if (entry.count === MAX_ATTEMPTS) {
      try {
        const db = getDB();
        createNotification(db, {
          userId: 'admin',
          title: '🚨 Cảnh báo bảo mật: Nhập sai mật khẩu 5 lần',
          message: `Hệ thống ghi nhận tài khoản "${email}" đã đăng nhập sai 5 lần liên tiếp. Yêu cầu đăng nhập tạm thời bị hạn chế trong 15 phút để bảo vệ tài khoản khỏi dò quét.`,
          type: 'danger'
        });
        saveDB(db);
      } catch (err) {
        console.error('Lỗi khi tạo thông báo cảnh báo cho admin:', err);
      }
    }
  }
  loginAttempts.set(key, entry);
  return entry;
};

const clearAttempts = (email) => {
  loginAttempts.delete(getAttemptKey(email));
};

// Admin backup recovery code (demo)
const ADMIN_RECOVERY_CODE = 'VCADM-2026-RECOVERY';

app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  const db = getDB();

  // Check rate limit first
  const rl = checkRateLimit(email);
  if (rl.limited) {
    return res.status(429).json({ success: false, rateLimited: true, error: 'rate_limited' });
  }

  // Admin login (dedicated route: /api/auth/admin-login)
  // This endpoint still handles admin if called from admin page
  if (role === 'admin') {
    const isValidAdmin =
      (email === 'admin@vconnect.vn' && password === 'admin123') ||
      password === ADMIN_RECOVERY_CODE;
    if (isValidAdmin) {
      clearAttempts(email);
      return res.json({
        success: true,
        user: {
          id: 'admin',
          fullName: 'Quản Trị Viên Hệ Thống',
          email: 'admin@vconnect.vn',
          role: 'admin'
        },
        role: 'admin'
      });
    }
    recordFailedAttempt(email);
    return res.status(401).json({ success: false, error: 'invalid_credentials' });
  }

  if (role === 'volunteer') {
    const vol = db.volunteers.find((v) => v.email.toLowerCase() === email?.toLowerCase());
    if (!vol || vol.password !== password) {
      recordFailedAttempt(email);
      return res.status(401).json({ success: false, error: 'invalid_credentials' });
    }
    if (vol.status === 'locked') {
      return res.status(403).json({ success: false, error: 'account_locked' });
    }
    if (vol.status === 'pending') {
      return res.status(403).json({ success: false, error: 'account_pending' });
    }
    clearAttempts(email);
    return res.json({ success: true, user: vol, role: 'volunteer' });
  }

  if (role === 'organization') {
    const org = db.organizations.find((o) => o.email.toLowerCase() === email?.toLowerCase());
    if (!org || org.password !== password) {
      recordFailedAttempt(email);
      return res.status(401).json({ success: false, error: 'invalid_credentials' });
    }
    if (org.status === 'locked') {
      return res.status(403).json({ success: false, error: 'account_locked' });
    }
    if (org.status === 'pending') {
      return res.status(403).json({ success: false, error: 'account_pending' });
    }
    clearAttempts(email);
    return res.json({ success: true, user: org, role: 'organization' });
  }

  return res.status(400).json({ success: false, error: 'invalid_credentials' });
});

// Dedicated admin login endpoint (for /admin/login page)
app.post('/api/auth/admin-login', (req, res) => {
  const { email, password } = req.body;

  const rl = checkRateLimit(email);
  if (rl.limited) {
    return res.status(429).json({ success: false, rateLimited: true, error: 'rate_limited' });
  }

  const isRecoveryCode = password === ADMIN_RECOVERY_CODE;
  const isNormalAdmin = email === 'admin@vconnect.vn' && password === 'admin123';

  if (isNormalAdmin || isRecoveryCode) {
    clearAttempts(email);
    return res.json({
      success: true,
      user: {
        id: 'admin',
        fullName: 'Quản Trị Viên Hệ Thống',
        email: 'admin@vconnect.vn',
        role: 'admin'
      },
      role: 'admin'
    });
  }

  recordFailedAttempt(email);
  return res.status(401).json({ success: false, error: 'invalid_credentials' });
});

// Password recovery - request OTP (demo: always returns success, OTP is 123456)
app.post('/api/auth/forgot-password', (req, res) => {
  const { email, role } = req.body;
  const db = getDB();

  // Check if email exists
  let found = false;
  if (role === 'admin' && email === 'admin@vconnect.vn') {
    found = true;
  } else if (role === 'volunteer') {
    found = db.volunteers.some((v) => v.email.toLowerCase() === email?.toLowerCase());
  } else if (role === 'organization') {
    found = db.organizations.some((o) => o.email.toLowerCase() === email?.toLowerCase());
  } else {
    found =
      db.volunteers.some((v) => v.email.toLowerCase() === email?.toLowerCase()) ||
      db.organizations.some((o) => o.email.toLowerCase() === email?.toLowerCase());
  }

  if (!found) {
    return res.status(404).json({ success: false, error: 'email_not_found' });
  }

  // Demo: OTP is always 123456 (in real system, send via email)
  return res.json({ success: true, message: 'otp_sent' });
});

// Verify OTP for password recovery (demo OTP: 123456)
app.post('/api/auth/verify-otp', (req, res) => {
  const { email, otp, role } = req.body;
  const db = getDB();

  const DEMO_OTP = '123456';
  if (otp !== DEMO_OTP) {
    return res.status(400).json({ success: false, error: 'invalid_otp' });
  }

  // Find user and auto-login
  if (role === 'admin' && email === 'admin@vconnect.vn') {
    return res.json({
      success: true,
      user: { id: 'admin', fullName: 'Quản Trị Viên Hệ Thống', email: 'admin@vconnect.vn', role: 'admin' },
      role: 'admin'
    });
  }

  const vol = db.volunteers.find((v) => v.email.toLowerCase() === email?.toLowerCase());
  if (vol && (role === 'volunteer' || !role)) {
    clearAttempts(email);
    return res.json({ success: true, user: vol, role: 'volunteer' });
  }

  const org = db.organizations.find((o) => o.email.toLowerCase() === email?.toLowerCase());
  if (org && (role === 'organization' || !role)) {
    clearAttempts(email);
    return res.json({ success: true, user: org, role: 'organization' });
  }

  return res.status(404).json({ success: false, error: 'email_not_found' });
});

// Verify OTP for registration (demo OTP: 111111 for volunteer, 111111 for org)
app.post('/api/auth/verify-register-otp', (req, res) => {
  const { otp, pendingData, role } = req.body;
  const REGISTER_OTP = '111111';

  if (otp !== REGISTER_OTP) {
    return res.status(400).json({ success: false, error: 'invalid_otp' });
  }

  const db = getDB();

  if (role === 'volunteer') {
    const formData = pendingData;
    const exists = db.volunteers.some((v) => v.email.toLowerCase() === formData.email?.toLowerCase());
    if (exists) {
      return res.status(400).json({ success: false, error: 'email_exists' });
    }
    const newVol = {
      id: `vol-${Date.now()}`,
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password || '123456',
      phone: formData.phone,
      dob: formData.dob || '2004-01-01',
      address: formData.address || '',
      skills: formData.skills || ['Nhiệt tình', 'Làm việc nhóm'],
      interests: formData.interests || ['Bảo vệ Môi trường'],
      avatar: formData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      status: 'approved', // Volunteer gets auto-approved after OTP verification
      totalHours: 0,
      completedActivitiesCount: 0,
      ratingAvg: 0,
      bio: formData.bio || 'Tình nguyện viên mới tham gia cộng đồng.',
      registeredAt: new Date().toISOString().split('T')[0]
    };
    db.volunteers.unshift(newVol);
    createNotification(db, {
      userId: 'admin',
      title: 'Tài khoản TNV mới đã xác minh OTP',
      message: `Tình nguyện viên ${newVol.fullName} (${newVol.email}) đã xác minh email và tài khoản đã kích hoạt.`,
      type: 'success'
    });
    saveDB(db);
    return res.status(201).json({ success: true, volunteer: newVol, role: 'volunteer' });
  }

  if (role === 'organization') {
    const formData = pendingData;
    const exists = db.organizations.some((o) => o.email.toLowerCase() === formData.email?.toLowerCase());
    if (exists) {
      return res.status(400).json({ success: false, error: 'email_exists' });
    }
    const newOrg = {
      id: `org-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      password: formData.password || '123456',
      phone: formData.phone,
      address: formData.address,
      representative: formData.representative,
      type: formData.type || 'Tổ chức phi lợi nhuận (NGO)',
      licenseNumber: formData.licenseNumber || 'GP-ĐK/2026',
      description: formData.description || '',
      website: formData.website || '',
      logo: formData.logo || 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=150&auto=format&fit=crop&q=80',
      status: 'pending', // Organization still needs admin approval even after OTP
      verifiedAt: null
    };
    db.organizations.unshift(newOrg);
    createNotification(db, {
      userId: 'admin',
      title: 'Tổ chức mới nộp hồ sơ duyệt',
      message: `Tổ chức "${newOrg.name}" (${newOrg.licenseNumber}) vừa đăng ký và xác minh OTP. Hồ sơ đang chờ xét duyệt pháp lý.`,
      type: 'warning'
    });
    saveDB(db);
    return res.status(201).json({ success: true, organization: newOrg, role: 'organization', pendingApproval: true });
  }

  return res.status(400).json({ success: false, error: 'invalid_role' });
});

// Đăng ký TNV (Quy trình 1) - now only validates, actual save done via verify-register-otp
app.post('/api/auth/register-volunteer', (req, res) => {
  const db = getDB();
  const formData = req.body;

  const exists = db.volunteers.some((v) => v.email.toLowerCase() === formData.email?.toLowerCase());
  if (exists) {
    return res.status(400).json({ success: false, error: 'Email này đã được sử dụng trên hệ thống!' });
  }

  // Return success to indicate validation passed, OTP will be sent next
  res.json({ success: true, message: 'validation_ok' });
});

// Đăng ký Tổ chức (Quy trình 1) - validation only, actual save via verify-register-otp
app.post('/api/auth/register-organization', (req, res) => {
  const db = getDB();
  const formData = req.body;

  const exists = db.organizations.some((o) => o.email.toLowerCase() === formData.email?.toLowerCase());
  if (exists) {
    return res.status(400).json({ success: false, error: 'Email tổ chức này đã được sử dụng!' });
  }

  // Return success to indicate validation passed
  res.json({ success: true, message: 'validation_ok' });
});

// ==========================================
// 3. ACTIVITIES (Quy trình 3)
// ==========================================
app.get('/api/activities', (req, res) => {
  const db = getDB();
  res.json({ success: true, data: db.activities });
});

app.post('/api/activities', (req, res) => {
  const db = getDB();
  const data = req.body;

  const category = db.categories.find((c) => c.id === data.categoryId) || db.categories[0];
  const location = db.locations.find((l) => l.id === data.locationId) || db.locations[0];

  const newAct = {
    id: `act-${Date.now()}`,
    title: data.title,
    organizationId: data.organizationId,
    organizationName: data.organizationName,
    categoryId: category.id,
    categoryName: category.name,
    locationId: location.id,
    locationName: location.name,
    specificAddress: data.specificAddress,
    startDate: data.startDate,
    endDate: data.endDate,
    hoursEarned: Number(data.hoursEarned) || 4,
    volunteersNeeded: Number(data.volunteersNeeded) || 10,
    volunteersRegistered: 0,
    volunteersApproved: 0,
    status: 'pending_approval',
    approvalStatus: 'pending',
    description: data.description,
    requirements: data.requirements,
    benefits: data.benefits,
    banner: data.banner || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop&q=80',
    shifts: data.shifts || [{ id: `shift-${Date.now()}`, name: 'Ca hoạt động chính', time: `${data.startDate} - ${data.endDate}` }],
    createdAt: new Date().toISOString().split('T')[0]
  };

  db.activities.unshift(newAct);

  // Notify Admin
  createNotification(db, {
    userId: 'admin',
    title: 'Hoạt động mới chờ duyệt',
    message: `Tổ chức "${newAct.organizationName}" vừa tạo hoạt động "${newAct.title}" cần kiểm duyệt.`,
    type: 'warning'
  });

  saveDB(db);
  res.status(201).json({ success: true, activity: newAct });
});

app.put('/api/activities/:id', (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const idx = db.activities.findIndex((a) => a.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Không tìm thấy hoạt động' });

  db.activities[idx] = { ...db.activities[idx], ...req.body };
  saveDB(db);
  res.json({ success: true, activity: db.activities[idx] });
});

app.post('/api/activities/:id/cancel', (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const { reason } = req.body;

  const act = db.activities.find((a) => a.id === id);
  if (!act) return res.status(404).json({ success: false, error: 'Không tìm thấy hoạt động' });

  act.status = 'cancelled';
  act.cancelReason = reason;

  // Notify all registered volunteers & update registration status
  db.registrations.forEach((r) => {
    if (r.activityId === id && r.status !== 'cancelled') {
      r.status = 'rejected';
      r.orgRejectReason = `Hoạt động bị hủy: ${reason || 'Không rõ lý do'}`;
      createNotification(db, {
        userId: r.volunteerId,
        title: `Hoạt động "${act.title}" đã bị hủy`,
        message: `Lý do từ Ban tổ chức: ${reason || 'Không có lý do cụ thể'}.`,
        type: 'error'
      });
    }
  });

  saveDB(db);
  res.json({ success: true, message: 'Đã hủy hoạt động và gửi thông báo tới TNV.' });
});

app.post('/api/activities/:id/toggle-recruiting', (req, res) => {
  const db = getDB();
  const act = db.activities.find((a) => a.id === req.params.id);
  if (!act) return res.status(404).json({ success: false, error: 'Không tìm thấy hoạt động' });

  act.status = act.status === 'recruiting' ? 'full' : 'recruiting';
  saveDB(db);
  res.json({ success: true, status: act.status });
});

// Admin Approve Activity
app.post('/api/activities/:id/approve', (req, res) => {
  const db = getDB();
  const act = db.activities.find((a) => a.id === req.params.id);
  if (!act) return res.status(404).json({ success: false, error: 'Không tìm thấy hoạt động' });

  act.approvalStatus = 'approved';
  act.status = 'recruiting';

  createNotification(db, {
    userId: act.organizationId,
    title: 'Hoạt động đã được phê duyệt công khai!',
    message: `Hoạt động "${act.title}" đã được kiểm duyệt và hiển thị công khai.`,
    type: 'success'
  });

  saveDB(db);
  res.json({ success: true, activity: act });
});

// Admin Reject Activity
app.post('/api/activities/:id/reject', (req, res) => {
  const db = getDB();
  const { reason } = req.body;
  const act = db.activities.find((a) => a.id === req.params.id);
  if (!act) return res.status(404).json({ success: false, error: 'Không tìm thấy hoạt động' });

  act.approvalStatus = 'rejected';
  act.status = 'rejected';
  act.rejectReason = reason;

  createNotification(db, {
    userId: act.organizationId,
    title: 'Hoạt động bị từ chối kiểm duyệt',
    message: `Hoạt động "${act.title}" không được duyệt. Lý do: ${reason || 'Chưa phù hợp'}.`,
    type: 'error'
  });

  saveDB(db);
  res.json({ success: true, activity: act });
});

// Admin Request Edit
app.post('/api/activities/:id/request-edit', (req, res) => {
  const db = getDB();
  const { reason } = req.body;
  const act = db.activities.find((a) => a.id === req.params.id);
  if (!act) return res.status(404).json({ success: false, error: 'Không tìm thấy hoạt động' });

  act.approvalStatus = 'need_edit';
  act.editReason = reason;

  createNotification(db, {
    userId: act.organizationId,
    title: 'Yêu cầu chỉnh sửa nội dung hoạt động',
    message: `Hoạt động "${act.title}" cần chỉnh sửa: "${reason}".`,
    type: 'warning'
  });

  saveDB(db);
  res.json({ success: true, activity: act });
});

// Admin Delete Activity
app.delete('/api/activities/:id', (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const act = db.activities.find((a) => a.id === id);
  if (!act) return res.status(404).json({ success: false, error: 'Không tìm thấy hoạt động' });

  // Cancel registered TNVs
  db.registrations.forEach((r) => {
    if (r.activityId === id && r.status !== 'cancelled') {
      r.status = 'rejected';
      createNotification(db, {
        userId: r.volunteerId,
        title: `Hoạt động "${act.title}" đã bị gỡ bỏ`,
        message: 'Hoạt động đã bị gỡ bỏ bởi Quản trị viên do vi phạm điều khoản.',
        type: 'error'
      });
    }
  });

  db.activities = db.activities.filter((a) => a.id !== id);
  saveDB(db);
  res.json({ success: true, message: 'Đã xóa hoạt động khỏi hệ thống.' });
});

// Complete Activity (Quy trình 6)
app.post('/api/activities/:id/complete', (req, res) => {
  const db = getDB();
  const act = db.activities.find((a) => a.id === req.params.id);
  if (!act) return res.status(404).json({ success: false, error: 'Không tìm thấy hoạt động' });

  act.status = 'completed';

  // Notify attended volunteers to review
  const presentRegs = db.registrations.filter(
    (r) => r.activityId === act.id && r.attendanceStatus === 'present'
  );
  presentRegs.forEach((r) => {
    createNotification(db, {
      userId: r.volunteerId,
      title: 'Mời đánh giá hoạt động',
      message: `Hoạt động "${act.title}" đã kết thúc! Hãy để lại nhận xét và chấm sao để giúp BTC cải thiện chất lượng nhé.`,
      type: 'info'
    });
  });

  saveDB(db);
  res.json({ success: true, activity: act });
});

// ==========================================
// 4. REGISTRATIONS & ATTENDANCE (Quy trình 4, 5, 6)
// ==========================================
app.get('/api/registrations', (req, res) => {
  const db = getDB();
  res.json({ success: true, data: db.registrations });
});

// Đăng ký tham gia hoạt động (Quy trình 4)
app.post('/api/registrations', (req, res) => {
  const db = getDB();
  const { activityId, volunteerId, message } = req.body;

  const vol = db.volunteers.find((v) => v.id === volunteerId);
  if (!vol) return res.status(404).json({ success: false, error: 'Không tìm thấy tình nguyện viên!' });
  if (vol.status !== 'approved') {
    return res.status(403).json({ success: false, error: 'Tài khoản chưa được Admin duyệt!' });
  }

  const act = db.activities.find((a) => a.id === activityId);
  if (!act) return res.status(404).json({ success: false, error: 'Không tìm thấy hoạt động!' });
  if (act.status !== 'recruiting') {
    return res.status(400).json({ success: false, error: 'Hoạt động hiện không nhận thêm đăng ký!' });
  }
  if (act.volunteersRegistered >= act.volunteersNeeded) {
    return res.status(400).json({ success: false, error: 'Hoạt động đã đủ số lượng tình nguyện viên!' });
  }

  // Check duplicate
  const alreadyReg = db.registrations.find(
    (r) => r.activityId === activityId && r.volunteerId === volunteerId && r.status !== 'cancelled'
  );
  if (alreadyReg) {
    return res.status(400).json({ success: false, error: 'Bạn đã đăng ký tham gia hoạt động này rồi!' });
  }

  // Create registration
  const newReg = {
    id: `reg-${Date.now()}`,
    activityId: act.id,
    activityTitle: act.title,
    volunteerId: vol.id,
    volunteerName: vol.fullName,
    volunteerEmail: vol.email,
    volunteerPhone: vol.phone,
    volunteerSkills: vol.skills || [],
    registeredDate: new Date().toISOString().split('T')[0],
    message: message || 'Tôi cam kết tham gia đầy đủ và tích cực.',
    status: 'pending', // Chờ duyệt
    attendanceStatus: 'not_yet',
    hoursConfirmed: 0,
    orgRejectReason: '',
    confirmedByVolunteer: false,
    ratedByVolunteer: false,
    ratedByOrg: false
  };

  db.registrations.unshift(newReg);

  // Update activity count
  act.volunteersRegistered += 1;
  if (act.volunteersRegistered >= act.volunteersNeeded) {
    act.status = 'full';
  }

  // Notify Organization
  createNotification(db, {
    userId: act.organizationId,
    title: 'Có TNV mới đăng ký',
    message: `Tình nguyện viên ${vol.fullName} vừa đăng ký tham gia "${act.title}". Vui lòng xét duyệt.`,
    type: 'info'
  });

  saveDB(db);
  res.status(201).json({ success: true, registration: newReg });
});

// Hủy đăng ký (Chức năng 8 TNV)
app.post('/api/registrations/:id/cancel', (req, res) => {
  const db = getDB();
  const reg = db.registrations.find((r) => r.id === req.params.id);
  if (!reg) return res.status(404).json({ success: false, error: 'Không tìm thấy đăng ký' });

  reg.status = 'cancelled';

  const act = db.activities.find((a) => a.id === reg.activityId);
  if (act) {
    act.volunteersRegistered = Math.max(0, act.volunteersRegistered - 1);
    if (reg.status === 'approved') {
      act.volunteersApproved = Math.max(0, act.volunteersApproved - 1);
    }
    if (act.status === 'full' && act.volunteersRegistered < act.volunteersNeeded) {
      act.status = 'recruiting';
    }
  }

  saveDB(db);
  res.json({ success: true, message: 'Đã hủy đăng ký thành công.' });
});

// Tổ chức duyệt TNV (Quy trình 5)
app.post('/api/registrations/:id/approve', (req, res) => {
  const db = getDB();
  const reg = db.registrations.find((r) => r.id === req.params.id);
  if (!reg) return res.status(404).json({ success: false, error: 'Không tìm thấy đăng ký' });

  reg.status = 'approved';

  const act = db.activities.find((a) => a.id === reg.activityId);
  if (act) {
    act.volunteersApproved += 1;
  }

  createNotification(db, {
    userId: reg.volunteerId,
    title: 'Đăng ký đã được chấp thuận!',
    message: `Chúc mừng bạn! Tổ chức đã duyệt yêu cầu tham gia hoạt động "${reg.activityTitle}".`,
    type: 'success'
  });

  saveDB(db);
  res.json({ success: true, registration: reg });
});

// Tổ chức từ chối TNV (Quy trình 5)
app.post('/api/registrations/:id/reject', (req, res) => {
  const db = getDB();
  const { reason } = req.body;
  const reg = db.registrations.find((r) => r.id === req.params.id);
  if (!reg) return res.status(404).json({ success: false, error: 'Không tìm thấy đăng ký' });

  reg.status = 'rejected';
  reg.orgRejectReason = reason || 'Chưa phù hợp đợt tuyển này';

  const act = db.activities.find((a) => a.id === reg.activityId);
  if (act) {
    act.volunteersRegistered = Math.max(0, act.volunteersRegistered - 1);
  }

  createNotification(db, {
    userId: reg.volunteerId,
    title: 'Thông báo kết quả đăng ký',
    message: `Yêu cầu tham gia "${reg.activityTitle}" chưa được chấp thuận. Lý do: ${reg.orgRejectReason}.`,
    type: 'warning'
  });

  saveDB(db);
  res.json({ success: true, registration: reg });
});

// TNV xác nhận tham gia (Chức năng 12 TNV)
app.post('/api/registrations/:id/confirm-attendance', (req, res) => {
  const db = getDB();
  const reg = db.registrations.find((r) => r.id === req.params.id);
  if (!reg) return res.status(404).json({ success: false, error: 'Không tìm thấy đăng ký' });

  reg.confirmedByVolunteer = true;
  saveDB(db);
  res.json({ success: true, registration: reg });
});

// Điểm danh & Ghi nhận giờ công (Quy trình 6)
app.post('/api/registrations/:id/mark-attendance', (req, res) => {
  const db = getDB();
  const { status } = req.body; // 'present' | 'absent'
  const reg = db.registrations.find((r) => r.id === req.params.id);
  if (!reg) return res.status(404).json({ success: false, error: 'Không tìm thấy đăng ký' });

  const act = db.activities.find((a) => a.id === reg.activityId);
  const earnedHours = act ? act.hoursEarned : 4;

  const isPresent = status === 'present';
  const hours = isPresent ? earnedHours : 0;

  const oldHours = reg.hoursConfirmed || 0;
  reg.attendanceStatus = status;
  reg.hoursConfirmed = hours;

  // Cập nhật tổng giờ công cho TNV
  const vol = db.volunteers.find((v) => v.id === reg.volunteerId);
  if (vol) {
    vol.totalHours = Math.max(0, (vol.totalHours || 0) - oldHours + hours);
    if (isPresent && oldHours === 0) {
      vol.completedActivitiesCount = (vol.completedActivitiesCount || 0) + 1;
    } else if (!isPresent && oldHours > 0) {
      vol.completedActivitiesCount = Math.max(0, (vol.completedActivitiesCount || 0) - 1);
    }
  }

  if (isPresent) {
    createNotification(db, {
      userId: reg.volunteerId,
      title: 'Bạn đã được điểm danh CÓ MẶT!',
      message: `Hệ thống đã xác nhận +${hours} giờ công tình nguyện cho "${reg.activityTitle}".`,
      type: 'success'
    });
  } else {
    createNotification(db, {
      userId: reg.volunteerId,
      title: 'Thông báo điểm danh: Vắng mặt',
      message: `Bạn được ghi nhận Vắng mặt tại hoạt động "${reg.activityTitle}".`,
      type: 'warning'
    });
  }

  saveDB(db);
  res.json({ success: true, registration: reg, volunteer: vol });
});

// ==========================================
// 5. REVIEWS & EVALUATIONS (Quy trình 7)
// ==========================================
app.get('/api/reviews', (req, res) => {
  const db = getDB();
  res.json({ success: true, data: db.reviews });
});

// TNV đánh giá hoạt động
app.post('/api/reviews', (req, res) => {
  const db = getDB();
  const { activityId, volunteerId, rating, comment } = req.body;

  const act = db.activities.find((a) => a.id === activityId);
  const vol = db.volunteers.find((v) => v.id === volunteerId);
  if (!act || !vol) return res.status(404).json({ success: false, error: 'Không tìm thấy dữ liệu' });

  const newRev = {
    id: `rev-${Date.now()}`,
    activityId,
    activityTitle: act.title,
    organizationId: act.organizationId,
    volunteerId: vol.id,
    volunteerName: vol.fullName,
    rating: Number(rating),
    comment,
    createdAt: new Date().toISOString().split('T')[0]
  };

  db.reviews.unshift(newRev);

  // Mark reg as rated
  const reg = db.registrations.find((r) => r.activityId === activityId && r.volunteerId === volunteerId);
  if (reg) reg.ratedByVolunteer = true;

  createNotification(db, {
    userId: act.organizationId,
    title: 'Nhận được đánh giá mới',
    message: `TNV ${vol.fullName} vừa đánh giá ${rating} sao cho hoạt động "${act.title}".`,
    type: 'info'
  });

  saveDB(db);
  res.status(201).json({ success: true, review: newRev });
});

// Tổ chức đánh giá TNV
app.get('/api/evaluations', (req, res) => {
  const db = getDB();
  res.json({ success: true, data: db.volunteerEvaluations });
});

app.post('/api/evaluations', (req, res) => {
  const db = getDB();
  const { activityId, volunteerId, organizationId, rating, feedback } = req.body;

  const newEval = {
    id: `veval-${Date.now()}`,
    activityId,
    volunteerId,
    organizationId,
    rating: Number(rating),
    feedback,
    createdAt: new Date().toISOString().split('T')[0]
  };

  db.volunteerEvaluations.unshift(newEval);

  const reg = db.registrations.find((r) => r.activityId === activityId && r.volunteerId === volunteerId);
  if (reg) reg.ratedByOrg = true;

  // Recalculate average rating for volunteer
  const volEvals = db.volunteerEvaluations.filter((e) => e.volunteerId === volunteerId);
  const avg = (volEvals.reduce((a, b) => a + b.rating, 0) / volEvals.length).toFixed(1);
  const vol = db.volunteers.find((v) => v.id === volunteerId);
  if (vol) vol.ratingAvg = Number(avg);

  createNotification(db, {
    userId: volunteerId,
    title: 'Đơn vị tổ chức đã đánh giá bạn',
    message: `Bạn vừa nhận được đánh giá ${rating} sao từ tổ chức: "${feedback}".`,
    type: 'success'
  });

  saveDB(db);
  res.status(201).json({ success: true, evaluation: newEval });
});

// ==========================================
// 6. VOLUNTEERS & ORGANIZATIONS MANAGEMENT
// ==========================================
app.get('/api/volunteers', (req, res) => {
  const db = getDB();
  res.json({ success: true, data: db.volunteers });
});

app.put('/api/volunteers/:id', (req, res) => {
  const db = getDB();
  const vol = db.volunteers.find((v) => v.id === req.params.id);
  if (!vol) return res.status(404).json({ success: false, error: 'Không tìm thấy tình nguyện viên' });

  Object.assign(vol, req.body);
  saveDB(db);
  res.json({ success: true, volunteer: vol });
});

app.post('/api/volunteers/:id/approve', (req, res) => {
  const db = getDB();
  const vol = db.volunteers.find((v) => v.id === req.params.id);
  if (!vol) return res.status(404).json({ success: false, error: 'Không tìm thấy' });

  vol.status = 'approved';
  createNotification(db, {
    userId: vol.id,
    title: 'Tài khoản đã được duyệt!',
    message: 'Tài khoản Tình nguyện viên của bạn đã được phê duyệt.',
    type: 'success'
  });
  saveDB(db);
  res.json({ success: true, volunteer: vol });
});

app.post('/api/volunteers/:id/reject', (req, res) => {
  const db = getDB();
  const { reason } = req.body;
  const vol = db.volunteers.find((v) => v.id === req.params.id);
  if (!vol) return res.status(404).json({ success: false, error: 'Không tìm thấy' });

  vol.status = 'rejected';
  vol.rejectReason = reason;
  saveDB(db);
  res.json({ success: true, volunteer: vol });
});

app.post('/api/volunteers/:id/toggle-lock', (req, res) => {
  const db = getDB();
  const vol = db.volunteers.find((v) => v.id === req.params.id);
  if (!vol) return res.status(404).json({ success: false, error: 'Không tìm thấy' });

  vol.status = vol.status === 'locked' ? 'approved' : 'locked';
  saveDB(db);
  res.json({ success: true, status: vol.status });
});

app.delete('/api/volunteers/:id', (req, res) => {
  const db = getDB();
  db.volunteers = db.volunteers.filter((v) => v.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

app.get('/api/organizations', (req, res) => {
  const db = getDB();
  res.json({ success: true, data: db.organizations });
});

app.put('/api/organizations/:id', (req, res) => {
  const db = getDB();
  const org = db.organizations.find((o) => o.id === req.params.id);
  if (!org) return res.status(404).json({ success: false, error: 'Không tìm thấy tổ chức' });

  Object.assign(org, req.body);
  saveDB(db);
  res.json({ success: true, organization: org });
});

app.post('/api/organizations/:id/approve', (req, res) => {
  const db = getDB();
  const org = db.organizations.find((o) => o.id === req.params.id);
  if (!org) return res.status(404).json({ success: false, error: 'Không tìm thấy' });

  org.status = 'active';
  org.verifiedAt = new Date().toISOString().split('T')[0];
  createNotification(db, {
    userId: org.id,
    title: 'Hồ sơ tổ chức đã được xác thực!',
    message: 'Ban Quản trị đã duyệt tư cách pháp nhân của tổ chức.',
    type: 'success'
  });
  saveDB(db);
  res.json({ success: true, organization: org });
});

app.post('/api/organizations/:id/reject', (req, res) => {
  const db = getDB();
  const { reason } = req.body;
  const org = db.organizations.find((o) => o.id === req.params.id);
  if (!org) return res.status(404).json({ success: false, error: 'Không tìm thấy' });

  org.status = 'rejected';
  org.rejectReason = reason;
  saveDB(db);
  res.json({ success: true, organization: org });
});

app.post('/api/organizations/:id/toggle-lock', (req, res) => {
  const db = getDB();
  const org = db.organizations.find((o) => o.id === req.params.id);
  if (!org) return res.status(404).json({ success: false, error: 'Không tìm thấy' });

  org.status = org.status === 'locked' ? 'active' : 'locked';
  saveDB(db);
  res.json({ success: true, status: org.status });
});

app.delete('/api/organizations/:id', (req, res) => {
  const db = getDB();
  db.organizations = db.organizations.filter((o) => o.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// ==========================================
// 7. CATEGORIES & LOCATIONS (Constraint checks)
// ==========================================
app.get('/api/categories', (req, res) => {
  const db = getDB();
  res.json({ success: true, data: db.categories });
});

app.post('/api/categories', (req, res) => {
  const db = getDB();
  const { name, icon, description } = req.body;
  const newCat = {
    id: `cat-${Date.now()}`,
    name,
    icon: icon || 'Heart',
    description: description || ''
  };
  db.categories.push(newCat);
  saveDB(db);
  res.status(201).json({ success: true, category: newCat });
});

app.delete('/api/categories/:id', (req, res) => {
  const db = getDB();
  const { id } = req.params;

  // Constraint check: cannot delete if activities use it (Quy trình 8 ngoại lệ 6a)
  const isUsed = db.activities.some((a) => a.categoryId === id);
  if (isUsed) {
    return res.status(400).json({
      success: false,
      error: 'KHÔNG THỂ XÓA: Danh mục đang được sử dụng bởi các hoạt động trong hệ thống!'
    });
  }

  db.categories = db.categories.filter((c) => c.id !== id);
  saveDB(db);
  res.json({ success: true });
});

app.get('/api/locations', (req, res) => {
  const db = getDB();
  res.json({ success: true, data: db.locations });
});

app.post('/api/locations', (req, res) => {
  const db = getDB();
  const { name, code } = req.body;
  const newLoc = { id: `loc-${Date.now()}`, name, code };
  db.locations.push(newLoc);
  saveDB(db);
  res.status(201).json({ success: true, location: newLoc });
});

app.delete('/api/locations/:id', (req, res) => {
  const db = getDB();
  const { id } = req.params;

  const isUsed = db.activities.some((a) => a.locationId === id);
  if (isUsed) {
    return res.status(400).json({
      success: false,
      error: 'KHÔNG THỂ XÓA: Địa điểm đang có hoạt động diễn ra!'
    });
  }

  db.locations = db.locations.filter((l) => l.id !== id);
  saveDB(db);
  res.json({ success: true });
});

// ==========================================
// 8. NOTIFICATIONS & FEEDBACKS
// ==========================================
app.get('/api/notifications', (req, res) => {
  const db = getDB();
  res.json({ success: true, data: db.notifications });
});

app.post('/api/notifications/:id/read', (req, res) => {
  const db = getDB();
  const notif = db.notifications.find((n) => n.id === req.params.id);
  if (notif) notif.read = true;
  saveDB(db);
  res.json({ success: true });
});

app.post('/api/notifications/read-all', (req, res) => {
  const db = getDB();
  const { userId } = req.body;
  db.notifications.forEach((n) => {
    if (n.userId === userId) n.read = true;
  });
  saveDB(db);
  res.json({ success: true });
});

// Admin Broadcast
app.post('/api/notifications/broadcast', (req, res) => {
  const db = getDB();
  const { targetGroup, title, message } = req.body;

  let targets = [];
  if (targetGroup === 'all' || targetGroup === 'volunteers') {
    targets = [...targets, ...db.volunteers.map((v) => v.id)];
  }
  if (targetGroup === 'all' || targetGroup === 'organizations') {
    targets = [...targets, ...db.organizations.map((o) => o.id)];
  }

  targets.forEach((uid) => {
    createNotification(db, {
      userId: uid,
      title: `[Thông báo Hệ thống] ${title}`,
      message,
      type: 'info'
    });
  });

  saveDB(db);
  res.json({ success: true, count: targets.length });
});

// Org send notice to activity volunteers
app.post('/api/notifications/send-activity', (req, res) => {
  const db = getDB();
  const { activityId, title, message } = req.body;

  const act = db.activities.find((a) => a.id === activityId);
  if (!act) return res.status(404).json({ success: false, error: 'Không tìm thấy hoạt động' });

  const targetRegs = db.registrations.filter(
    (r) => r.activityId === activityId && (r.status === 'approved' || r.status === 'pending')
  );

  targetRegs.forEach((r) => {
    createNotification(db, {
      userId: r.volunteerId,
      title: `[${act.title}] ${title}`,
      message,
      type: 'info'
    });
  });

  saveDB(db);
  res.json({ success: true, count: targetRegs.length });
});

app.get('/api/feedbacks', (req, res) => {
  const db = getDB();
  res.json({ success: true, data: db.feedbacks });
});

app.post('/api/feedbacks', (req, res) => {
  const db = getDB();
  const { volunteerId, volunteerName, volunteerEmail, targetType, title, content } = req.body;

  const newFb = {
    id: `fb-${Date.now()}`,
    volunteerId,
    volunteerName,
    volunteerEmail,
    targetType: targetType || 'system',
    title,
    content,
    status: 'pending',
    createdAt: new Date().toISOString().split('T')[0]
  };

  db.feedbacks.unshift(newFb);

  createNotification(db, {
    userId: 'admin',
    title: 'Ý kiến phản hồi / khiếu nại mới',
    message: `${newFb.volunteerName} vừa gửi phản hồi: "${title}".`,
    type: 'warning'
  });

  saveDB(db);
  res.status(201).json({ success: true, feedback: newFb });
});

// ==========================================
// 9. SETTINGS
// ==========================================
app.get('/api/settings', (req, res) => {
  const db = getDB();
  res.json({ success: true, data: db.settings });
});

app.put('/api/settings', (req, res) => {
  const db = getDB();
  db.settings = { ...db.settings, ...req.body };
  saveDB(db);
  res.json({ success: true, settings: db.settings });
});

// Start listening
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`V-Connect Backend REST API running at:`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`===============================================`);
});
