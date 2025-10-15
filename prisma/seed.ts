import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create users
  console.log("Creating users...");
  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.nguoi_dungs.create({
    data: {
      ho_va_ten: "Nguyễn Văn Admin",
      email: "admin@relieflink.vn",
      mat_khau: hashedPassword,
      vai_tro: "admin",
      so_dien_thoai: "0901234567",
      vi_do: 10.8231,
      kinh_do: 106.6297,
    },
  });

  const volunteer1 = await prisma.nguoi_dungs.create({
    data: {
      ho_va_ten: "Trần Thị Lan",
      email: "volunteer1@relieflink.vn",
      mat_khau: hashedPassword,
      vai_tro: "tinh_nguyen_vien",
      so_dien_thoai: "0912345678",
      vi_do: 21.0285,
      kinh_do: 105.8542,
    },
  });

  const volunteer2 = await prisma.nguoi_dungs.create({
    data: {
      ho_va_ten: "Lê Văn Hùng",
      email: "volunteer2@relieflink.vn",
      mat_khau: hashedPassword,
      vai_tro: "tinh_nguyen_vien",
      so_dien_thoai: "0923456789",
      vi_do: 16.0544,
      kinh_do: 108.2022,
    },
  });

  const citizen1 = await prisma.nguoi_dungs.create({
    data: {
      ho_va_ten: "Phạm Thị Mai",
      email: "citizen1@relieflink.vn",
      mat_khau: hashedPassword,
      vai_tro: "nguoi_dan",
      so_dien_thoai: "0934567890",
      vi_do: 10.0452,
      kinh_do: 105.7469,
    },
  });

  const citizen2 = await prisma.nguoi_dungs.create({
    data: {
      ho_va_ten: "Hoàng Văn Nam",
      email: "citizen2@relieflink.vn",
      mat_khau: hashedPassword,
      vai_tro: "nguoi_dan",
      so_dien_thoai: "0945678901",
      vi_do: 12.2388,
      kinh_do: 109.1967,
    },
  });

  console.log(`✅ Created ${5} users`);

  // Create relief centers
  console.log("Creating relief centers...");
  const center1 = await prisma.trung_tam_cuu_tros.create({
    data: {
      ten_trung_tam: "Trung tâm Cứu trợ TP. Hồ Chí Minh",
      dia_chi: "123 Nguyễn Huệ, Quận 1, TP. HCM",
      vi_do: 10.7769,
      kinh_do: 106.7009,
      nguoi_quan_ly: "Nguyễn Văn A",
      so_lien_he: "0281234567",
    },
  });

  const center2 = await prisma.trung_tam_cuu_tros.create({
    data: {
      ten_trung_tam: "Trung tâm Cứu trợ Hà Nội",
      dia_chi: "456 Hoàn Kiếm, Hà Nội",
      vi_do: 21.0285,
      kinh_do: 105.8542,
      nguoi_quan_ly: "Trần Thị B",
      so_lien_he: "0241234567",
    },
  });

  const center3 = await prisma.trung_tam_cuu_tros.create({
    data: {
      ten_trung_tam: "Trung tâm Cứu trợ Đà Nẵng",
      dia_chi: "789 Bạch Đằng, Đà Nẵng",
      vi_do: 16.0544,
      kinh_do: 108.2022,
      nguoi_quan_ly: "Lê Văn C",
      so_lien_he: "02361234567",
    },
  });

  console.log(`✅ Created ${3} relief centers`);

  // Create resources
  console.log("Creating resources...");
  const resources = [
    {
      ten_nguon_luc: "Gạo",
      loai: "Thực phẩm",
      so_luong: 10000,
      don_vi: "kg",
      id_trung_tam: center1.id,
    },
    {
      ten_nguon_luc: "Nước uống đóng chai",
      loai: "Nước uống",
      so_luong: 5000,
      don_vi: "chai",
      id_trung_tam: center1.id,
    },
    {
      ten_nguon_luc: "Thuốc cơ bản",
      loai: "Y tế",
      so_luong: 2000,
      don_vi: "hộp",
      id_trung_tam: center1.id,
    },
    {
      ten_nguon_luc: "Mì gói",
      loai: "Thực phẩm",
      so_luong: 15000,
      don_vi: "gói",
      id_trung_tam: center2.id,
    },
    {
      ten_nguon_luc: "Nước lọc",
      loai: "Nước uống",
      so_luong: 8000,
      don_vi: "lít",
      id_trung_tam: center2.id,
    },
    {
      ten_nguon_luc: "Khẩu trang y tế",
      loai: "Y tế",
      so_luong: 10000,
      don_vi: "cái",
      id_trung_tam: center2.id,
    },
    {
      ten_nguon_luc: "Lều bạt",
      loai: "Chỗ ở",
      so_luong: 500,
      don_vi: "cái",
      id_trung_tam: center3.id,
    },
    {
      ten_nguon_luc: "Chăn màn",
      loai: "Chỗ ở",
      so_luong: 1000,
      don_vi: "bộ",
      id_trung_tam: center3.id,
    },
  ];

  for (const resource of resources) {
    await prisma.nguon_lucs.create({ data: resource });
  }

  console.log(`✅ Created ${resources.length} resources`);

  // Create relief requests
  console.log("Creating relief requests...");
  const request1 = await prisma.yeu_cau_cuu_tros.create({
    data: {
      id_nguoi_dung: citizen1.id,
      loai_yeu_cau: "Thực phẩm khẩn cấp",
      mo_ta: "Cần gấp thực phẩm cho 50 người do lũ lụt",
      so_nguoi: 50,
      do_uu_tien: "cao",
      trang_thai: "cho_xu_ly",
      vi_do: 10.0452,
      kinh_do: 105.7469,
    },
  });

  const request2 = await prisma.yeu_cau_cuu_tros.create({
    data: {
      id_nguoi_dung: citizen2.id,
      loai_yeu_cau: "Nước uống và thuốc men",
      mo_ta: "Khu vực bị cô lập sau bão, cần nước uống và thuốc",
      so_nguoi: 30,
      do_uu_tien: "cao",
      trang_thai: "dang_xu_ly",
      vi_do: 12.2388,
      kinh_do: 109.1967,
    },
  });

  const request3 = await prisma.yeu_cau_cuu_tros.create({
    data: {
      id_nguoi_dung: citizen1.id,
      loai_yeu_cau: "Chỗ ở tạm",
      mo_ta: "Nhà bị sập, cần lều bạt và chăn màn",
      so_nguoi: 15,
      do_uu_tien: "trung_binh",
      trang_thai: "cho_xu_ly",
      vi_do: 10.1234,
      kinh_do: 105.8567,
    },
  });

  const request4 = await prisma.yeu_cau_cuu_tros.create({
    data: {
      id_nguoi_dung: citizen2.id,
      loai_yeu_cau: "Hỗ trợ y tế",
      mo_ta: "Có người bị thương cần thuốc và băng bó",
      so_nguoi: 5,
      do_uu_tien: "cao",
      trang_thai: "hoan_thanh",
      vi_do: 12.3456,
      kinh_do: 109.2345,
    },
  });

  console.log(`✅ Created ${4} relief requests`);

  // Create distributions
  console.log("Creating distributions...");
  const distribution1 = await prisma.phan_phois.create({
    data: {
      id_yeu_cau: request2.id,
      id_nguon_luc: 2, // Nước uống
      id_tinh_nguyen_vien: volunteer1.id,
      trang_thai: "dang_giao",
      ma_giao_dich: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      thoi_gian_xuat: new Date(),
    },
  });

  const distribution2 = await prisma.phan_phois.create({
    data: {
      id_yeu_cau: request4.id,
      id_nguon_luc: 3, // Thuốc
      id_tinh_nguyen_vien: volunteer2.id,
      trang_thai: "hoan_thanh",
      ma_giao_dich: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      thoi_gian_xuat: new Date(Date.now() - 86400000),
      thoi_gian_giao: new Date(),
    },
  });

  console.log(`✅ Created ${2} distributions`);

  // Create blockchain logs
  console.log("Creating blockchain logs...");
  await prisma.nhat_ky_blockchains.create({
    data: {
      id_phan_phoi: distribution1.id,
      ma_giao_dich: distribution1.ma_giao_dich!,
      hanh_dong: "phan_phoi_tao_moi",
      du_lieu: {
        id_yeu_cau: distribution1.id_yeu_cau,
        id_nguon_luc: distribution1.id_nguon_luc,
        timestamp: new Date().toISOString(),
      },
    },
  });

  await prisma.nhat_ky_blockchains.create({
    data: {
      id_phan_phoi: distribution2.id,
      ma_giao_dich: distribution2.ma_giao_dich!,
      hanh_dong: "phan_phoi_tao_moi",
      du_lieu: {
        id_yeu_cau: distribution2.id_yeu_cau,
        id_nguon_luc: distribution2.id_nguon_luc,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      },
    },
  });

  await prisma.nhat_ky_blockchains.create({
    data: {
      id_phan_phoi: distribution2.id,
      ma_giao_dich: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      hanh_dong: "phan_phoi_hoan_thanh",
      du_lieu: {
        id_phan_phoi: distribution2.id,
        thoi_gian_giao: new Date().toISOString(),
      },
    },
  });

  console.log(`✅ Created ${3} blockchain logs`);

  // Create AI predictions
  console.log("Creating AI predictions...");
  const provinces = [
    "Hà Nội",
    "Hồ Chí Minh",
    "Đà Nẵng",
    "Hải Phòng",
    "Cần Thơ",
    "Quảng Ninh",
    "Thừa Thiên Huế",
    "Nghệ An",
  ];
  const disasters = ["Lũ lụt", "Bão", "Hạn hán", "Sạt lở đất"];

  for (const province of provinces) {
    await prisma.du_bao_ais.create({
      data: {
        tinh_thanh: province,
        loai_thien_tai: disasters[Math.floor(Math.random() * disasters.length)],
        du_doan_nhu_cau_thuc_pham: Math.floor(Math.random() * 5000) + 1000,
        du_doan_nhu_cau_nuoc: Math.floor(Math.random() * 10000) + 2000,
        du_doan_nhu_cau_thuoc: Math.floor(Math.random() * 2000) + 500,
        du_doan_nhu_cau_cho_o: Math.floor(Math.random() * 1000) + 200,
        ngay_du_bao: new Date(
          Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000,
        ),
      },
    });
  }

  console.log(`✅ Created ${provinces.length} AI predictions`);

  console.log("\n✨ Database seeded successfully!");
  console.log("\n📝 Test accounts:");
  console.log("  Admin: admin@relieflink.vn / password123");
  console.log("  Volunteer 1: volunteer1@relieflink.vn / password123");
  console.log("  Volunteer 2: volunteer2@relieflink.vn / password123");
  console.log("  Citizen 1: citizen1@relieflink.vn / password123");
  console.log("  Citizen 2: citizen2@relieflink.vn / password123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

