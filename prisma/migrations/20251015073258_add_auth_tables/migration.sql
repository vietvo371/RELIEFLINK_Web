/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "nguoi_dungs" (
    "id" SERIAL NOT NULL,
    "ho_va_ten" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "so_dien_thoai" TEXT,
    "mat_khau" TEXT NOT NULL,
    "vai_tro" TEXT NOT NULL,
    "hinh_anh" TEXT,
    "vi_do" DECIMAL(10,8),
    "kinh_do" DECIMAL(11,8),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nguoi_dungs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "yeu_cau_cuu_tros" (
    "id" SERIAL NOT NULL,
    "id_nguoi_dung" INTEGER NOT NULL,
    "loai_yeu_cau" TEXT NOT NULL,
    "mo_ta" TEXT,
    "so_nguoi" INTEGER NOT NULL,
    "do_uu_tien" TEXT NOT NULL,
    "vi_do" DECIMAL(10,8),
    "kinh_do" DECIMAL(11,8),
    "trang_thai" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "yeu_cau_cuu_tros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trung_tam_cuu_tros" (
    "id" SERIAL NOT NULL,
    "ten_trung_tam" TEXT NOT NULL,
    "dia_chi" TEXT NOT NULL,
    "vi_do" DECIMAL(10,8),
    "kinh_do" DECIMAL(11,8),
    "nguoi_quan_ly" TEXT,
    "so_lien_he" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trung_tam_cuu_tros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nguon_lucs" (
    "id" SERIAL NOT NULL,
    "ten_nguon_luc" TEXT NOT NULL,
    "loai" TEXT NOT NULL,
    "so_luong" INTEGER NOT NULL,
    "don_vi" TEXT NOT NULL,
    "id_trung_tam" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nguon_lucs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phan_phois" (
    "id" SERIAL NOT NULL,
    "id_yeu_cau" INTEGER NOT NULL,
    "id_nguon_luc" INTEGER NOT NULL,
    "id_tinh_nguyen_vien" INTEGER NOT NULL,
    "trang_thai" TEXT NOT NULL,
    "ma_giao_dich" TEXT,
    "thoi_gian_xuat" TIMESTAMP(3),
    "thoi_gian_giao" TIMESTAMP(3),

    CONSTRAINT "phan_phois_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nhat_ky_blockchains" (
    "id" SERIAL NOT NULL,
    "id_phan_phoi" INTEGER NOT NULL,
    "ma_giao_dich" TEXT NOT NULL,
    "hanh_dong" TEXT NOT NULL,
    "du_lieu" JSONB NOT NULL,
    "thoi_gian" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nhat_ky_blockchains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "du_bao_ais" (
    "id" SERIAL NOT NULL,
    "tinh_thanh" TEXT NOT NULL,
    "loai_thien_tai" TEXT NOT NULL,
    "du_doan_nhu_cau_thuc_pham" INTEGER NOT NULL,
    "du_doan_nhu_cau_nuoc" INTEGER NOT NULL,
    "du_doan_nhu_cau_thuoc" INTEGER NOT NULL,
    "du_doan_nhu_cau_cho_o" INTEGER NOT NULL,
    "ngay_du_bao" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "du_bao_ais_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nguoi_dungs_email_key" ON "nguoi_dungs"("email");

-- AddForeignKey
ALTER TABLE "yeu_cau_cuu_tros" ADD CONSTRAINT "yeu_cau_cuu_tros_id_nguoi_dung_fkey" FOREIGN KEY ("id_nguoi_dung") REFERENCES "nguoi_dungs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nguon_lucs" ADD CONSTRAINT "nguon_lucs_id_trung_tam_fkey" FOREIGN KEY ("id_trung_tam") REFERENCES "trung_tam_cuu_tros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phan_phois" ADD CONSTRAINT "phan_phois_id_yeu_cau_fkey" FOREIGN KEY ("id_yeu_cau") REFERENCES "yeu_cau_cuu_tros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phan_phois" ADD CONSTRAINT "phan_phois_id_nguon_luc_fkey" FOREIGN KEY ("id_nguon_luc") REFERENCES "nguon_lucs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phan_phois" ADD CONSTRAINT "phan_phois_id_tinh_nguyen_vien_fkey" FOREIGN KEY ("id_tinh_nguyen_vien") REFERENCES "nguoi_dungs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nhat_ky_blockchains" ADD CONSTRAINT "nhat_ky_blockchains_id_phan_phoi_fkey" FOREIGN KEY ("id_phan_phoi") REFERENCES "phan_phois"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
