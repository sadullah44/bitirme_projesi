import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getAllProducts,
  searchProducts,
  filterProducts,
  getBrands,
  getCategoryTree
} from "../services/productService";

import ProductCard from "../components/ProductCard";
import BestSellers from "../components/BestSellers";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("search");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 12;

  // --- FİLTRE STATE'LERİ ---
  const [categoryTree, setCategoryTree] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");

  const [availableBrands, setAvailableBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isFilterActive, setIsFilterActive] = useState(false);

  // 1) KATEGORİ AĞACINI ÇEK
  useEffect(() => {
    getCategoryTree()
      .then((res) => {
        const sortedData = (res.data || []).sort((a, b) => 
            a.anaKategori.localeCompare(b.anaKategori, 'tr')
        );
        setCategoryTree(sortedData);
      })
      .catch((err) => console.error("Kategori ağacı yüklenemedi:", err));
  }, []);

  // 2) KATEGORİ DEĞİŞİNCE MARKA ÇEK
  useEffect(() => {
    if (!selectedMainCategory && (!selectedCategory || selectedCategory === "Tümü")) {
        setAvailableBrands([]);
        return;
    }

    getBrands(selectedMainCategory, selectedCategory)
      .then((res) => {
          const brands = res.data.filter(b => b).sort();
          setAvailableBrands(brands);
      })
      .catch((err) => console.error("Markalar çekilemedi:", err));
  }, [selectedCategory, selectedMainCategory]);

  // 3) ÜRÜNLERİ YÜKLE
  useEffect(() => {
    loadProducts();
  }, [page, selectedMainCategory, selectedCategory, selectedGender, searchTerm, isFilterActive]);

  const loadProducts = () => {
    setLoading(true);
    setProducts([]);

    let request;

    if (searchTerm) {
      request = searchProducts(searchTerm, page, pageSize);
    } else if (isFilterActive) {
      request = filterProducts(
        selectedMainCategory,
        selectedCategory === "Tümü" ? null : selectedCategory,
        selectedGender,
        selectedBrand,
        minPrice,
        maxPrice,
        page,
        pageSize
      );
    } else if (selectedCategory !== "Tümü" || selectedMainCategory) {
       request = filterProducts(
           selectedMainCategory, 
           selectedCategory === "Tümü" ? null : selectedCategory, 
           selectedGender,
           null, null, null, page, pageSize
        );
    } else {
      request = getAllProducts(page, pageSize);
    }

    request
      .then((res) => {
        setProducts(res.data.content);
        setTotalPages(res.data.totalPages);
      })
      .catch((err) => console.error("Hata:", err))
      .finally(() => setLoading(false));
  };

  const handleMainCategoryChange = (e) => {
    const mainCat = e.target.value;
    setSelectedMainCategory(mainCat);
    setSelectedCategory("Tümü");
    setSelectedGender(""); // Ana kategori değişince cinsiyeti sıfırla
  };

  const getSelectedCategoryObject = () => {
      return categoryTree.find(cat => cat.anaKategori === selectedMainCategory);
  };

  // 🔥 YENİ MANTIK: Cinsiyete bakmadan TÜM alt kategorileri getir
  const getSubCategories = () => {
    const catObj = getSelectedCategoryObject();
    if (!catObj) return [];

    // Hepsini bir havuzda toplayacağız (Set kullanarak tekrarları önlüyoruz)
    const tumAltKategoriler = new Set();

    // 1. Varsa 'cinsiyetliAltKategoriler' içindeki tüm listeleri ekle
    if (catObj.cinsiyetliAltKategoriler) {
        Object.values(catObj.cinsiyetliAltKategoriler).forEach(liste => {
            if(Array.isArray(liste)) {
                liste.forEach(item => tumAltKategoriler.add(item));
            }
        });
    }

    // 2. Varsa 'altKategoriler' listesini de ekle (Yedek olarak)
    if (catObj.altKategoriler && Array.isArray(catObj.altKategoriler)) {
        catObj.altKategoriler.forEach(item => tumAltKategoriler.add(item));
    }

    // Alfabatik sıralayıp dizi olarak döndür
    return Array.from(tumAltKategoriler).sort((a, b) => a.localeCompare(b, 'tr'));
  };

  const applyFilter = () => {
    setIsFilterActive(true);
    setPage(0);
    loadProducts();
    const closeBtn = document.getElementById("closeFilterBtn");
    if(closeBtn) closeBtn.click();
  };

  const clearFilters = () => {
    setSelectedMainCategory("");
    setSelectedCategory("Tümü"); // Sıra değiştiği için önce bunu sıfırlıyoruz
    setSelectedGender("");
    setSelectedBrand("");
    setMinPrice("");
    setMaxPrice("");
    setIsFilterActive(false);
    setPage(0);
  };

  const isGenderNeeded = () => {
      const catObj = getSelectedCategoryObject();
      return catObj ? catObj.genderRequired : false;
  };

  return (
    <>
      <div className="bg-white shadow-sm sticky-top" style={{ top: "70px", zIndex: 900 }}>
        <div className="container py-3 d-flex justify-content-end">
          <button className="btn btn-outline-primary" data-bs-toggle="offcanvas" data-bs-target="#filterSidebar">
            <i className="bi bi-sliders"></i> Detaylı Filtrele
          </button>
        </div>
      </div>

      <div className="offcanvas offcanvas-end" id="filterSidebar">
        <div className="offcanvas-header bg-light">
          <h5 className="offcanvas-title fw-bold">Filtreleme</h5>
          <button type="button" className="btn-close" id="closeFilterBtn" data-bs-dismiss="offcanvas"></button>
        </div>

        <div className="offcanvas-body">
          
          {/* 1. ANA KATEGORİ */}
          <div className="mb-3">
              <label className="form-label fw-bold">Ana Kategori</label>
              <select
                className="form-select mb-3"
                value={selectedMainCategory}
                onChange={handleMainCategoryChange}
              >
                <option value="">Tümü</option>
                {categoryTree.map((cat) => (
                  <option key={cat.id} value={cat.anaKategori}>
                    {cat.anaKategori}
                  </option>
                ))}
              </select>
          </div>

          {/* 2. ALT KATEGORİ (YERİ DEĞİŞTİ - ARTIK ÜSTTE) */}
          <div className="mb-3">
              <label className="form-label fw-bold">Alt Kategori</label>
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={!selectedMainCategory} // Sadece ana kategori seçilince açılır
              >
                <option value="Tümü">
                    {!selectedMainCategory 
                        ? "Önce Ana Kategori Seçin" 
                        : "Tümü"
                    }
                </option>
                {getSubCategories().map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
          </div>

          {/* 3. CİNSİYET (YERİ DEĞİŞTİ - ARTIK ALTTA) */}
          {/* Sadece gerekli kategorilerde göster */}
          {isGenderNeeded() && (
              <div className="mb-3">
                <label className="form-label fw-bold">Cinsiyet</label>
                <select
                  className="form-select"
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                >
                  <option value="">Tümü</option>
                  <option value="Bayan">Bayan</option>
                  <option value="Bay">Bay</option>
                </select>
              </div>
          )}

          {/* 4. MARKA */}
          {availableBrands.length > 0 && (
            <div className="mb-3">
              <label className="form-label fw-bold">Marka</label>
              <select
                className="form-select"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
              >
                <option value="">Tüm Markalar</option>
                {availableBrands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
          )}

          {/* 5. FİYAT */}
          <div className="mb-3">
              <label className="form-label fw-bold">Fiyat Aralığı</label>
              <div className="d-flex gap-2">
                <input type="number" className="form-control" placeholder="Min"
                  value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                <span>-</span>
                <input type="number" className="form-control" placeholder="Max"
                  value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
              </div>
          </div>

          <hr />

          <div className="d-grid gap-2">
              <button className="btn btn-primary" onClick={applyFilter}>
                Sonuçları Göster
              </button>
              <button className="btn btn-outline-secondary" onClick={clearFilters}>
                Temizle
              </button>
          </div>
        </div>
      </div>

      {selectedCategory === "Tümü" && !selectedMainCategory && !searchTerm && !isFilterActive && (
        <>
            <div className="bg-light py-5 text-center shadow-sm" style={{ background: "linear-gradient(to right, #eef2f3, #8e9eab)" }}>
                <div className="container py-4">
                <h1 className="display-5 fw-bold text-dark">E-Ticaret Dünyası</h1>
                <p className="lead text-secondary">Binlerce ürün arasından dilediğini seç.</p>
                </div>
            </div>
            <BestSellers />
        </>
      )}

      <div className="container my-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 className="fw-bold border-start border-4 border-primary ps-3 d-inline-block">
                    {isFilterActive 
                        ? (selectedBrand ? `${selectedBrand}` : (selectedCategory !== "Tümü" ? selectedCategory : (selectedMainCategory || "Filtrelenmiş Ürünler"))) 
                        : (searchTerm ? `"${searchTerm}"` : (selectedCategory !== "Tümü" ? selectedCategory : (selectedMainCategory || "Tüm Ürünler")))
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
            <div className="spinner-border text-primary"></div>
            <p className="mt-2">Yükleniyor...</p>
          </div>
        ) : (
            <>
                {products.length === 0 ? (
                    <div className="text-center py-5">
                        <i className="bi bi-emoji-frown display-1 text-muted"></i>
                        <h3 className="mt-3 text-secondary">Sonuç Bulunamadı</h3>
                        <p>Seçtiğiniz kriterlere uygun ürün bulunmamaktadır.</p>
                        <button className="btn btn-outline-dark" onClick={clearFilters}>Filtreleri Temizle</button>
                    </div>
                ) : (
                  <div className="row g-4">
                    {products.map((p) => (
                      <div className="col-6 col-md-4 col-lg-3" key={p.id}>
                        <ProductCard product={p} />
                      </div>
                    ))}
                  </div>
                )}
            </>
        )}

        {/* Sayfalama */}
        {!loading && totalPages > 1 && (
          <div className="d-flex justify-content-center mt-5">
            <nav>
              <ul className="pagination">
                <li className={`page-item ${page === 0 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage(page - 1)}>&laquo; Önceki</button>
                </li>
                <li className="page-item active">
                  <span className="page-link">{page + 1} / {totalPages}</span>
                </li>
                <li className={`page-item ${page === totalPages - 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage(page + 1)}>Sonraki &raquo;</button>
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