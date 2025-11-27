// src/services/sepetService.js
import api from "./api";

// Ürünü sepete ekle
export function sepetEkle(urunId) {
    return api.post("/sepet/ekle", {
        urunId,
        adet: 1
    });
}

// Sepeti getir
export function sepetGetir() {
    return api.get("/sepet");
}

// Adet güncelle
export function sepetGuncelle(urunId, adet) {
    return api.put("/sepet/guncelle", {
        urunId,
        adet
    });
}

// Ürün sil
export function sepetSil(urunId) {
    return api.delete(`/sepet/sil/${urunId}`);
}