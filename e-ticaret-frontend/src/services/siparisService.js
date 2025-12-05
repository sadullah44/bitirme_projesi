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
export const getMyOrders = () => {
    // Backend: GET /siparis/listem
    return api.get("/siparis/listem");
};
// SATICIYA GELEN SİPARİŞLER
export const getSellerOrders = () => {
    return api.get("/siparis/satici-siparisleri");
};