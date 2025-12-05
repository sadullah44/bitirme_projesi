import api from "./api";

// Sipariş Oluştur (Checkout)
export const createOrder = (teslimatAdresBasligi) => {
    // Backend: POST /siparis/olustur
    // Body: { "teslimatAdresBasligi": "Ev" }
    return api.post("/siparis/olustur", {
        teslimatAdresBasligi: teslimatAdresBasligi
    });
};

// Sipariş Geçmişini Getir
// GÜNCELLENDİ: Artık /siparis/musteri-siparisleri adresine gidiyor
export const getMyOrders = () => {
    return api.get("/siparis/musteri-siparisleri");
};

// SATICIYA GELEN SİPARİŞLER
export const getSellerOrders = () => {
    return api.get("/siparis/satici-siparisleri");
};