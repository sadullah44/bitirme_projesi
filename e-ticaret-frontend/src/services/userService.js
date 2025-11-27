import api from "./api";

export const getProfile = () => {
    return api.get("/kullanicilar/profil");
};

export const addAddress = (adresData) => {
    return api.post("/kullanicilar/adres-ekle", adresData);
};

export const deleteAddress = (baslik) => {
    return api.delete(`/kullanicilar/adres-sil/${baslik}`);
};

// YENİ: Varsayılan Yap
export const setDefaultAddress = (baslik) => {
    return api.put(`/kullanicilar/adres-varsayilan/${baslik}`);
};