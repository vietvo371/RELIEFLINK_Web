-- AlterTable
ALTER TABLE "nguoi_dungs" ADD COLUMN     "nhan_thong_bao" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "thong_bao_email" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "thong_bao_sms" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "nguon_lucs" ADD COLUMN     "so_luong_toi_thieu" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "trang_thai" TEXT NOT NULL DEFAULT 'san_sang';

-- AlterTable
ALTER TABLE "yeu_cau_cuu_tros" ADD COLUMN     "diem_uu_tien" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "id_nguoi_phe_duyet" INTEGER,
ADD COLUMN     "id_nguon_luc_match" INTEGER,
ADD COLUMN     "khoang_cach_gan_nhat" DECIMAL(10,2),
ADD COLUMN     "ly_do_tu_choi" TEXT,
ADD COLUMN     "thoi_gian_phe_duyet" TIMESTAMP(3),
ADD COLUMN     "trang_thai_matching" TEXT NOT NULL DEFAULT 'chua_match',
ADD COLUMN     "trang_thai_phe_duyet" TEXT NOT NULL DEFAULT 'cho_phe_duyet';

-- CreateTable
CREATE TABLE "thong_baos" (
    "id" SERIAL NOT NULL,
    "id_nguoi_gui" INTEGER NOT NULL,
    "id_nguoi_nhan" INTEGER NOT NULL,
    "id_yeu_cau" INTEGER,
    "loai_thong_bao" TEXT NOT NULL,
    "tieu_de" TEXT NOT NULL,
    "noi_dung" TEXT NOT NULL,
    "da_doc" BOOLEAN NOT NULL DEFAULT false,
    "da_gui_email" BOOLEAN NOT NULL DEFAULT false,
    "da_gui_sms" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thong_baos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "yeu_cau_cuu_tros" ADD CONSTRAINT "yeu_cau_cuu_tros_id_nguoi_phe_duyet_fkey" FOREIGN KEY ("id_nguoi_phe_duyet") REFERENCES "nguoi_dungs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "yeu_cau_cuu_tros" ADD CONSTRAINT "yeu_cau_cuu_tros_id_nguon_luc_match_fkey" FOREIGN KEY ("id_nguon_luc_match") REFERENCES "nguon_lucs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thong_baos" ADD CONSTRAINT "thong_baos_id_nguoi_gui_fkey" FOREIGN KEY ("id_nguoi_gui") REFERENCES "nguoi_dungs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thong_baos" ADD CONSTRAINT "thong_baos_id_nguoi_nhan_fkey" FOREIGN KEY ("id_nguoi_nhan") REFERENCES "nguoi_dungs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thong_baos" ADD CONSTRAINT "thong_baos_id_yeu_cau_fkey" FOREIGN KEY ("id_yeu_cau") REFERENCES "yeu_cau_cuu_tros"("id") ON DELETE SET NULL ON UPDATE CASCADE;
