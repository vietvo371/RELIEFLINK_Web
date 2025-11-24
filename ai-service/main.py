"""
ReliefLink AI Service
Python microservice để dự báo nhu cầu cứu trợ dựa trên historical data
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime, timedelta
try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    PSYCOPG_VERSION = 2
except ImportError:
    try:
        import psycopg
        from psycopg.rows import dict_row
        PSYCOPG_VERSION = 3
    except ImportError:
        raise ImportError("Please install psycopg2-binary or psycopg[binary]")
import os
from dotenv import load_dotenv
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
import joblib
import sys
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import requests

# Import weather service
try:
    from weather_service import check_weather_and_predict, get_province_coords
except ImportError:
    print("⚠️  weather_service module not found, weather features disabled")
    check_weather_and_predict = None
    get_province_coords = None

load_dotenv()

app = FastAPI(title="ReliefLink AI Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Trong production nên chỉ định cụ thể
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL")

# Model paths
MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

# Next.js API URL for sending notifications
NEXTJS_API_URL = os.getenv("NEXTJS_API_URL", "http://localhost:3000")

# Scheduler for periodic weather checks
scheduler = BackgroundScheduler()
scheduler.start()


class PredictionRequest(BaseModel):
    tinh_thanh: str
    loai_thien_tai: Optional[str] = None
    so_nguoi: Optional[int] = None


class PredictionResponse(BaseModel):
    tinh_thanh: str
    loai_thien_tai: str
    du_doan_nhu_cau_thuc_pham: int
    du_doan_nhu_cau_nuoc: int
    du_doan_nhu_cau_thuoc: int
    du_doan_nhu_cau_cho_o: int
    ngay_du_bao: str
    confidence_score: Optional[float] = None
    method: str = "heuristic"  # heuristic, ml, hybrid


class WeatherAlertRequest(BaseModel):
    tinh_thanh: str
    message: Optional[str] = None


def get_db_connection():
    """Tạo kết nối database"""
    try:
        if PSYCOPG_VERSION == 3:
            conn = psycopg.connect(DATABASE_URL)
            return conn
        else:
            conn = psycopg2.connect(DATABASE_URL)
            return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        return None


def analyze_historical_data(tinh_thanh: str, loai_thien_tai: Optional[str] = None):
    """
    Phân tích dữ liệu lịch sử từ database để tạo dự báo
    """
    conn = get_db_connection()
    if not conn:
        return None

    try:
        if PSYCOPG_VERSION == 3:
            cursor = conn.cursor(row_factory=dict_row)
        else:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Query historical requests
        query = """
            SELECT 
                loai_yeu_cau,
                so_nguoi,
                do_uu_tien,
                created_at,
                CASE 
                    WHEN dia_chi LIKE %s THEN true
                    ELSE false
                END as in_province
            FROM yeu_cau_cuu_tros
            WHERE created_at >= NOW() - INTERVAL '6 months'
            ORDER BY created_at DESC
            LIMIT 500
        """
        
        cursor.execute(query, (f'%{tinh_thanh}%',))
        historical_requests = cursor.fetchall()
        
        # Query historical distributions để tính actual needs
        dist_query = """
            SELECT 
                ph.id_yeu_cau,
                yc.so_nguoi,
                nr.loai,
                ph.thoi_gian_xuat,
                ph.thoi_gian_giao
            FROM phan_phois ph
            JOIN yeu_cau_cuu_tros yc ON ph.id_yeu_cau = yc.id
            JOIN nguon_lucs nr ON ph.id_nguon_luc = nr.id
            WHERE ph.trang_thai = 'hoan_thanh'
            AND ph.thoi_gian_xuat >= NOW() - INTERVAL '6 months'
            LIMIT 200
        """
        
        cursor.execute(dist_query)
        historical_distributions = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return {
            "requests": historical_requests,
            "distributions": historical_distributions
        }
    except Exception as e:
        print(f"Error analyzing historical data: {e}")
        if conn:
            conn.close()
        return None


def send_alert_to_nextjs(tinh_thanh: str, disaster_types: List[str], risk_level: str, details: Dict):
    """
    Gửi cảnh báo đến Next.js API để tạo notification
    """
    try:
        # Call Next.js API endpoint
        url = f"{NEXTJS_API_URL}/api/ai/weather-alert"
        
        payload = {
            "tinh_thanh": tinh_thanh,
            "disaster_types": disaster_types,
            "risk_level": risk_level,
            "details": details
        }
        
        response = requests.post(
            url,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Alert sent successfully: {result.get('notifications_sent', 0)} notifications")
            return True
        else:
            print(f"⚠️  Failed to send alert: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error sending alert to Next.js: {e}")
        return False


def heuristic_prediction(
    tinh_thanh: str, 
    loai_thien_tai: Optional[str] = None,
    so_nguoi: Optional[int] = None
) -> PredictionResponse:
    """
    Dự báo dựa trên heuristic và historical patterns
    Không cần train model, chạy real-time
    """
    historical_data = analyze_historical_data(tinh_thanh, loai_thien_tai)
    
    # Base multipliers theo loại thiên tai
    disaster_multipliers = {
        "Lũ lụt": {"food": 1.2, "water": 1.5, "medicine": 1.1, "shelter": 1.3},
        "Bão": {"food": 1.5, "water": 1.3, "medicine": 1.2, "shelter": 1.6},
        "Hạn hán": {"food": 1.1, "water": 2.0, "medicine": 1.0, "shelter": 0.8},
        "Sạt lở đất": {"food": 1.3, "water": 1.2, "medicine": 1.4, "shelter": 1.8},
        "Động đất": {"food": 1.4, "water": 1.4, "medicine": 1.5, "shelter": 2.0},
        "Cháy rừng": {"food": 1.2, "water": 1.6, "medicine": 1.3, "shelter": 1.4},
    }
    
    # Default multipliers
    multipliers = disaster_multipliers.get(
        loai_thien_tai or "Lũ lụt",
        {"food": 1.2, "water": 1.3, "medicine": 1.1, "shelter": 1.2}
    )
    
    # Base needs per person (kg/day, lít/day, etc.)
    base_food_per_person = 2.0  # kg/day
    base_water_per_person = 5.0  # lít/day
    base_medicine_per_person = 0.5  # đơn vị/day
    base_shelter_per_household = 1  # hộ
    
    # Estimate affected people từ historical data
    if historical_data and historical_data.get("requests"):
        people_list = [r["so_nguoi"] for r in historical_data["requests"] if r.get("so_nguoi")]
        if people_list:
            avg_people = float(np.mean(people_list))
            people_estimate = int(avg_people * 1.1)  # +10% buffer
        else:
            people_estimate = so_nguoi or 100
    else:
        people_estimate = so_nguoi or 100
    
    # Estimate households (average 4 people per household in Vietnam)
    households = max(1, people_estimate // 4)
    
    # Calculate predictions for 7 days
    days = 7
    
    food_need = int(people_estimate * base_food_per_person * days * multipliers["food"])
    water_need = int(people_estimate * base_water_per_person * days * multipliers["water"])
    medicine_need = int(people_estimate * base_medicine_per_person * days * multipliers["medicine"])
    shelter_need = int(households * multipliers["shelter"])
    
    # Apply historical adjustment nếu có data
    if historical_data and historical_data.get("distributions"):
        # Calculate average actual usage
        distributions = historical_data["distributions"]
        people_list = [d["so_nguoi"] for d in distributions if d.get("so_nguoi")]
        if people_list:
            avg_people_historical = float(np.mean(people_list))
            
            if avg_people_historical > 0:
                # Adjust based on historical patterns
                adjustment_factor = float(people_estimate) / avg_people_historical
                food_need = int(food_need * adjustment_factor)
                water_need = int(water_need * adjustment_factor)
                medicine_need = int(medicine_need * adjustment_factor)
    
    # Ensure minimum values
    food_need = max(1000, food_need)
    water_need = max(2000, water_need)
    medicine_need = max(500, medicine_need)
    shelter_need = max(50, shelter_need)
    
    return PredictionResponse(
        tinh_thanh=tinh_thanh,
        loai_thien_tai=loai_thien_tai or "Lũ lụt",
        du_doan_nhu_cau_thuc_pham=food_need,
        du_doan_nhu_cau_nuoc=water_need,
        du_doan_nhu_cau_thuoc=medicine_need,
        du_doan_nhu_cau_cho_o=shelter_need,
        ngay_du_bao=(datetime.now() + timedelta(days=7)).isoformat(),
        confidence_score=0.75 if historical_data else 0.5,
        method="heuristic"
    )


def train_ml_model():
    """
    Train ML model từ historical data
    Chạy định kỳ (cron job) hoặc on-demand
    """
    historical_data = analyze_historical_data("")  # Get all data
    
    if not historical_data or not historical_data["distributions"]:
        print("Not enough data to train model")
        return False
    
    # Prepare features
    X = []
    y_food = []
    y_water = []
    y_medicine = []
    y_shelter = []
    
    distributions = historical_data["distributions"]
    
    for dist in distributions:
        # Features: số người, loại thiên tai, thời gian, ...
        features = [
            dist["so_nguoi"],
            hash(dist.get("loai", "")) % 100,  # Simple encoding
        ]
        X.append(features)
        
        # Labels: actual distributed amounts (sẽ cần thêm fields trong DB)
        # Tạm thời estimate từ so_nguoi
        y_food.append(dist["so_nguoi"] * 2 * 7)
        y_water.append(dist["so_nguoi"] * 5 * 7)
        y_medicine.append(dist["so_nguoi"] * 0.5 * 7)
        y_shelter.append(max(1, dist["so_nguoi"] // 4))
    
    if len(X) < 10:
        print("Not enough data for ML model")
        return False
    
    X = np.array(X)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Train models
    models = {
        "food": RandomForestRegressor(n_estimators=50, random_state=42),
        "water": RandomForestRegressor(n_estimators=50, random_state=42),
        "medicine": RandomForestRegressor(n_estimators=50, random_state=42),
        "shelter": RandomForestRegressor(n_estimators=50, random_state=42),
    }
    
    models["food"].fit(X_scaled, y_food)
    models["water"].fit(X_scaled, y_water)
    models["medicine"].fit(X_scaled, y_medicine)
    models["shelter"].fit(X_scaled, y_shelter)
    
    # Save models
    joblib.dump(scaler, f"{MODEL_DIR}/scaler.pkl")
    for name, model in models.items():
        joblib.dump(model, f"{MODEL_DIR}/model_{name}.pkl")
    
    print("Models trained and saved successfully")
    return True


def ml_prediction(tinh_thanh: str, so_nguoi: Optional[int] = None) -> Optional[PredictionResponse]:
    """
    Dự báo bằng ML model (nếu đã train)
    """
    model_paths = {
        "food": f"{MODEL_DIR}/model_food.pkl",
        "water": f"{MODEL_DIR}/model_water.pkl",
        "medicine": f"{MODEL_DIR}/model_medicine.pkl",
        "shelter": f"{MODEL_DIR}/model_shelter.pkl",
    }
    
    scaler_path = f"{MODEL_DIR}/scaler.pkl"
    
    # Check if models exist
    if not all(os.path.exists(path) for path in list(model_paths.values()) + [scaler_path]):
        return None
    
    try:
        scaler = joblib.load(scaler_path)
        models = {name: joblib.load(path) for name, path in model_paths.items()}
        
        # Prepare features
        features = np.array([[so_nguoi or 100, hash(tinh_thanh) % 100]])
        features_scaled = scaler.transform(features)
        
        # Predict
        food = int(models["food"].predict(features_scaled)[0])
        water = int(models["water"].predict(features_scaled)[0])
        medicine = int(models["medicine"].predict(features_scaled)[0])
        shelter = int(models["shelter"].predict(features_scaled)[0])
        
        return PredictionResponse(
            tinh_thanh=tinh_thanh,
            loai_thien_tai="Dự báo",
            du_doan_nhu_cau_thuc_pham=max(1000, food),
            du_doan_nhu_cau_nuoc=max(2000, water),
            du_doan_nhu_cau_thuoc=max(500, medicine),
            du_doan_nhu_cau_cho_o=max(50, shelter),
            ngay_du_bao=(datetime.now() + timedelta(days=7)).isoformat(),
            confidence_score=0.85,
            method="ml"
        )
    except Exception as e:
        print(f"ML prediction error: {e}")
        return None


@app.get("/")
def root():
    return {
        "service": "ReliefLink AI Service",
        "version": "1.0.0",
        "status": "running",
        "methods": ["heuristic", "ml", "hybrid"]
    }


@app.get("/health")
def health_check():
    conn = get_db_connection()
    db_status = "connected" if conn else "disconnected"
    if conn:
        conn.close()
    
    return {
        "status": "healthy",
        "database": db_status,
        "models_available": {
            "heuristic": True,
            "ml": all(os.path.exists(f"{MODEL_DIR}/model_{name}.pkl") 
                     for name in ["food", "water", "medicine", "shelter"])
        }
    }


@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    """
    Tạo dự báo nhu cầu cứu trợ
    """
    try:
        # Try ML first, fallback to heuristic
        ml_result = ml_prediction(request.tinh_thanh, request.so_nguoi)
        
        if ml_result:
            return ml_result
        
        # Use heuristic
        return heuristic_prediction(
            request.tinh_thanh,
            request.loai_thien_tai,
            request.so_nguoi
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/batch", response_model=List[PredictionResponse])
def predict_batch(requests: List[PredictionRequest]):
    """
    Tạo nhiều dự báo cùng lúc
    """
    results = []
    for req in requests:
        try:
            pred = predict(req)
            results.append(pred)
        except Exception as e:
            print(f"Error predicting for {req.tinh_thanh}: {e}")
    return results


@app.post("/train")
def train_model():
    """
    Train ML model từ historical data
    """
    try:
        success = train_ml_model()
        if success:
            return {"message": "Models trained successfully", "status": "success"}
        else:
            return {
                "message": "Not enough data to train models",
                "status": "insufficient_data"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/predict/provinces")
def get_provinces():
    """
    Lấy danh sách tỉnh thành có trong database
    """
    conn = get_db_connection()
    if not conn:
        return {"provinces": []}
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT DISTINCT 
                CASE 
                    WHEN dia_chi LIKE '%Hà Nội%' THEN 'Hà Nội'
                    WHEN dia_chi LIKE '%Hồ Chí Minh%' OR dia_chi LIKE '%TP.HCM%' THEN 'Hồ Chí Minh'
                    WHEN dia_chi LIKE '%Đà Nẵng%' THEN 'Đà Nẵng'
                    WHEN dia_chi LIKE '%Hải Phòng%' THEN 'Hải Phòng'
                    WHEN dia_chi LIKE '%Cần Thơ%' THEN 'Cần Thơ'
                    ELSE 'Khác'
                END as province
            FROM yeu_cau_cuu_tros
            WHERE dia_chi IS NOT NULL
            LIMIT 20
        """)
        
        provinces = [row[0] for row in cursor.fetchall() if row[0]]
        cursor.close()
        conn.close()
        
        return {"provinces": list(set(provinces))}
    except Exception as e:
        if conn:
            conn.close()
        return {"provinces": []}


@app.get("/weather/check/{tinh_thanh}")
def check_weather(tinh_thanh: str):
    """
    Check thời tiết và dự đoán thiên tai cho một tỉnh thành
    """
    if not check_weather_and_predict:
        raise HTTPException(
            status_code=503,
            detail="Weather service not available. Please install weather_service module."
        )
    
    try:
        result = check_weather_and_predict(tinh_thanh)
        
        # Nếu có nguy cơ cao, tự động gửi cảnh báo
        disaster_risk = result.get("disaster_risk", {})
        risk_level = disaster_risk.get("risk_level", "low")
        disaster_types = disaster_risk.get("disaster_types", [])
        
        if risk_level in ["high", "critical"] and disaster_types:
            send_alert_to_nextjs(
                tinh_thanh,
                disaster_types,
                risk_level,
                disaster_risk.get("details", {})
            )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/weather/check-batch")
def check_weather_batch(provinces: List[str]):
    """
    Check thời tiết cho nhiều tỉnh thành cùng lúc
    """
    if not check_weather_and_predict:
        raise HTTPException(
            status_code=503,
            detail="Weather service not available"
        )
    
    results = []
    alerts_sent = []
    
    for province in provinces:
        try:
            result = check_weather_and_predict(province)
            results.append(result)
            
            # Check if alert needed
            disaster_risk = result.get("disaster_risk", {})
            risk_level = disaster_risk.get("risk_level", "low")
            disaster_types = disaster_risk.get("disaster_types", [])
            
            if risk_level in ["high", "critical"] and disaster_types:
                alert_sent = send_alert_to_nextjs(
                    province,
                    disaster_types,
                    risk_level,
                    disaster_risk.get("details", {})
                )
                if alert_sent:
                    alerts_sent.append(province)
        except Exception as e:
            print(f"Error checking weather for {province}: {e}")
            results.append({
                "tinh_thanh": province,
                "error": str(e)
            })
    
    return {
        "results": results,
        "alerts_sent": alerts_sent,
        "timestamp": datetime.now().isoformat()
    }


@app.post("/weather/alert")
def create_weather_alert(request: WeatherAlertRequest):
    """
    Tạo cảnh báo thời tiết thủ công
    """
    if not check_weather_and_predict:
        raise HTTPException(
            status_code=503,
            detail="Weather service not available"
        )
    
    try:
        result = check_weather_and_predict(request.tinh_thanh)
        disaster_risk = result.get("disaster_risk", {})
        
        # Force send alert
        disaster_types = disaster_risk.get("disaster_types", ["Thiên tai"])
        risk_level = disaster_risk.get("risk_level", "medium")
        
        message = request.message or f"Cảnh báo thời tiết cho {request.tinh_thanh}"
        
        send_alert_to_nextjs(
            request.tinh_thanh,
            disaster_types,
            risk_level,
            disaster_risk.get("details", {})
        )
        
        return {
            "message": "Alert sent successfully",
            "tinh_thanh": request.tinh_thanh,
            "disaster_risk": disaster_risk
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def periodic_weather_check():
    """
    Hàm được gọi định kỳ để check thời tiết cho các tỉnh thành chính
    """
    if not check_weather_and_predict:
        print("⚠️  Weather service not available for periodic check")
        return
    
    # Danh sách tỉnh thành cần monitor
    provinces_to_check = [
        "Hà Nội",
        "Hồ Chí Minh",
        "Đà Nẵng",
        "Hải Phòng",
        "Cần Thơ",
        "Quảng Ninh",
        "Thừa Thiên Huế",
        "Nghệ An",
        "Thanh Hóa",
        "Bình Định"
    ]
    
    print(f"🔄 Starting periodic weather check for {len(provinces_to_check)} provinces...")
    
    for province in provinces_to_check:
        try:
            result = check_weather_and_predict(province)
            disaster_risk = result.get("disaster_risk", {})
            risk_level = disaster_risk.get("risk_level", "low")
            disaster_types = disaster_risk.get("disaster_types", [])
            
            if risk_level in ["high", "critical"] and disaster_types:
                print(f"🚨 ALERT: {province} - {', '.join(disaster_types)} - Risk: {risk_level}")
                send_alert_to_nextjs(
                    province,
                    disaster_types,
                    risk_level,
                    disaster_risk.get("details", {})
                )
            else:
                print(f"✅ {province}: Risk level {risk_level}")
        except Exception as e:
            print(f"❌ Error checking {province}: {e}")
    
    print("✅ Periodic weather check completed")


# Schedule periodic weather checks (mỗi 6 giờ)
scheduler.add_job(
    periodic_weather_check,
    trigger=CronTrigger(hour="*/6"),  # Every 6 hours
    id="periodic_weather_check",
    name="Periodic Weather Check",
    replace_existing=True
)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

