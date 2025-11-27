import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getProductById } from "../services/productService";
import { CartContext } from "../context/CartContext"; 
import { AuthContext } from "../context/AuthContext";
import { sepetEkle } from "../services/sepetService";

// --- GÜVENİLİR VE TUTARLI RESİM HAVUZU ---
const IMAGE_MAP = {
  // TELEFONLAR
  "Apple_Telefon": [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80", // iPhone
    "https://images.unsplash.com/photo-1598327105666-5b89351aff23?w=800&q=80"
  ],
  "Samsung_Telefon": [
    "https://images.unsplash.com/photo-1610945265064-f45a855f79d1?w=800&q=80", // Galaxy
    "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=800&q=80"
  ],
  "Xiaomi_Telefon": [
    "https://images.unsplash.com/photo-1598327105666-5b89351aff23?w=800&q=80" // Genel Android
  ],

  // BİLGİSAYARLAR
  "Apple_Bilgisayar": [
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80", // MacBook
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=800&q=80"
  ],
  "Monster_Bilgisayar": [
    "https://images.unsplash.com/photo-1531297461136-82lw8z8a?w=800&q=80" // Gaming Laptop
  ],
  "Lenovo_Bilgisayar": [
    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80" // Laptop
  ],
  "Asus_Bilgisayar": [
     "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&q=80"
  ],

  // GİYİM (Markalar)
  "Nike_Giyim": ["https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80"],
  "Adidas_Giyim": ["https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80"],
  "Mavi_Giyim": ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80"],
  "Zara_Giyim": ["https://images.unsplash.com/photo-1551488852-080146633429?w=800&q=80"],

  // AYAKKABI
  "Nike_Ayakkabı": ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"],
  "Adidas_Ayakkabı": ["https://images.unsplash.com/photo-1560769629-975e13b061d9?w=800&q=80"],
  "New Balance_Ayakkabı": ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80"],

  // GENEL YEDEKLER (Kategori Bazlı)
  "Telefon_Genel": ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80"],
  "Bilgisayar_Genel": ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80"],
  "Elektronik_Genel": ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"],
  "Giyim_Genel": ["https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80"],
  "Ayakkabı_Genel": ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"],
  "Ev & Yaşam_Genel": ["https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80"],
  "Spor_Genel": ["https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80"],
  "Kitap_Genel": ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80"],
  "Varsayilan": ["https://images.unsplash.com/photo-1526304640152-d4619684e484?w=800&q=80"]
};

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [imgError, setImgError] = useState(false); // Resim hatası kontrolü

  const { updateCartCount } = useContext(CartContext); 
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    getProductById(id)
      .then((res) => setProduct(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  // --- AKILLI RESİM SEÇME MANTIĞI (Marka Öncelikli) ---
  const getImage = () => {
    if (!product) return IMAGE_MAP["Varsayilan"][0];

    const marka = product.marka || "";
    const kategori = product.kategori || "";

    // 1. Önce "Marka_Kategori" kombinasyonuna bak (Örn: "Apple_Telefon")
    const specificKey = `${marka}_${kategori}`;
    if (IMAGE_MAP[specificKey]) {
        return IMAGE_MAP[specificKey][0];
    }

    // 2. Yoksa sadece "Kategori_Genel" kombinasyonuna bak
    const categoryKey = `${kategori}_Genel`;
    if (IMAGE_MAP[categoryKey]) {
        return IMAGE_MAP[categoryKey][0];
    }

    // 3. Hiçbiri yoksa varsayılan
    return IMAGE_MAP["Varsayilan"][0];
  };

  const handleSepeteEkle = () => {
    if (!isAuthenticated) {
      // Return URL mantığı burada korunuyor
      navigate("/giris", { state: { returnUrl: location.pathname } });
      return;
    }

    sepetEkle(product.id)
      .then((res) => {
        const guncelUrunler = res.data.urunler;
        const yeniToplamAdet = guncelUrunler.reduce((toplam, urun) => toplam + urun.adet, 0);
        updateCartCount(yeniToplamAdet);
        alert("Ürün başarıyla sepete eklendi!");
      })
      .catch((err) => {
        console.error("Sepete eklenirken hata:", err);
        alert("Sepete eklenirken bir hata oluştu.");
      });
  };

  if (!product) {
    return (
        <div className="d-flex justify-content-center align-items-center" style={{height: "80vh"}}>
            <div className="spinner-border text-primary" role="status"></div>
        </div>
    );
  }

  const imageUrl = getImage();

  return (
    <div className="container mt-5 mb-5">
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
        <div className="row g-0">
            
            {/* SOL TARAF: Ürün Resmi (Büyük) */}
            <div className="col-md-6 bg-light d-flex align-items-center justify-content-center p-4">
               <img
                    // Hata varsa varsayılanı, yoksa hesaplanan resmi göster
                    src={imgError ? IMAGE_MAP["Varsayilan"][0] : imageUrl}
                    alt={product.isim}
                    className="img-fluid rounded shadow-sm"
                    style={{ maxHeight: "500px", objectFit: "contain", width: "100%" }}
                    onError={() => setImgError(true)}
                />
            </div>

            {/* SAĞ TARAF: Ürün Bilgileri */}
            <div className="col-md-6 p-5 d-flex flex-column justify-content-center">
                
                <div className="mb-2">
                    <span className="badge bg-warning text-dark me-2 px-3 py-2 rounded-pill">
                        {product.kategori || "Genel"}
                    </span>
                    <span className="badge bg-secondary px-3 py-2 rounded-pill">
                        {product.marka || "Markasız"}
                    </span>
                </div>

                <h1 className="fw-bold text-dark mb-3">{product.isim}</h1>
                
                <p className="lead fs-6 text-secondary mb-4">
                    {product.aciklama || "Bu ürün için henüz bir açıklama girilmemiş. Kaliteli ve güvenilir bir tercih."}
                </p>

                <h2 className="text-primary fw-bold mb-4 display-5">{product.fiyat} ₺</h2>

                <hr className="mb-4" />

                <div className="d-grid gap-3">
                    <button 
                        className="btn btn-success btn-lg py-3 rounded-pill fw-bold shadow-sm" 
                        onClick={handleSepeteEkle}
                        disabled={product.stok === 0}
                    >
                        {product.stok > 0 ? (
                            <> <i className="bi bi-cart-plus me-2"></i> Sepete Ekle </>
                        ) : (
                            "Stokta Yok"
                        )}
                    </button>
                    
                    <button 
                        className="btn btn-outline-dark rounded-pill py-2"
                        onClick={() => navigate(-1)} 
                    >
                        Alışverişe Dön
                    </button>
                </div>
                
                <div className="mt-4 text-muted small d-flex align-items-center">
                    <i className="bi bi-box-seam me-2 fs-5"></i> 
                    <span>Stok Durumu: <strong>{product.stok} adet</strong> kaldı</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;