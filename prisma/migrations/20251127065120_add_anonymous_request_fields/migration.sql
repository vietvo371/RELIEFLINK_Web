-- DropForeignKey
ALTER TABLE "yeu_cau_cuu_tros" DROP CONSTRAINT "yeu_cau_cuu_tros_id_nguoi_dung_fkey";

-- AlterTable
ALTER TABLE "yeu_cau_cuu_tros" ADD COLUMN     "email_lien_he" TEXT,
ADD COLUMN     "ho_va_ten_lien_he" TEXT,
ADD COLUMN     "so_dien_thoai_lien_he" TEXT,
ALTER COLUMN "id_nguoi_dung" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "yeu_cau_cuu_tros" ADD CONSTRAINT "yeu_cau_cuu_tros_id_nguoi_dung_fkey" FOREIGN KEY ("id_nguoi_dung") REFERENCES "nguoi_dungs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
