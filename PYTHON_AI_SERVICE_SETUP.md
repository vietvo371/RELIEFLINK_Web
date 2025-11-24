# 🐍 Python AI Service Setup Guide

Hướng dẫn cài đặt và chạy Python AI Service cho ReliefLink.

## 📋 Tổng quan

Python AI Service là một microservice độc lập chạy bằng FastAPI, cung cấp:
- ✅ Dự báo nhu cầu cứu trợ dựa trên historical data (miễn phí)
- ✅ Heuristic prediction (không cần train model)
- ✅ ML prediction với Random Forest (cần train)
- ✅ Hybrid approach (kết hợp cả hai)

## 🚀 Quick Start

### 1. Cài đặt Python dependencies

```bash
cd ai-service
pip install -r requirements.txt
```

Hoặc sử dụng virtual environment:

```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # Trên Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Cấu hình Environment

Tạo file `.env` trong thư mục `ai-service/`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/relieflink
```

**Lưu ý**: Sử dụng cùng `DATABASE_URL` như Next.js app để kết nối cùng database.

### 3. Chạy Service

```bash
python main.py
```

Hoặc với uvicorn:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Service sẽ chạy tại: `http://localhost:8000`

### 4. Kiểm tra Service

Mở browser và truy cập:
- Health check: `http://localhost:8000/health`
- API Docs: `http://localhost:8000/docs`

## 🔗 Tích hợp với Next.js

### 1. Cập nhật Environment Variables

Thêm vào `.env` của Next.js app (ở root):

```env
AI_SERVICE_URL=http://localhost:8000
```

### 2. Test API Integration

Service đã có sẵn endpoint `/api/ai/predict` trong Next.js để gọi Python service.

### 3. Sử dụng trong Frontend

Service sẽ tự động được sử dụng khi:
- Frontend gọi `/api/ai?generate=true&use_python=true`
- Hoặc gọi `/api/ai/predict` endpoint

## 📊 API Endpoints

### Health Check
```bash
GET /health
```

### Tạo dự báo đơn lẻ
```bash
POST /predict
Content-Type: application/json

{
  "tinh_thanh": "Hà Nội",
  "loai_thien_tai": "Lũ lụt",
  "so_nguoi": 100
}
```

### Tạo dự báo batch
```bash
POST /predict/batch
Content-Type: application/json

[
  {"tinh_thanh": "Hà Nội", "loai_thien_tai": "Lũ lụt"},
  {"tinh_thanh": "Hồ Chí Minh", "loai_thien_tai": "Bão"}
]
```

### Train ML Model
```bash
POST /train
```

## 🐳 Chạy với Docker

### 1. Build image

```bash
cd ai-service
docker build -t relieflink-ai-service .
```

### 2. Run container

```bash
docker run -p 8000:8000 --env-file .env relieflink-ai-service
```

### 3. Hoặc dùng docker-compose

```bash
cd ai-service
docker-compose up -d
```

## 🔧 Cấu hình

### Development Mode

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 📈 Model Training

### Train model thủ công

```bash
curl -X POST http://localhost:8000/train
```

### Train model tự động (cron job)

Thêm vào crontab:

```bash
# Train model mỗi ngày lúc 2:00 AM
0 2 * * * curl -X POST http://localhost:8000/train >> /var/log/ai-service-train.log 2>&1
```

### Điều kiện để train model

- Cần ít nhất 50 historical records trong database
- Cần có data trong bảng `phan_phois` với `trang_thai = 'hoan_thanh'`
- Models sẽ được lưu trong thư mục `models/`

## 🔍 Debugging

### Kiểm tra logs

```bash
# Nếu chạy với Python
python main.py

# Nếu chạy với uvicorn
uvicorn main:app --log-level debug
```

### Test API

```bash
# Health check
curl http://localhost:8000/health

# Test prediction
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"tinh_thanh": "Hà Nội", "loai_thien_tai": "Lũ lụt"}'
```

## 🐛 Troubleshooting

### Lỗi database connection

**Problem**: `Database connection error`

**Solution**:
1. Kiểm tra `DATABASE_URL` trong `.env`
2. Đảm bảo database đang chạy
3. Test connection:
   ```bash
   psql $DATABASE_URL -c "SELECT 1"
   ```

### Lỗi không train được model

**Problem**: `Not enough data to train model`

**Solution**:
1. Cần ít nhất 50 records trong database
2. Chạy seed để tạo dữ liệu mẫu:
   ```bash
   yarn prisma:seed
   ```
3. Đảm bảo có historical distributions

### Lỗi port đã được sử dụng

**Problem**: `Address already in use`

**Solution**:
1. Đổi port trong `main.py`:
   ```python
   uvicorn.run(app, host="0.0.0.0", port=8001)
   ```
2. Hoặc kill process đang dùng port 8000:
   ```bash
   lsof -ti:8000 | xargs kill -9
   ```

## 📝 Notes

- **Heuristic method**: Luôn available, không cần train, accuracy ~70-80%
- **ML method**: Cần train trước, accuracy ~80-90%, nhưng cần đủ data
- Service tự động fallback về heuristic nếu ML model chưa được train

## 🔒 Production Checklist

- [ ] Thay đổi CORS origins từ `["*"]` sang specific domains
- [ ] Thêm authentication cho API
- [ ] Setup rate limiting
- [ ] Setup logging (file-based hoặc cloud)
- [ ] Setup monitoring (Prometheus, Grafana)
- [ ] Setup auto-scaling
- [ ] Setup health checks trong orchestrator
- [ ] Backup models định kỳ

## 📚 Documentation

- API docs tự động: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Main README: `ai-service/README.md`

