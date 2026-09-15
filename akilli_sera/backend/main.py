from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import sqlite3
from datetime import datetime
from pydantic import BaseModel

# --- AYARLAR ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


ESP32_URL = "http://10.145.57.129" 


def init_db():
    conn = sqlite3.connect('sera.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS logs
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  zaman TEXT,
                  nem INTEGER,
                  mod TEXT,
                  motor TEXT)''')
    conn.commit()
    conn.close()

init_db()


@app.get("/")
def home():
    return {"durum": "Backend Calisiyor"}

@app.get("/api/sensor")
def sensor_oku():
    try:
        r = requests.get(ESP32_URL, timeout=3)
        veri = r.json()
        
        
        conn = sqlite3.connect('sera.db')
        c = conn.cursor()
        zaman = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        c.execute("INSERT INTO logs (zaman, nem, mod, motor) VALUES (?, ?, ?, ?)",
                  (zaman, veri['nem'], veri['mod'], veri['motor']))
        conn.commit()
        conn.close()
        
        return veri
    except requests.exceptions.RequestException as e:
        print(f"Bağlantı Hatası: {e}")
        return {"nem": 0, "mod": "BAGLANTI_YOK", "motor": "HATA"}

@app.get("/api/kontrol/{komut}")
def komut_gonder(komut: str):
    try:
        url = f"{ESP32_URL}/?komut={komut}"
        requests.get(url, timeout=2)
        return {"mesaj": "Komut gönderildi"}
    except:
        raise HTTPException(status_code=503, detail="ESP32'ye ulaşılamadı")

@app.get("/api/gecmis")
def gecmis_veriler():
    conn = sqlite3.connect('sera.db')
    c = conn.cursor()
    c.execute("SELECT zaman, nem, mod, motor FROM logs ORDER BY id DESC LIMIT 20")
    veriler = [{"zaman": row[0], "nem": row[1], "mod": row[2], "motor": row[3]} for row in c.fetchall()]
    conn.close()
    return veriler