import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// productService yerine raporService yazıyoruz
import { getFrequentlyBoughtTogether } from "../services/raporService";

function FrequentlyBoughtTogether({ currentProductId }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentProductId) {
            setLoading(true);
            getFrequentlyBoughtTogether(currentProductId)
                .then((res) => {
                    setProducts(res.data);
                })
                .catch((err) => console.error("Birlikte alınanlar yüklenemedi:", err))
                .finally(() => setLoading(false));
        }
    }, [currentProductId]);

    // Eğer yükleniyorsa veya liste boşsa bu bloğu hiç gösterme (Hidden)
    if (loading || products.length === 0) return null;

    return (
        <div className="card border-0 shadow-sm bg-light mb-5">
            <div className="card-body p-4">
                <h5 className="fw-bold mb-4 text-primary">
                    <i className="bi bi-bag-plus-fill me-2"></i>
                    Bu Ürünle Birlikte Çok Alınanlar
                </h5>
                <div className="row g-3">
                    {products.map((item) => (
                        <div key={item.id} className="col-6 col-md-3">
                            <div className="card h-100 border-0 shadow-sm text-center position-relative hover-card">
                                <Link to={`/urun/${item.id}`} className="text-decoration-none text-dark">
                                    <img 
                                        src={item.resimUrl || "https://placehold.co/150x150?text=Resim+Yok"} 
                                        className="card-img-top p-3" 
                                        alt={item.isim}
                                        style={{ height: "140px", objectFit: "contain" }} 
                                    />
                                    <div className="card-body p-2">
                                        {/* Backend'den 'isim' olarak geliyor, dikkat et */}
                                        <h6 className="card-title text-truncate small fw-bold mb-1" title={item.isim}>
                                            {item.isim}
                                        </h6>
                                        <div className="text-success fw-bold small mb-2">{item.fiyat} ₺</div>
                                        <div className="d-grid">
                                            <button className="btn btn-sm btn-outline-primary py-0" style={{fontSize: "12px"}}>
                                                İncele
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default FrequentlyBoughtTogether;