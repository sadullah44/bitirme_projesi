import { createContext, useState, useEffect, useContext } from "react";
import { sepetGetir } from "../services/sepetService";
// 1. AuthContext'i import et (Oturum durumunu dinlemek için)
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);

  // 2. Kullanıcının giriş yapıp yapmadığını öğren
  const { isAuthenticated } = useContext(AuthContext);

  const updateCartCount = (count) => {
    setCartCount(count);
  };

  // 3. 'isAuthenticated' değiştiğinde çalışacak kod
  useEffect(() => {
    // A) Eğer kullanıcı GİRİŞ YAPMIŞSA --> Backend'den güncel sayıyı çek
    if (isAuthenticated) {
        sepetGetir()
            .then((res) => {
                // Backend'den gelen ürün listesinin toplam adedini hesapla
                if (res.data && res.data.urunler) {
                    const toplamAdet = res.data.urunler.reduce((acc, item) => acc + item.adet, 0);
                    setCartCount(toplamAdet);
                }
            })
            .catch(err => {
                console.log("Sepet sayısı çekilemedi:", err);
            });
    } 
    // B) Eğer kullanıcı ÇIKIŞ YAPMIŞSA --> Sayacı SIFIRLA
    else {
        setCartCount(0);
    }

  }, [isAuthenticated]); // Bu kod sadece giriş/çıkış durumu değişince çalışır

  return (
    <CartContext.Provider value={{ cartCount, updateCartCount }}>
      {children}
    </CartContext.Provider>
  );
}