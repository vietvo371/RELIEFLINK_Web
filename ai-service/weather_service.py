"""
Weather Service - Tích hợp OpenWeatherMap API để dự đoán thiên tai
"""

import os
import requests
from typing import Optional, Dict, List, Tuple
from datetime import datetime, timedelta
import json

# OpenWeatherMap API Key
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "")
WEATHER_API_URL = "https://api.openweathermap.org/data/2.5"

# Tọa độ các tỉnh thành lớn ở Việt Nam
VIETNAM_PROVINCES_COORDS = {
    "Hà Nội": {"lat": 21.0285, "lon": 105.8542},
    "Hồ Chí Minh": {"lat": 10.8231, "lon": 106.6297},
    "Đà Nẵng": {"lat": 16.0544, "lon": 108.2022},
    "Hải Phòng": {"lat": 20.8449, "lon": 106.6881},
    "Cần Thơ": {"lat": 10.0452, "lon": 105.7469},
    "Quảng Ninh": {"lat": 21.0064, "lon": 107.2925},
    "Thừa Thiên Huế": {"lat": 16.4637, "lon": 107.5909},
    "Nghệ An": {"lat": 18.6796, "lon": 105.6813},
    "Thanh Hóa": {"lat": 19.8067, "lon": 105.7852},
    "Bình Định": {"lat": 13.8800, "lon": 109.1100},
    "Quảng Nam": {"lat": 15.8801, "lon": 108.3380},
    "Quảng Ngãi": {"lat": 15.1214, "lon": 108.8048},
    "Bình Thuận": {"lat": 10.9287, "lon": 108.1021},
    "Khánh Hòa": {"lat": 12.2388, "lon": 109.1967},
    "Phú Yên": {"lat": 13.0880, "lon": 109.0920},
    "Quảng Trị": {"lat": 16.7500, "lon": 107.2000},
    "Quảng Bình": {"lat": 17.4687, "lon": 106.6227},
    "Hà Tĩnh": {"lat": 18.3429, "lon": 105.9059},
    "Quảng Ninh": {"lat": 21.0064, "lon": 107.2925},
    "Lào Cai": {"lat": 22.4856, "lon": 103.9706},
    "Sơn La": {"lat": 21.3257, "lon": 103.9167},
    "Điện Biên": {"lat": 21.4064, "lon": 103.0167},
    "Lai Châu": {"lat": 22.3869, "lon": 103.4550},
    "Yên Bái": {"lat": 21.7000, "lon": 104.8667},
    "Tuyên Quang": {"lat": 21.8183, "lon": 105.2117},
    "Cao Bằng": {"lat": 22.6657, "lon": 106.2578},
    "Bắc Kạn": {"lat": 22.1473, "lon": 105.8342},
    "Thái Nguyên": {"lat": 21.5928, "lon": 105.8442},
    "Lạng Sơn": {"lat": 21.8527, "lon": 106.7610},
    "Bắc Giang": {"lat": 21.2734, "lon": 106.1946},
    "Phú Thọ": {"lat": 21.3083, "lon": 105.3211},
    "Vĩnh Phúc": {"lat": 21.3609, "lon": 105.5970},
    "Bắc Ninh": {"lat": 21.1861, "lon": 106.0763},
    "Hải Dương": {"lat": 20.9373, "lon": 106.3146},
    "Hưng Yên": {"lat": 20.6464, "lon": 106.0511},
    "Hà Nam": {"lat": 20.5433, "lon": 105.9239},
    "Nam Định": {"lat": 20.4200, "lon": 106.1683},
    "Thái Bình": {"lat": 20.4461, "lon": 106.3367},
    "Ninh Bình": {"lat": 20.2539, "lon": 105.9750},
    "Hà Giang": {"lat": 22.8233, "lon": 104.9833},
    "Đắk Lắk": {"lat": 12.6667, "lon": 108.0500},
    "Lâm Đồng": {"lat": 11.9465, "lon": 108.4419},
    "Bình Dương": {"lat": 11.3254, "lon": 106.4774},
    "Đồng Nai": {"lat": 10.9574, "lon": 106.8429},
    "Bà Rịa - Vũng Tàu": {"lat": 10.3460, "lon": 107.0843},
    "Tây Ninh": {"lat": 11.3104, "lon": 106.0973},
    "Bình Phước": {"lat": 11.6471, "lon": 106.6056},
    "Long An": {"lat": 10.6086, "lon": 106.6714},
    "Tiền Giang": {"lat": 10.3600, "lon": 106.3600},
    "Bến Tre": {"lat": 10.2414, "lon": 106.3758},
    "Trà Vinh": {"lat": 9.9347, "lon": 106.3453},
    "Vĩnh Long": {"lat": 10.2537, "lon": 105.9722},
    "Đồng Tháp": {"lat": 10.5183, "lon": 105.6333},
    "An Giang": {"lat": 10.5216, "lon": 105.1259},
    "Kiên Giang": {"lat": 9.9522, "lon": 105.1289},
    "Cà Mau": {"lat": 9.1769, "lon": 105.1500},
    "Bạc Liêu": {"lat": 9.2941, "lon": 105.7278},
    "Sóc Trăng": {"lat": 9.6027, "lon": 105.9739},
    "Hậu Giang": {"lat": 9.7844, "lon": 105.4706},
}


def get_province_coords(tinh_thanh: str) -> Optional[Dict[str, float]]:
    """Lấy tọa độ của tỉnh thành"""
    # Normalize province name
    normalized = tinh_thanh.strip()
    
    # Try exact match
    if normalized in VIETNAM_PROVINCES_COORDS:
        return VIETNAM_PROVINCES_COORDS[normalized]
    
    # Try partial match
    for province, coords in VIETNAM_PROVINCES_COORDS.items():
        if normalized.lower() in province.lower() or province.lower() in normalized.lower():
            return coords
    
    return None


def get_current_weather(lat: float, lon: float) -> Optional[Dict]:
    """Lấy thời tiết hiện tại từ OpenWeatherMap"""
    if not WEATHER_API_KEY:
        print("⚠️  WEATHER_API_KEY not set, using mock data")
        return None
    
    try:
        url = f"{WEATHER_API_URL}/weather"
        params = {
            "lat": lat,
            "lon": lon,
            "appid": WEATHER_API_KEY,
            "units": "metric",
            "lang": "vi"
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"⚠️  Weather API error: {response.status_code}")
            return None
    except Exception as e:
        print(f"⚠️  Error fetching weather: {e}")
        return None


def get_weather_forecast(lat: float, lon: float, days: int = 5) -> Optional[Dict]:
    """Lấy dự báo thời tiết 5 ngày từ OpenWeatherMap"""
    if not WEATHER_API_KEY:
        print("⚠️  WEATHER_API_KEY not set, using mock data")
        return None
    
    try:
        url = f"{WEATHER_API_URL}/forecast"
        params = {
            "lat": lat,
            "lon": lon,
            "appid": WEATHER_API_KEY,
            "units": "metric",
            "lang": "vi",
            "cnt": days * 8  # 8 forecasts per day (3-hour intervals)
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"⚠️  Weather Forecast API error: {response.status_code}")
            return None
    except Exception as e:
        print(f"⚠️  Error fetching weather forecast: {e}")
        return None


def analyze_disaster_risk(weather_data: Dict, forecast_data: Optional[Dict] = None) -> Dict:
    """
    Phân tích rủi ro thiên tai từ dữ liệu thời tiết
    
    Returns:
        {
            "risk_level": "low" | "medium" | "high" | "critical",
            "disaster_types": ["Lũ lụt", "Bão", ...],
            "confidence": 0.0-1.0,
            "details": {...}
        }
    """
    if not weather_data:
        return {
            "risk_level": "low",
            "disaster_types": [],
            "confidence": 0.0,
            "details": {}
        }
    
    risk_score = 0.0
    disaster_types = []
    details = {}
    
    # Extract weather info
    main = weather_data.get("main", {})
    weather = weather_data.get("weather", [{}])[0]
    wind = weather_data.get("wind", {})
    rain = weather_data.get("rain", {})
    clouds = weather_data.get("clouds", {})
    
    temp = main.get("temp", 25)
    humidity = main.get("humidity", 50)
    pressure = main.get("pressure", 1013)
    wind_speed = wind.get("speed", 0)
    rain_1h = rain.get("1h", 0)
    rain_3h = rain.get("3h", 0)
    cloudiness = clouds.get("all", 0)
    weather_main = weather.get("main", "").lower()
    weather_desc = weather.get("description", "").lower()
    
    # Analyze current conditions
    details["current"] = {
        "temp": temp,
        "humidity": humidity,
        "pressure": pressure,
        "wind_speed": wind_speed,
        "rain": rain_1h or rain_3h,
        "cloudiness": cloudiness,
        "condition": weather_main
    }
    
    # 1. Flood Risk (Lũ lụt)
    flood_risk = 0.0
    if rain_1h > 20:  # Heavy rain > 20mm/h
        flood_risk += 0.4
    if rain_3h > 50:  # Very heavy rain > 50mm/3h
        flood_risk += 0.5
    if humidity > 90 and rain_1h > 10:
        flood_risk += 0.3
    if "rain" in weather_main or "drizzle" in weather_main:
        flood_risk += 0.2
    
    if flood_risk > 0.3:
        disaster_types.append("Lũ lụt")
        risk_score += flood_risk
        details["flood"] = {"risk": flood_risk, "reason": "Mưa lớn kéo dài"}
    
    # 2. Storm Risk (Bão)
    storm_risk = 0.0
    if wind_speed > 20:  # Strong wind > 20 m/s
        storm_risk += 0.5
    if wind_speed > 25:  # Very strong wind > 25 m/s
        storm_risk += 0.8
    if pressure < 1000:  # Low pressure
        storm_risk += 0.4
    if "storm" in weather_main or "hurricane" in weather_main:
        storm_risk += 0.6
    
    if storm_risk > 0.3:
        disaster_types.append("Bão")
        risk_score += storm_risk
        details["storm"] = {"risk": storm_risk, "reason": f"Gió mạnh {wind_speed} m/s"}
    
    # 3. Drought Risk (Hạn hán)
    drought_risk = 0.0
    if temp > 35 and humidity < 30:  # Hot and dry
        drought_risk += 0.4
    if temp > 38:  # Very hot
        drought_risk += 0.5
    if rain_1h == 0 and rain_3h == 0 and humidity < 40:
        drought_risk += 0.3
    
    if drought_risk > 0.3:
        disaster_types.append("Hạn hán")
        risk_score += drought_risk
        details["drought"] = {"risk": drought_risk, "reason": f"Nhiệt độ cao {temp}°C, độ ẩm thấp {humidity}%"}
    
    # 4. Landslide Risk (Sạt lở đất)
    landslide_risk = 0.0
    if rain_3h > 40 and humidity > 85:  # Heavy rain + high humidity
        landslide_risk += 0.5
    if rain_1h > 15 and pressure < 1005:
        landslide_risk += 0.4
    
    if landslide_risk > 0.3:
        disaster_types.append("Sạt lở đất")
        risk_score += landslide_risk
        details["landslide"] = {"risk": landslide_risk, "reason": "Mưa lớn kết hợp độ ẩm cao"}
    
    # Analyze forecast if available
    if forecast_data:
        forecast_list = forecast_data.get("list", [])
        if forecast_list:
            # Check next 24-48 hours
            future_rain = 0
            future_wind = 0
            for item in forecast_list[:8]:  # Next 24 hours (8 * 3h)
                future_rain += item.get("rain", {}).get("3h", 0)
                future_wind = max(future_wind, item.get("wind", {}).get("speed", 0))
            
            if future_rain > 100:  # > 100mm in 24h
                if "Lũ lụt" not in disaster_types:
                    disaster_types.append("Lũ lụt")
                risk_score += 0.3
                details["forecast_flood"] = {"rain_24h": future_rain}
            
            if future_wind > 20:
                if "Bão" not in disaster_types:
                    disaster_types.append("Bão")
                risk_score += 0.2
                details["forecast_storm"] = {"wind_max": future_wind}
    
    # Determine risk level
    if risk_score >= 0.8:
        risk_level = "critical"
    elif risk_score >= 0.6:
        risk_level = "high"
    elif risk_score >= 0.4:
        risk_level = "medium"
    else:
        risk_level = "low"
    
    confidence = min(1.0, risk_score * 1.2)  # Scale confidence
    
    return {
        "risk_level": risk_level,
        "disaster_types": list(set(disaster_types)),  # Remove duplicates
        "confidence": round(confidence, 2),
        "risk_score": round(risk_score, 2),
        "details": details
    }


def check_weather_and_predict(tinh_thanh: str) -> Dict:
    """
    Check thời tiết và dự đoán thiên tai cho một tỉnh thành
    
    Returns:
        {
            "tinh_thanh": str,
            "coords": {"lat": float, "lon": float},
            "weather": {...},
            "forecast": {...},
            "disaster_risk": {...},
            "timestamp": str
        }
    """
    coords = get_province_coords(tinh_thanh)
    
    if not coords:
        return {
            "tinh_thanh": tinh_thanh,
            "error": "Không tìm thấy tọa độ cho tỉnh thành này",
            "coords": None
        }
    
    # Get current weather
    weather_data = get_current_weather(coords["lat"], coords["lon"])
    
    # Get forecast
    forecast_data = get_weather_forecast(coords["lat"], coords["lon"])
    
    # Analyze disaster risk
    disaster_risk = analyze_disaster_risk(weather_data, forecast_data)
    
    return {
        "tinh_thanh": tinh_thanh,
        "coords": coords,
        "weather": weather_data,
        "forecast": forecast_data,
        "disaster_risk": disaster_risk,
        "timestamp": datetime.now().isoformat()
    }

