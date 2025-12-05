import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function ProtectedRoute({ children, roleRequired }) { // roleRequired opsiyonel
  const { isAuthenticated, role, loading } = useContext(AuthContext);

  // 1. KRİTİK: Eğer hala token kontrolü yapılıyorsa (loading),
  //    karar verme, sadece bekleme ekranı göster.
  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border"></div></div>;
  }

  // 2. Yükleme bitti, kullanıcı hala giriş yapmamışsa -> Login'e yolla
  if (!isAuthenticated) {
    return <Navigate to="/giris" replace />;
  }

  // 3. (Opsiyonel) Eğer sayfa özel bir rol istiyorsa ve kullanıcının rolü tutmuyorsa
  if (roleRequired && role !== roleRequired) {
     return <Navigate to="/" replace />;
  }

  // 4. Her şey tamamsa sayfayı göster
  return children;
}

export default ProtectedRoute;