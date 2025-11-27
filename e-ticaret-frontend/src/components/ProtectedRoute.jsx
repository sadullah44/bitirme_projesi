import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useContext(AuthContext);

  // AuthContext daha token'ı okumayı bitirmedi --> bekle
  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  // Token yok → giriş sayfasına gönder
  if (!isAuthenticated) {
    return <Navigate to="/giris" replace />;
  }

  return children;
}

export default ProtectedRoute;
