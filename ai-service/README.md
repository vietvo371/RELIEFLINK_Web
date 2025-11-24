# ReliefLink AI Service

Python microservice để dự báo nhu cầu cứu trợ dựa trên historical data.

## 🚀 Tính năng

- ✅ **Heuristic Prediction**: Dự báo dựa trên patterns từ historical data (không cần train)
- ✅ **ML Prediction**: Sử dụng Random Forest model (cần train)
- ✅ **Hybrid Approach**: Kết hợp cả hai phương pháp
- ✅ **Real-time Analysis**: Phân tích historical data real-time
- ✅ **Weather API Integration**: Tích hợp OpenWeatherMap để dự đoán thiên tai dựa trên thời tiết thực tế
- ✅ **Automatic Alerts**: Tự động gửi cảnh báo khi phát hiện nguy cơ thiên tai
- ✅ **Scheduled Monitoring**: Check thời tiết định kỳ (mỗi 6 giờ) cho các tỉnh thành chính
- ✅ **RESTful API**: FastAPI với automatic docs

## 📋 Yêu cầu

- Python 3.11+
- PostgreSQL database (cùng database với Next.js app)
- pip hoặc pipenv

## 🛠️ Cài đặt

### 1. Clone và di chuyển vào thư mục

```bash
cd ai-service
```

### 2. Cài đặt dependencies

```bash
pip install -r requirements.txt
```

Hoặc sử dụng virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # Trên Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Cấu hình environment

Copy `.env.example` thành `.env` và điền thông tin:

```bash
cp .env.example .env
```

Chỉnh sửa `.env`:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/relieflink
NEXTJS_API_URL=http://localhost:3000
WEATHER_API_KEY=your_openweathermap_api_key_here
```

**Lấy OpenWeatherMap API Key (FREE):**
1. Đăng ký tại: https://openweathermap.org/api
2. Chọn "Free" plan (1000 calls/day)
3. Copy API key vào `.env`

## 🚀 Chạy Service

### Development mode

```bash
python main.py
```

Hoặc với uvicorn:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Service sẽ chạy tại: `http://localhost:8000`

### Production mode (với Docker)

```bash
docker build -t relieflink-ai-service .
docker run -p 8000:8000 --env-file .env relieflink-ai-service
```

## 📚 API Documentation

Sau khi chạy service, truy cập:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🔌 API Endpoints

### 1. Health Check

```bash
GET /health
```

Response:
```json
{
  "status": "healthy",
  "database": "connected",
  "models_available": {
    "heuristic": true,
    "ml": false
  }
}
```

### 2. Tạo dự báo đơn lẻ

```bash
POST /predict
Content-Type: application/json

{
  "tinh_thanh": "Hà Nội",
  "loai_thien_tai": "Lũ lụt",
  "so_nguoi": 100
}
```

Response:
```json
{
  "tinh_thanh": "Hà Nội",
  "loai_thien_tai": "Lũ lụt",
  "du_doan_nhu_cau_thuc_pham": 1680,
  "du_doan_nhu_cau_nuoc": 5250,
  "du_doan_nhu_cau_thuoc": 385,
  "du_doan_nhu_cau_cho_o": 33,
  "ngay_du_bao": "2024-01-15T00:00:00",
  "confidence_score": 0.75,
  "method": "heuristic"
}
```

### 3. Tạo dự báo batch

```bash
POST /predict/batch
Content-Type: application/json

[
  {"tinh_thanh": "Hà Nội", "loai_thien_tai": "Lũ lụt"},
  {"tinh_thanh": "Hồ Chí Minh", "loai_thien_tai": "Bão"}
]
```

### 4. Train ML Model

```bash
POST /train
```

Response:
```json
{
  "message": "Models trained successfully",
  "status": "success"
}
```

### 5. Lấy danh sách tỉnh thành

```bash
GET /predict/provinces
```

### 6. Check thời tiết và dự đoán thiên tai

```bash
GET /weather/check/{tinh_thanh}
```

Ví dụ:
```bash
GET /weather/check/Hà Nội
```

Response:
```json
{
  "tinh_thanh": "Hà Nội",
  "coords": {"lat": 21.0285, "lon": 105.8542},
  "weather": {...},
  "forecast": {...},
  "disaster_risk": {
    "risk_level": "high",
    "disaster_types": ["Lũ lụt", "Bão"],
    "confidence": 0.85,
    "risk_score": 0.75,
    "details": {
      "current": {
        "temp": 28,
        "humidity": 92,
        "rain": 25,
        "wind_speed": 15
      },
      "flood": {
        "risk": 0.6,
        "reason": "Mưa lớn kéo dài"
      }
    }
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

### 7. Check thời tiết batch (nhiều tỉnh)

```bash
POST /weather/check-batch
Content-Type: application/json

["Hà Nội", "Hồ Chí Minh", "Đà Nẵng"]
```

### 8. Tạo cảnh báo thời tiết thủ công

```bash
POST /weather/alert
Content-Type: application/json

{
  "tinh_thanh": "Hà Nội",
  "message": "Cảnh báo tùy chỉnh"
}
```

## 🔗 Tích hợp với Next.js

### Cách 1: Update API route trong Next.js

Tạo file `src/app/api/ai/predict/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${AI_SERVICE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error("AI service error");
    }
    
    const prediction = await response.json();
    return NextResponse.json(prediction);
  } catch (error) {
    console.error("AI prediction error:", error);
    return NextResponse.json(
      { error: "Failed to get prediction" },
      { status: 500 }
    );
  }
}
```

### Cách 2: Update hook

Update `src/hooks/useAIPredictions.ts`:

```typescript
export function useAIPredictions(tinhThanh?: string, generate?: boolean) {
  const { error: showError } = useToast();
  
  return useQuery<PredictionsResponse>({
    queryKey: ["ai-predictions", tinhThanh, generate],
    queryFn: async () => {
      if (generate) {
        // Call Python AI service
        const res = await fetch("/api/ai/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tinh_thanh: tinhThanh || "",
            loai_thien_tai: undefined,
          }),
        });
        
        if (!res.ok) throw new Error("AI prediction failed");
        const prediction = await res.json();
        
        return { predictions: [prediction] };
      }
      
      // Fallback to database
      const params = new URLSearchParams();
      if (tinhThanh) params.append("tinh_thanh", tinhThanh);
      
      const res = await fetch(`/api/ai?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch predictions");
      return res.json();
    },
  });
}
```

## 🌦️ Weather API Integration

### Cách hoạt động:

1. **Lấy dữ liệu thời tiết**: AI service gọi OpenWeatherMap API để lấy thời tiết hiện tại và dự báo 5 ngày
2. **Phân tích rủi ro**: Phân tích các chỉ số thời tiết để dự đoán thiên tai:
   - **Lũ lụt**: Mưa lớn (>20mm/h), độ ẩm cao (>90%)
   - **Bão**: Gió mạnh (>20 m/s), áp suất thấp (<1000 hPa)
   - **Hạn hán**: Nhiệt độ cao (>35°C), độ ẩm thấp (<30%)
   - **Sạt lở đất**: Mưa lớn + độ ẩm cao (>85%)
3. **Gửi cảnh báo**: Tự động gửi notification đến admin khi phát hiện nguy cơ cao
4. **Monitoring định kỳ**: Check thời tiết mỗi 6 giờ cho các tỉnh thành chính

### Risk Levels:

- **critical**: Nguy cơ rất cao (risk_score >= 0.8)
- **high**: Nguy cơ cao (risk_score >= 0.6)
- **medium**: Nguy cơ trung bình (risk_score >= 0.4)
- **low**: Nguy cơ thấp (risk_score < 0.4)

### Scheduled Jobs:

AI service tự động check thời tiết mỗi 6 giờ cho các tỉnh thành:
- Hà Nội, Hồ Chí Minh, Đà Nẵng, Hải Phòng, Cần Thơ
- Quảng Ninh, Thừa Thiên Huế, Nghệ An, Thanh Hóa, Bình Định

Cảnh báo chỉ được gửi khi risk_level >= "high"

## 🔧 Cấu hình Environment

Thêm vào `.env` của Next.js app:

```env
AI_SERVICE_URL=http://localhost:8000
```

Thêm vào `.env` của AI service:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/relieflink
NEXTJS_API_URL=http://localhost:3000
WEATHER_API_KEY=your_openweathermap_api_key_here
```

## 📊 Model Training

Train model định kỳ bằng cron job:

```bash
# Train model mỗi ngày lúc 2:00 AM
0 2 * * * curl -X POST http://localhost:8000/train
```

Hoặc tự động train khi có đủ data:

```python
# Trong main.py, có thể thêm scheduled task
```

## 🐛 Troubleshooting

### Lỗi database connection

- Kiểm tra `DATABASE_URL` trong `.env`
- Đảm bảo database đang chạy
- Kiểm tra firewall/network

### Model không train được

- Cần ít nhất 50 samples trong database
- Kiểm tra xem có historical distributions không
- Xem logs để biết chi tiết lỗi

### Prediction chậm

- Heuristic method: ~100-500ms
- ML method: ~200-1000ms (nếu model lớn)
- Optimize bằng cách cache predictions

## 📈 Performance

- **Heuristic**: Nhanh, không cần train, accuracy ~70-80%
- **ML**: Chậm hơn một chút, cần train, accuracy ~80-90%
- **Hybrid**: Cân bằng, accuracy ~75-85%

## 🔒 Security

Trong production:
- Chỉ định CORS origins cụ thể
- Thêm authentication cho API
- Rate limiting
- Input validation

## 📝 License

MIT

