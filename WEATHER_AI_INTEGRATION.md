# 🌦️ Weather AI Integration - ReliefLink

## 📋 Tổng quan

AI Service đã được tích hợp với **OpenWeatherMap API** để:
- ✅ Lấy dữ liệu thời tiết thực tế cho các tỉnh thành Việt Nam
- ✅ Phân tích và dự đoán thiên tai dựa trên thời tiết
- ✅ Tự động gửi cảnh báo khi phát hiện nguy cơ
- ✅ Monitoring định kỳ (mỗi 6 giờ)

## 🎯 Mục đích

Thay vì chỉ dựa vào dữ liệu lịch sử, AI service giờ đây:
1. **Lấy thời tiết thực tế** từ OpenWeatherMap API
2. **Phân tích các chỉ số** (mưa, gió, nhiệt độ, độ ẩm, áp suất)
3. **Dự đoán thiên tai** dựa trên patterns:
   - **Lũ lụt**: Mưa lớn + độ ẩm cao
   - **Bão**: Gió mạnh + áp suất thấp
   - **Hạn hán**: Nhiệt độ cao + độ ẩm thấp
   - **Sạt lở đất**: Mưa lớn + độ ẩm cao
4. **Gửi cảnh báo tự động** đến admin khi phát hiện nguy cơ

## 🚀 Cài đặt

### 1. Lấy OpenWeatherMap API Key (FREE)

1. Đăng ký tại: https://openweathermap.org/api
2. Chọn "Free" plan:
   - 1,000 calls/day
   - Current weather data
   - 5-day forecast
   - Hoàn toàn miễn phí!
3. Copy API key

### 2. Cấu hình Environment

Thêm vào `ai-service/.env`:

```env
WEATHER_API_KEY=your_openweathermap_api_key_here
NEXTJS_API_URL=http://localhost:3000
```

### 3. Cài đặt Dependencies

```bash
cd ai-service
pip install -r requirements.txt
```

Dependencies mới:
- `requests==2.31.0` - Gọi OpenWeatherMap API
- `apscheduler==3.10.4` - Scheduled jobs

## 📡 API Endpoints

### 1. Check thời tiết cho một tỉnh

```bash
GET /weather/check/{tinh_thanh}
```

Ví dụ:
```bash
curl http://localhost:8000/weather/check/Hà%20Nội
```

Response:
```json
{
  "tinh_thanh": "Hà Nội",
  "coords": {"lat": 21.0285, "lon": 105.8542},
  "weather": {
    "main": {"temp": 28, "humidity": 92, "pressure": 1005},
    "weather": [{"main": "Rain", "description": "mưa lớn"}],
    "wind": {"speed": 15},
    "rain": {"1h": 25}
  },
  "disaster_risk": {
    "risk_level": "high",
    "disaster_types": ["Lũ lụt"],
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
  }
}
```

### 2. Check thời tiết batch

```bash
POST /weather/check-batch
Content-Type: application/json

["Hà Nội", "Hồ Chí Minh", "Đà Nẵng"]
```

### 3. Tạo cảnh báo thủ công

```bash
POST /weather/alert
Content-Type: application/json

{
  "tinh_thanh": "Hà Nội",
  "message": "Cảnh báo tùy chỉnh"
}
```

## 🔄 Tích hợp với Next.js

### 1. API Endpoint nhận cảnh báo

Đã tạo: `src/app/api/ai/weather-alert/route.ts`

Endpoint này nhận cảnh báo từ AI service và tạo notification cho admin.

### 2. Check thời tiết từ Next.js

```typescript
// GET /api/ai/weather-alert?tinh_thanh=Hà Nội
const response = await fetch('/api/ai/weather-alert?tinh_thanh=Hà Nội');
const weatherData = await response.json();
```

## ⏰ Scheduled Monitoring

AI service tự động check thời tiết **mỗi 6 giờ** cho các tỉnh thành:

- Hà Nội
- Hồ Chí Minh
- Đà Nẵng
- Hải Phòng
- Cần Thơ
- Quảng Ninh
- Thừa Thiên Huế
- Nghệ An
- Thanh Hóa
- Bình Định

**Cảnh báo chỉ được gửi khi:**
- `risk_level >= "high"`
- Có ít nhất 1 loại thiên tai được phát hiện

## 📊 Risk Analysis Logic

### Lũ lụt (Flood)
- Mưa > 20mm/h → +0.4 risk
- Mưa > 50mm/3h → +0.5 risk
- Độ ẩm > 90% + mưa > 10mm/h → +0.3 risk
- Weather condition = "rain" → +0.2 risk

### Bão (Storm)
- Gió > 20 m/s → +0.5 risk
- Gió > 25 m/s → +0.8 risk
- Áp suất < 1000 hPa → +0.4 risk
- Weather condition = "storm" → +0.6 risk

### Hạn hán (Drought)
- Nhiệt độ > 35°C + độ ẩm < 30% → +0.4 risk
- Nhiệt độ > 38°C → +0.5 risk
- Không mưa + độ ẩm < 40% → +0.3 risk

### Sạt lở đất (Landslide)
- Mưa > 40mm/3h + độ ẩm > 85% → +0.5 risk
- Mưa > 15mm/h + áp suất < 1005 → +0.4 risk

## 🎯 Workflow

```
1. Scheduled Job (mỗi 6 giờ)
   ↓
2. Check thời tiết cho 10 tỉnh thành chính
   ↓
3. Phân tích disaster risk
   ↓
4. Nếu risk_level >= "high"
   ↓
5. Gửi cảnh báo đến Next.js API
   ↓
6. Next.js tạo notification cho admin
   ↓
7. Admin nhận thông báo trong hệ thống
```

## 🔔 Notification Format

Khi có cảnh báo, admin sẽ nhận notification:

```
🚨 CẢNH BÁO: Lũ lụt có nguy cơ xảy ra tại Hà Nội

Thông tin thời tiết:
- Nhiệt độ: 28°C
- Độ ẩm: 92%
- Mưa: 25mm/h
- Gió: 15 m/s
```

## 🛠️ Troubleshooting

### Weather API không hoạt động

1. Kiểm tra `WEATHER_API_KEY` trong `.env`
2. Kiểm tra API key có hợp lệ không: https://openweathermap.org/api
3. Kiểm tra quota (free tier: 1000 calls/day)

### Không nhận được cảnh báo

1. Kiểm tra `NEXTJS_API_URL` trong `.env`
2. Đảm bảo Next.js app đang chạy
3. Kiểm tra logs của AI service
4. Kiểm tra risk_level có >= "high" không

### Scheduled job không chạy

1. Kiểm tra logs: `scheduler.add_job` đã được gọi
2. Kiểm tra timezone
3. Restart AI service

## 📈 Cải thiện trong tương lai

- [ ] Tích hợp thêm dữ liệu từ các nguồn khác (VD: Vietnam Meteorological Service)
- [ ] Machine Learning model để dự đoán chính xác hơn
- [ ] Historical weather patterns analysis
- [ ] Multi-day forecast analysis
- [ ] Custom thresholds cho từng vùng
- [ ] SMS/Email alerts ngoài in-app notifications

## 📝 Notes

- OpenWeatherMap Free tier: 1,000 calls/day
- Với 10 tỉnh × 4 lần/ngày = 40 calls/day → Còn dư nhiều!
- Scheduled job chạy mỗi 6 giờ = 4 lần/ngày
- Có thể tăng frequency nếu cần

