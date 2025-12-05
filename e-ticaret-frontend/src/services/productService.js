import api from "./api";

// Tüm Ürünler
export const getAllProducts = (page = 0, size = 12) => {
    return api.get(`/urunler?page=${page}&size=${size}`);
};

// Kategoriye Göre
export const getProductsByCategory = (category, page = 0, size = 12) => {
    // Türkçe karakter sorunu olmasın diye encodeURIComponent kullanıyoruz
    return api.get(`/urunler/kategori/${encodeURIComponent(category)}?page=${page}&size=${size}`);
};

// Arama
export const searchProducts = (keyword, page = 0, size = 12) => {
    return api.get(`/urunler/ara?q=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
};

export const getProductById = (id) => {
    return api.get(`/urunler/${id}`);
};
// DETAYLI FİLTRELEME
// Marka parametresi eklendi
export const filterProducts = (kategori, marka, minFiyat, maxFiyat, page = 0, size = 12) => {
    let url = `/urunler/filtrele?page=${page}&size=${size}`;

    if (kategori && kategori !== "Tümü") url += `&kategori=${encodeURIComponent(kategori)}`;

    // YENİ: Marka parametresi
    if (marka) url += `&marka=${encodeURIComponent(marka)}`;

    if (minFiyat) url += `&minFiyat=${minFiyat}`;
    if (maxFiyat) url += `&maxFiyat=${maxFiyat}`;

    return api.get(url);
};
// Markaları Getir
export const getBrands = (category) => {
    let url = "/urunler/markalar";
    if (category && category !== "Tümü") {
        url += `?kategori=${encodeURIComponent(category)}`;
    }
    return api.get(url);
};
// Kategorileri Getir
export const getCategories = () => {
    return api.get("/urunler/kategoriler");
};
// src/services/productService.js içine ekle:
export const addProduct = (productData) => {
    return api.post("/urun-ekle", productData);
};
// YORUM EKLEME
export const addReview = (urunId, reviewData) => {
    // reviewData: { puan: 5, metin: "Çok güzel" }
    return api.post(`/urunler/${urunId}/yorum`, reviewData);
};