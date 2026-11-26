import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { getDB, saveDB, resetDB } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;
const AUTH_SECRET = process.env.AUTH_SECRET || 'vconnect-session-secret-2026';
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ==========================================
// AUTH TOKEN & SANITIZATION HELPERS
// ==========================================
const signToken = (payload) => {
  const body = { ...payload, exp: Date.now() + TOKEN_TTL_MS };
  const encoded = Buffer.from(JSON.stringify(body), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
};

const verifyToken = (token) => {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(encoded).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
};

const attachAuth = (req, _res, next) => {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    req.auth = verifyToken(header.slice(7).trim());
  } else {
    req.auth = null;
  }
  next();
};

const requireAuth = (req, res, next) => {
  if (!req.auth) {
    return res.status(401).json({ success: false, error: 'Vui lòng đăng nhập để thực hiện thao tác này!' });
  }
  next();
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.auth) {
    return res.status(401).json({ success: false, error: 'Vui lòng đăng nhập để thực hiện thao tác này!' });
  }
  if (!roles.includes(req.auth.role)) {
    return res.status(403).json({ success: false, error: 'Bạn không có quyền thực hiện thao tác này!' });
  }
  next();
};

app.use(attachAuth);

const stripPassword = (entity) => {
  if (!entity || typeof entity !== 'object') return entity;
  const { password: _password, ...safe } = entity;
  return safe;
};

const sanitizeDB = (db) => ({
  ...db,
  volunteers: (db.volunteers || []).map(stripPassword),
  organizations: (db.organizations || []).map(stripPassword)
});

const pickAllowedFields = (source, allowedKeys) => {
  const out = {};
  allowedKeys.forEach((key) => {
    if (source && Object.prototype.hasOwnProperty.call(source, key) && source[key] !== undefined) {
      out[key] = source[key];
    }
  });
  return out;
};

const generateCertificateCode = (reg) => {
  const cleanId = String(reg.id || 'REG').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const hash = crypto
    .createHash('sha256')
    .update(`${reg.id}:${reg.activityId}:${reg.volunteerId}`)
    .digest('hex')
    .slice(0, 6)
    .toUpperCase();
  return `VCN-CERT-${cleanId}-${hash}`;
};

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
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

app.get('/api/bootstrap', (_req, res) => {
  const db = getDB();
  res.json({ success: true, data: sanitizeDB(db) });
});

app.post('/api/system/reset', requireRole('admin'), (_req, res) => {
  const db = resetDB();
  res.json({ success: true, message: 'Đã khôi phục dữ liệu ban đầu', data: sanitizeDB(db) });
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

const checkAccountStatus = (account) => {
  if (account.status === 'locked') return { ok: false, error: 'account_locked' };
  if (account.status === 'pending') return { ok: false, error: 'account_pending' };
  if (account.status === 'rejected') return { ok: false, error: 'account_rejected' };
  return { ok: true };
};

// Admin backup recovery code (demo)
const ADMIN_RECOVERY_CODE = 'VCADM-2026-RECOVERY';
const ADMIN_USER = {
  id: 'admin',
  fullName: 'Quản Trị Viên Hệ Thống',
  email: 'admin@vconnect.vn',
  role: 'admin'
};

app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  const db = getDB();

  const rl = checkRateLimit(email);
  if (rl.limited) {
    return res.status(429).json({ success: false, rateLimited: true, error: 'rate_limited' });
  }

  if (role === 'admin') {
    const isValidAdmin =
      (email === 'admin@vconnect.vn' && password === 'admin123') ||
      password === ADMIN_RECOVERY_CODE;
    if (isValidAdmin) {
      clearAttempts(email);
      return res.json({
        success: true,
        user: ADMIN_USER,
        role: 'admin',
        token: signToken({ id: 'admin', role: 'admin' })
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
    const statusCheck = checkAccountStatus(vol);
    if (!statusCheck.ok) {
      return res.status(403).json({ success: false, error: statusCheck.error });
    }
    clearAttempts(email);
    return res.json({
      success: true,
      user: stripPassword(vol),
      role: 'volunteer',
      token: signToken({ id: vol.id, role: 'volunteer' })
    });
  }

  if (role === 'organization') {
    const org = db.organizations.find((o) => o.email.toLowerCase() === email?.toLowerCase());
    if (!org || org.password !== password) {
      recordFailedAttempt(email);
      return res.status(401).json({ success: false, error: 'invalid_credentials' });
    }
    const statusCheck = checkAccountStatus(org);
    if (!statusCheck.ok) {
      return res.status(403).json({ success: false, error: statusCheck.error });
    }
    clearAttempts(email);
    return res.json({
      success: true,
      user: stripPassword(org),
      role: 'organization',
      token: signToken({ id: org.id, role: 'organization' })
    });
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
      user: ADMIN_USER,
      role: 'admin',
      token: signToken({ id: 'admin', role: 'admin' })
    });
  }

  recordFailedAttempt(email);
  return res.status(401).json({ success: false, error: 'invalid_credentials' });
});

// Password recovery - request OTP (demo: OTP is 123456)
app.post('/api/auth/forgot-password', (req, res) => {
  const { email, role } = req.body;
  const db = getDB();

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

  if (role === 'admin' && email === 'admin@vconnect.vn') {
    return res.json({
      success: true,
      user: ADMIN_USER,
      role: 'admin',
      token: signToken({ id: 'admin', role: 'admin' })
    });
  }

  const vol = db.volunteers.find((v) => v.email.toLowerCase() === email?.toLowerCase());
  if (vol && (role === 'volunteer' || !role)) {
    const statusCheck = checkAccountStatus(vol);
    if (!statusCheck.ok) {
      return res.status(403).json({ success: false, error: statusCheck.error });
    }
    clearAttempts(email);
    return res.json({
      success: true,
      user: stripPassword(vol),
      role: 'volunteer',
      token: signToken({ id: vol.id, role: 'volunteer' })
    });
  }

  const org = db.organizations.find((o) => o.email.toLowerCase() === email?.toLowerCase());
  if (org && (role === 'organization' || !role)) {
    const statusCheck = checkAccountStatus(org);
    if (!statusCheck.ok) {
      return res.status(403).json({ success: false, error: statusCheck.error });
    }
    clearAttempts(email);
    return res.json({
      success: true,
      user: stripPassword(org),
      role: 'organization',
      token: signToken({ id: org.id, role: 'organization' })
    });
  }

  return res.status(404).json({ success: false, error: 'email_not_found' });
});

// Change password for logged-in volunteer or organization
app.post('/api/auth/change-password', requireRole('volunteer', 'organization'), (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ success: false, error: 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới!' });
  }
  if (String(newPassword).length < 6) {
    return res.status(400).json({ success: false, error: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
  }

  const db = getDB();
  const list = req.auth.role === 'volunteer' ? db.volunteers : db.organizations;
  const account = list.find((u) => u.id === req.auth.id);
  if (!account) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy tài khoản!' });
  }
  if (account.password !== oldPassword) {
    return res.status(400).json({ success: false, error: 'Mật khẩu hiện tại không chính xác!' });
  }

  account.password = newPassword;
  saveDB(db);
  return res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
});

// Verify OTP for registration (demo OTP: 111111)
app.post('/api/auth/verify-register-otp', (req, res) => {
  const { otp, pendingData, role } = req.body;
  const REGISTER_OTP = '111111';

  if (otp !== REGISTER_OTP) {
    return res.status(400).json({ success: false, error: 'invalid_otp' });
  }
  if (!pendingData || !pendingData.email) {
    return res.status(400).json({ success: false, error: 'Thiếu thông tin đăng ký!' });
  }

  const db = getDB();
  const chosenPassword =
    pendingData.password && String(pendingData.password).trim().length >= 6
      ? String(pendingData.password).trim()
      : '123456';

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
      password: chosenPassword,
      phone: formData.phone,
      dob: formData.dob || '2004-01-01',
      address: formData.address || '',
      skills: formData.skills || ['Nhiệt tình', 'Làm việc nhóm'],
      interests: formData.interests || ['Bảo vệ Môi trường'],
      avatar: formData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      status: 'approved',
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
    return res.status(201).json({ success: true, volunteer: stripPassword(newVol), role: 'volunteer' });
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
      password: chosenPassword,
      phone: formData.phone,
      address: formData.address,
      representative: formData.representative,
      type: formData.type || 'Tổ chức phi lợi nhuận (NGO)',
      licenseNumber: formData.licenseNumber || 'GP-ĐK/2026',
      description: formData.description || '',
      website: formData.website || '',
      logo: formData.logo || 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=150&auto=format&fit=crop&q=80',
      status: 'pending',
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
    return res.status(201).json({
      success: true,
      organization: stripPassword(newOrg),
      role: 'organization',
      pendingApproval: true
    });
  }

  return res.status(400).json({ success: false, error: 'invalid_role' });
});

// Đăng ký TNV (Quy trình 1) - validation only, actual save via verify-register-otp
app.post('/api/auth/register-volunteer', (req, res) => {
  const db = getDB();
  const formData = req.body;

  const exists = db.volunteers.some((v) => v.email.toLowerCase() === formData.email?.toLowerCase());
  if (exists) {
    return res.status(400).json({ success: false, error: 'Email này đã được sử dụng trên hệ thống!' });
  }
  if (formData.password && String(formData.password).trim().length < 6) {
    return res.status(400).json({ success: false, error: 'Mật khẩu phải có ít nhất 6 ký tự!' });
  }

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
  if (formData.password && String(formData.password).trim().length < 6) {
    return res.status(400).json({ success: false, error: 'Mật khẩu phải có ít nhất 6 ký tự!' });
  }

  res.json({ success: true, message: 'validation_ok' });
});

// ==========================================
// 3. ACTIVITIES (Quy trình 3)
// ==========================================
app.get('/api/activities', (_req, res) => {
  const db = getDB();
  res.json({ success: true, data: db.activities });
});

app.post('/api/activities', requireRole('organization'), (req, res) => {
  const db = getDB();
  const data = req.body;

  const org = db.organizations.find((o) => o.id === req.auth.id);
  if (!org) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy đơn vị tổ chức!' });
  }

  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return res.status(400).json({ success: false, error: 'Thời gian kết thúc phải diễn ra sau thời gian bắt đầu!' });
  }

  const category = db.categories.find((c) => c.id === data.categoryId) || db.categories[0];
  const location = db.locations.find((l) => l.id === data.locationId) || db.locations[0];

  const newAct = {
    id: `act-${Date.now()}`,
    title: data.title,
    organizationId: org.id,
    organizationName: org.name,
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

  createNotification(db, {
    userId: 'admin',
    title: 'Hoạt động mới chờ duyệt',
    message: `Tổ chức "${newAct.organizationName}" vừa tạo hoạt động "${newAct.title}" cần kiểm duyệt.`,
    type: 'warning'
  });

  saveDB(db);
  res.status(201).json({ success: true, activity: newAct });
});

app.put('/api/activities/:id', requireRole('organization', 'admin'), (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const idx = db.activities.findIndex((a) => a.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Không tìm thấy hoạt động' });

  const act = db.activities[idx];
  if (req.auth.role === 'organization' && act.organizationId !== req.auth.id) {
    return res.status(403).json({ success: false, error: 'Bạn không có quyền chỉnh sửa hoạt động của tổ chức khác!' });
  }
  if (act.status === 'completed' || act.status === 'cancelled') {
    return res.status(400).json({ success: false, error: 'Không thể chỉnh sửa hoạt động đã kết thúc hoặc đã bị hủy!' });
  }

  const allowedUpdates = pickAllowedFields(req.body, [
    'title',
    'categoryId',
    'locationId',
    'specificAddress',
    'startDate',
    'endDate',
    'hoursEarned',
    'volunteersNeeded',
    'description',
    'requirements',
    'benefits',
    'banner',
    'shifts'
  ]);

  const nextStart = new Date(allowedUpdates.startDate ?? act.startDate);
  const nextEnd = new Date(allowedUpdates.endDate ?? act.endDate);
  if (Number.isNaN(nextStart.getTime()) || Number.isNaN(nextEnd.getTime()) || nextEnd <= nextStart) {
    return res.status(400).json({ success: false, error: 'Thời gian kết thúc phải diễn ra sau thời gian bắt đầu!' });
  }

  if (allowedUpdates.hoursEarned !== undefined) {
    const hours = Number(allowedUpdates.hoursEarned);
    if (Number.isNaN(hours) || hours < 1 || hours > 100) {
      return res.status(400).json({ success: false, error: 'Số giờ công phải nằm trong khoảng từ 1 đến 100!' });
    }
    allowedUpdates.hoursEarned = hours;
  }

  if (allowedUpdates.volunteersNeeded !== undefined) {
    const needed = Number(allowedUpdates.volunteersNeeded);
    const minAllowed = Math.max(1, act.volunteersRegistered || 0);
    if (Number.isNaN(needed) || needed < minAllowed) {
      return res.status(400).json({
        success: false,
        error: `Số lượng TNV cần tuyển không thể nhỏ hơn số lượng đã đăng ký (${minAllowed})!`
      });
    }
    allowedUpdates.volunteersNeeded = needed;
  }

  if (allowedUpdates.categoryId) {
    const cat = db.categories.find((c) => c.id === allowedUpdates.categoryId);
    if (cat) allowedUpdates.categoryName = cat.name;
  }
  if (allowedUpdates.locationId) {
    const loc = db.locations.find((l) => l.id === allowedUpdates.locationId);
    if (loc) allowedUpdates.locationName = loc.name;
  }

  const updated = { ...act, ...allowedUpdates };

  // Reopen recruiting if needed increased on a full approved activity
  if (updated.approvalStatus === 'approved' && updated.status === 'full' && updated.volunteersRegistered < updated.volunteersNeeded) {
    updated.status = 'recruiting';
  }

  // If org edited a need_edit or rejected activity, re-submit it to Admin approval queue
  let resubmitted = false;
  if (req.auth.role === 'organization' && (act.approvalStatus === 'need_edit' || act.approvalStatus === 'rejected')) {
    updated.approvalStatus = 'pending';
    updated.status = 'pending_approval';
    updated.editReason = '';
    updated.rejectReason = '';
    resubmitted = true;
    createNotification(db, {
      userId: 'admin',
      title: 'Hoạt động đã được chỉnh sửa & gửi duyệt lại',
      message: `Tổ chức "${updated.organizationName}" đã cập nhật hoạt động "${updated.title}" theo yêu cầu và gửi duyệt lại.`,
      type: 'info'
    });
  }

  db.activities[idx] = updated;
  saveDB(db);
  res.json({ success: true, activity: updated, resubmitted });
});

app.post('/api/activities/:id/cancel', requireRole('organization', 'admin'), (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const { reason } = req.body;

  const act = db.activities.find((a) => a.id === id);
  if (!act) return res.status(404).json({ success: false, error: 'Không tìm thấy hoạt động' });
  if (req.auth.role === 'organization' && act.organizationId !== req.auth.id) {
    return res.status(403).json({ success: false, error: 'Bạn không có quyền hủy hoạt động của tổ chức khác!' });
  }
  if (act.status === 'completed' || act.status === 'cancelled') {
    return res.status(400).json({ success: false, error: 'Hoạt động đã kết thúc hoặc đã bị hủy trước đó!' });
  }

  act.status = 'cancelled';
  act.cancelReason = reason;

  // Only notify and reject registrations that are still pending or approved
  db.registrations.forEach((r) => {
    if (r.activityId === id && (r.status === 'pending' || r.status === 'approved')) {
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

app.post('/api/activities/:id/toggle-recruiting', requireRole('organization'), (req, res) => {
  const db = getDB();
  const act = db.activities.find((a) => a.id === req.params.id);
  if (!act) return res.status(404).json({ success: false, error: 'Không tìm thấy hoạt động' });
  if (act.organizationId !== req.auth.id) {
    return res.status(403).json({ success: false, error: 'Bạn không có quyền thao tác hoạt động của tổ chức khác!' });
  }
  if (act.approvalStatus !== 'approved') {
    return res.status(400).json({ success: false, error: 'Hoạt động chưa được Quản trị viên phê duyệt!' });
  }
  if (act.status !== 'recruiting' && act.status !== 'full') {
    return res.status(400).json({ success: false, error: 'Không thể thay đổi trạng thái tuyển của hoạt động này!' });
  }

  act.status = act.status === 'recruiting' ? 'full' : 'recruiting';
  saveDB(db);
  res.json({ success: true, status: act.status });
});

// Admin Approve Activity
app.post('/api/activities/:id/approve', requireRole('admin'), (req, res) => {
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
app.post('/api/activities/:id/reject', requireRole('admin'), (req, res) => {
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
app.post('/api/activities/:id/request-edit', requireRole('admin'), (req, res) => {
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
app.delete('/api/activities/:id', requireRole('admin'), (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const act = db.activities.find((a) => a.id === id);
  if (!act) return res.status(404).json({ success: false, error: 'Không tìm thấy hoạt động' });

  db.registrations.forEach((r) => {
    if (r.activityId === id && (r.status === 'pending' || r.status === 'approved')) {
      r.status = 'rejected';
      r.orgRejectReason = 'Hoạt động đã bị gỡ bỏ bởi Quản trị viên.';
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
app.post('/api/activities/:id/complete', requireRole('organization', 'admin'), (req, res) => {
  const db = getDB();
  const act = db.activities.find((a) => a.id === req.params.id);
  if (!act) return res.status(404).json({ success: false, error: 'Không tìm thấy hoạt động' });
  if (req.auth.role === 'organization' && act.organizationId !== req.auth.id) {
    return res.status(403).json({ success: false, error: 'Bạn không có quyền kết thúc hoạt động của tổ chức khác!' });
  }
  if (act.approvalStatus !== 'approved') {
    return res.status(400).json({ success: false, error: 'Không thể kết thúc hoạt động chưa được Quản trị viên phê duyệt!' });
  }
  if (act.status === 'cancelled' || act.status === 'rejected' || act.status === 'completed') {
    return res.status(400).json({ success: false, error: 'Hoạt động không ở trạng thái có thể kết thúc!' });
  }

  act.status = 'completed';

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
app.get('/api/registrations', (_req, res) => {
  const db = getDB();
  res.json({ success: true, data: db.registrations });
});

// Đăng ký tham gia hoạt động (Quy trình 4)
app.post('/api/registrations', requireRole('volunteer'), (req, res) => {
  const db = getDB();
  const { activityId, message } = req.body;
  const volunteerId = req.auth.id;

  const vol = db.volunteers.find((v) => v.id === volunteerId);
  if (!vol) return res.status(404).json({ success: false, error: 'Không tìm thấy tình nguyện viên!' });
  if (vol.status !== 'approved') {
    return res.status(403).json({ success: false, error: 'Tài khoản chưa được Admin duyệt!' });
  }

  const act = db.activities.find((a) => a.id === activityId);
  if (!act) return res.status(404).json({ success: false, error: 'Không tìm thấy hoạt động!' });
  if (act.approvalStatus !== 'approved' || act.status !== 'recruiting') {
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

  // Gather active registrations of this volunteer
  const activeVolRegs = db.registrations.filter((r) => {
    if (r.volunteerId !== volunteerId) return false;
    if (r.status !== 'pending' && r.status !== 'approved') return false;
    if (r.attendanceStatus === 'present' || r.attendanceStatus === 'absent') return false;
    const otherAct = db.activities.find((a) => a.id === r.activityId);
    if (!otherAct || otherAct.status === 'completed' || otherAct.status === 'cancelled' || otherAct.status === 'rejected') {
      return false;
    }
    return true;
  });

  // Check max active registrations limit from system settings
  const maxRegs = Number(db.settings?.maxRegistrationsPerVolunteer) || 5;
  if (activeVolRegs.length >= maxRegs) {
    return res.status(400).json({
      success: false,
      error: `Bạn đã đạt giới hạn tối đa ${maxRegs} hoạt động đăng ký cùng lúc theo quy định hệ thống!`
    });
  }

  // Check schedule conflict (Quy trình 4c)
  const newStart = new Date(act.startDate).getTime();
  const newEnd = new Date(act.endDate).getTime();
  if (!Number.isNaN(newStart) && !Number.isNaN(newEnd)) {
    for (const r of activeVolRegs) {
      const otherAct = db.activities.find((a) => a.id === r.activityId);
      if (!otherAct) continue;
      const otherStart = new Date(otherAct.startDate).getTime();
      const otherEnd = new Date(otherAct.endDate).getTime();
      if (!Number.isNaN(otherStart) && !Number.isNaN(otherEnd) && otherStart < newEnd && otherEnd > newStart) {
        return res.status(400).json({
          success: false,
          error: `Lịch trình bị trùng với hoạt động "${otherAct.title}" mà bạn đã đăng ký!`
        });
      }
    }
  }

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
    status: 'pending',
    attendanceStatus: 'not_yet',
    hoursConfirmed: 0,
    orgRejectReason: '',
    confirmedByVolunteer: false,
    ratedByVolunteer: false,
    ratedByOrg: false
  };

  db.registrations.unshift(newReg);

  act.volunteersRegistered += 1;
  if (act.volunteersRegistered >= act.volunteersNeeded) {
    act.status = 'full';
  }

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
app.post('/api/registrations/:id/cancel', requireRole('volunteer', 'admin'), (req, res) => {
  const db = getDB();
  const reg = db.registrations.find((r) => r.id === req.params.id);
  if (!reg) return res.status(404).json({ success: false, error: 'Không tìm thấy đăng ký' });
  if (req.auth.role === 'volunteer' && reg.volunteerId !== req.auth.id) {
    return res.status(403).json({ success: false, error: 'Bạn không có quyền hủy đăng ký của người khác!' });
  }
  if (reg.status === 'cancelled' || reg.status === 'rejected') {
    return res.status(400).json({ success: false, error: 'Đăng ký này đã bị hủy hoặc từ chối trước đó!' });
  }
  if (reg.attendanceStatus === 'present') {
    return res.status(400).json({ success: false, error: 'Không thể hủy đăng ký sau khi đã được điểm danh có mặt!' });
  }

  const wasApproved = reg.status === 'approved';
  reg.status = 'cancelled';

  const act = db.activities.find((a) => a.id === reg.activityId);
  if (act) {
    act.volunteersRegistered = Math.max(0, act.volunteersRegistered - 1);
    if (wasApproved) {
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
app.post('/api/registrations/:id/approve', requireRole('organization'), (req, res) => {
  const db = getDB();
  const reg = db.registrations.find((r) => r.id === req.params.id);
  if (!reg) return res.status(404).json({ success: false, error: 'Không tìm thấy đăng ký' });

  const act = db.activities.find((a) => a.id === reg.activityId);
  if (!act || act.organizationId !== req.auth.id) {
    return res.status(403).json({ success: false, error: 'Bạn không có quyền duyệt đăng ký của tổ chức khác!' });
  }
  if (reg.status !== 'pending') {
    return res.status(400).json({ success: false, error: 'Chỉ có thể duyệt đăng ký đang ở trạng thái Chờ duyệt!' });
  }

  reg.status = 'approved';
  act.volunteersApproved += 1;

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
app.post('/api/registrations/:id/reject', requireRole('organization'), (req, res) => {
  const db = getDB();
  const { reason } = req.body;
  const reg = db.registrations.find((r) => r.id === req.params.id);
  if (!reg) return res.status(404).json({ success: false, error: 'Không tìm thấy đăng ký' });

  const act = db.activities.find((a) => a.id === reg.activityId);
  if (!act || act.organizationId !== req.auth.id) {
    return res.status(403).json({ success: false, error: 'Bạn không có quyền từ chối đăng ký của tổ chức khác!' });
  }
  if (reg.status !== 'pending') {
    return res.status(400).json({ success: false, error: 'Chỉ có thể từ chối đăng ký đang ở trạng thái Chờ duyệt!' });
  }

  reg.status = 'rejected';
  reg.orgRejectReason = reason || 'Chưa phù hợp đợt tuyển này';

  act.volunteersRegistered = Math.max(0, act.volunteersRegistered - 1);
  if (act.status === 'full' && act.volunteersRegistered < act.volunteersNeeded) {
    act.status = 'recruiting';
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
app.post('/api/registrations/:id/confirm-attendance', requireRole('volunteer'), (req, res) => {
  const db = getDB();
  const reg = db.registrations.find((r) => r.id === req.params.id);
  if (!reg) return res.status(404).json({ success: false, error: 'Không tìm thấy đăng ký' });
  if (reg.volunteerId !== req.auth.id) {
    return res.status(403).json({ success: false, error: 'Bạn không có quyền xác nhận thay người khác!' });
  }
  if (reg.status !== 'approved') {
    return res.status(400).json({ success: false, error: 'Đăng ký chưa được tổ chức phê duyệt!' });
  }

  reg.confirmedByVolunteer = true;
  saveDB(db);
  res.json({ success: true, registration: reg });
});

// Điểm danh & Ghi nhận giờ công (Quy trình 6)
app.post('/api/registrations/:id/mark-attendance', requireRole('organization'), (req, res) => {
  const db = getDB();
  const { status } = req.body; // 'present' | 'absent'
  if (status !== 'present' && status !== 'absent') {
    return res.status(400).json({ success: false, error: 'Trạng thái điểm danh không hợp lệ!' });
  }

  const reg = db.registrations.find((r) => r.id === req.params.id);
  if (!reg) return res.status(404).json({ success: false, error: 'Không tìm thấy đăng ký' });

  const act = db.activities.find((a) => a.id === reg.activityId);
  if (!act || act.organizationId !== req.auth.id) {
    return res.status(403).json({ success: false, error: 'Bạn không có quyền điểm danh hoạt động của tổ chức khác!' });
  }
  if (reg.status !== 'approved') {
    return res.status(400).json({ success: false, error: 'Chỉ có thể điểm danh tình nguyện viên đã được duyệt!' });
  }
  if (act.status === 'completed' || act.status === 'cancelled') {
    return res.status(400).json({ success: false, error: 'Hoạt động đã kết thúc hoặc bị hủy, không thể thay đổi điểm danh!' });
  }

  const earnedHours = act.hoursEarned || 4;
  const isPresent = status === 'present';
  const hours = isPresent ? earnedHours : 0;

  const oldHours = reg.hoursConfirmed || 0;
  reg.attendanceStatus = status;
  reg.hoursConfirmed = hours;

  if (isPresent) {
    if (!reg.certificateCode) {
      reg.certificateCode = generateCertificateCode(reg);
    }
    if (!reg.certificateIssuedAt) {
      reg.certificateIssuedAt = new Date().toISOString().split('T')[0];
    }
  }

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
  res.json({ success: true, registration: reg, volunteer: stripPassword(vol) });
});

// ==========================================
// 5. REVIEWS & EVALUATIONS (Quy trình 7)
// ==========================================
app.get('/api/reviews', (_req, res) => {
  const db = getDB();
  res.json({ success: true, data: db.reviews });
});

// TNV đánh giá hoạt động
app.post('/api/reviews', requireRole('volunteer'), (req, res) => {
  const db = getDB();
  const { activityId, rating, comment } = req.body;
  const volunteerId = req.auth.id;

  const act = db.activities.find((a) => a.id === activityId);
  const vol = db.volunteers.find((v) => v.id === volunteerId);
  if (!act || !vol) return res.status(404).json({ success: false, error: 'Không tìm thấy dữ liệu' });

  const reg = db.registrations.find(
    (r) => r.activityId === activityId && r.volunteerId === volunteerId && r.attendanceStatus === 'present'
  );
  if (!reg) {
    return res.status(400).json({ success: false, error: 'Bạn chỉ có thể đánh giá sau khi đã được điểm danh có mặt!' });
  }
  if (reg.ratedByVolunteer) {
    return res.status(400).json({ success: false, error: 'Bạn đã đánh giá hoạt động này rồi!' });
  }

  const newRev = {
    id: `rev-${Date.now()}`,
    activityId,
    activityTitle: act.title,
    organizationId: act.organizationId,
    volunteerId: vol.id,
    volunteerName: vol.fullName,
    rating: Math.min(5, Math.max(1, Number(rating) || 5)),
    comment,
    createdAt: new Date().toISOString().split('T')[0]
  };

  db.reviews.unshift(newRev);
  reg.ratedByVolunteer = true;

  createNotification(db, {
    userId: act.organizationId,
    title: 'Nhận được đánh giá mới',
    message: `TNV ${vol.fullName} vừa đánh giá ${newRev.rating} sao cho hoạt động "${act.title}".`,
    type: 'info'
  });

  saveDB(db);
  res.status(201).json({ success: true, review: newRev });
});

// Tổ chức đánh giá TNV
app.get('/api/evaluations', (_req, res) => {
  const db = getDB();
  res.json({ success: true, data: db.volunteerEvaluations });
});

app.post('/api/evaluations', requireRole('organization'), (req, res) => {
  const db = getDB();
  const { activityId, volunteerId, rating, feedback } = req.body;
  const organizationId = req.auth.id;

  const act = db.activities.find((a) => a.id === activityId);
  if (!act || act.organizationId !== organizationId) {
    return res.status(403).json({ success: false, error: 'Bạn không có quyền đánh giá TNV của hoạt động khác!' });
  }

  const reg = db.registrations.find(
    (r) => r.activityId === activityId && r.volunteerId === volunteerId && r.attendanceStatus === 'present'
  );
  if (!reg) {
    return res.status(400).json({ success: false, error: 'Chỉ có thể đánh giá TNV đã được điểm danh có mặt!' });
  }
  if (reg.ratedByOrg) {
    return res.status(400).json({ success: false, error: 'Tình nguyện viên này đã được đánh giá cho hoạt động này!' });
  }

  const newEval = {
    id: `veval-${Date.now()}`,
    activityId,
    volunteerId,
    organizationId,
    rating: Math.min(5, Math.max(1, Number(rating) || 5)),
    feedback,
    createdAt: new Date().toISOString().split('T')[0]
  };

  db.volunteerEvaluations.unshift(newEval);
  reg.ratedByOrg = true;

  const volEvals = db.volunteerEvaluations.filter((e) => e.volunteerId === volunteerId);
  const avg = (volEvals.reduce((a, b) => a + b.rating, 0) / volEvals.length).toFixed(1);
  const vol = db.volunteers.find((v) => v.id === volunteerId);
  if (vol) vol.ratingAvg = Number(avg);

  createNotification(db, {
    userId: volunteerId,
    title: 'Đơn vị tổ chức đã đánh giá bạn',
    message: `Bạn vừa nhận được đánh giá ${newEval.rating} sao từ tổ chức: "${feedback}".`,
    type: 'success'
  });

  saveDB(db);
  res.status(201).json({ success: true, evaluation: newEval });
});

// ==========================================
// 6. VOLUNTEERS & ORGANIZATIONS MANAGEMENT
// ==========================================
app.get('/api/volunteers', (_req, res) => {
  const db = getDB();
  res.json({ success: true, data: db.volunteers.map(stripPassword) });
});

app.put('/api/volunteers/:id', requireRole('volunteer', 'admin'), (req, res) => {
  const db = getDB();
  if (req.auth.role === 'volunteer' && req.auth.id !== req.params.id) {
    return res.status(403).json({ success: false, error: 'Bạn chỉ có thể cập nhật hồ sơ của chính mình!' });
  }

  const vol = db.volunteers.find((v) => v.id === req.params.id);
  if (!vol) return res.status(404).json({ success: false, error: 'Không tìm thấy tình nguyện viên' });

  const allowedUpdates = pickAllowedFields(req.body, [
    'fullName',
    'phone',
    'dob',
    'address',
    'skills',
    'interests',
    'bio',
    'avatar'
  ]);
  Object.assign(vol, allowedUpdates);
  saveDB(db);
  res.json({ success: true, volunteer: stripPassword(vol) });
});

app.post('/api/volunteers/:id/approve', requireRole('admin'), (req, res) => {
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
  res.json({ success: true, volunteer: stripPassword(vol) });
});

app.post('/api/volunteers/:id/reject', requireRole('admin'), (req, res) => {
  const db = getDB();
  const { reason } = req.body;
  const vol = db.volunteers.find((v) => v.id === req.params.id);
  if (!vol) return res.status(404).json({ success: false, error: 'Không tìm thấy' });

  vol.status = 'rejected';
  vol.rejectReason = reason;
  saveDB(db);
  res.json({ success: true, volunteer: stripPassword(vol) });
});

app.post('/api/volunteers/:id/toggle-lock', requireRole('admin'), (req, res) => {
  const db = getDB();
  const vol = db.volunteers.find((v) => v.id === req.params.id);
  if (!vol) return res.status(404).json({ success: false, error: 'Không tìm thấy' });

  vol.status = vol.status === 'locked' ? 'approved' : 'locked';
  saveDB(db);
  res.json({ success: true, status: vol.status });
});

app.delete('/api/volunteers/:id', requireRole('admin'), (req, res) => {
  const db = getDB();
  db.volunteers = db.volunteers.filter((v) => v.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

app.get('/api/organizations', (_req, res) => {
  const db = getDB();
  res.json({ success: true, data: db.organizations.map(stripPassword) });
});

app.put('/api/organizations/:id', requireRole('organization', 'admin'), (req, res) => {
  const db = getDB();
  if (req.auth.role === 'organization' && req.auth.id !== req.params.id) {
    return res.status(403).json({ success: false, error: 'Bạn chỉ có thể cập nhật thông tin tổ chức của mình!' });
  }

  const org = db.organizations.find((o) => o.id === req.params.id);
  if (!org) return res.status(404).json({ success: false, error: 'Không tìm thấy tổ chức' });

  const allowedUpdates = pickAllowedFields(req.body, [
    'name',
    'phone',
    'address',
    'representative',
    'type',
    'website',
    'description',
    'logo'
  ]);
  Object.assign(org, allowedUpdates);
  saveDB(db);
  res.json({ success: true, organization: stripPassword(org) });
});

app.post('/api/organizations/:id/approve', requireRole('admin'), (req, res) => {
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
  res.json({ success: true, organization: stripPassword(org) });
});

app.post('/api/organizations/:id/reject', requireRole('admin'), (req, res) => {
  const db = getDB();
  const { reason } = req.body;
  const org = db.organizations.find((o) => o.id === req.params.id);
  if (!org) return res.status(404).json({ success: false, error: 'Không tìm thấy' });

  org.status = 'rejected';
  org.rejectReason = reason;
  saveDB(db);
  res.json({ success: true, organization: stripPassword(org) });
});

app.post('/api/organizations/:id/toggle-lock', requireRole('admin'), (req, res) => {
  const db = getDB();
  const org = db.organizations.find((o) => o.id === req.params.id);
  if (!org) return res.status(404).json({ success: false, error: 'Không tìm thấy' });

  org.status = org.status === 'locked' ? 'active' : 'locked';
  saveDB(db);
  res.json({ success: true, status: org.status });
});

app.delete('/api/organizations/:id', requireRole('admin'), (req, res) => {
  const db = getDB();
  db.organizations = db.organizations.filter((o) => o.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// ==========================================
// 7. CATEGORIES & LOCATIONS (Constraint checks)
// ==========================================
app.get('/api/categories', (_req, res) => {
  const db = getDB();
  res.json({ success: true, data: db.categories });
});

app.post('/api/categories', requireRole('admin'), (req, res) => {
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

app.delete('/api/categories/:id', requireRole('admin'), (req, res) => {
  const db = getDB();
  const { id } = req.params;

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

app.get('/api/locations', (_req, res) => {
  const db = getDB();
  res.json({ success: true, data: db.locations });
});

app.post('/api/locations', requireRole('admin'), (req, res) => {
  const db = getDB();
  const { name, code } = req.body;
  const newLoc = { id: `loc-${Date.now()}`, name, code };
  db.locations.push(newLoc);
  saveDB(db);
  res.status(201).json({ success: true, location: newLoc });
});

app.delete('/api/locations/:id', requireRole('admin'), (req, res) => {
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
app.get('/api/notifications', (_req, res) => {
  const db = getDB();
  res.json({ success: true, data: db.notifications });
});

app.post('/api/notifications/:id/read', requireAuth, (req, res) => {
  const db = getDB();
  const notif = db.notifications.find((n) => n.id === req.params.id);
  const targetUserId = req.auth.role === 'admin' ? 'admin' : req.auth.id;
  if (notif && notif.userId === targetUserId) {
    notif.read = true;
    saveDB(db);
  }
  res.json({ success: true });
});

app.post('/api/notifications/read-all', requireAuth, (req, res) => {
  const db = getDB();
  const targetUserId = req.auth.role === 'admin' ? 'admin' : req.auth.id;
  db.notifications.forEach((n) => {
    if (n.userId === targetUserId) n.read = true;
  });
  saveDB(db);
  res.json({ success: true });
});

// Admin Broadcast
app.post('/api/notifications/broadcast', requireRole('admin'), (req, res) => {
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
app.post('/api/notifications/send-activity', requireRole('organization'), (req, res) => {
  const db = getDB();
  const { activityId, title, message } = req.body;

  const act = db.activities.find((a) => a.id === activityId);
  if (!act) return res.status(404).json({ success: false, error: 'Không tìm thấy hoạt động' });
  if (act.organizationId !== req.auth.id) {
    return res.status(403).json({ success: false, error: 'Bạn không có quyền gửi thông báo cho hoạt động của tổ chức khác!' });
  }

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

app.get('/api/feedbacks', (_req, res) => {
  const db = getDB();
  res.json({ success: true, data: db.feedbacks });
});

app.post('/api/feedbacks', requireRole('volunteer', 'organization'), (req, res) => {
  const db = getDB();
  const { targetType, title, content } = req.body;
  const sender =
    req.auth.role === 'volunteer'
      ? db.volunteers.find((v) => v.id === req.auth.id)
      : db.organizations.find((o) => o.id === req.auth.id);

  const newFb = {
    id: `fb-${Date.now()}`,
    volunteerId: req.auth.id,
    volunteerName: sender?.fullName || sender?.name || req.body.volunteerName || 'Người dùng',
    volunteerEmail: sender?.email || req.body.volunteerEmail || '',
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

app.post('/api/feedbacks/:id/resolve', requireRole('admin'), (req, res) => {
  const db = getDB();
  const { adminNote } = req.body || {};
  const fb = db.feedbacks.find((f) => f.id === req.params.id);
  if (!fb) return res.status(404).json({ success: false, error: 'Không tìm thấy phản hồi!' });

  fb.status = 'resolved';
  fb.adminNote = (adminNote || '').trim() || 'Ban Quản trị đã tiếp nhận và xử lý phản hồi của bạn.';
  fb.resolvedAt = new Date().toISOString().split('T')[0];

  if (fb.volunteerId) {
    createNotification(db, {
      userId: fb.volunteerId,
      title: 'Phản hồi / khiếu nại của bạn đã được xử lý',
      message: `Phản hồi "${fb.title}" đã được Ban Quản trị giải quyết: ${fb.adminNote}`,
      type: 'success'
    });
  }

  saveDB(db);
  res.json({ success: true, feedback: fb });
});

// ==========================================
// 9. SETTINGS
// ==========================================
app.get('/api/settings', (_req, res) => {
  const db = getDB();
  res.json({ success: true, data: db.settings });
});

app.put('/api/settings', requireRole('admin'), (req, res) => {
  const db = getDB();
  const allowed = pickAllowedFields(req.body, [
    'defaultApprovalDays',
    'maxRegistrationsPerVolunteer',
    'generalGuidelines'
  ]);
  db.settings = { ...db.settings, ...allowed };
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
