import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [veri, setVeri] = useState({ nem: 0, mod: 'BEKLENİYOR...', motor: '---' });
  const [gecmis, setGecmis] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(false);

  const API_URL = "http://localhost:8000/api";

  useEffect(() => {
    const veriCek = async () => {
      try {
        const sensorRes = await axios.get(`${API_URL}/sensor`);
        setVeri(sensorRes.data);
        
        const gecmisRes = await axios.get(`${API_URL}/gecmis`);
        setGecmis(gecmisRes.data);
      } catch (error) {
        console.error("Bağlantı hatası:", error);
      }
    };

    veriCek(); 
    const interval = setInterval(veriCek, 2000); 
    return () => clearInterval(interval);
  }, []);

  // Komut Gönderme Fonksiyonu
  const komutGonder = async (komut) => {
    setYukleniyor(true);
    try {
      await axios.get(`${API_URL}/kontrol/${komut}`);
    } catch (error) {
      alert("Komut gönderilemedi!");
    } finally {
      setTimeout(() => setYukleniyor(false), 500);
    }
  };

  return (
    <div className="container">
      <div className="panel">
        <h2> AKILLI SERA KONTROL</h2>
        
        <div className={`durum-etiketi ${veri.mod === 'OTO' ? 'mod-oto' : 'mod-manuel'}`}>
          {veri.mod === 'OTO' ? 'OTOMATİK MOD' : 'MANUEL KONTROL'}
        </div>

        <div className="bilgi-kartlari">
          <div className="kart">
            <span> Nem Değeri</span>
            <h3>{veri.nem}</h3>
          </div>
          <div className="kart">
            <span> Motor Durumu</span>
            <h3 style={{ color: veri.motor === 'ACIK' ? '#2ecc71' : '#e74c3c' }}>
              {veri.motor}
            </h3>
          </div>
        </div>

        <div className="butonlar">
          <button onClick={() => komutGonder('oto')} className="btn btn-mavi">OTOMATİK</button>
          <button onClick={() => komutGonder('ac')} className="btn btn-yesil" disabled={yukleniyor}>AÇ</button>
          <button onClick={() => komutGonder('kapat')} className="btn btn-kirmizi" disabled={yukleniyor}>KAPAT</button>
        </div>
      </div>

      <div className="tablo-panel">
        <h3> Geçmiş Kayıtlar</h3>
        <table>
          <thead>
            <tr>
              <th>Zaman</th>
              <th>Nem</th>
              <th>Mod</th>
              <th>Motor</th>
            </tr>
          </thead>
          <tbody>
            {gecmis.map((satir, index) => (
              <tr key={index}>
                <td>{satir.zaman}</td>
                <td>{satir.nem}</td>
                <td>{satir.mod}</td>
                <td>{satir.motor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;