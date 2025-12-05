// axios yerine senin oluşturduğun api instance'ını import ediyoruz
import api from "./api";

// BaseURL (localhost:8080) zaten api.js içinde var.
// O yüzden sadece yolun kalan kısmını yazmamız yeterli.

// Çok Satanlar
export const getBestSellers = () => {
    return api.get("/raporlar/populer-urunler");
};

// Yüksek Puanlılar
export const getTopRated = () => {
    return api.get("/raporlar/yuksek-puanlilar");
};