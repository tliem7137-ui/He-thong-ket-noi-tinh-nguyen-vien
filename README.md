# V-Connect - HỆ THỐNG KẾT NỐI TÌNH NGUYỆN VIÊN (FULLSTACK)

Hệ thống Fullstack hoàn chỉnh (Backend REST API Express + Frontend React) phục vụ công tác kết nối, quản lý và xác thực hoạt động tình nguyện xã hội theo đúng báo cáo phân tích đề tài.

---

## 📋 Danh Sách Tài Khoản Mẫu Để Đăng Nhập & Kiểm Thử

Khi truy cập vào hệ thống tại **`http://localhost:5173/`**, trang web mặc định ở **View Khách (Guest View)**. Bạn bấm vào nút **"Đăng Nhập"** ở góc trên bên phải thanh Navbar, hoặc truy cập trực tiếp đường dẫn **`/login`**, chọn tab vai trò tương ứng và nhập thông tin tài khoản dưới đây:

### 1. 🎓 Nhóm Tình Nguyện Viên (Tab: Tình Nguyện Viên)

| Họ và Tên | Email Đăng Nhập | Mật Khẩu | Trạng Thái Hồ Sơ | Ghi Chú Dữ Liệu Sẵn Có |
| :--- | :--- | :---: | :---: | :--- |
| **Nguyễn Văn An** | `nguyenvanan@gmail.com` | `123456` | **Đã duyệt** | Đã tích lũy **24 giờ công**, hoàn thành 4 hoạt động, đã có sẵn Giấy chứng nhận điện tử để in. |
| **Trần Thị Mai** | `tranmai99@gmail.com` | `123456` | **Đã duyệt** | Đã tích lũy **36 giờ công**, hoàn thành 6 hoạt động, đánh giá 5.0 sao. |
| **Lê Hoàng Long** | `hoanglong.le@gmail.com` | `123456` | **Đã duyệt** | Đã tích lũy **16 giờ công**, kỹ năng cứu hộ nước, thể lực tốt. |
| **Phạm Quỳnh Chi** | `quynhchi.volunteer@gmail.com` | `123456` | **Chờ duyệt** | Tài khoản mới đăng ký, dùng để kiểm thử luồng Admin duyệt hồ sơ TNV mới (Quy trình 1). |

---

### 2. 🏢 Nhóm Đơn Vị Tổ Chức (Tab: Đơn Vị Tổ Chức)

| Tên Tổ Chức | Email Đăng Nhập | Mật Khẩu | Trạng Thái Pháp Lý | Ghi Chú & Hoạt Động |
| :--- | :--- | :---: | :---: | :--- |
| **Quỹ Tình Nguyện Xanh (Green Life)** | `contact@greenlife.vn` | `123456` | **Đã xác minh** | GP-892/BNV-2021. Đơn vị tổ chức chiến dịch dọn rác biển Vũng Tàu, trồng rừng ngập mặn Cần Giờ. Dùng để test luồng: Duyệt TNV, Điểm danh, Đánh giá TNV. |
| **Hội Chữ Thập Đỏ Thanh Niên** | `info@redcrossyouth.org.vn` | `123456` | **Đã xác minh** | CTD-334/QĐ-TW. Tổ chức ngày hội hiến máu Giọt hồng trao đi, tập huấn sơ cấp cứu. |
| **Dự án Ánh Sáng Tri Thức Vùng Cao** | `anhsangtrithuc@gmail.com` | `123456` | **Đã xác minh** | CLB-556/HSV-ĐHQG. Dự án xây thư viện sách & dạy tin học Mèo Vạc (Hà Giang). |
| **CLB Kết Nối Trái Tim Đà Nẵng** | `ketnoitraitimdn@gmail.com` | `123456` | **Chờ duyệt** | ĐK-8812/UBND-DN. Hồ sơ tổ chức mới nộp, dùng để test luồng Admin xác minh pháp lý tổ chức mới. |

---

### 3. 👑 Quản Trị Viên Hệ Thống (Cổng Admin Riêng Biệt Qua URL Bảo Mật)

Nhằm bảo vệ hệ thống tuyệt đối (không để lộ bất kỳ liên kết hay nút nào ở Footer):
- **Đường dẫn truy cập trực tiếp:** `http://localhost:5173/admin/login` (hoặc `http://localhost:3000/admin/login`)
- **Tài khoản đăng nhập tiêu chuẩn:**
  - Email: `admin@vconnect.vn`
  - Mật khẩu: `admin123`
- **Mã Khôi Phục Dự Phòng (Emergency Recovery Code):**
  - Nhập mã: `VCADM-2026-RECOVERY` (có thể bấm "Dùng mã khôi phục dự phòng" trên form để đăng nhập trực tiếp).

---

## 🛡️ Cơ Chế Bảo Mật & Xác Thực Mới

1. **Phân tách đường dẫn đăng nhập:**
   - **Người dùng (TNV & Tổ chức):** `http://localhost:5173/login` (hoặc nút "Đăng Nhập" trên Navbar).
   - **Quản trị viên (Admin):** `http://localhost:5173/admin/login` (đã loại bỏ hoàn toàn nút ở Footer).

2. **Cơ chế khóa đăng nhập tạm thời (Rate Limiting chống dò quét):**
   - **Nhập sai email hoặc mật khẩu (dưới 5 lần):**
     > **Đăng nhập không thành công**  
     > Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại thông tin đăng nhập.
   - **Nhập sai liên tiếp 5 lần:**
     > **Yêu cầu đăng nhập tạm thời bị hạn chế**  
     > Hệ thống hiện không thể xử lý yêu cầu đăng nhập của bạn. Vui lòng thử lại sau.  
     > Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ bộ phận hỗ trợ.

3. **Tính năng "Không thể đăng nhập?" (Khôi phục quyền truy cập):**
   - Nằm ngay dưới nút "Đăng Nhập".
   - Bước 1: Nhập email đã đăng ký -> Bấm **"Tiếp Tục Xác Minh"**.
   - Bước 2: Nhập mã xác minh 6 số (Mã demo: **`123456`**) -> Hệ thống tự động xác minh và đăng nhập vào tài khoản ngay lập tức.

4. **Xác minh OTP khi Đăng ký mới:**
   - **Tình nguyện viên:** Sau khi điền form đăng ký, nhập mã OTP (Mã demo: **`111111`**) -> Tài khoản được kích hoạt thành công để đăng nhập và tham gia hoạt động ngay.
   - **Đơn vị Tổ chức:** Sau khi điền form đăng ký, nhập mã OTP (Mã demo: **`111111`**) -> Xác minh email thành công, hồ sơ chuyển sang trạng thái **"Chờ duyệt"** để Admin thẩm định pháp lý theo đúng quy trình.

---

## 🏗️ Kiến Trúc Hệ Thống Fullstack

### 1. Backend REST API (Node.js & Express)
- **Cổng dịch vụ**: `http://localhost:5000`
- **Cơ sở dữ liệu lưu trữ**: File-based JSON Database với tính năng tự động khởi tạo và lưu trữ liên tục tại `server/data/database.json`.
- **Hệ thống RESTful API**:
  - `POST /api/auth/login`: Xác thực đăng nhập TNV / Tổ chức với Rate Limit.
  - `POST /api/auth/admin-login`: Xác thực Quản trị viên với mật khẩu hoặc mã khôi phục dự phòng.
  - `POST /api/auth/forgot-password`: Yêu cầu mã khôi phục qua email.
  - `POST /api/auth/verify-otp`: Xác thực mã OTP (mã demo `123456`) để đăng nhập khẩn cấp.
  - `POST /api/auth/verify-register-otp`: Xác thực mã OTP (mã demo `111111`) để hoàn tất đăng ký.
  - `GET /api/activities`: Lấy danh sách hoạt động công khai.
  - `POST /api/activities`: Tạo hoạt động thiện nguyện mới (chờ Admin duyệt theo Quy trình 3).
  - `POST /api/activities/:id/cancel`: Hủy hoạt động kèm lý do, tự động gửi thông báo đến toàn bộ TNV đã đăng ký.
  - `POST /api/activities/:id/toggle-recruiting`: Đóng/mở tuyển TNV sớm.
  - `POST /api/activities/:id/approve` / `reject`: Admin duyệt hoặc từ chối kiểm duyệt hoạt động.
  - `POST /api/registrations`: TNV đăng ký tham gia (kiểm tra còn slot, tài khoản đã duyệt, kiểm tra không trùng lịch).
  - `POST /api/registrations/:id/approve` / `reject`: Tổ chức xét duyệt hoặc từ chối kèm lý do (Quy trình 5).
  - `POST /api/registrations/:id/mark-attendance`: Tổ chức điểm danh Có mặt / Vắng mặt. Khi Có mặt, tự động cộng số giờ công vào hồ sơ cá nhân của TNV (Quy trình 6).
  - `POST /api/reviews`: TNV chấm điểm 1-5 sao và viết nhận xét về khâu tổ chức (Quy trình 7).
  - `POST /api/evaluations`: Tổ chức đánh giá năng lực, thái độ của TNV (Quy trình 7).
  - `POST /api/categories`: Quản lý danh mục lĩnh vực (Có ràng buộc: không cho xóa nếu đang có hoạt động dùng).
  - `POST /api/notifications/broadcast`: Quản trị viên phát thông báo toàn server (Quy trình 8).
  - `POST /api/feedbacks`: Tiếp nhận khiếu nại, phản ánh của người dùng.
  - `POST /api/system/reset`: Khôi phục toàn bộ dữ liệu máy chủ về trạng thái ban đầu.

### 2. Frontend (React 19 + Tailwind CSS v4 + Lucide Icons)
- **Cổng giao diện**: `http://localhost:5173`
- **Vite Proxy**: Tự động chuyển tiếp toàn bộ request `/api/*` sang Backend port 5000.
- **Giấy chứng nhận giờ công điện tử**: Xuất chứng nhận chính thức kèm mã xác thực điện tử và chức năng in trực tiếp.

---

## 🚀 Hướng Dẫn Khởi Chạy

```bash
# Khởi chạy đồng thời cả Backend (5000) và Frontend (5173):
npm run dev

# Hoặc khởi chạy riêng:
npm run server   # Khởi chạy Express Backend API tại http://localhost:5000
npm run client   # Khởi chạy Vite Frontend tại http://localhost:5173
```
