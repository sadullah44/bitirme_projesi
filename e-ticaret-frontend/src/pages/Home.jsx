import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom"; // URL parametrelerini okumak için
import { getAllProducts, getProductsByCategory, searchProducts } from "../services/productService";
import ProductCard from "../components/ProductCard";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // URL'deki "?search=..." parametresini okumak için
  const [searchParams, setSearchSearchParams] = useSearchParams();
  const searchTerm = searchParams.get("search");

  // Sayfalama ve Kategori State'leri
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  
  const pageSize = 12;

  // Sabit Kategoriler (İstersen burayı da backend'den çekebilirsin ama şimdilik sabit olsun)
  const categories = ["Tümü", "Telefon", "Bilgisayar", "Elektronik", "Giyim", "Ayakkabı", "Ev & Yaşam", "Spor", "Kitap"];

  useEffect(() => {
    loadProducts();
  }, [page, selectedCategory, searchTerm]); // Bu değerler değişince yeniden yükle

  const loadProducts = () => {
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let request;

    if (searchTerm) {
        // 1. Arama Modu
        request = searchProducts(searchTerm, page, pageSize);
    } 
    else if (selectedCategory !== "Tümü") {
        // 2. Kategori Modu
        request = getProductsByCategory(selectedCategory, page, pageSize);
    } 
    else {
        // 3. Normal Mod (Tüm Ürünler)
        request = getAllProducts(page, pageSize);
    }

    request
      .then(res => {
        setProducts(res.data.content);
        setTotalPages(res.data.totalPages);
      })
      .catch(err => console.error("Hata:", err))
      .finally(() => setLoading(false));
  };

  // Kategoriye Tıklanınca
  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    setPage(0); // Sayfayı başa sar
    setSearchSearchParams({}); // Aramayı temizle (Kategori seçince arama iptal olsun)
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) setPage(newPage);
  };

  return (
    <>
      {/* KATEGORİ MENÜSÜ (Yatay Kaydırılabilir) */}
      <div className="bg-white border-bottom shadow-sm sticky-top" style={{ top: "70px", zIndex: 900 }}>
        <div className="container py-3">
            <div className="d-flex gap-2 overflow-auto pb-1" style={{ whiteSpace: "nowrap" }}>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => handleCategoryClick(cat)}
                        className={`btn rounded-pill px-4 fw-bold ${
                            selectedCategory === cat && !searchTerm 
                            ? "btn-dark" 
                            : "btn-light text-secondary border"
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* HERO SECTION (Sadece arama veya kategori yoksa göster) */}
      {selectedCategory === "Tümü" && !searchTerm && (
        <div className="bg-light py-5 text-center shadow-sm" style={{ background: "linear-gradient(to right, #eef2f3, #8e9eab)" }}>
            <div className="container py-4">
            <h1 className="display-5 fw-bold text-dark">E-Ticaret Dünyası</h1>
            <p className="lead text-secondary">Binlerce ürün arasından dilediğini seç.</p>
            </div>
        </div>
      )}

      {/* ÜRÜN LİSTESİ */}
      <div className="container my-5" id="urunler">
        
        {/* Başlık Alanı */}
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold border-start border-4 border-primary ps-3">
                {searchTerm ? `"${searchTerm}" için sonuçlar` : `${selectedCategory} Ürünleri`}
            </h2>
            <span className="text-muted small">{products.length} ürün gösteriliyor</span>
        </div>

        {loading ? (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2">Yükleniyor...</p>
            </div>
        ) : (
            <>
                {products.length === 0 ? (
                    <div className="text-center py-5">
                        <i className="bi bi-search display-1 text-muted"></i>
                        <h3 className="mt-3 text-secondary">Sonuç Bulunamadı</h3>
                        <p>Farklı bir arama yapmayı veya kategoriyi değiştirmeyi deneyin.</p>
                        <button className="btn btn-primary" onClick={() => {setSearchSearchParams({}); setSelectedCategory("Tümü");}}>
                            Tüm Ürünleri Göster
                        </button>
                    </div>
                ) : (
                    <div className="row g-4">
                        {products.map((product) => (
                            <div className="col-6 col-md-4 col-lg-3" key={product.id}>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                )}
            </>
        )}

        {/* SAYFALAMA */}
        {!loading && totalPages > 1 && (
            <div className="d-flex justify-content-center mt-5">
                <nav>
                    <ul className="pagination">
                        <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(page - 1)}>
                                &laquo; Önceki
                            </button>
                        </li>
                        <li className="page-item active">
                            <span className="page-link">{page + 1} / {totalPages}</span>
                        </li>
                        <li className={`page-item ${page === totalPages - 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(page + 1)}>
                                Sonraki &raquo;
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        )}

      </div>

      <footer className="bg-dark text-white text-center py-4 mt-auto">
        <div className="container">
            <p className="mb-0">&copy; 2024 E-Ticaret. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </>
  );
}

export default Home;