import api from "./api";

// TÜM ÜRÜNLER
export const getAllProducts = (page = 0, size = 12) => {
    return api.get(`/urunler?page=${page}&size=${size}`);
};

// ARAMA
export const searchProducts = (keyword, page = 0, size = 12) => {
    return api.get(`/urunler/ara?q=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
};

// ÜRÜN DETAY
export const getProductById = (id) => {
    return api.get(`/urunler/${id}`);
};

// DETAYLI FİLTRELEME (cinsiyet parametresi eklendi)
export const filterProducts = (mainCategory, subCategory, gender, brand, minPrice, maxPrice, page, size) => {
    return api.get(`/urunler/filtrele`, {
        params: {
            anaKategori: mainCategory || null,
            altKategori: subCategory || null,
            cinsiyet: gender || null, // 🔥 YENİ: Cinsiyet eklendi
            marka: brand || null,
            minFiyat: minPrice || null,
            maxFiyat: maxPrice || null,
            page,
            size
        }
    });
};

// MARKALARI GETİR
export const getBrands = (mainCategory, subCategory) => {
    return api.get("/urunler/markalar", {
        params: {
            anaKategori: mainCategory || null,
            altKategori: subCategory !== "Tümü" ? subCategory : null
        }
    });
};

// SATICININ KENDİ ÜRÜNLERİ
export const getMyProducts = () => {
    return api.get("/urunler/satici-urunleri");
};

// ÜRÜN EKLE
export const addProduct = (productData) => {
    return api.post("/urun-ekle", productData);
};

// ÜRÜN SİL
export const deleteProduct = (id) => {
    return api.delete(`/urunler/${id}`);
};

// ÜRÜN GÜNCELLE
export const updateProduct = (id, productData) => {
    return api.put(`/urunler/${id}`, productData);
};

// YORUM EKLE
export const addReview = (urunId, reviewData) => {
    return api.post(`/urunler/${urunId}/yorum`, reviewData);
};

// BİRLİKTE ALINAN ÜRÜNLER
export const getSuggestedProducts = (productId) => {
    return api.get(`/oneri/benzer-urunler/${productId}`);
};

// 🔥 KATEGORİ AĞACINI GETİR (YENİ FORMAT)
// Backend endpoint: GET /kategori/agac
export const getCategoryTree = () => {
    return api.get("/kategori/agac");
};