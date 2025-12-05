import { useState } from "react";
import { Link } from "react-router-dom";

function ProductCard({ product }) {
  // Eğer veritabanında resimUrl yoksa veya kırık ise bunu göster
  const fallbackImage = "https://placehold.co/500x500?text=Resim+Yok";
  const [imgSrc, setImgSrc] = useState(product.resimUrl || fallbackImage);

  const rating = Math.floor(Math.random() * 2) + 3;
  const reviewCount = Math.floor(Math.random() * 50) + 10;

  return (
    <div className="card pro-card h-100">
      
      <div className="img-box">
        <span className="category-badge">
          {product.kategori || "FIRSAT"}
        </span>

        {product.stok < 10 && (
          <span className="position-absolute top-0 end-0 m-3 badge bg-danger rounded-pill shadow-sm">
            Son {product.stok}
          </span>
        )}

        <img
          src={imgSrc} // Direkt veritabanından gelen URL!
          alt={product.isim}
          loading="lazy"
          onError={() => setImgSrc(fallbackImage)}
        />
      </div>

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