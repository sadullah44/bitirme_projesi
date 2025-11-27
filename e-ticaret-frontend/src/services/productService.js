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