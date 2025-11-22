# 🚀 ADVANCED WORKFLOW SYSTEM - Hệ thống Phê duyệt & Auto-Matching

## ✨ Tính năng đã thêm mới

### 1. **Hệ thống Phê duyệt Yêu cầu từ Admin**
- Tất cả yêu cầu mới sẽ ở trạng thái "Chờ phê duyệt"
- Admin có thể phê duyệt hoặc từ chối với lý do cụ thể
- Tự động gửi thông báo kết quả cho citizen
- Dashboard chuyên dụng cho Admin quản lý phê duyệt

### 2. **Auto-matching Yêu cầu với Nguồn lực**
- Tự động tìm nguồn lực phù hợp khi yêu cầu được phê duyệt
- Tính toán dựa trên khoảng cách, loại yêu cầu, và availability
- Hiển thị kết quả matching ngay trong dashboard
- Đề xuất các lựa chọn thay thế

### 3. **Tính toán Độ ưu tiên thông minh**
- Algorithm tính điểm ưu tiên từ 0-100
- Dựa trên: độ khẩn, số người, loại yêu cầu, thời gian, khoảng cách, thời tiết
- Tự động cập nhật priority score theo thời gian
- Sắp xếp requests theo độ ưu tiên

### 4. **Thông báo Realtime**
- Thông báo tự động cho Admin khi có yêu cầu mới
- Thông báo kết quả phê duyệt cho citizen
- Badge số lượng thông báo chưa đọc
- Dropdown thông báo với UI hiện đại

---

## 📊 Database Schema Updates

### Bảng `yeu_cau_cuu_tros` - Đã thêm:
```sql
-- Hệ thống phê duyệt
trang_thai_phe_duyet  String @default("cho_phe_duyet")
id_nguoi_phe_duyet    Int?
thoi_gian_phe_duyet   DateTime?
ly_do_tu_choi         String?

-- Auto-matching và độ ưu tiên
diem_uu_tien          Int @default(0)
khoang_cach_gan_nhat  Decimal?
id_nguon_luc_match    Int?
trang_thai_matching   String @default("chua_match")
```

### Bảng `nguoi_dungs` - Đã thêm:
```sql
-- Thông báo settings
nhan_thong_bao        Boolean @default(true)
thong_bao_email       Boolean @default(true)
thong_bao_sms         Boolean @default(false)
```

### Bảng `nguon_lucs` - Đã thêm:
```sql
-- Inventory management
so_luong_toi_thieu    Int @default(10)
trang_thai            String @default("san_sang")
```

### Bảng mới `thong_baos`:
```sql
-- Hệ thống thông báo realtime
id, id_nguoi_gui, id_nguoi_nhan, id_yeu_cau
loai_thong_bao, tieu_de, noi_dung
da_doc, da_gui_email, da_gui_sms, created_at
```

---

## 🔌 API Endpoints mới

### Phê duyệt:
- `PUT /api/requests/[id]/approve` - Phê duyệt/từ chối yêu cầu
- `POST /api/requests/batch-update-priorities` - Cập nhật tất cả priorities

### Thông báo:
- `GET /api/notifications` - Lấy danh sách thông báo
- `PUT /api/notifications/mark-read` - Đánh dấu đã đọc
- `POST /api/notifications/emergency` - Gửi thông báo khẩn cấp

---

## 🎯 Services & Logic

### `RequestWorkflowService`:
- `calculatePriorityScore()` - Tính điểm ưu tiên
- `findBestResourceMatch()` - Tự động matching
- `updateRequestPriority()` - Cập nhật priority
- `batchUpdatePriorities()` - Cập nhật hàng loạt

### `NotificationService`:
- `notifyNewRequest()` - Thông báo yêu cầu mới
- `notifyApprovalResult()` - Thông báo kết quả phê duyệt
- `broadcastEmergencyAlert()` - Thông báo khẩn cấp
- `markAsRead()` - Đánh dấu đã đọc

---

## 🎨 Components mới

### `NotificationDropdown`:
- Bell icon với badge số lượng
- Dropdown hiển thị 10 thông báo gần nhất
- Đánh dấu đã đọc khi click
- Refresh tự động mỗi 30s

### `AdminApprovalDashboard`:
- Danh sách yêu cầu chờ phê duyệt
- Sắp xếp theo priority score
- Modal phê duyệt với thông tin chi tiết
- Auto-match status và distance

---

## 🚀 Cách sử dụng

### 1. **Tích hợp NotificationDropdown**:
```tsx
import NotificationDropdown from "@/components/relief/NotificationDropdown";

// Thêm vào header
<NotificationDropdown className="ml-4" />
```

### 2. **Sử dụng AdminApprovalDashboard**:
```tsx
import AdminApprovalDashboard from "@/components/relief/AdminApprovalDashboard";

// Trang admin approval
<AdminApprovalDashboard />
```

### 3. **Hooks mới**:
```tsx
import { 
  useNotifications,
  useApproveRequest,
  usePendingApprovalRequests 
} from "@/hooks/useWorkflow";

// Lấy thông báo
const { data: notifications } = useNotifications();

// Phê duyệt yêu cầu
const approveRequest = useApproveRequest();
```

---

## 🔄 Workflow Flow

### Khi Citizen tạo yêu cầu:
1. ✅ Yêu cầu được tạo với status "Chờ phê duyệt"
2. ✅ Tính toán priority score ban đầu
3. ✅ Gửi thông báo cho tất cả Admin
4. ⏳ Chờ Admin phê duyệt

### Khi Admin phê duyệt:
1. ✅ Cập nhật trạng thái phê duyệt
2. ✅ Tự động tìm nguồn lực phù hợp
3. ✅ Cập nhật priority score
4. ✅ Gửi thông báo kết quả cho citizen
5. ✅ Sẵn sàng cho distribution

### Priority Calculation:
- **Độ khẩn cấp** (0-40 điểm): cao=40, trung_binh=25, thap=10
- **Số người** (0-30 điểm): >=100=30, >=50=25, >=20=20, >=10=15, <10=10
- **Loại yêu cầu** (0-20 điểm): cuu_ho=20, thuoc=18, nuoc=15, thuc_pham=12, cho_o=10
- **Thời gian** (0-10 điểm): +1 điểm mỗi 2 tiếng
- **Khoảng cách**: -10 nếu >50km, -5 nếu >20km
- **Thời tiết**: +15 mưa bão, +5 nắng nóng

---

## 📈 Performance Features

### Real-time Updates:
- **Notifications**: Refresh mỗi 30s
- **Unread count**: Check mỗi 15s  
- **Pending requests**: Refresh mỗi 60s

### Caching:
- React Query cache cho tất cả API calls
- Automatic invalidation khi có update
- Optimistic updates cho UX tốt hơn

---

## 🎯 Next Steps

### Immediate (Tuần này):
1. ✅ **Test workflow** với data thật
2. ✅ **Tích hợp NotificationDropdown** vào layout
3. ✅ **Add AdminApprovalDashboard** vào admin pages
4. ✅ **Update existing request cards** để hiển thị priority

### Phase 2 (Tuần tới):
1. 🔄 **Real-time WebSocket** thay vì polling
2. 📱 **Push notifications** cho mobile
3. 📊 **Analytics dashboard** cho workflow metrics
4. 🤖 **AI enhancement** cho priority calculation

---

## 🐛 Testing

### Test Cases:
1. **Tạo yêu cầu mới** → Kiểm tra thông báo Admin
2. **Phê duyệt yêu cầu** → Kiểm tra auto-matching
3. **Từ chối yêu cầu** → Kiểm tra thông báo citizen
4. **Priority calculation** → Test với các scenarios khác nhau
5. **Notification dropdown** → Test mark as read

### Seed Data:
Migration đã tạo sample data với:
- ✅ Users với roles khác nhau
- ✅ Requests với statuses khác nhau  
- ✅ Resources tại các trung tâm
- ✅ Sample notifications

---

## 💡 Key Benefits

### Cho Admin:
- **Dashboard tập trung** để quản lý phê duyệt
- **Auto-matching** giảm công sức manual
- **Priority scoring** giúp ưu tiên đúng
- **Real-time notifications** không bỏ lỡ yêu cầu

### Cho Citizens:
- **Transparency** trong quy trình phê duyệt
- **Notifications** cập nhật status realtime
- **Faster processing** với auto-matching

### Cho System:
- **Scalable architecture** với clean separation
- **Performance optimized** với caching
- **Maintainable code** với TypeScript
- **Extensible** cho future features

---

**🎉 Hệ thống Workflow nâng cao đã sẵn sàng sử dụng!**

Tất cả files đã được tạo và migration đã chạy. Bạn có thể test ngay bằng cách:

1. Tạo yêu cầu mới (as citizen)
2. Login as admin → Xem notification dropdown
3. Vào approval dashboard → Phê duyệt yêu cầu
4. Kiểm tra auto-matching results

**Ready to deploy! 🚀**