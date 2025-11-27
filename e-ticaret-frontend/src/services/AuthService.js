import api from "./api";

// Kayıt olma isteği
export const register = (registerData) => {
    // registerData: { isim, email, sifre, ... } gibi bir obje bekler
    return api.post("/kullanicilar/kayit", registerData);
};

// Giriş yapma isteği
export const login = (loginData) => {
    // loginData: { email, sifre } gibi bir obje bekler
    return api.post("/kullanicilar/giris", loginData);
};