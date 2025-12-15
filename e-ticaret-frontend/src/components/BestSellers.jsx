import { useEffect, useState } from "react";
import { getBestSellers, getTopRated } from "../services/raporService";
import ProductCard from "../components/ProductCard";

function BestSellers() {
  const [bestSellers, setBestSellers] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("satis");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bestRes, ratedRes] = await Promise.all([
          getBestSellers(),
          getTopRated()
        ]);
        
        // Veri kontrolü (Debugging için konsolda görebilirsin)
        // console.log("Gelen Çok Satanlar:", bestRes.data);
        // console.log("Gelen Yüksek Puanlılar:", ratedRes.data);

        setBestSellers(Array.isArray(bestRes.data) ? bestRes.data : []);
        setTopRated(Array.isArray(ratedRes.data) ? ratedRes.data : []);
      } catch (error) {
        console.error("Raporlar çekilemedi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
      <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Yükleniyor...</span>
          </div>
      </div>
  );

  // Eğer iki liste de boşsa bileşeni gizle
  if (bestSellers.length === 0 && topRated.length === 0) return null;

  const activeList = activeTab === "satis" ? bestSellers : topRated;

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h3 className="fw-bold mb-4">Öne Çıkanlar</h3>
        
        {/* Tab Butonları */}
        <div className="d-inline-flex bg-light rounded-pill p-1 shadow-sm border">
          <button 
            className={`btn px-4 rounded-pill fw-bold transition ${activeTab === 'satis' ? 'btn-dark' : 'btn-light text-muted'}`}
            onClick={() => setActiveTab("satis")}
          >
             <i className="bi bi-graph-up-arrow me-2"></i>Çok Satanlar
          </button>
          <button 
            className={`btn px-4 rounded-pill fw-bold transition ${activeTab === 'puan' ? 'btn-warning text-dark' : 'btn-light text-muted'}`}
            onClick={() => setActiveTab("puan")}
          >
             <i className="bi bi-star-fill me-2"></i>En Beğenilenler
          </button>
        </div>
      </div>

      {/* YENİ HALİ (Soldan Sağa Dizilir) */}
<div className="row g-4">
        {activeList.map((item, index) => {
    
    // --- GÜVENLİK GÜNCELLEMESİ ---
    // Backend'den string gelmesi lazım ama nesne gelirse de yakalayalım.
    let rawId = item.id || item._id || item.urunId;
    
    // Eğer rawId bir obje ise (örneğin MongoDB ObjectId nesnesi), 
    // bunu string'e çevirmeyi dene veya varsa $oid özelliğini al.
    // Ancak backend düzeltmesiyle buna gerek kalmayacak, yine de güvenliktir.
    const productId = (typeof rawId === 'object' && rawId !== null) 
                      ? rawId.toString() // Nesne ise stringe çevir (bazen [object Object] döner, backend düzeltmesi şart)
                      : rawId;

    if (!productId || productId === "[object Object]") return null; // Hatalı ID varsa basma

    const formattedProduct = {
      id: productId,
      // ... diğer alanlar aynı ...
      isim: item.urunAdi || item.isim,
      resimUrl: item.resimUrl,
      fiyat: item.fiyat || 0,
      yorumlar: item.ortalamaPuan ? [{ puan: item.ortalamaPuan }] : [],
      stok: item.stok !== undefined ? item.stok : 100,
      marka: activeTab === 'satis' ? `${item.toplamSatisAdedi || 0} Adet Satıldı` : "Yüksek Puan",
      kategori: activeTab === 'satis' ? "Popüler" : "Beğenilen"
    };

    return (
       // ... return kısmı aynı ...
       <div key={productId} className="col-6 col-md-4 col-lg-3">
          {/* ... */}
          <ProductCard product={formattedProduct} />
       </div>
    );
})}
      </div>
    </div>
  );
}

export default BestSellers;