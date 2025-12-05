import { useState } from "react";
import { register } from "../services/AuthService";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Form state'ine 'isSeller' ekledik
  const [form, setForm] = useState({
    ad: "", soyad: "", eposta: "", sifre: "", telefon: "",
    baslik: "", adresSatiri: "", sehir: "", ilce: "", postaKodu: "",
    isSeller: false // YENİ: Satıcı mı?
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const registerData = {
      ad: form.ad, soyad: form.soyad, eposta: form.eposta, sifre: form.sifre, telefon: form.telefon,
      adresler: [{
        baslik: form.baslik, adresSatiri: form.adresSatiri, sehir: form.sehir, 
        ilce: form.ilce, postaKodu: form.postaKodu, varsayilanMi: true
      }],
      // Eğer kutucuk işaretliyse "SATICI", değilse null gönder (Backend USER yapacak)
      rol: form.isSeller ? "SATICI" : null 
    };

    register(registerData)
      .then(() => {
        setSuccess("Kayıt başarılı! Yönlendiriliyorsunuz...");
        setTimeout(() => navigate("/giris"), 2000);
      })
      .catch((err) => {
        setError("Kayıt başarısız: " + (err.response?.data?.message || "Bilinmeyen hata"));
        setLoading(false);
      });
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="card-body p-0">
              
              <div className="row g-0">
                {/* SOL TARAF */}
                <div className="col-md-4 bg-primary text-white p-5 d-flex flex-column justify-content-center align-items-center text-center">
                  <div className="mb-4">
                    <i className="bi bi-shop display-1"></i>
                  </div>
                  <h2 className="fw-bold">Mağazanızı Açın!</h2>
                  <p className="lead">İster müşteri olun, ister satıcı. E-Ticaret dünyasına adım atın.</p>
                  <Link to="/giris" className="btn btn-outline-light rounded-pill mt-3 px-4">
                    Zaten üye misiniz?
                  </Link>
                </div>

                {/* SAĞ TARAF: Form Alanı */}
                <div className="col-md-8 p-5">
                  <h3 className="fw-bold text-primary mb-4">Üyelik Formu</h3>
                  
                  {error && <div className="alert alert-danger">{error}</div>}
                  {success && <div className="alert alert-success">{success}</div>}

                  <form onSubmit={handleSubmit}>
                    
                    {/* --- SATICI OLMAK İSTİYORUM CHECKBOX --- */}
                    <div className="form-check form-switch mb-4 p-3 bg-light rounded border">
                        <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id="sellerCheck" 
                            name="isSeller"
                            checked={form.isSeller}
                            onChange={handleChange}
                            style={{cursor: "pointer"}}
                        />
                        <label className="form-check-label fw-bold ms-2" htmlFor="sellerCheck" style={{cursor: "pointer"}}>
                            Satıcı Hesabı Oluştur (Ürün Satmak İstiyorum)
                        </label>
                    </div>

                    <div className="row g-3">
                      {/* --- Kişisel Bilgiler --- */}
                      <div className="col-12"><h6 className="text-muted border-bottom pb-2">Kişisel Bilgiler</h6></div>
                      
                      <div className="col-md-6">
                        <label className="form-label small">Ad</label>
                        <input className="form-control" name="ad" value={form.ad} onChange={handleChange} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small">Soyad</label>
                        <input className="form-control" name="soyad" value={form.soyad} onChange={handleChange} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small">E-Posta</label>
                        <input type="email" className="form-control" name="eposta" value={form.eposta} onChange={handleChange} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small">Telefon</label>
                        <input className="form-control" name="telefon" value={form.telefon} onChange={handleChange} required />
                      </div>
                      <div className="col-12">
                        <label className="form-label small">Şifre</label>
                        <input type="password" minLength={6} className="form-control" name="sifre" value={form.sifre} onChange={handleChange} required />
                      </div>

                      {/* --- Adres Bilgileri --- */}
                      <div className="col-12 mt-4"><h6 className="text-muted border-bottom pb-2">Adres Bilgileri</h6></div>
                      
                      <div className="col-md-4">
                        <label className="form-label small">Adres Başlığı</label>
                        <input className="form-control" name="baslik" placeholder="Örn: Ofis" value={form.baslik} onChange={handleChange} required />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small">Şehir</label>
                        <input className="form-control" name="sehir" value={form.sehir} onChange={handleChange} required />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small">İlçe</label>
                        <input className="form-control" name="ilce" value={form.ilce} onChange={handleChange} required />
                      </div>
                      <div className="col-md-12">
                        <label className="form-label small">Adres Detayı</label>
                        <textarea className="form-control" name="adresSatiri" rows="2" value={form.adresSatiri} onChange={handleChange} required></textarea>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small">Posta Kodu</label>
                        <input className="form-control" name="postaKodu" value={form.postaKodu} onChange={handleChange} required />
                      </div>
                    </div>

                    <div className="d-grid mt-4">
                      <button type="submit" className="btn btn-primary btn-lg rounded-pill shadow-sm" disabled={loading}>
                         {loading ? "Kaydediliyor..." : (form.isSeller ? "Satıcı Olarak Kaydol" : "Üye Ol")}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;