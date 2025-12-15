import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getProductById, addReview } from "../services/productService";
import { CartContext } from "../context/CartContext"; 
import { AuthContext } from "../context/AuthContext";
import { sepetEkle } from "../services/sepetService";

// 👇 HER İKİ BİLEŞENİ DE IMPORT EDİYORUZ
import ProductRecommendations from "../components/ProductRecommendations"; // Eski (Benzer Ürünler)
import RecommendedProducts from "../components/RecommendedProducts";     // Yeni (İlginizi Çekebilir)

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Yorum Formu State'i
  const [reviewForm, setReviewForm] = useState({ puan: 5, metin: "" });
  const [reviewLoading, setReviewLoading] = useState(false);

  const fallbackImage = "https://placehold.co/600x600?text=Resim+Yok";
  const [imgSrc, setImgSrc] = useState(null);

  const { updateCartCount } = useContext(CartContext); 
  const { isAuthenticated } = useContext(AuthContext);

  const fetchProduct = () => {
    getProductById(id)
      .then((res) => {
        setProduct(res.data);
        setImgSrc(res.data.resimUrl || fallbackImage);
      })
      .catch((err) => console.error("Ürün detayı alınamadı:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    fetchProduct();
  }, [id]);

  const handleSepeteEkle = () => {
    if (!isAuthenticated) {
      navigate("/giris", { state: { returnUrl: location.pathname } });
      return;
    }
    sepetEkle(product.id)
      .then((res) => {
        const yeniToplamAdet = res.data.urunler.reduce((toplam, urun) => toplam + urun.adet, 0);
        updateCartCount(yeniToplamAdet);
        alert("Ürün sepete eklendi!");
      })
      .catch((err) => alert("Hata oluştu."));
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
        navigate("/giris", { state: { returnUrl: location.pathname } });
        return;
    }

    setReviewLoading(true);
    addReview(product.id, reviewForm)
        .then(() => {
            alert("Yorumunuz başarıyla eklendi!");
            setReviewForm({ puan: 5, metin: "" });
            fetchProduct();
        })
        .catch((err) => {
            alert("Yorum eklenirken hata oluştu.");
            console.error(err);
        })
        .finally(() => setReviewLoading(false));
  };

  if (loading) return <div className="text-center mt-5">Yükleniyor...</div>;
  if (!product) return <div className="text-center mt-5">Ürün bulunamadı.</div>;

  return (
    <div className="container mt-5 mb-5">
      
      {/* 1. KISIM: Ürün Detay Kartı */}
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden mb-5">
        <div className="row g-0">
            <div className="col-md-6 bg-light d-flex align-items-center justify-content-center p-4">
               <img src={imgSrc} alt={product.isim} className="img-fluid rounded shadow-sm" style={{ maxHeight: "500px", objectFit: "contain", width: "100%" }} onError={() => setImgSrc(fallbackImage)} />
            </div>
            <div className="col-md-6 p-5 d-flex flex-column justify-content-center">
                <div className="mb-2">
                    <span className="badge bg-warning text-dark me-2">{product.kategori}</span>
                    <span className="badge bg-secondary">{product.marka}</span>
                </div>
                <h1 className="fw-bold text-dark mb-3">{product.isim}</h1>
                <p className="lead fs-6 text-secondary mb-4">{product.aciklama}</p>
                <h2 className="text-primary fw-bold mb-4 display-5">{product.fiyat} ₺</h2>
                <div className="d-grid gap-3">
                    <button className="btn btn-success btn-lg rounded-pill shadow-sm" onClick={handleSepeteEkle} disabled={product.stok === 0}>
                        {product.stok > 0 ? "Sepete Ekle" : "Stokta Yok"}
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* 2. KISIM: BENZER ÜRÜNLER (Eski Bileşen - Kategori Bazlı) */}
      <div className="mb-4">
        <h4 className="fw-bold mb-3">Benzer Ürünler</h4>
        {/* Eski bileşeni burada tuttuk */}
        <ProductRecommendations currentProductId={id} />
      </div>

      <hr className="my-5 text-muted" />

      {/* 3. KISIM: İLGİNİZİ ÇEKEBİLİR (Yeni Bileşen - Akıllı Öneri) */}
      {/* Yeni bileşeni buraya ekledik */}
      <RecommendedProducts currentProductId={id} />
      
      <div className="mb-5"></div> 

      {/* 4. KISIM: YORUMLAR */}
      <div className="row mt-5">
        <div className="col-lg-8 mx-auto">
            <h4 className="fw-bold mb-4"><i className="bi bi-chat-quote me-2"></i>Değerlendirmeler</h4>
            
            {product.yorumlar && product.yorumlar.length > 0 ? (
                <div className="list-group shadow-sm mb-5">
                    {product.yorumlar.map((yorum, index) => (
                        <div key={index} className="list-group-item border-0 border-bottom p-4">
                            <div className="d-flex justify-content-between mb-2">
                                <h6 className="fw-bold mb-0">{yorum.kullaniciAdi || "Kullanıcı"}</h6>
                                <div className="text-warning">
                                    {[...Array(5)].map((_, i) => (
                                        <i key={i} className={`bi ${i < yorum.puan ? 'bi-star-fill' : 'bi-star'}`}></i>
                                    ))}
                                </div>
                            </div>
                            <p className="text-muted mb-0">{yorum.metin}</p>
                            <small className="text-secondary" style={{fontSize: "11px"}}>
                                {yorum.tarih ? new Date(yorum.tarih).toLocaleDateString() : ""}
                            </small>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="alert alert-light border text-center mb-5">Henüz yorum yapılmamış. İlk yorumu sen yap!</div>
            )}

            <div className="card shadow-sm border-0 bg-light">
                <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">Yorum Yap</h5>
                    
                    {!isAuthenticated ? (
                        <div className="text-center py-3">
                            <p>Yorum yapmak için giriş yapmalısınız.</p>
                            <button className="btn btn-primary btn-sm" onClick={() => navigate("/giris", { state: { returnUrl: location.pathname } })}>Giriş Yap</button>
                        </div>
                    ) : (
                        <form onSubmit={handleReviewSubmit}>
                            <div className="mb-3">
                                <label className="form-label fw-bold small text-muted">PUANINIZ</label>
                                <div className="fs-3 text-warning" style={{cursor: "pointer"}}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <i 
                                            key={star} 
                                            className={`bi ${star <= reviewForm.puan ? 'bi-star-fill' : 'bi-star'} me-1`}
                                            onClick={() => setReviewForm({...reviewForm, puan: star})}
                                        ></i>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold small text-muted">YORUMUNUZ</label>
                                <textarea 
                                    className="form-control" 
                                    rows="3" 
                                    placeholder="Ürün hakkında ne düşünüyorsunuz?"
                                    value={reviewForm.metin}
                                    onChange={(e) => setReviewForm({...reviewForm, metin: e.target.value})}
                                    required
                                ></textarea>
                            </div>
                            <div className="d-flex justify-content-end">
                                <button type="submit" className="btn btn-primary px-4" disabled={reviewLoading}>
                                    {reviewLoading ? "Gönderiliyor..." : "Yorumu Gönder"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;