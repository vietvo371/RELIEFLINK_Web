# 🔗 Hướng dẫn Tích hợp Python AI Service

## 📋 Tổng quan

Python AI Service đã được tích hợp vào dự án ReliefLink. Service tự động:
- ✅ **Tự động detect** Python AI Service availability
- ✅ **Tự động sử dụng** Python AI nếu available
- ✅ **Fallback** về mock data nếu Python AI không available
- ✅ **Health check** real-time để hiển thị status

## 🔧 Cách Tích hợp

### Bước 1: Cấu hình Environment Variables

Thêm vào `.env` của Next.js app (ở root):

```env
AI_SERVICE_URL=http://localhost:8000
```

Nếu Python AI Service chạy ở port khác hoặc remote server, thay đổi URL tương ứng.

### Bước 2: Khởi động Python AI Service

```bash
cd ai-service
source venv/bin/activate
python main.py
```

Hoặc dùng Docker:
```bash
cd ai-service
docker-compose up -d
```

### Bước 3: Kiểm tra Integration

1. Mở trang `/admin/ai`
2. Kiểm tra status indicator ở header:
   - 🟢 **Green**: Python AI Service đang hoạt động
   - 🟡 **Yellow**: Python AI Service không khả dụng (fallback to mock)

3. Nhấn "Tạo dự báo mới" để test:
   - Nếu Python AI available → sử dụng Python AI (phân tích historical data)
   - Nếu không → sử dụng mock data

## 📊 Cách Service Hoạt động

### Flow khi Generate Predictions:

```
User clicks "Tạo dự báo mới"
         ↓
Frontend: useAIPredictions hook
         ↓
Check: useAIServiceHealth()
         ↓
    ┌─────────────────┐
    │ Python AI OK?   │
    └────────┬────────┘
         Yes │ No
            ↓ ↓
    ┌─────────────────┐
    │ Call Python AI  │ → Mock Data
    │ Service         │
    └─────────────────┘
```

### API Flow:

```
GET /api/ai?generate=true&use_python=true
         ↓
Check AI_SERVICE_URL health
         ↓
    ┌─────────────────┐
    │ AI Service OK?  │
    └────────┬────────┘
         Yes │ No
            ↓ ↓
    ┌─────────────────┐
    │ POST to Python  │ → Generate Mock
    │ /predict/batch  │
    └─────────────────┘
```

## 🎯 Các Tính năng Đã Tích hợp

### 1. Auto-Detection

Service tự động detect Python AI availability:
- Health check mỗi 30 giây
- Hiển thị status indicator trong UI
- Tự động fallback nếu service down

### 2. Smart Fallback

```typescript
// Trong API route
if (usePythonAI && healthCheck.ok) {
  // Gọi Python AI Service
  try {
    const response = await fetch(`${AI_SERVICE_URL}/predict/batch`);
    return response.json();
  } catch (error) {
    // Fallback to mock
    return generateMultiplePredictions(10);
  }
}
```

### 3. Status Indicator

UI hiển thị:
- 🟢 **"Python AI Service: Hoạt động"** - Service đang chạy
- 🟡 **"Python AI Service: Không khả dụng"** - Service down, dùng mock

### 4. Prediction Details

Chi tiết dự báo hiển thị:
- **Method**: heuristic, ml, python_ai, mock, fallback_mock
- **Confidence Score**: Độ tin cậy (0-100%)
- **Warning**: Cảnh báo nếu có

## 🔌 API Endpoints

### 1. Health Check

```typescript
GET /api/ai/predict
// Check Python AI Service health

Response:
{
  "status": "healthy" | "unavailable",
  "database": "connected" | "disconnected",
  "models_available": {
    "heuristic": true,
    "ml": false
  }
}
```

### 2. Generate Predictions

```typescript
GET /api/ai?generate=true&use_python=true

// Tự động:
// - Nếu Python AI available → gọi Python service
// - Nếu không → dùng mock data
```

### 3. Save Predictions

```typescript
POST /api/ai
{
  "generate_multiple": true,
  "use_python": true  // Optional, auto-detect if not provided
}
```

## 📝 Cách Sử dụng trong Code

### Trong React Component:

```typescript
import { useAIPredictions, useAIServiceHealth } from "@/hooks/useAIPredictions";

function MyComponent() {
  // Check AI service health
  const { data: healthData } = useAIServiceHealth();
  const isAvailable = healthData?.available === true;

  // Get predictions (tự động dùng Python AI nếu available)
  const { data, isLoading } = useAIPredictions(
    "Hà Nội",  // tinh_thanh
    true,       // generate
    true        // usePythonAI (mặc định: true)
  );

  return (
    <div>
      {isAvailable ? "🟢 Python AI Active" : "🟡 Using Mock Data"}
      {/* ... */}
    </div>
  );
}
```

### Trong API Route:

```typescript
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

// Check health
const healthRes = await fetch(`${AI_SERVICE_URL}/health`);

if (healthRes.ok) {
  // Call Python AI
  const response = await fetch(`${AI_SERVICE_URL}/predict`, {
    method: "POST",
    body: JSON.stringify({ tinh_thanh: "Hà Nội" })
  });
}
```

## 🎨 UI Features

### Admin AI Page (`/admin/ai`)

1. **Status Indicator**: Hiển thị trạng thái Python AI Service
2. **Smart Button**: 
   - "Tạo dự báo AI mới" nếu Python AI available
   - "Hiển thị dữ liệu mẫu" nếu không available
3. **Prediction Details**: Hiển thị method, confidence score, warnings

### Prediction Cards

Mỗi prediction hiển thị:
- Method badge (heuristic/ml/python_ai/mock)
- Confidence score
- Warning messages nếu có

## 🔄 Workflow Integration

### Tích hợp với Request Approval:

Khi admin approve request, có thể:
1. **Gọi AI để dự báo nhu cầu** → Giúp quyết định resource allocation
2. **Gợi ý số lượng** resource cần phân phối

Có thể thêm vào `src/app/api/requests/[id]/approve/route.ts`:

```typescript
// Sau khi approve
if (approved) {
  // Get AI prediction for this location
  const prediction = await fetch(`${AI_SERVICE_URL}/predict`, {
    method: "POST",
    body: JSON.stringify({
      tinh_thanh: extractProvinceFromAddress(request.dia_chi),
      loai_thien_tai: determineDisasterType(request.loai_yeu_cau),
      so_nguoi: request.so_nguoi
    })
  });
  
  // Use prediction data to improve matching
}
```

## 📊 Monitoring

### Health Check Logs

Service tự động log:
- Python AI Service availability
- Response times
- Errors và fallbacks

Check logs:
```bash
# Next.js logs
npm run dev

# Python AI Service logs  
cd ai-service
python main.py
```

## 🐛 Troubleshooting

### Python AI Service không available

1. **Kiểm tra service đang chạy**:
   ```bash
   curl http://localhost:8000/health
   ```

2. **Kiểm tra DATABASE_URL**:
   ```bash
   cd ai-service
   cat .env  # Kiểm tra DATABASE_URL
   ```

3. **Kiểm tra firewall/network**:
   - Port 8000 có bị block không?
   - AI_SERVICE_URL có đúng không?

### Predictions luôn dùng mock data

1. Kiểm tra `AI_SERVICE_URL` trong `.env`
2. Kiểm tra Python service logs
3. Kiểm tra network connection

## ✅ Checklist Integration

- [x] Python AI Service đã chạy
- [x] Environment variable `AI_SERVICE_URL` đã set
- [x] Health check endpoint hoạt động
- [x] Auto-detection hoạt động
- [x] Fallback mechanism hoạt động
- [x] UI status indicator hiển thị đúng
- [x] Predictions được generate từ Python AI

## 🚀 Next Steps

Sau khi tích hợp xong, bạn có thể:

1. **Train ML Model**: 
   ```bash
   curl -X POST http://localhost:8000/train
   ```

2. **Improve Predictions**: Thêm more features vào model

3. **Integrate với Auto-Matching**: Dùng AI predictions để improve matching logic

4. **Dashboard Metrics**: Hiển thị accuracy của predictions

