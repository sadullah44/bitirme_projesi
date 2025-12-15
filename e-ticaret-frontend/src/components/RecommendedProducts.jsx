import React, { useEffect, useState } from "react";
import { getRecommendedProducts } from "../services/productService";
import ProductCard from "./ProductCard";

const RecommendedProducts = ({ currentProductId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentProductId) {
      setLoading(true);
      getRecommendedProducts(currentProductId)
        .then((res) => {
          setProducts(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Önerilen ürünler alınamadı", err);
          setLoading(false);
        });
    }
  }, [currentProductId]);

  if (loading) return null; // Yüklenirken boş dön veya spinner koy
  if (products.length === 0) return null; // Öneri yoksa bileşeni gizle

  return (
    <div className="mt-5 py-5 bg-light bg-opacity-25 rounded-3">
      <div className="container">
        {/* Başlık Tasarımı - Trendyol Tarzı */}
        <div className="d-flex align-items-center mb-4">
            <div className="bg-primary rounded-pill me-3" style={{width:"5px", height:"30px"}}></div>
            <h3 className="fw-bold m-0" style={{color: "#333"}}>
                İlginizi Çekebilir
            </h3>
            <span className="ms-auto text-muted small cursor-pointer hover-link">
                Tümünü Gör <i className="bi bi-arrow-right"></i>
            </span>
        </div>

        <div className="row g-3">
          {products.map((product) => (
            <div className="col-6 col-md-4 col-lg-3" key={product.id}>
              {/* ProductCard bileşenini olduğu gibi kullanıyoruz */}
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendedProducts;