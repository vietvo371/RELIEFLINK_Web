import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Helper functions
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateRandomCoordinates() {
  // Vietnam coordinates bounds
  const latMin = 8.5, latMax = 23.4;
  const lngMin = 102.1, lngMax = 109.5;
  
  return {
    vi_do: parseFloat((Math.random() * (latMax - latMin) + latMin).toFixed(6)),
    kinh_do: parseFloat((Math.random() * (lngMax - lngMin) + lngMin).toFixed(6))
  };
}

function generatePhoneNumber(): string {
  const prefixes = ['090', '091', '092', '093', '094', '095', '096', '097', '098', '099'];
  const prefix = getRandomElement(prefixes);
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return prefix + number;
}

function generateTransactionHash(): string {
  return '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

async function main() {
  console.log("🌱 Starting comprehensive database seed...");

  // Clear existing data
  console.log("🧹 Clearing existing data...");
  await prisma.thong_baos.deleteMany();
  await prisma.nhat_ky_blockchains.deleteMany();
  await prisma.phan_phois.deleteMany();
  await prisma.yeu_cau_cuu_tros.deleteMany();
  await prisma.nguon_lucs.deleteMany();
  await prisma.trung_tam_cuu_tros.deleteMany();
  await prisma.du_bao_ais.deleteMany();
  await prisma.nguoi_dungs.deleteMany();

  // Create users with diverse data
  console.log("👥 Creating diverse users...");
  const hashedPassword = await bcrypt.hash("password123", 10);

  const firstNames = [
    'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi',
    'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đinh', 'Đào', 'Tôn', 'Thái', 'Lương'
  ];

  const lastNames = [
    'Văn', 'Thị', 'Minh', 'Hồng', 'Thanh', 'Thu', 'Linh', 'Anh', 'Hương', 'Mai',
    'Lan', 'Hoa', 'Nga', 'Tuyết', 'Hạnh', 'Dung', 'Phương', 'Thảo', 'Yến', 'Trang'
  ];

  const middleNames = [
    'Văn', 'Thị', 'Minh', 'Hồng', 'Thanh', 'Thu', 'Linh', 'Anh', 'Hương', 'Mai',
    'Lan', 'Hoa', 'Nga', 'Tuyết', 'Hạnh', 'Dung', 'Phương', 'Thảo', 'Yến', 'Trang'
  ];

  const roles = ['admin', 'tinh_nguyen_vien', 'nguoi_dan'];
  const users = [];

  // Create 1 admin
  const admin = await prisma.nguoi_dungs.create({
    data: {
      ho_va_ten: "Nguyễn Văn Admin",
      email: "admin@relieflink.vn",
      mat_khau: hashedPassword,
      vai_tro: "admin",
      so_dien_thoai: "0901234567",
      vi_do: 10.8231,
      kinh_do: 106.6297,
      // New notification settings
      nhan_thong_bao: true,
      thong_bao_email: true,
      thong_bao_sms: false,
    },
  });
  users.push(admin);

  // Create 20 volunteers
  for (let i = 1; i <= 20; i++) {
    const coords = generateRandomCoordinates();
    const user = await prisma.nguoi_dungs.create({
      data: {
        ho_va_ten: `${getRandomElement(firstNames)} ${getRandomElement(middleNames)} ${getRandomElement(lastNames)}`,
        email: `volunteer${i}@relieflink.vn`,
        mat_khau: hashedPassword,
        vai_tro: "tinh_nguyen_vien",
        so_dien_thoai: generatePhoneNumber(),
        vi_do: coords.vi_do,
        kinh_do: coords.kinh_do,
        // Random notification preferences
        nhan_thong_bao: Math.random() > 0.2, // 80% enable notifications
        thong_bao_email: Math.random() > 0.3, // 70% enable email
        thong_bao_sms: Math.random() > 0.7, // 30% enable SMS
      },
    });
    users.push(user);
  }

  // Create 50 citizens
  for (let i = 1; i <= 50; i++) {
    const coords = generateRandomCoordinates();
    const user = await prisma.nguoi_dungs.create({
      data: {
        ho_va_ten: `${getRandomElement(firstNames)} ${getRandomElement(middleNames)} ${getRandomElement(lastNames)}`,
        email: `citizen${i}@relieflink.vn`,
        mat_khau: hashedPassword,
        vai_tro: "nguoi_dan",
        so_dien_thoai: generatePhoneNumber(),
        vi_do: coords.vi_do,
        kinh_do: coords.kinh_do,
        // Random notification preferences
        nhan_thong_bao: Math.random() > 0.1, // 90% enable notifications
        thong_bao_email: Math.random() > 0.2, // 80% enable email
        thong_bao_sms: Math.random() > 0.6, // 40% enable SMS
      },
    });
    users.push(user);
  }

  console.log(`✅ Created ${users.length} users`);

  // Create relief centers
  console.log("🏢 Creating relief centers...");
  const centerNames = [
    'Trung tâm Cứu trợ TP. Hồ Chí Minh',
    'Trung tâm Cứu trợ Hà Nội',
    'Trung tâm Cứu trợ Đà Nẵng',
    'Trung tâm Cứu trợ Hải Phòng',
    'Trung tâm Cứu trợ Cần Thơ',
    'Trung tâm Cứu trợ Quảng Ninh',
    'Trung tâm Cứu trợ Thừa Thiên Huế',
    'Trung tâm Cứu trợ Nghệ An',
    'Trung tâm Cứu trợ Thanh Hóa',
    'Trung tâm Cứu trợ Quảng Nam',
    'Trung tâm Cứu trợ Bình Định',
    'Trung tâm Cứu trợ Khánh Hòa',
    'Trung tâm Cứu trợ Lâm Đồng',
    'Trung tâm Cứu trợ Bình Dương',
    'Trung tâm Cứu trợ Đồng Nai'
  ];

  const addresses = [
    '123 Nguyễn Huệ, Quận 1, TP. HCM',
    '456 Hoàn Kiếm, Hà Nội',
    '789 Bạch Đằng, Đà Nẵng',
    '321 Lê Lợi, Hải Phòng',
    '654 Nguyễn Văn Cừ, Cần Thơ',
    '987 Hạ Long, Quảng Ninh',
    '147 Lê Lợi, Huế',
    '258 Quang Trung, Nghệ An',
    '369 Lê Lợi, Thanh Hóa',
    '741 Trần Phú, Quảng Nam',
    '852 Lê Lợi, Bình Định',
    '963 Trần Phú, Khánh Hòa',
    '159 Lê Lợi, Lâm Đồng',
    '357 Nguyễn Văn Cừ, Bình Dương',
    '468 Lê Lợi, Đồng Nai'
  ];

  const centers = [];
  for (let i = 0; i < centerNames.length; i++) {
    const coords = generateRandomCoordinates();
    const center = await prisma.trung_tam_cuu_tros.create({
      data: {
        ten_trung_tam: centerNames[i],
        dia_chi: addresses[i],
        vi_do: coords.vi_do,
        kinh_do: coords.kinh_do,
        nguoi_quan_ly: `${getRandomElement(firstNames)} ${getRandomElement(middleNames)} ${getRandomElement(lastNames)}`,
        so_lien_he: generatePhoneNumber(),
      },
    });
    centers.push(center);
  }

  console.log(`✅ Created ${centers.length} relief centers`);

  // Create diverse resources with new fields
  console.log("📦 Creating diverse resources...");
  const resourceTypes = [
    { name: 'Gạo', category: 'Thực phẩm', unit: 'kg', minQty: 1000, maxQty: 50000 },
    { name: 'Mì gói', category: 'Thực phẩm', unit: 'gói', minQty: 5000, maxQty: 100000 },
    { name: 'Nước uống đóng chai', category: 'Nước uống', unit: 'chai', minQty: 2000, maxQty: 20000 },
    { name: 'Nước lọc', category: 'Nước uống', unit: 'lít', minQty: 5000, maxQty: 50000 },
    { name: 'Thuốc cơ bản', category: 'Y tế', unit: 'hộp', minQty: 500, maxQty: 5000 },
    { name: 'Khẩu trang y tế', category: 'Y tế', unit: 'cái', minQty: 2000, maxQty: 50000 },
    { name: 'Băng gạc', category: 'Y tế', unit: 'cuộn', minQty: 100, maxQty: 2000 },
    { name: 'Lều bạt', category: 'Chỗ ở', unit: 'cái', minQty: 50, maxQty: 1000 },
    { name: 'Chăn màn', category: 'Chỗ ở', unit: 'bộ', minQty: 200, maxQty: 5000 },
    { name: 'Quần áo', category: 'Quần áo', unit: 'bộ', minQty: 500, maxQty: 10000 },
    { name: 'Giày dép', category: 'Quần áo', unit: 'đôi', minQty: 200, maxQty: 5000 },
    { name: 'Pin dự phòng', category: 'Điện tử', unit: 'cái', minQty: 100, maxQty: 2000 },
    { name: 'Đèn pin', category: 'Điện tử', unit: 'cái', minQty: 200, maxQty: 5000 },
    { name: 'Bình gas mini', category: 'Năng lượng', unit: 'bình', minQty: 50, maxQty: 500 },
    { name: 'Xăng dự phòng', category: 'Năng lượng', unit: 'lít', minQty: 100, maxQty: 2000 }
  ];

  const resources = [];
  for (let i = 0; i < 200; i++) {
    const resourceType = getRandomElement(resourceTypes);
    const center = getRandomElement(centers);
    const quantity = Math.floor(Math.random() * (resourceType.maxQty - resourceType.minQty) + resourceType.minQty);
    
    const resource = await prisma.nguon_lucs.create({
      data: {
        ten_nguon_luc: resourceType.name,
        loai: resourceType.category,
        so_luong: quantity,
        don_vi: resourceType.unit,
        id_trung_tam: center.id,
        // New inventory management fields
        so_luong_toi_thieu: Math.floor(quantity * 0.1), // 10% of quantity as minimum threshold
        trang_thai: getRandomElement(['san_sang', 'het_hang', 'bao_tri']),
      },
    });
    resources.push(resource);
  }

  console.log(`✅ Created ${resources.length} resources`);

  // Create diverse relief requests with new workflow fields
  console.log("🚨 Creating diverse relief requests...");
  const requestTypes = [
    'Thực phẩm khẩn cấp',
    'Nước uống và thuốc men',
    'Chỗ ở tạm thời',
    'Hỗ trợ y tế',
    'Quần áo và đồ dùng cá nhân',
    'Năng lượng và điện',
    'Phương tiện di chuyển',
    'Thiết bị cứu hộ',
    'Thực phẩm dinh dưỡng',
    'Vật tư y tế chuyên dụng'
  ];

  const priorities = ['thap', 'trung_binh', 'cao'];
  const statuses = ['cho_xu_ly', 'dang_xu_ly', 'hoan_thanh', 'huy_bo'];
  const descriptions = [
    'Cần gấp do thiên tai',
    'Khu vực bị cô lập',
    'Nhà cửa bị hư hỏng nặng',
    'Có người bị thương',
    'Thiếu nước sạch',
    'Mất điện kéo dài',
    'Đường sá bị cắt',
    'Cần hỗ trợ khẩn cấp',
    'Dân số đông cần hỗ trợ',
    'Tình hình phức tạp'
  ];

  const approvalStatuses = ['cho_phe_duyet', 'da_phe_duyet', 'tu_choi'];
  const matchingStatuses = ['chua_match', 'da_match', 'khong_match'];
  
  const citizens = users.filter(u => u.vai_tro === 'nguoi_dan');
  const admins = users.filter(u => u.vai_tro === 'admin');
  const requests = [];

  for (let i = 0; i < 100; i++) {
    const citizen = getRandomElement(citizens);
    const coords = generateRandomCoordinates();
    const approvalStatus = getRandomElement(approvalStatuses);
    const isApproved = approvalStatus === 'da_phe_duyet';
    const isRejected = approvalStatus === 'tu_choi';
    
    // Calculate priority score based on factors
    const urgencyLevel = getRandomElement(priorities);
    const numberOfPeople = Math.floor(Math.random() * 200) + 1;
    const requestType = getRandomElement(requestTypes);
    
    let priorityScore = 0;
    // Urgency score
    if (urgencyLevel === 'cao') priorityScore += 40;
    else if (urgencyLevel === 'trung_binh') priorityScore += 25;
    else priorityScore += 10;
    
    // Number of people score
    if (numberOfPeople >= 100) priorityScore += 30;
    else if (numberOfPeople >= 50) priorityScore += 25;
    else if (numberOfPeople >= 20) priorityScore += 20;
    else if (numberOfPeople >= 10) priorityScore += 15;
    else priorityScore += 10;
    
    // Request type score
    const typeScores: { [key: string]: number } = {
      'Hỗ trợ y tế': 20,
      'Nước uống và thuốc men': 18,
      'Thực phẩm khẩn cấp': 15,
      'Chỗ ở tạm thời': 12,
      'Quần áo và đồ dùng cá nhân': 10,
    };
    priorityScore += typeScores[requestType] || 8;
    
    // Random time bonus (0-10)
    priorityScore += Math.floor(Math.random() * 11);
    
    // Ensure score is between 0-100
    priorityScore = Math.min(100, Math.max(0, priorityScore));
    
    // Find matching resource if approved
    let matchingResourceId = null;
    let nearestDistance = null;
    let matchingStatus = 'chua_match';
    
    if (isApproved && resources.length > 0) {
      // Simple matching: find resource with matching category
      const matchingResources = resources.filter(r => 
        r.trang_thai === 'san_sang' && 
        r.so_luong > 0 &&
        (r.loai.toLowerCase().includes('thực phẩm') || r.loai.toLowerCase().includes('y tế'))
      );
      
      if (matchingResources.length > 0) {
        const matchedResource = getRandomElement(matchingResources);
        matchingResourceId = matchedResource.id;
        // Calculate random distance (simplified)
        nearestDistance = parseFloat((Math.random() * 100 + 5).toFixed(2));
        matchingStatus = 'da_match';
      } else {
        matchingStatus = 'khong_match';
      }
    }

    const request = await prisma.yeu_cau_cuu_tros.create({
      data: {
        id_nguoi_dung: citizen.id,
        loai_yeu_cau: requestType,
        mo_ta: getRandomElement(descriptions),
        so_nguoi: numberOfPeople,
        do_uu_tien: urgencyLevel,
        trang_thai: isRejected ? 'bi_tu_choi' : (isApproved ? 'da_phe_duyet' : 'cho_xu_ly'),
        vi_do: coords.vi_do,
        kinh_do: coords.kinh_do,
        
        // New workflow fields
        trang_thai_phe_duyet: approvalStatus,
        id_nguoi_phe_duyet: (isApproved || isRejected) ? admin.id : null,
        thoi_gian_phe_duyet: (isApproved || isRejected) ? 
          new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
        ly_do_tu_choi: isRejected ? 
          getRandomElement([
            'Không đủ thông tin',
            'Yêu cầu không hợp lệ',
            'Đã có hỗ trợ từ nguồn khác',
            'Vùng không thuộc phạm vi hỗ trợ',
            'Cần bổ sung giấy tờ chứng minh'
          ]) : null,
        
        // Priority and matching fields
        diem_uu_tien: priorityScore,
        khoang_cach_gan_nhat: nearestDistance,
        id_nguon_luc_match: matchingResourceId,
        trang_thai_matching: matchingStatus,
      },
    });
    requests.push(request);
  }

  console.log(`✅ Created ${requests.length} relief requests with workflow data`);

  // Create distributions
  console.log("🚚 Creating distributions...");
  const volunteers = users.filter(u => u.vai_tro === 'tinh_nguyen_vien');
  const distributionStatuses = ['dang_chuan_bi', 'dang_van_chuyen', 'dang_giao', 'hoan_thanh', 'huy_bo'];
  const distributions = [];

  for (let i = 0; i < 150; i++) {
    const request = getRandomElement(requests);
    const resource = getRandomElement(resources);
    const volunteer = getRandomElement(volunteers);
    const status = getRandomElement(distributionStatuses);
    
    const now = new Date();
    const randomDaysAgo = Math.floor(Math.random() * 30);
    const createdDate = new Date(now.getTime() - randomDaysAgo * 24 * 60 * 60 * 1000);
    
    const distribution = await prisma.phan_phois.create({
      data: {
        id_yeu_cau: request.id,
        id_nguon_luc: resource.id,
        id_tinh_nguyen_vien: volunteer.id,
        trang_thai: status,
        ma_giao_dich: generateTransactionHash(),
        thoi_gian_xuat: createdDate,
        thoi_gian_giao: status === 'hoan_thanh' ? new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
      },
    });
    distributions.push(distribution);
  }

  console.log(`✅ Created ${distributions.length} distributions`);

  // Create blockchain logs
  console.log("⛓️ Creating blockchain logs...");
  const actions = [
    'phan_phoi_tao_moi',
    'phan_phoi_bat_dau',
    'phan_phoi_dang_giao',
    'phan_phoi_hoan_thanh',
    'phan_phoi_huy_bo',
    'phan_phoi_cap_nhat',
    'phan_phoi_xac_nhan',
    'phan_phoi_thanh_toan'
  ];

  for (let i = 0; i < 300; i++) {
    const distribution = getRandomElement(distributions);
    const action = getRandomElement(actions);
    const now = new Date();
    const randomDaysAgo = Math.floor(Math.random() * 30);
    const logDate = new Date(now.getTime() - randomDaysAgo * 24 * 60 * 60 * 1000);
    
    await prisma.nhat_ky_blockchains.create({
      data: {
        id_phan_phoi: distribution.id,
        ma_giao_dich: generateTransactionHash(),
        hanh_dong: action,
        du_lieu: {
          id_yeu_cau: distribution.id_yeu_cau,
          id_nguon_luc: distribution.id_nguon_luc,
          id_tinh_nguyen_vien: distribution.id_tinh_nguyen_vien,
          trang_thai: distribution.trang_thai,
          timestamp: logDate.toISOString(),
          metadata: {
            action_type: action,
            processed_by: 'system',
            version: '1.0.0'
          }
        },
        thoi_gian: logDate,
      },
    });
  }

  console.log(`✅ Created 300 blockchain logs`);

  // Create sample notifications
  console.log("📧 Creating sample notifications...");
  const notificationTypes = ['yeu_cau_moi', 'phe_duyet', 'tu_choi', 'phan_phoi', 'khan_cap'];
  const notifications = [];

  // Create notifications for approved/rejected requests
  const processedRequests = requests.filter(r => 
    r.trang_thai_phe_duyet === 'da_phe_duyet' || r.trang_thai_phe_duyet === 'tu_choi'
  );

  for (let i = 0; i < Math.min(processedRequests.length, 50); i++) {
    const request = processedRequests[i];
    const isApproved = request.trang_thai_phe_duyet === 'da_phe_duyet';
    
    // Notification to citizen about approval result
    const notification = await prisma.thong_baos.create({
      data: {
        id_nguoi_gui: admin.id,
        id_nguoi_nhan: request.id_nguoi_dung,
        id_yeu_cau: request.id,
        loai_thong_bao: isApproved ? 'phe_duyet' : 'tu_choi',
        tieu_de: isApproved ? 
          '✅ Yêu cầu cứu trợ được phê duyệt' : 
          '❌ Yêu cầu cứu trợ bị từ chối',
        noi_dung: isApproved ?
          `Yêu cầu ${request.loai_yeu_cau} của bạn đã được phê duyệt. Chúng tôi sẽ sớm liên hệ để hỗ trợ.` :
          `Yêu cầu ${request.loai_yeu_cau} của bạn đã bị từ chối. Lý do: ${request.ly_do_tu_choi}`,
        da_doc: Math.random() > 0.3, // 70% read
        da_gui_email: Math.random() > 0.2, // 80% sent email
        da_gui_sms: Math.random() > 0.8, // 20% sent SMS
      },
    });
    notifications.push(notification);
  }

  // Create some new request notifications for admins
  const recentRequests = requests.filter(r => r.trang_thai_phe_duyet === 'cho_phe_duyet').slice(0, 20);
  for (const request of recentRequests) {
    const citizen = users.find(u => u.id === request.id_nguoi_dung);
    if (citizen) {
      const notification = await prisma.thong_baos.create({
        data: {
          id_nguoi_gui: citizen.id,
          id_nguoi_nhan: admin.id,
          id_yeu_cau: request.id,
          loai_thong_bao: 'yeu_cau_moi',
          tieu_de: '🆘 Yêu cầu cứu trợ mới',
          noi_dung: `${citizen.ho_va_ten} đã gửi yêu cầu ${request.loai_yeu_cau} cho ${request.so_nguoi} người. Độ ưu tiên: ${request.do_uu_tien.toUpperCase()}`,
          da_doc: Math.random() > 0.6, // 40% read
          da_gui_email: true,
          da_gui_sms: false,
        },
      });
      notifications.push(notification);
    }
  }

  // Create some emergency notifications
  for (let i = 0; i < 10; i++) {
    const randomUsers = getRandomElements(users.filter(u => u.vai_tro !== 'admin'), 5);
    for (const user of randomUsers) {
      const notification = await prisma.thong_baos.create({
        data: {
          id_nguoi_gui: admin.id,
          id_nguoi_nhan: user.id,
          loai_thong_bao: 'khan_cap',
          tieu_de: '🚨 CẢNH BÁO KHẨN CẤP',
          noi_dung: getRandomElement([
            'Cảnh báo lũ lụt: Sơ tán khẩn cấp khỏi khu vực nguy hiểm',
            'Cảnh báo bão: Tìm nơi trú ẩn an toàn ngay lập tức',
            'Cảnh báo sạt lở đất: Di chuyển khỏi khu vực đồi núi',
            'Cảnh báo cháy rừng: Sơ tán ngay khỏi khu vực rừng',
            'Cảnh báo động đất: Tìm không gian mở và an toàn'
          ]),
          da_doc: Math.random() > 0.1, // 90% read (emergency)
          da_gui_email: true,
          da_gui_sms: Math.random() > 0.5, // 50% SMS for emergency
        },
      });
      notifications.push(notification);
    }
  }

  console.log(`✅ Created ${notifications.length} notifications`);

  // Create AI predictions
  console.log("🤖 Creating AI predictions...");
  const provinces = [
    'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Quảng Ninh',
    'Thừa Thiên Huế', 'Nghệ An', 'Thanh Hóa', 'Quảng Nam', 'Bình Định',
    'Khánh Hòa', 'Lâm Đồng', 'Bình Dương', 'Đồng Nai', 'Tây Ninh',
    'Long An', 'Tiền Giang', 'Bến Tre', 'Vĩnh Long', 'Trà Vinh',
    'Sóc Trăng', 'Bạc Liêu', 'Cà Mau', 'Kiên Giang', 'An Giang'
  ];

  const disasters = [
    'Lũ lụt', 'Bão', 'Hạn hán', 'Sạt lở đất', 'Động đất', 'Cháy rừng',
    'Bão tuyết', 'Lốc xoáy', 'Sóng thần', 'Núi lửa', 'Dịch bệnh', 'Ô nhiễm'
  ];

  for (let i = 0; i < 200; i++) {
    const province = getRandomElement(provinces);
    const disaster = getRandomElement(disasters);
    const predictionDate = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000);
    
    await prisma.du_bao_ais.create({
      data: {
        tinh_thanh: province,
        loai_thien_tai: disaster,
        du_doan_nhu_cau_thuc_pham: Math.floor(Math.random() * 10000) + 1000,
        du_doan_nhu_cau_nuoc: Math.floor(Math.random() * 20000) + 2000,
        du_doan_nhu_cau_thuoc: Math.floor(Math.random() * 5000) + 500,
        du_doan_nhu_cau_cho_o: Math.floor(Math.random() * 2000) + 200,
        ngay_du_bao: predictionDate,
      },
    });
  }

  console.log(`✅ Created 200 AI predictions`);

  // Summary statistics
  console.log("\n📊 Database seeded successfully!");
  console.log("\n📈 Summary:");
  console.log(`  👥 Users: ${users.length} (1 admin, 20 volunteers, 50 citizens)`);
  console.log(`  🏢 Relief Centers: ${centers.length}`);
  console.log(`  📦 Resources: ${resources.length} (with inventory management)`);
  console.log(`  🚨 Relief Requests: ${requests.length} (with approval workflow)`);
  console.log(`  🚚 Distributions: ${distributions.length}`);
  console.log(`  ⛓️ Blockchain Logs: 300`);
  console.log(`  🤖 AI Predictions: 200`);
  console.log(`  📧 Notifications: ${notifications.length}`);

  // New workflow summary
  console.log("\n🔄 Workflow Data:");
  const pendingApproval = requests.filter(r => r.trang_thai_phe_duyet === 'cho_phe_duyet').length;
  const approved = requests.filter(r => r.trang_thai_phe_duyet === 'da_phe_duyet').length;
  const rejected = requests.filter(r => r.trang_thai_phe_duyet === 'tu_choi').length;
  const matched = requests.filter(r => r.trang_thai_matching === 'da_match').length;
  
  console.log(`  ⏳ Pending Approval: ${pendingApproval}`);
  console.log(`  ✅ Approved: ${approved}`);
  console.log(`  ❌ Rejected: ${rejected}`);
  console.log(`  🎯 Auto-matched: ${matched}`);
  
  const avgPriorityScore = Math.round(requests.reduce((sum, r) => sum + r.diem_uu_tien, 0) / requests.length);
  console.log(`  📊 Average Priority Score: ${avgPriorityScore}/100`);

  console.log("\n🔑 Test accounts:");
  console.log("  Admin: admin@relieflink.vn / password123");
  console.log("  Volunteers: volunteer1@relieflink.vn to volunteer20@relieflink.vn / password123");
  console.log("  Citizens: citizen1@relieflink.vn to citizen50@relieflink.vn / password123");
  
  console.log("\n✨ New Features Ready:");
  console.log("  🔔 Real-time notifications system");
  console.log("  ⚡ Request approval workflow");
  console.log("  🎯 Auto-matching with resources");
  console.log("  📈 Priority scoring algorithm");
  console.log("  📱 Notification preferences per user");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });