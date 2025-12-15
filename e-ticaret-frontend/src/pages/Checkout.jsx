import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../services/siparisService";
import { getProfile } from "../services/userService";
import { sepetGetir } from "../services/sepetService"; // Sepet özetini göstermek için
import { CartContext } from "../context/CartContext";

function Checkout() {
  // --- STATE YÖNETİMİ ---
  const [adresler, setAdresler] = useState([]);
  const [seciliAdresBasligi, setSeciliAdresBasligi] = useState("");
  
  const [sepetUrunleri, setSepetUrunleri] = useState([]);
  const [toplamTutar, setToplamTutar] = useState(0);

  // --- STATE ---
  // Kart bilgilerinde artık 'skt' tek string değil, ay ve yıl ayrı tutuyoruz
  const [kartBilgileri, setKartBilgileri] = useState({
    adSoyad: "",
    kartNo: "",
    sktAy: "",  // Yeni: Sadece ay
    sktYil: "", // Yeni: Sadece yıl
    cvv: ""
  });

  // --- AY VE YIL LİSTELERİ ---
  const currentYear = new Date().getFullYear();
  const years = [];
  // Bulunduğumuz yıldan başlayarak 15 yıl sonrasına kadar liste oluştur
  for (let i = 0; i < 15; i++) {
    years.push(currentYear + i);
  }

  const months = Array.from({ length: 12 }, (_, i) => {
    return (i + 1).toString().padStart(2, "0"); // "01", "02" ... "12" yapar
  });

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { updateCartCount } = useContext(CartContext);

  // --- VERİ ÇEKME (Adresler ve Sepet) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Profil ve Adresleri Çek
        const profileRes = await getProfile();
        const userAdresler = profileRes.data.adresler || [];
        setAdresler(userAdresler);

        // Varsayılan adresi seç
        if (userAdresler.length > 0) {
          const varsayilan = userAdresler.find(a => a.varsayilanMi) || userAdresler[0];
          setSeciliAdresBasligi(varsayilan.baslik);
        }

        // 2. Sepet Bilgisini Çek (Özet için)
        const cartRes = await sepetGetir();
        setSepetUrunleri(cartRes.data.urunler);
        setToplamTutar(cartRes.data.toplamTutar);

      } catch (err) {
        console.error("Veri yükleme hatası:", err);
        setError("Bilgiler yüklenirken bir hata oluştu.");
      } finally {
        setPageLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- KART INPUT FORMATLAMA ---
  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "kartNo") {
      // Sadece rakam ve boşluk, 16 hane + boşluklar
      formattedValue = value.replace(/\D/g, "").substring(0, 16).replace(/(\d{4})/g, "$1 ").trim();
    } else if (name === "skt") {
      // MM/YY formatı
      formattedValue = value.replace(/\D/g, "").substring(0, 4).replace(/^(\d{2})/, "$1/");
    } else if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "").substring(0, 3);
    }

    setKartBilgileri({ ...kartBilgileri, [name]: formattedValue });
  };

  // --- SİPARİŞİ ONAYLA (TARİH KONTROLLÜ) ---
  const handleOrder = async (e) => {
    e.preventDefault(); 

    // 1. Adres Seçili mi?
    if (!seciliAdresBasligi) {
      alert("Lütfen bir teslimat adresi seçiniz.");
      return;
    }

    // 2. İsim Kontrolü
    if (!kartBilgileri.adSoyad.trim()) {
      alert("Lütfen kart üzerindeki ismi giriniz.");
      document.querySelector('input[name="adSoyad"]').focus();
      return; 
    }

    // 3. Kart No Kontrolü
    if (kartBilgileri.kartNo.length < 19) { 
      alert("Lütfen geçerli bir kart numarası giriniz.");
      document.querySelector('input[name="kartNo"]').focus();
      return; 
    }

    // 4. TARİH KONTROLÜ (YENİ) ---------------------------
    if (!kartBilgileri.sktAy || !kartBilgileri.sktYil) {
      alert("Lütfen kartın son kullanma tarihini (Ay ve Yıl) seçiniz.");
      // Ay seçili değilse aya, yıl değilse yıla odaklan
      if(!kartBilgileri.sktAy) document.querySelector('select[name="sktAy"]').focus();
      else document.querySelector('select[name="sktYil"]').focus();
      return; 
    }

    // Mantıksal Kontrol: Kartın Süresi Dolmuş mu?
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // getMonth 0-11 döner, biz 1-12 kullanıyoruz

    const selectedYear = parseInt(kartBilgileri.sktYil);
    const selectedMonth = parseInt(kartBilgileri.sktAy);

    // Eğer seçilen yıl geçmişse (Dropdown bunu engeller ama yine de kontrol)
    if (selectedYear < currentYear) {
      alert("Kartınızın kullanım süresi dolmuş.");
      return;
    }

    // Eğer Yıl aynı ama Ay geçmişse (Örn: Şu an Mayıs 2025, Seçilen: Şubat 2025)
    if (selectedYear === currentYear && selectedMonth < currentMonth) {
      alert("Kartınızın kullanım süresi dolmuş. Lütfen geçerli bir tarih giriniz.");
      return;
    }
    // -----------------------------------------------------

    // 5. CVV Kontrolü
    if (kartBilgileri.cvv.length < 3) {
      alert("Lütfen 3 haneli CVV kodunu giriniz.");
      document.querySelector('input[name="cvv"]').focus();
      return; 
    }

    // --- BACKEND İSTEĞİ ---
    setLoading(true);
    try {
      const res = await createOrder(seciliAdresBasligi);
      updateCartCount(0); 
      alert("🎉 Siparişiniz başarıyla alındı! Sipariş No: " + res.data.siparisNo);
      navigate("/siparislerim");
    } catch (err) {
      console.error(err);
      const mesaj = err.response?.data?.message || "Hata oluştu.";
      setError(mesaj);
    } finally {
      setLoading(false);
    }
  };
  if (pageLoading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container py-5">
      <h2 className="mb-4 fw-bold">Ödeme Yap</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-5">
        
        {/* SOL SÜTUN: ADRES VE ÖDEME */}
        <div className="col-lg-8">
          
          {/* 1. ADRES SEÇİMİ */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold text-primary"><i className="bi bi-geo-alt-fill me-2"></i>Teslimat Adresi</h5>
            </div>
            <div className="card-body">
              {adresler.length === 0 ? (
                <div className="alert alert-warning">
                  Kayıtlı adresiniz yok. <a href="/profil" className="alert-link">Profil sayfasından</a> ekleyiniz.
                </div>
              ) : (
                <div className="row g-3">
                  {adresler.map((adres, index) => (
                    <div key={index} className="col-md-6">
                      <div 
                        className={`card h-100 cursor-pointer ${seciliAdresBasligi === adres.baslik ? 'border-primary bg-primary-subtle' : ''}`}
                        style={{ cursor: 'pointer', borderWidth: seciliAdresBasligi === adres.baslik ? '2px' : '1px' }}
                        onClick={() => setSeciliAdresBasligi(adres.baslik)}
                      >
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="fw-bold mb-0">{adres.baslik}</h6>
                            {seciliAdresBasligi === adres.baslik && <i className="bi bi-check-circle-fill text-primary"></i>}
                          </div>
                          <p className="card-text small text-muted mb-0">
                            {adres.adresSatiri} <br/>
                            {adres.ilce} / {adres.sehir}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 2. KREDİ KARTI BİLGİLERİ */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold text-success"><i className="bi bi-credit-card-2-front-fill me-2"></i>Kart Bilgileri</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                 <div className="col-12">
                    <label className="form-label small text-muted">Kart Üzerindeki İsim</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="adSoyad"
                      placeholder="AD SOYAD" 
                      value={kartBilgileri.adSoyad}
                      onChange={handleCardChange}
                    />
                 </div>
                 <div className="col-12">
                    <label className="form-label small text-muted">Kart Numarası</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white"><i className="bi bi-credit-card"></i></span>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="kartNo"
                        placeholder="0000 0000 0000 0000" 
                        maxLength="19"
                        value={kartBilgileri.kartNo}
                        onChange={handleCardChange}
                      />
                    </div>
                 </div>
                 <div className="col-md-6">
                    <label className="form-label small text-muted">Son Kullanma Tarihi</label>
                    <div className="input-group">
                      {/* AY SEÇİMİ */}
                      <select 
                        className="form-select" 
                        name="sktAy"
                        value={kartBilgileri.sktAy}
                        onChange={handleCardChange}
                      >
                        <option value="">Ay</option>
                        {months.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>

                      {/* YIL SEÇİMİ */}
                      <select 
                        className="form-select" 
                        name="sktYil"
                        value={kartBilgileri.sktYil}
                        onChange={handleCardChange}
                      >
                        <option value="">Yıl</option>
                        {years.map(y => (
                          // Yılın sadece son 2 hanesini göstermek istersen (25, 26 gibi):
                          // <option key={y} value={y.toString().slice(-2)}>{y.toString().slice(-2)}</option>
                          // Ama genelde tam yıl (2025) daha güven verir:
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                 </div>
                 <div className="col-md-6">
                    <label className="form-label small text-muted">CVV</label>
                    <div className="input-group">
                        <input 
                          type="password" 
                          className="form-control" 
                          name="cvv"
                          placeholder="***" 
                          maxLength="3"
                          value={kartBilgileri.cvv}
                          onChange={handleCardChange}
                        />
                        <span className="input-group-text bg-white"><i className="bi bi-question-circle"></i></span>
                    </div>
                 </div>
              </div>
              
              <div className="mt-3 form-check">
                  <input className="form-check-input" type="checkbox" id="3dsecure" defaultChecked />
                  <label className="form-check-label small text-muted" htmlFor="3dsecure">
                    3D Secure ile ödemek istiyorum.
                  </label>
              </div>
            </div>
          </div>
        
        </div>

        {/* SAĞ SÜTUN: SİPARİŞ ÖZETİ */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 sticky-top" style={{ top: "20px" }}>
            <div className="card-header bg-light py-3">
              <h5 className="mb-0 fw-bold">Sipariş Özeti</h5>
            </div>
            <div className="card-body p-4">
              
              {/* Ürün Listesi (Scrollable) */}
              <div className="mb-3" style={{ maxHeight: "200px", overflowY: "auto" }}>
                {sepetUrunleri.map(item => (
                  <div key={item.urunId} className="d-flex align-items-center mb-3">
                    <img 
                      src={item.resimUrl || "https://placehold.co/50"} 
                      alt={item.isim} 
                      className="rounded border" 
                      style={{ width: "50px", height: "50px", objectFit: "contain" }} 
                    />
                    <div className="ms-3 flex-grow-1">
                      <div className="small fw-bold text-truncate" style={{ maxWidth: "150px" }}>{item.isim}</div>
                      <div className="text-muted small">{item.adet} adet</div>
                    </div>
                    <div className="fw-bold small">{item.fiyat * item.adet} ₺</div>
                  </div>
                ))}
              </div>

              <hr />

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Ara Toplam</span>
                <span className="fw-bold">{toplamTutar} ₺</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Kargo</span>
                <span className="text-success fw-bold">Bedava</span>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between align-items-center mb-4">
                <span className="h5 fw-bold mb-0">Toplam</span>
                <span className="h4 fw-bold text-primary mb-0">{toplamTutar} ₺</span>
              </div>

              <button 
                className="btn btn-success w-100 py-3 rounded-3 fw-bold shadow-sm transition-btn"
                onClick={handleOrder}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    İşleniyor...
                  </>
                ) : (
                   <>Siparişi Onayla <i className="bi bi-chevron-right ms-2"></i></> 
                )}
              </button>

              <div className="text-center mt-3">
                <small className="text-muted d-block">
                  <i className="bi bi-shield-lock-fill me-1"></i>
                  Ödeme bilgileriniz 256-bit SSL ile korunmaktadır.
                </small>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Checkout;