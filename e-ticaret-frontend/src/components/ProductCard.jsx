import { useState } from "react";
import { Link } from "react-router-dom";

function ProductCard({ product }) {
  // Eğer veritabanında resimUrl yoksa veya kırık ise bunu göster
  const fallbackImage = "https://placehold.co/500x500?text=Resim+Yok";
  const [imgSrc, setImgSrc] = useState(product.resimUrl || fallbackImage);

  // --- GERÇEK VERİ HESAPLAMA ---
  // 1. Yorum listesini al (Yoksa boş dizi kabul et)
  const comments = product.yorumlar || [];
  
  // 2. Yorum Sayısı
  const reviewCount = comments.length;

  // 3. Ortalama Puanı Hesapla
  // reduce ile tüm puanları topla, sonra sayıya böl
  const totalPoints = comments.reduce((sum, comment) => sum + (comment.puan || 0), 0);
  const averageRating = reviewCount > 0 ? totalPoints / reviewCount : 0;

  // Yıldız gösterimi için yuvarla (Örn: 4.6 -> 5, 4.2 -> 4)
  const ratingToDisplay = Math.round(averageRating);

  return (
    <div className="card pro-card h-100">
      
      <div className="img-box">
        <span className="category-badge">
          {product.kategori || "GENEL"}
        </span>

        {product.stok < 10 && product.stok > 0 && (
          <span className="position-absolute top-0 end-0 m-3 badge bg-danger rounded-pill shadow-sm">
            Son {product.stok}
          </span>
        )}
        
        {product.stok === 0 && (
           <span className="position-absolute top-0 end-0 m-3 badge bg-secondary rounded-pill shadow-sm">
            Tükendi
          </span>
        )}

        <img
          src={imgSrc}
          alt={product.isim}
          loading="lazy"
          onError={() => setImgSrc(fallbackImage)}
        />
      </div>

      <div className="card-body d-flex flex-column p-4">
        <div className="mb-2">
           <small className="text-muted fw-bold ls-1" style={{letterSpacing: "1px", fontSize: "11px"}}>
             {product.marka ? product.marka.toUpperCase() : ""}
           </small>
           <h5 className="fw-bold text-dark mt-1 text-truncate" title={product.isim}>
             {product.isim}
           </h5>
        </div>

        {/* YILDIZLAR KISMI: Sadece yorum varsa göster, yoksa "Yeni Ürün" yaz */}
        <div className="mb-3 d-flex align-items-center">
           {reviewCount > 0 ? (
               <>
                 <div className="text-warning me-2">
                   {[...Array(5)].map((_, i) => (
                     <i key={i} className={`bi ${i < ratingToDisplay ? 'bi-star-fill' : 'bi-star'}`}></i>
                   ))}
                 </div>
                 <small className="text-muted">({reviewCount})</small>
               </>
           ) : (
               <small className="text-success fst-italic">
                   <i className="bi bi-stars me-1"></i>Yeni Ürün
               </small>
           )}
        </div>

        <div className="mt-auto d-flex align-items-center justify-content-between pt-3 border-top">
           <div>
              {/* SAHTE İNDİRİM KALDIRILDI. Sadece gerçek fiyat. */}
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