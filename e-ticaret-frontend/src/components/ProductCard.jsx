import { useState } from "react";
import { Link } from "react-router-dom";

// --- GÜVENİLİR RESİM HAVUZU (UNSPLASH) ---
const IMAGE_MAP = {
  // TELEFONLAR
  "Apple_Telefon": [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80", // iPhone
    "https://images.unsplash.com/photo-1598327105666-5b89351aff23?w=500&q=80"
  ],
  "Samsung_Telefon": [
    "https://images.unsplash.com/photo-1610945265064-f45a855f79d1?w=500&q=80", // Galaxy
    "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=500&q=80"
  ],
  "Xiaomi_Telefon": [
    "https://images.unsplash.com/photo-1598327105666-5b89351aff23?w=500&q=80" // Genel Android
  ],

  // BİLGİSAYARLAR
  "Apple_Bilgisayar": [
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80", // MacBook
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=500&q=80"
  ],
  "Monster_Bilgisayar": [
    "https://images.unsplash.com/photo-1531297461136-82lw8z8a?w=500&q=80" // Gaming Laptop
  ],
  "Lenovo_Bilgisayar": [
    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500&q=80" // Laptop
  ],

  // GİYİM (Markalar)
  "Nike_Giyim": ["https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&q=80"],
  "Adidas_Giyim": ["https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&q=80"],
  "Mavi_Giyim": ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&q=80"],
  "Zara_Giyim": ["https://images.unsplash.com/photo-1551488852-080146633429?w=500&q=80"],

  // AYAKKABI
  "Nike_Ayakkabı": ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80"],
  "Adidas_Ayakkabı": ["https://images.unsplash.com/photo-1560769629-975e13b061d9?w=500&q=80"],
  "New Balance_Ayakkabı": ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&q=80"],

  // GENEL YEDEKLER (Kategori Bazlı)
  "Telefon_Genel": ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80"],
  "Bilgisayar_Genel": ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80"],
  "Elektronik_Genel": ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"],
  "Giyim_Genel": ["https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&q=80"],
  "Ayakkabı_Genel": ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80"],
  "Varsayilan": ["https://images.unsplash.com/photo-1526304640152-d4619684e484?w=500&q=80"]
};

function ProductCard({ product }) {
  const [imgError, setImgError] = useState(false);

  // --- GELİŞMİŞ RESİM SEÇME MANTIĞI ---
  const getImage = () => {
    const marka = product.marka || "";
    const kategori = product.kategori || "";

    // 1. Önce "Marka_Kategori" kombinasyonuna bak (Örn: "Apple_Telefon")
    const specificKey = `${marka}_${kategori}`;
    if (IMAGE_MAP[specificKey]) {
        return IMAGE_MAP[specificKey][0]; // İlk resmi al
    }

    // 2. Yoksa sadece "Kategori_Genel" kombinasyonuna bak (Örn: "Telefon_Genel")
    const categoryKey = `${kategori}_Genel`;
    if (IMAGE_MAP[categoryKey]) {
        return IMAGE_MAP[categoryKey][0];
    }

    // 3. Hiçbiri yoksa varsayılanı döndür
    return IMAGE_MAP["Varsayilan"][0];
  };

  const finalSrc = getImage();
  const rating = Math.floor(Math.random() * 2) + 3; // 3-5 arası puan
  const reviewCount = Math.floor(Math.random() * 50) + 10;

  return (
    <div className="card pro-card h-100">
      
      {/* Resim Alanı */}
      <div className="img-box">
        <span className="category-badge">
          {product.kategori || "FIRSAT"}
        </span>

        {product.stok < 20 && (
          <span className="position-absolute top-0 end-0 m-3 badge bg-danger rounded-pill shadow-sm">
            Son {product.stok}
          </span>
        )}

        <img
          src={imgError ? IMAGE_MAP["Varsayilan"][0] : finalSrc}
          alt={product.isim}
          loading="lazy"
          onError={() => setImgError(true)}
        />
      </div>

      {/* İçerik */}
      <div className="card-body d-flex flex-column p-4">
        
        <div className="mb-2">
           <small className="text-muted fw-bold ls-1" style={{letterSpacing: "1px", fontSize: "11px"}}>
             {product.marka ? product.marka.toUpperCase() : "MARKASIZ"}
           </small>
           <h5 className="fw-bold text-dark mt-1 text-truncate" title={product.isim}>
             {product.isim}
           </h5>
        </div>

        <div className="mb-3 d-flex align-items-center">
           <div className="text-warning me-2">
             {[...Array(5)].map((_, i) => (
               <i key={i} className={`bi ${i < rating ? 'bi-star-fill' : 'bi-star'}`}></i>
             ))}
           </div>
           <small className="text-muted">({reviewCount})</small>
        </div>

        <div className="mt-auto d-flex align-items-center justify-content-between pt-3 border-top">
           <div>
              <span className="text-decoration-line-through text-muted small me-2">
                {(product.fiyat * 1.25).toFixed(0)}₺
              </span>
              <span className="fw-black fs-4 text-primary">
                {product.fiyat} ₺
              </span>
           </div>

           <Link to={`/urun/${product.id}`} className="btn-circle shadow-sm text-decoration-none">
             <i className="bi bi-arrow-right fs-5"></i>
           </Link>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;