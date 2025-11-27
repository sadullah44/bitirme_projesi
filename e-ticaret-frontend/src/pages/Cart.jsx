import { useEffect, useState, useContext } from "react";
import { sepetGetir, sepetGuncelle, sepetSil } from "../services/sepetService";
// 1. Context'i import ediyoruz
import { CartContext } from "../context/CartContext";

function Cart() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  // 2. Context'ten güncelleme fonksiyonunu alıyoruz
  const { updateCartCount } = useContext(CartContext);

  // Yardımcı Fonksiyon: Listeyi alıp toplam adedi hesaplar ve Navbar'a gönderir
  const updateNavbarCount = (urunlerListesi) => {
    const toplamAdet = urunlerListesi.reduce((acc, item) => acc + item.adet, 0);
    updateCartCount(toplamAdet);
  };

  // Sepeti backend'den çek
  const loadCart = () => {
    sepetGetir()
      .then((res) => {
        setItems(res.data.urunler);
        setTotal(res.data.toplamTutar);
        // Sayfa ilk açıldığında da sayıyı güncelle (garanti olsun)
        updateNavbarCount(res.data.urunler);
      })
      .catch((err) => {
        console.error("Sepet yüklenirken hata:", err);
      });
  };

  useEffect(() => {
    loadCart();
  }, []);

  // Adet artır/azalt
  const changeQuantity = (urunId, newAdet) => {
    if (newAdet < 1) return;

    sepetGuncelle(urunId, newAdet)
      .then(res => {
        setItems(res.data.urunler);
        setTotal(res.data.toplamTutar);
        
        // 3. Adet değiştiğinde Navbar'ı güncelle
        updateNavbarCount(res.data.urunler);
      })
      .catch(err => console.error("Adet güncelleme hatası:", err));
  };

  // Sil
  const removeItem = (urunId) => {
    sepetSil(urunId)
      .then(res => {
        setItems(res.data.urunler);
        setTotal(res.data.toplamTutar);

        // 4. Ürün silindiğinde Navbar'ı güncelle
        updateNavbarCount(res.data.urunler);
      })
      .catch(err => console.error("Silme hatası:", err));
  };

  return (
    <div className="container mt-4">
      <h2>🛒 Sepetim</h2>
      <hr/>

      {items.length === 0 ? (
        <div className="text-center py-5">
            <i className="bi bi-cart-x display-1 text-muted"></i>
            <h3 className="mt-3 text-secondary">Sepetinizde ürün yok</h3>
            <p className="text-muted">İhtiyacınız olan ürünleri hemen keşfedin.</p>
            <a href="/" className="btn btn-primary btn-lg mt-3">
                <i className="bi bi-arrow-left"></i> Alışverişe Başla
            </a>
        </div>
      ) : (
        <div className="row">
          <div className="col-md-8">
            {items.map(item => (
              <div key={item.urunId} className="card mb-3 p-3 shadow-sm border-0">
                <div className="row g-3 align-items-center">

                  <div className="col-md-3">
                    <img 
                      src="https://placehold.co/200x150?text=Urun"
                      className="img-fluid rounded"
                      alt={item.isim}
                    />
                  </div>

                  <div className="col-md-9">
                    <div className="d-flex justify-content-between">
                        <h5>{item.isim}</h5>
                        <h5 className="text-primary fw-bold">{item.fiyat * item.adet} ₺</h5>
                    </div>
                    
                    <p className="text-muted small">Birim Fiyat: {item.fiyat} ₺</p>

                    <div className="d-flex align-items-center gap-3 mt-3">
                      <div className="input-group input-group-sm" style={{ width: "120px" }}>
                          <button 
                            className="btn btn-outline-secondary"
                            onClick={() => changeQuantity(item.urunId, item.adet - 1)}
                          >-</button>
                          <span className="form-control text-center bg-white">{item.adet}</span>
                          <button 
                            className="btn btn-outline-secondary"
                            onClick={() => changeQuantity(item.urunId, item.adet + 1)}
                          >+</button>
                      </div>

                      <button
                        className="btn btn-outline-danger btn-sm ms-auto"
                        onClick={() => removeItem(item.urunId)}
                      >
                        <i className="bi bi-trash"></i> Sil
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* Sağ taraf: toplam fiyat */}
          <div className="col-md-4">
            <div className="card shadow p-4 border-0 bg-light">
              <h4 className="mb-3">Sipariş Özeti</h4>
              <div className="d-flex justify-content-between mb-3">
                  <span>Ara Toplam</span>
                  <span>{total} ₺</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                  <span>Kargo</span>
                  <span className="text-success">Bedava</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-4">
                  <span className="h5">Toplam</span>
                  <span className="h4 text-primary">{total} ₺</span>
              </div>
              
              <a href="/odeme" className="btn btn-success w-100 py-2 fw-bold">
                Sepeti Onayla
              </a>
              <a href="/" className="btn btn-outline-secondary w-100 py-2 mt-2">
                Alışverişe Devam Et
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;