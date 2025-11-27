import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import { AuthProvider } from "./context/AuthContext";
import Checkout from "./pages/Checkout"; // YENİ
import Orders from "./pages/Orders";     // YENİ
// Import'u ekle
import Profile from "./pages/Profile";
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/urun/:id" element={<ProductDetail />} />
          <Route path="/giris" element={<Login />} />
          <Route path="/kayit" element={<Register />} />
          <Route
            path="/sepet"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          {/* Sepet Onay Sayfası (Korumalı) */}
          <Route path="/odeme" element={
            <ProtectedRoute><Checkout /></ProtectedRoute>
          } />

          {/* Siparişlerim Sayfası (Korumalı) */}
          <Route path="/siparislerim" element={
            <ProtectedRoute><Orders /></ProtectedRoute>
          } />
          <Route path="/profil" element={
            <ProtectedRoute>
                <Profile />
            </ProtectedRoute>
} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
