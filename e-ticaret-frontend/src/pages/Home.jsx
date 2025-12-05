import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom"; 
import { getAllProducts, getProductsByCategory, searchProducts, filterProducts, getBrands, getCategories } from "../services/productService";
import ProductCard from "../components/ProductCard";
import BestSellers from "../components/BestSellers"; // <-- Zaten import etmiştin

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchParams, setSearchSearchParams] = useSearchParams();
  const searchTerm = searchParams.get("search");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 12;

  // --- FİLTRE VE VERİ STATE'LERİ ---
  const [categories, setCategories] = useState(["Tümü"]); 
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  
  const [availableBrands, setAvailableBrands] = useState([]); 
  const [selectedBrand, setSelectedBrand] = useState("");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isFilterActive, setIsFilterActive] = useState(false);

  // 1. KATEGORİLERİ ÇEK
  useEffect(() => {
    getCategories()
        .then(res => {
            setCategories(["Tümü", ...res.data]);
        })
        .catch(err => console.error("Kategoriler yüklenemedi:", err));
  }, []);

  // 2. KATEGORİ DEĞİŞİNCE MARKALARI ÇEK
  useEffect(() => {
    setSelectedBrand(""); 
    
    if (selectedCategory === "Tümü") {
        setAvailableBrands([]); 
    } else {
        getBrands(selectedCategory)
            .then(res => setAvailableBrands(res.data.filter(b => b)))
            .catch(err => console.error("Markalar çekilemedi:", err));
    }
  }, [selectedCategory]);


  // 3. ÜRÜNLERİ YÜKLE
  useEffect(() => {
    loadProducts();
  }, [page, selectedCategory, searchTerm, isFilterActive]); 

  const loadProducts = () => {
    setLoading(true);
    setProducts([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let request;

    if (searchTerm) {
        request = searchProducts(searchTerm, page, pageSize);
    } 
    else if (isFilterActive) {
        request = filterProducts(selectedCategory, selectedBrand, minPrice, maxPrice, page, pageSize);
    }
    else if (selectedCategory !== "Tümü") {
        request = getProductsByCategory(selectedCategory, page, pageSize);
    } 
    else {
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

  const applyFilter = () => {
    setIsFilterActive(true);
    setPage(0);
    loadProducts();
    const closeBtn = document.getElementById("closeFilterBtn");
    if(closeBtn) closeBtn.click();
  };

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setSelectedBrand("");
    setIsFilterActive(false);
    setSelectedCategory("Tümü");
    setPage(0);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) setPage(newPage);
  };

  return (
    <>
      {/* ÜST BAR: SADECE FİLTRE BUTONU KALDI */}
      <div className="bg-white border-bottom shadow-sm sticky-top" style={{ top: "70px", zIndex: 900 }}>
        <div className="container py-3 d-flex align-items-center justify-content-end">
            
            <button 
                className="btn btn-outline-primary rounded-pill px-4 d-flex align-items-center gap-2"
                data-bs-toggle="offcanvas" 
                data-bs-target="#filterSidebar"
            >
                <i className="bi bi-sliders"></i> 
                <span>Detaylı Filtrele</span>
            </button>
        </div>
      </div>

      {/* --- YAN FİLTRE PANELİ (OFFCANVAS) --- */}
      <div className="offcanvas offcanvas-end" tabIndex="-1" id="filterSidebar">
        <div className="offcanvas-header bg-light">
            <h5 className="offcanvas-title fw-bold">Filtreleme</h5>
            <button type="button" className="btn-close" id="closeFilterBtn" data-bs-dismiss="offcanvas"></button>
        </div>
        <div className="offcanvas-body">
            
            {/* 1. Kategori */}
            <div className="mb-4">
                <label className="form-label fw-bold text-muted small">KATEGORİ</label>
                <select 
                    className="form-select" 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>

            {/* 2. Marka */}
            {availableBrands.length > 0 && (
                <div className="mb-4">
                    <label className="form-label fw-bold text-muted small">MARKA</label>
                    <select 
                        className="form-select"
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                    >
                        <option value="">Tüm Markalar</option>
                        {availableBrands.map(brand => (
                            <option key={brand} value={brand}>{brand}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* 3. Fiyat */}
            <div className="mb-4">
                <label className="form-label fw-bold text-muted small">FİYAT ARALIĞI</label>
                <div className="d-flex gap-2 align-items-center">
                    <input type="number" className="form-control" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                    <span>-</span>
                    <input type="number" className="form-control" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                </div>
            </div>

            <hr />

            <div className="d-grid gap-2">
                <button className="btn btn-primary" onClick={applyFilter}>Sonuçları Göster</button>
                <button className="btn btn-outline-secondary" onClick={clearFilters} data-bs-dismiss="offcanvas">Temizle</button>
            </div>
        </div>
      </div>

      {/* HERO SECTION & BEST SELLERS */}
      {/* Sadece ana sayfadayken (filtre/arama yokken) göster */}
      {selectedCategory === "Tümü" && !searchTerm && !isFilterActive && (
        <>
            <div className="bg-light py-5 text-center shadow-sm" style={{ background: "linear-gradient(to right, #eef2f3, #8e9eab)" }}>
                <div className="container py-4">
                <h1 className="display-5 fw-bold text-dark">E-Ticaret Dünyası</h1>
                <p className="lead text-secondary">Binlerce ürün arasından dilediğini seç.</p>
                </div>
            </div>
            
            {/* 👇 YENİ EKLENEN KISIM BURASI 👇 */}
            <BestSellers />
        </>
      )}

      {/* ÜRÜN LİSTESİ */}
      <div className="container my-5" id="urunler">
        <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 className="fw-bold border-start border-4 border-primary ps-3 d-inline-block">
                    {isFilterActive 
                        ? (selectedBrand ? `${selectedBrand} Ürünleri` : "Filtrelenmiş Ürünler") 
                        : (searchTerm ? `"${searchTerm}"` : `${selectedCategory} Ürünleri`)
                    }
                </h2>
                {isFilterActive && (
                    <span className="badge bg-info text-dark ms-2" onClick={clearFilters} style={{cursor: "pointer"}}>
                        Filtreleri Temizle <i className="bi bi-x"></i>
                    </span>
                )}
            </div>
            <span className="text-muted small">{products.length} ürün</span>
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
                        <i className="bi bi-emoji-frown display-1 text-muted"></i>
                        <h3 className="mt-3 text-secondary">Sonuç Bulunamadı</h3>
                        <p>Seçtiğiniz kriterlere uygun ürün bulunmamaktadır.</p>
                        <button className="btn btn-outline-dark" onClick={clearFilters}>
                            Filtreleri Temizle
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