import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../services/siparisService";
import { getProfile } from "../services/userService"; // Profil servisini ekledik
import { CartContext } from "../context/CartContext";

function Checkout() {
  const [adresBasligi, setAdresBasligi] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true); // Sayfa yükleniyor durumu
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const { updateCartCount } = useContext(CartContext);

  // Sayfa açıldığında varsayılan adresi bulup getirme
  useEffect(() => {
    getProfile()
      .then((res) => {
        const adresler = res.data.adresler;
        if (adresler && adresler.length > 0) {
            // Varsayılan olanı bul, yoksa ilkini al
            const varsayilan = adresler.find(a => a.varsayilanMi) || adresler[0];
            setAdresBasligi(varsayilan.baslik);
        }
      })
      .catch((err) => {
        console.error("Profil bilgisi alınamadı:", err);
      })
      .finally(() => {
        setPageLoading(false);
      });
  }, []);

  const handleOrder = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    createOrder(adresBasligi)
      .then((res) => {
        alert("Siparişiniz başarıyla alındı! Sipariş No: " + res.data.siparisNo);
        updateCartCount(0);
        navigate("/siparislerim");
      })
      .catch((err) => {
        console.error(err);
        // Backend'den gelen hata mesajını göster yoksa genel mesaj yaz
        const mesaj = err.response?.data?.message || err.response?.data || "Sipariş oluşturulurken bir hata oluştu.";
        setError(mesaj);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (pageLoading) {
      return <div className="container mt-5 text-center">Yükleniyor...</div>;
  }

  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <div className="card shadow border-0 rounded-4">
        <div className="card-header bg-primary text-white text-center py-3 rounded-top-4">
          <h4 className="mb-0 fw-bold">Siparişi Tamamla</h4>
        </div>
        <div className="card-body p-4">
          
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="alert alert-light border shadow-sm mb-4">
            <h6 className="fw-bold text-primary"><i className="bi bi-info-circle me-2"></i>Bilgilendirme</h6>
            <p className="mb-0 small text-muted">
                Siparişiniz, aşağıda belirttiğiniz kayıtlı adresinize gönderilecektir. 
                Eğer adresiniz yoksa önce Profil sayfasından ekleyiniz.
            </p>
          </div>

          <form onSubmit={handleOrder}>
            <div className="mb-4">
              <label className="form-label fw-bold">Teslimat Adresi Başlığı</label>
              <div className="input-group">
                <span className="input-group-text bg-light"><i className="bi bi-geo-alt"></i></span>
                <input 
                    type="text" 
                    className="form-control"
                    placeholder="Örn: Ev, İş"
                    value={adresBasligi}
                    onChange={(e) => setAdresBasligi(e.target.value)}
                    required
                />
              </div>
              <div className="form-text mt-2">
                Varsayılan adresiniz otomatik seçilmiştir. Dilerseniz değiştirebilirsiniz.
              </div>
            </div>

            <div className="d-grid gap-2">
                <button 
                type="submit" 
                className="btn btn-success btn-lg rounded-pill shadow-sm" 
                disabled={loading}
                >
                {loading ? (
                    <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        İşleniyor...
                    </>
                ) : (
                    <>
                        <i className="bi bi-check-circle-fill me-2"></i>
                        Siparişi Onayla & Satın Al
                    </>
                )}
                </button>
                
                <button 
                    type="button" 
                    className="btn btn-outline-secondary rounded-pill"
                    onClick={() => navigate("/sepet")}
                    disabled={loading}
                >
                    İptal Et ve Sepete Dön
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Checkout;