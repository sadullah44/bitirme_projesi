import api from "./api";

// EN YÜKSEK PUANLI ÜRÜNLERİ GETİR
export const getTopRatedProducts = () => {
    return api.get("/raporlar/yuksek-puanlilar");
};

// EN ÇOK SATANLARI GETİR
export const getBestSellers = () => {
    return api.get("/raporlar/cok-satanlar");
};