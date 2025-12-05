import { useEffect, useState } from "react";
import { getBestSellers, getTopRated } from "../services/raporService";

function BestSellers() {
    const [bestSellers, setBestSellers] = useState([]);
    const [topRated, setTopRated] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bestRes, ratedRes] = await Promise.all([
                    getBestSellers(),
                    getTopRated()
                ]);

                // --- DEBUG İÇİN LOG ---
                console.log("Gelen Best Sellers:", bestRes.data);
                console.log("Gelen Top Rated:", ratedRes.data);

                // --- GÜVENLİK KONTROLÜ ---
                // Gelen veri bir Dizi (Array) ise state'e at, değilse boş dizi at.
                setBestSellers(Array.isArray(bestRes.data) ? bestRes.data : []);
                setTopRated(Array.isArray(ratedRes.data) ? ratedRes.data : []);

            } catch (error) {
                console.error("Raporlar çekilemedi:", error);
                setBestSellers([]); // Hata durumunda boşalt
                setTopRated([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="text-center py-4">Yükleniyor...</div>;

    return (
        <div className="container py-5">
            <div className="row g-5">
                {/* SOL TARAFA: ÇOK SATANLAR */}
                <div className="col-md-6">
                    <h3 className="fw-bold mb-3 text-primary">
                        <i className="bi bi-graph-up-arrow me-2"></i>Çok Satanlar
                    </h3>
                    <div className="list-group shadow-sm">
                        
                        {/* Map hatası almamak için ekstra güvenlik */}
                        {bestSellers.length > 0 ? (
                            bestSellers.map((item, index) => (
                                <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                        <span className="badge bg-primary rounded-pill me-3">{index + 1}</span>
                                        <span className="fw-bold">{item.urunAdi || item.urunIsmi}</span>
                                    </div>
                                    <span className="badge bg-light text-dark border">
                                        {item.toplamSatisAdedi} Adet Satıldı
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="p-3 text-muted">Henüz satış verisi yok.</div>
                        )}
                    </div>
                </div>

                {/* SAĞ TARAFA: YÜKSEK PUANLILAR */}
                <div className="col-md-6">
                    <h3 className="fw-bold mb-3 text-warning">
                        <i className="bi bi-star-fill me-2"></i>En Beğenilenler
                    </h3>
                    <div className="list-group shadow-sm">
                        
                        {topRated.length > 0 ? (
                            topRated.map((item, index) => (
                                <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                        {item.resimUrl ? (
                                            <img src={item.resimUrl} alt="urun" className="rounded-circle me-3" style={{width: "40px", height: "40px", objectFit: "cover"}} />
                                        ) : (
                                            <span className="badge bg-warning text-dark rounded-pill me-3">{index + 1}</span>
                                        )}
                                        <span className="fw-bold">{item.urunAdi || item.urunIsmi}</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <i className="bi bi-star-fill text-warning me-1"></i>
                                        <strong>{item.ortalamaPuan ? Number(item.ortalamaPuan).toFixed(1) : "0.0"}</strong>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-3 text-muted">Henüz puan verisi yok.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BestSellers;