import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";

function Navbar() {
  const { isAuthenticated, logout, role } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const navigate = useNavigate();

  // Arama State'i
  const [searchTerm, setSearchTerm] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Arama Fonksiyonu
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
        navigate(`/?search=${searchTerm}`);
        setSearchTerm("");
    } else {
        navigate("/");
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm py-3">
      <div className="container">
        {/* LOGO */}
        <Link className="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2" to="/">
          <i className="bi bi-bag-heart-fill text-warning"></i> E-Ticaret
        </Link>

        {/* MOBİL MENU BUTONU */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          
          {/* ARAMA ÇUBUĞU */}
          <form className="d-flex mx-auto my-3 my-lg-0" style={{ maxWidth: "400px", width: "100%" }} onSubmit={handleSearch}>
             <div className="input-group">
                <input 
                    className="form-control border-0" 
                    type="search" 
                    placeholder="Ürün ara..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn btn-warning text-dark" type="submit">
                    <i className="bi bi-search"></i>
                </button>
             </div>
          </form>

          {/* SAĞ TARAFAKİ LİNKLER */}
          <ul className="navbar-nav ms-auto align-items-center gap-2">
            
            <li className="nav-item">
              <Link className="nav-link active" to="/">Ana Sayfa</Link>
            </li>

            {/* SEPET */}
            <li className="nav-item me-2">
              <Link className="nav-link position-relative" to="/sepet">
                <i className="bi bi-cart3 fs-5"></i>
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cartCount}
                  </span>
                )}
              </Link>
            </li>

            {/* GİRİŞ / ÇIKIŞ DURUMU */}
            {!isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="btn btn-outline-light btn-sm" to="/giris">Giriş Yap</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-warning btn-sm" to="/kayit">Kayıt Ol</Link>
                </li>
              </>
            ) : (
              <li className="nav-item d-flex align-items-center gap-2">
                  
                  {/* SATICI BUTONU (Sadece Satıcılar Görür) */}
                  {role === "ROLE_SELLER" && (
                      <Link to="/satici-paneli" className="btn btn-success btn-sm fw-bold">
                          <i className="bi bi-shop-window me-1"></i> Mağazam
                      </Link>
                  )}

                  {/* PROFİL BUTONU (Müşteri ve Satıcı Görür) */}
                  {/* 'btn-outline-primary' yerine 'btn-outline-light' yaptım, koyu zeminde daha net görünür */}
                  <Link to="/profil" className="btn btn-outline-light btn-sm">
                      <i className="bi bi-person-circle me-1"></i> Hesabım
                  </Link>
                  
                  {/* ÇIKIŞ BUTONU */}
                  <button onClick={handleLogout} className="btn btn-outline-danger btn-sm" title="Çıkış Yap">
                      <i className="bi bi-box-arrow-right"></i>
                  </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;