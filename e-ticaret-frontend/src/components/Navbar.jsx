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
    e.preventDefault(); // Sayfa yenilenmesini engelle
    if (searchTerm.trim()) {
        // Ana sayfaya 'search' parametresi ile git
        navigate(`/?search=${searchTerm}`);
        setSearchTerm(""); // Inputu temizle (İsteğe bağlı)
    } else {
        navigate("/"); // Boşsa ana sayfaya dön
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm py-3">
      <div className="container">
        <Link className="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2" to="/">
          <i className="bi bi-bag-heart-fill text-warning"></i> E-Ticaret
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          
          {/* ARAMA ÇUBUĞU (Aynı) */}
          <form className="d-flex mx-auto my-2 my-lg-0" style={{ maxWidth: "400px", width: "100%" }} onSubmit={handleSearch}>
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

          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link className="nav-link active" to="/">Ana Sayfa</Link>
            </li>

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

            {!isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="btn btn-outline-light btn-sm ms-2" to="/giris">Giriş Yap</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-warning btn-sm ms-2" to="/kayit">Kayıt Ol</Link>
                </li>
              </>
            ) : (
              <li className="nav-item dropdown">
                 <div className="d-flex gap-2 ms-2 align-items-center">
                    
                    {/* 👇 SADECE SATICILAR GÖREBİLİR 👇 */}
                    {role === "ROLE_SELLER" && (
                        <Link to="/satici-paneli" className="btn btn-success btn-sm fw-bold">
                            <i className="bi bi-shop-window me-1"></i> Mağazam
                        </Link>
                    )}
                    {/* ------------------------------- */}

                    <Link to="/profil" className="btn btn-outline-primary btn-sm">
                        <i className="bi bi-person"></i> Profilim
                    </Link>
                    <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
                        <i className="bi bi-box-arrow-right"></i>
                    </button>
                 </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;