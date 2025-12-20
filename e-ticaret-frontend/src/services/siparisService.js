import api from "./api";

// ================= MÜŞTERİ İŞLEMLERİ =================

// 1. Sipariş Oluştur (Checkout)
export const createOrder = (teslimatAdresBasligi) => {
    // Body: { "teslimatAdresBasligi": "Ev" }
    return api.post("/siparis/olustur", {
        teslimatAdresBasligi: teslimatAdresBasligi
    });
};

// 2. Müşterinin Kendi Sipariş Geçmişini Getir
export const getMyOrders = () => {
    // Backend'deki @GetMapping("/listem") ile eşleşmeli
    return api.get("/siparis/listem");
};

// 3. Sipariş İptal Et (Opsiyonel - Müşteri kargoya verilmeden iptal edebilsin diye)
export const cancelOrder = (siparisId) => {
    return api.put(`/siparis/${siparisId}/iptal`);
};


// ================= SATICI İŞLEMLERİ =================

// 4. Satıcıya Gelen Siparişleri Getir
export const getSellerOrders = () => {
    return api.get("/siparis/satici-siparisleri");
};

// 5. 🔥 EKSİK OLAN KISIM: Sipariş İçindeki Bir Ürünü Kargoya Ver
// Backend'de: PUT /siparis/{siparisId}/urun-kargola
export const shipOrderItem = (siparisId, urunId, kargoNo) => {
    return api.put(`/siparis/${siparisId}/urun-kargola`, {
        urunId: urunId,
        kargoNo: kargoNo
    });
};