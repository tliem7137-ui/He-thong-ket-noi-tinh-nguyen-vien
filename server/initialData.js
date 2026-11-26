// Dữ liệu ban đầu chuẩn cho Backend REST API Hệ thống Kết nối Tình nguyện viên (V-Connect)

export const initialCategories = [
  { id: 'cat-1', name: 'Bảo vệ Môi trường', icon: 'Leaf', description: 'Trồng cây, dọn rác, tái chế, bảo tồn đa dạng sinh học' },
  { id: 'cat-2', name: 'Giáo dục & Trẻ em', icon: 'GraduationCap', description: 'Dạy học vùng cao, phổ cập tin học, tặng sách, hỗ trợ trẻ em khó khăn' },
  { id: 'cat-3', name: 'Y tế & Sức khỏe', icon: 'HeartPulse', description: 'Hiến máu nhân đạo, khám bệnh từ thiện, phát thuốc miễn phí' },
  { id: 'cat-4', name: 'Cứu trợ Khẩn cấp', icon: 'LifeBuoy', description: 'Cứu trợ lũ lụt, bão, hỏa hoạn, hỗ trợ vùng thiên tai' },
  { id: 'cat-5', name: 'Chăm sóc Người già & Khuyết tật', icon: 'HandHeart', description: 'Thăm viện dưỡng lão, hỗ trợ người khuyết tật hòa nhập cộng đồng' },
  { id: 'cat-6', name: 'Văn hóa & Cộng đồng', icon: 'Users', description: 'Bảo tồn văn hóa, các sự kiện thiện nguyện cộng đồng' }
];

export const initialLocations = [
  { id: 'loc-1', name: 'Hà Nội', code: 'HN' },
  { id: 'loc-2', name: 'TP. Hồ Chí Minh', code: 'HCM' },
  { id: 'loc-3', name: 'Đà Nẵng', code: 'DN' },
  { id: 'loc-4', name: 'Thừa Thiên Huế', code: 'HUE' },
  { id: 'loc-5', name: 'Bà Rịa - Vũng Tàu', code: 'VT' },
  { id: 'loc-6', name: 'Hà Giang', code: 'HG' },
  { id: 'loc-7', name: 'Cần Thơ', code: 'CT' },
  { id: 'loc-8', name: 'Lâm Đồng (Đà Lạt)', code: 'LD' }
];

export const initialOrganizations = [
  {
    id: 'org-1',
    name: 'Quỹ Tình Nguyện Xanh (Green Life Vietnam)',
    email: 'contact@greenlife.vn',
    password: '123456',
    phone: '0903123456',
    address: '45 Nguyễn Thị Minh Khai, Quận 1, TP. Hồ Chí Minh',
    representative: 'Trần Minh Quân',
    type: 'Tổ chức phi lợi nhuận (NGO)',
    licenseNumber: 'GP-892/BNV-2021',
    description: 'Chuyên các hoạt động phục hồi rừng, dọn sạch bãi biển và giáo dục lối sống xanh cho thanh niên.',
    website: 'https://greenlife.vn',
    logo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    verifiedAt: '2025-01-15'
  },
  {
    id: 'org-2',
    name: 'Hội Chữ Thập Đỏ Thanh Niên',
    email: 'info@redcrossyouth.org.vn',
    password: '123456',
    phone: '02438221199',
    address: '88 Bà Triệu, Hoàn Kiếm, Hà Nội',
    representative: 'Lê Thị Thu Hương',
    type: 'Tổ chức xã hội - nhân đạo',
    licenseNumber: 'CTD-334/QĐ-TW',
    description: 'Tổ chức các phong trào hiến máu nhân đạo, sơ cứu cộng đồng và cứu trợ bà con chịu ảnh hưởng bởi lũ lụt.',
    website: 'https://redcrossyouth.org.vn',
    logo: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    verifiedAt: '2025-02-10'
  },
  {
    id: 'org-3',
    name: 'Dự án Ánh Sáng Tri Thức Vùng Cao',
    email: 'anhsangtrithuc@gmail.com',
    password: '123456',
    phone: '0912456789',
    address: 'Khu Đô thị Mỹ Đình 2, Nam Từ Liêm, Hà Nội',
    representative: 'Hoàng Văn Bách',
    type: 'Câu lạc bộ tình nguyện sinh viên',
    licenseNumber: 'CLB-556/HSV-ĐHQG',
    description: 'Đưa giáo dục, thư viện sách và dạy học tin học tới trẻ em các điểm trường vùng sâu vùng xa Hà Giang, Lào Cai.',
    website: 'https://anhsangtrithuc.edu.vn',
    logo: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    verifiedAt: '2025-03-01'
  },
  {
    id: 'org-4',
    name: 'CLB Kết Nối Trái Tim Đà Nẵng',
    email: 'ketnoitraitimdn@gmail.com',
    password: '123456',
    phone: '0935112233',
    address: '120 Nguyễn Văn Linh, Hải Châu, Đà Nẵng',
    representative: 'Phạm Thanh Bình',
    type: 'Tổ chức từ thiện độc lập',
    licenseNumber: 'ĐK-8812/UBND-DN',
    description: 'Chăm sóc và tặng quà cho người già neo đơn, trẻ mồ côi tại các trung tâm bảo trợ xã hội miền Trung.',
    website: 'https://ketnoitraitim.org',
    logo: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?w=150&auto=format&fit=crop&q=80',
    status: 'pending',
    verifiedAt: null
  }
];

export const initialVolunteers = [
  {
    id: 'vol-1',
    fullName: 'Nguyễn Văn An',
    email: 'nguyenvanan@gmail.com',
    password: '123456',
    phone: '0987654321',
    dob: '2003-05-18',
    address: 'Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    skills: ['Sơ cấp cứu cơ bản', 'Giao tiếp tiếng Anh tốt', 'Chụp ảnh & Quay video', 'Nấu ăn tập thể'],
    interests: ['Bảo vệ Môi trường', 'Y tế & Sức khỏe', 'Giáo dục & Trẻ em'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'approved',
    totalHours: 24,
    completedActivitiesCount: 4,
    ratingAvg: 4.9,
    bio: 'Sinh viên năm 3 ĐHQG HCM, đam mê các chiến dịch mùa hè xanh và bảo vệ thiên nhiên.',
    registeredAt: '2025-01-20'
  },
  {
    id: 'vol-2',
    fullName: 'Trần Thị Mai',
    email: 'tranmai99@gmail.com',
    password: '123456',
    phone: '0978112233',
    dob: '2001-11-04',
    address: 'Cầu Giấy, Hà Nội',
    skills: ['Dạy học Toán & Văn', 'Hoạt náo viên', 'Hậu cần sự kiện', 'Sử dụng máy tính thành thạo'],
    interests: ['Giáo dục & Trẻ em', 'Cứu trợ Khẩn cấp'],
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    status: 'approved',
    totalHours: 36,
    completedActivitiesCount: 6,
    ratingAvg: 5.0,
    bio: 'Giáo viên trẻ, mong muốn dùng thời gian cuối tuần mang kiến thức tới các em nhỏ vùng cao.',
    registeredAt: '2025-02-05'
  },
  {
    id: 'vol-3',
    fullName: 'Lê Hoàng Long',
    email: 'hoanglong.le@gmail.com',
    password: '123456',
    phone: '0918776655',
    dob: '2004-08-22',
    address: 'Sơn Trà, Đà Nẵng',
    skills: ['Kỹ năng bơi lội & cứu hộ nước', 'Lái xe B2', 'Thể lực tốt'],
    interests: ['Cứu trợ Khẩn cấp', 'Bảo vệ Môi trường'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'approved',
    totalHours: 16,
    completedActivitiesCount: 2,
    ratingAvg: 4.8,
    bio: 'Thành viên đội cứu hộ bờ biển trẻ, luôn sẵn sàng khi miền Trung cần cứu trợ.',
    registeredAt: '2025-03-10'
  },
  {
    id: 'vol-4',
    fullName: 'Phạm Quỳnh Chi',
    email: 'quynhchi.volunteer@gmail.com',
    password: '123456',
    phone: '0945998877',
    dob: '2005-02-14',
    address: 'Hải Châu, Đà Nẵng',
    skills: ['Vẽ tranh & thủ công mỹ thuật', 'Ca hát'],
    interests: ['Chăm sóc Người già & Khuyết tật'],
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    status: 'pending',
    totalHours: 0,
    completedActivitiesCount: 0,
    ratingAvg: 0,
    bio: 'Mới biết đến hệ thống, hy vọng được tham gia đóng góp cho các cụ già neo đơn.',
    registeredAt: '2026-11-20'
  }
];

export const initialActivities = [
  {
    id: 'act-1',
    title: 'Chiến Dịch Làm Sạch Biển Vũng Tàu - Đại Dương Không Rác Thải',
    organizationId: 'org-1',
    organizationName: 'Quỹ Tình Nguyện Xanh (Green Life Vietnam)',
    categoryId: 'cat-1',
    categoryName: 'Bảo vệ Môi trường',
    locationId: 'loc-5',
    locationName: 'Bà Rịa - Vũng Tàu',
    specificAddress: 'Bãi Sau, TP. Vũng Tàu (Tập trung tại Đài Liệt Sĩ)',
    startDate: '2026-11-28T07:00',
    endDate: '2026-11-28T12:00',
    hoursEarned: 5,
    volunteersNeeded: 50,
    volunteersRegistered: 42,
    volunteersApproved: 38,
    status: 'recruiting',
    approvalStatus: 'approved',
    description: 'Chung tay cùng Quỹ Tình Nguyện Xanh thu gom và phân loại hơn 2 tấn rác thải nhựa tại bờ biển Vũng Tàu. Hướng tới đại dương xanh sạch đẹp.',
    requirements: 'Có sức khỏe tốt, tinh thần nhiệt huyết, tự chuẩn bị mũ nón và bình nước cá nhân để hạn chế rác phát sinh.',
    benefits: 'Được cấp chứng nhận 5 giờ tình nguyện chính thức, áo đồng phục Green Life, bao tay bảo hộ, suất ăn nhẹ và nước giải khát.',
    banner: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop&q=80',
    shifts: [
      { id: 'shift-1-1', name: 'Ca sáng thu gom & phân loại rác', time: '07:00 - 12:00 (28/11/2026)' }
    ],
    createdAt: '2026-11-10'
  },
  {
    id: 'act-2',
    title: 'Ngày Hội Hiến Máu Tình Nguyện - Giọt Hồng Trao Đi, Hy Vọng Ở Lại',
    organizationId: 'org-2',
    organizationName: 'Hội Chữ Thập Đỏ Thanh Niên',
    categoryId: 'cat-3',
    categoryName: 'Y tế & Sức khỏe',
    locationId: 'loc-1',
    locationName: 'Hà Nội',
    specificAddress: 'Viện Huyết học - Truyền máu Trung ương, Phạm Văn Bạch, Cầu Giấy, Hà Nội',
    startDate: '2026-12-05T07:30',
    endDate: '2026-12-05T16:30',
    hoursEarned: 8,
    volunteersNeeded: 30,
    volunteersRegistered: 28,
    volunteersApproved: 25,
    status: 'recruiting',
    approvalStatus: 'approved',
    description: 'Hỗ trợ công tác tiếp đón người hiến máu, điều phối xếp hàng, phát quà và hỗ trợ chăm sóc người sau hiến máu.',
    requirements: 'Kỹ năng giao tiếp nhẹ nhàng, cẩn thận, biết sơ cấp cứu cơ bản là lợi thế lớn.',
    benefits: 'Chứng nhận 8 giờ tình nguyện cấp bởi Viện Huyết học & Hội CTĐ, ăn trưa miễn phí, quà tặng lưu niệm.',
    banner: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&auto=format&fit=crop&q=80',
    shifts: [
      { id: 'shift-2-1', name: 'Ca cả ngày điều phối hiến máu', time: '07:30 - 16:30 (05/12/2026)' }
    ],
    createdAt: '2026-11-12'
  },
  {
    id: 'act-3',
    title: 'Xây Dựng Thư Viện Sách & Dạy Tin Học Cơ Bản Cho Trẻ Em Mèo Vạc',
    organizationId: 'org-3',
    organizationName: 'Dự án Ánh Sáng Tri Thức Vùng Cao',
    categoryId: 'cat-2',
    categoryName: 'Giáo dục & Trẻ em',
    locationId: 'loc-6',
    locationName: 'Hà Giang',
    specificAddress: 'Điểm trường Tiểu học Pải Lủng, Mèo Vạc, Hà Giang',
    startDate: '2026-12-18T06:00',
    endDate: '2026-12-20T18:00',
    hoursEarned: 24,
    volunteersNeeded: 15,
    volunteersRegistered: 15,
    volunteersApproved: 15,
    status: 'full',
    approvalStatus: 'approved',
    description: 'Chuyến xe thiện nguyện 3 ngày 2 đêm lên vùng cao mang theo 1.500 đầu sách, lắp ráp 10 máy tính cũ và hướng dẫn các em học sinh tiểu học tiếp cận thế giới tri thức số.',
    requirements: 'Kỹ năng sư phạm hoặc công nghệ thông tin, chịu khó thích nghi thời tiết lạnh vùng cao.',
    benefits: 'Chứng nhận 24 giờ tình nguyện, kỷ niệm chương Ánh Sáng Tri Thức, hỗ trợ toàn bộ xe đi lại và ăn ở suốt chuyến đi.',
    banner: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
    shifts: [
      { id: 'shift-3-1', name: 'Chuyến công tác Hà Giang 3 ngày 2 đêm', time: '18/12 - 20/12/2026' }
    ],
    createdAt: '2026-11-01'
  },
  {
    id: 'act-4',
    title: 'Bữa Cơm Yêu Thương & Giao Lưu Văn Nghệ Tại Viện Dưỡng Lão',
    organizationId: 'org-1',
    organizationName: 'Quỹ Tình Nguyện Xanh (Green Life Vietnam)',
    categoryId: 'cat-5',
    categoryName: 'Chăm sóc Người già & Khuyết tật',
    locationId: 'loc-2',
    locationName: 'TP. Hồ Chí Minh',
    specificAddress: 'Viện Dưỡng Lão Thị Nghè, Bình Thạnh, TP.HCM',
    startDate: '2026-11-15T08:00',
    endDate: '2026-11-15T14:00',
    hoursEarned: 6,
    volunteersNeeded: 20,
    volunteersRegistered: 20,
    volunteersApproved: 20,
    status: 'completed',
    approvalStatus: 'approved',
    description: 'Nấu 120 suất ăn bổ dưỡng, dọn dẹp khuôn viên viện dưỡng lão và tổ chức chương trình giao lưu văn nghệ, chuyện trò cùng các cụ già.',
    requirements: 'Biết nấu ăn hoặc có khả năng ca hát, đàn hát, lòng kiên nhẫn và sự lễ phép.',
    benefits: 'Đã hoàn thành và xác nhận 6 giờ công tình nguyện vào hồ sơ cá nhân.',
    banner: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&auto=format&fit=crop&q=80',
    shifts: [
      { id: 'shift-4-1', name: 'Ca nấu cơm & văn nghệ', time: '08:00 - 14:00 (15/11/2026)' }
    ],
    createdAt: '2026-10-25'
  },
  {
    id: 'act-5',
    title: 'Trồng 1.000 Cây Xanh Phòng Hộ Rừng Ngập Mặn Cần Giờ',
    organizationId: 'org-1',
    organizationName: 'Quỹ Tình Nguyện Xanh (Green Life Vietnam)',
    categoryId: 'cat-1',
    categoryName: 'Bảo vệ Môi trường',
    locationId: 'loc-2',
    locationName: 'TP. Hồ Chí Minh',
    specificAddress: 'Khu Dự trữ Sinh quyển Rừng ngập mặn Cần Giờ, TP.HCM',
    startDate: '2026-12-12T06:30',
    endDate: '2026-12-12T16:00',
    hoursEarned: 8,
    volunteersNeeded: 40,
    volunteersRegistered: 12,
    volunteersApproved: 10,
    status: 'recruiting',
    approvalStatus: 'approved',
    description: 'Cùng trồng cây Đước, Mắm ven cửa sông để giữ đất, chống xói lở và hấp thụ carbon.',
    requirements: 'Không say xe buýt, không ngại lội bùn, sức khỏe dẻo dai.',
    benefits: 'Áo thun kỷ niệm, ủng lội bùn, chứng nhận 8 giờ tình nguyện và bữa trưa hải sản Cần Giờ.',
    banner: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
    shifts: [
      { id: 'shift-5-1', name: 'Ca trồng rừng một ngày trọn vẹn', time: '06:30 - 16:00 (12/12/2026)' }
    ],
    createdAt: '2026-11-15'
  },
  {
    id: 'act-6',
    title: 'Tập Huấn Sơ Cứu Ban Đầu và Phòng Chống Đuối Nước Cho Học Sinh',
    organizationId: 'org-2',
    organizationName: 'Hội Chữ Thập Đỏ Thanh Niên',
    categoryId: 'cat-3',
    categoryName: 'Y tế & Sức khỏe',
    locationId: 'loc-3',
    locationName: 'Đà Nẵng',
    specificAddress: 'Trường THCS Lê Quý Đôn, Hải Châu, Đà Nẵng',
    startDate: '2026-12-25T08:00',
    endDate: '2026-12-25T11:30',
    hoursEarned: 4,
    volunteersNeeded: 15,
    volunteersRegistered: 0,
    volunteersApproved: 0,
    status: 'pending_approval',
    approvalStatus: 'pending',
    description: 'Chương trình diễn tập sơ cấp cứu khi bị hóc dị vật, ngừng tim thở và cứu nạn khi gặp sự cố đuối nước.',
    requirements: 'Sinh viên ngành y hoặc tình nguyện viên đã có chứng chỉ sơ cấp cứu.',
    benefits: 'Cộng 4 giờ tình nguyện, giấy chứng nhận tập huấn viên cộng đồng.',
    banner: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
    shifts: [
      { id: 'shift-6-1', name: 'Buổi tập huấn buổi sáng', time: '08:00 - 11:30 (25/12/2026)' }
    ],
    createdAt: '2026-11-21'
  }
];

export const initialRegistrations = [
  {
    id: 'reg-1',
    activityId: 'act-1',
    activityTitle: 'Chiến Dịch Làm Sạch Biển Vũng Tàu - Đại Dương Không Rác Thải',
    volunteerId: 'vol-1',
    volunteerName: 'Nguyễn Văn An',
    volunteerEmail: 'nguyenvanan@gmail.com',
    volunteerPhone: '0987654321',
    volunteerSkills: ['Sơ cấp cứu cơ bản', 'Giao tiếp tiếng Anh tốt'],
    registeredDate: '2026-11-12',
    message: 'Em đã có kinh nghiệm dọn rác bãi biển ở Cần Giờ năm ngoái, rất hào hứng tham gia cùng Green Life!',
    status: 'approved',
    attendanceStatus: 'not_yet',
    hoursConfirmed: 0,
    orgRejectReason: '',
    confirmedByVolunteer: true,
    ratedByVolunteer: false,
    ratedByOrg: false
  },
  {
    id: 'reg-2',
    activityId: 'act-2',
    activityTitle: 'Ngày Hội Hiến Máu Tình Nguyện - Giọt Hồng Trao Đi, Hy Vọng Ở Lại',
    volunteerId: 'vol-1',
    volunteerName: 'Nguyễn Văn An',
    volunteerEmail: 'nguyenvanan@gmail.com',
    volunteerPhone: '0987654321',
    volunteerSkills: ['Sơ cấp cứu cơ bản', 'Giao tiếp tiếng Anh tốt'],
    registeredDate: '2026-11-18',
    message: 'Em mong muốn hỗ trợ khu vực đón tiếp và sơ cứu người hiến máu.',
    status: 'pending',
    attendanceStatus: 'not_yet',
    hoursConfirmed: 0,
    orgRejectReason: '',
    confirmedByVolunteer: false,
    ratedByVolunteer: false,
    ratedByOrg: false
  },
  {
    id: 'reg-3',
    activityId: 'act-4',
    activityTitle: 'Bữa Cơm Yêu Thương & Giao Lưu Văn Nghệ Tại Viện Dưỡng Lão',
    volunteerId: 'vol-1',
    volunteerName: 'Nguyễn Văn An',
    volunteerEmail: 'nguyenvanan@gmail.com',
    volunteerPhone: '0987654321',
    volunteerSkills: ['Nấu ăn tập thể', 'Chụp ảnh & Quay video'],
    registeredDate: '2026-10-28',
    message: 'Em có thể hỗ trợ khâu nấu nướng và chụp ảnh lưu niệm cho các cụ.',
    status: 'approved',
    attendanceStatus: 'present',
    hoursConfirmed: 6,
    orgRejectReason: '',
    confirmedByVolunteer: true,
    ratedByVolunteer: true,
    ratedByOrg: true
  },
  {
    id: 'reg-4',
    activityId: 'act-1',
    activityTitle: 'Chiến Dịch Làm Sạch Biển Vũng Tàu - Đại Dương Không Rác Thải',
    volunteerId: 'vol-2',
    volunteerName: 'Trần Thị Mai',
    volunteerEmail: 'tranmai99@gmail.com',
    volunteerPhone: '0978112233',
    volunteerSkills: ['Dạy học Toán & Văn', 'Hoạt náo viên'],
    registeredDate: '2026-11-14',
    message: 'Tôi muốn tham gia hoạt náo và gom rác cùng các bạn sinh viên.',
    status: 'approved',
    attendanceStatus: 'not_yet',
    hoursConfirmed: 0,
    orgRejectReason: '',
    confirmedByVolunteer: true,
    ratedByVolunteer: false,
    ratedByOrg: false
  },
  {
    id: 'reg-5',
    activityId: 'act-1',
    activityTitle: 'Chiến Dịch Làm Sạch Biển Vũng Tàu - Đại Dương Không Rác Thải',
    volunteerId: 'vol-3',
    volunteerName: 'Lê Hoàng Long',
    volunteerEmail: 'hoanglong.le@gmail.com',
    volunteerPhone: '0918776655',
    volunteerSkills: ['Kỹ năng bơi lội & cứu hộ nước', 'Thể lực tốt'],
    registeredDate: '2026-11-19',
    message: 'Em đăng ký tham gia hỗ trợ an toàn ven bờ biển ạ.',
    status: 'pending',
    attendanceStatus: 'not_yet',
    hoursConfirmed: 0,
    orgRejectReason: '',
    confirmedByVolunteer: false,
    ratedByVolunteer: false,
    ratedByOrg: false
  }
];

export const initialReviews = [
  {
    id: 'rev-1',
    activityId: 'act-4',
    activityTitle: 'Bữa Cơm Yêu Thương & Giao Lưu Văn Nghệ Tại Viện Dưỡng Lão',
    organizationId: 'org-1',
    volunteerId: 'vol-1',
    volunteerName: 'Nguyễn Văn An',
    rating: 5,
    comment: 'Chương trình được tổ chức cực kỳ chu đáo và ấm cúng. Nhìn nụ cười của các cụ già mà bao mệt nhọc tan biến. BTC phân công công việc rõ ràng, hậu cần rất tốt!',
    createdAt: '2026-11-16'
  }
];

export const initialVolunteerEvaluations = [
  {
    id: 'veval-1',
    activityId: 'act-4',
    volunteerId: 'vol-1',
    organizationId: 'org-1',
    rating: 5,
    feedback: 'Bạn An rất chủ động trong công việc, nấu ăn ngon, hòa đồng và lễ phép với các cụ già tại viện dưỡng lão. Cảm ơn sự cống hiến của bạn!',
    createdAt: '2026-11-16'
  }
];

export const initialNotifications = [
  {
    id: 'notif-1',
    userId: 'vol-1',
    title: 'Đăng ký đã được duyệt!',
    message: 'Tổ chức Green Life Vietnam đã duyệt đăng ký của bạn cho hoạt động: "Chiến Dịch Làm Sạch Biển Vũng Tàu". Hãy xác nhận tham gia trước ngày 26/11.',
    type: 'success',
    read: false,
    createdAt: '2026-11-20T10:30'
  },
  {
    id: 'notif-2',
    userId: 'vol-1',
    title: 'Xác nhận giờ công tình nguyện thành công',
    message: 'Bạn đã được xác nhận 6 giờ tình nguyện cho hoạt động: "Bữa Cơm Yêu Thương Tại Viện Dưỡng Lão". Giấy chứng nhận điện tử đã sẵn sàng trong hồ sơ!',
    type: 'info',
    read: true,
    createdAt: '2026-11-16T15:00'
  },
  {
    id: 'notif-3',
    userId: 'org-1',
    title: 'Có tình nguyện viên mới đăng ký',
    message: 'Tình nguyện viên Lê Hoàng Long vừa gửi yêu cầu đăng ký tham gia "Chiến Dịch Làm Sạch Biển Vũng Tàu". Vui lòng xét duyệt.',
    type: 'info',
    read: false,
    createdAt: '2026-11-19T14:20'
  },
  {
    id: 'notif-4',
    userId: 'admin',
    title: 'Yêu cầu duyệt tổ chức mới',
    message: 'Tổ chức "CLB Kết Nối Trái Tim Đà Nẵng" vừa nộp hồ sơ đăng ký và đang chờ Admin phê duyệt pháp lý.',
    type: 'warning',
    read: false,
    createdAt: '2026-11-20T09:00'
  },
  {
    id: 'notif-5',
    userId: 'admin',
    title: 'Hoạt động mới chờ kiểm duyệt',
    message: 'Hội Chữ Thập Đỏ Thanh Niên vừa tạo hoạt động "Tập Huấn Sơ Cứu Ban Đầu và Phòng Chống Đuối Nước", vui lòng kiểm tra nội dung.',
    type: 'warning',
    read: false,
    createdAt: '2026-11-21T11:45'
  }
];

export const initialFeedbacks = [
  {
    id: 'fb-1',
    volunteerId: 'vol-1',
    volunteerName: 'Nguyễn Văn An',
    volunteerEmail: 'nguyenvanan@gmail.com',
    targetType: 'system',
    title: 'Đề xuất bổ sung thêm tính năng nhóm chat',
    content: 'Em mong muốn hệ thống có thêm tính năng phòng chat nhỏ giữa các tình nguyện viên trong cùng một hoạt động để dễ dàng liên lạc khi tập trung ạ.',
    status: 'pending',
    createdAt: '2026-11-18'
  }
];

export const initialSystemSettings = {
  defaultApprovalDays: 3,
  maxRegistrationsPerVolunteer: 5,
  minHoursPerActivity: 1,
  requireEmailVerification: true,
  autoNotifyUpcomingDays: 2,
  allowCancellationHoursBefore: 24,
  generalGuidelines: 'Tất cả tình nguyện viên và đơn vị tổ chức cam kết tuân thủ đạo đức thiện nguyện, trung thực trong điểm danh và bảo đảm an toàn thân thể cho tình nguyện viên.'
};
