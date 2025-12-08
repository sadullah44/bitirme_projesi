import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSuggestedProducts } from "../services/productService";

function ProductRecommendations({ currentProductId }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // DÜZELTME BURADA:
    // ID null ise, boş ise VEYA string olarak "undefined" ise işlemi durdur.
    if (!currentProductId || currentProductId === "undefined") return;

    setLoading(true);
    // Sayfa değiştiğinde önceki önerileri temizle
    setSuggestions([]); 
    
    getSuggestedProducts(currentProductId)
      .then((res) => {
        setSuggestions(res.data);
      })
      .catch((err) => console.error("Öneriler yüklenemedi:", err))
      .finally(() => setLoading(false));
  }, [currentProductId]);

  if (loading || suggestions.length === 0) return null;

  return (
    <div className="mt-5 p-4 bg-light rounded-4 bg-opacity-50">
      <h4 className="fw-bold mb-3 text-dark">
        <i className="bi bi-grid-fill text-primary me-2"></i>
        Benzer Ürünler
      </h4>
      <div className="row g-3">
        {suggestions.map((product) => (
          <div key={product.id} className="col-6 col-md-3">
            <div className="card h-100 border-0 shadow-sm text-center p-3 position-relative">
                
              {/* Ürün Resmi */}
              <div className="mb-2" style={{height: "120px", display: "flex", alignItems: "center", justifyContent: "center"}}>
                  <img 
                    src={product.resimUrl || "https://placehold.co/100x100?text=No+Img"} 
                    alt={product.isim}
                    className="img-fluid"
                    style={{maxHeight: "100%", objectFit: "contain"}}
                  />
              </div>

              {/* Ürün Bilgileri */}
              <h6 className="fw-bold text-dark text-truncate mb-1" title={product.isim}>
                {product.isim}
              </h6>
              
              <div className="text-primary fw-bold mb-2">
                  {product.fiyat} ₺
              </div>

              <Link 
                to={`/urun/${product.id}`} 
                className="btn btn-outline-primary btn-sm rounded-pill w-100 stretched-link"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                İncele
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductRecommendations;