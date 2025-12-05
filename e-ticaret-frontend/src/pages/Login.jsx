import { useState, useContext } from "react";
import { login } from "../services/AuthService";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link, useLocation} from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  // 2. Gelen veriyi okumak için location'ı çağır
  const location = useLocation();
  const { login: saveToken } = useContext(AuthContext);

  const [form, setForm] = useState({ eposta: "", sifre: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    login(form)
      .then((res) => {
        // saveToken (yani context'teki login) fonksiyonuna token VE rol gönderiyoruz
        // res.data.rol, Backend'deki GirisYaniti'ndan geliyor
        saveToken(res.data.token, res.data.rol);
        // 3. KRİTİK NOKTA BURASI:
        // Eğer bir önceki sayfadan "returnUrl" geldiyse ORAYA git,
        // Yoksa (normal girişse) Ana Sayfaya "/" git.
        const targetUrl = location.state?.returnUrl || "/";
        navigate(targetUrl);
      })
      .catch((err) => {
        setError("Giriş başarısız! Lütfen bilgilerinizi kontrol edin.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100" 
         style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", marginTop: "-50px" }}>
      
      <div className="card shadow-lg border-0 rounded-4" style={{ maxWidth: "450px", width: "100%" }}>
        <div className="card-body p-5">
          
          <div className="text-center mb-4">
            <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                 style={{ width: "60px", height: "60px" }}>
              <i className="bi bi-person-fill fs-2"></i>
            </div>
            <h3 className="fw-bold">Hoş Geldiniz</h3>
            <p className="text-muted">Hesabınıza giriş yapın</p>
          </div>

          {error && <div className="alert alert-danger text-center py-2">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* E-POSTA ALANI */}
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold">E-POSTA</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-secondary">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  name="eposta"
                  className="form-control bg-light border-start-0 ps-0"
                  placeholder="ornek@email.com"
                  value={form.eposta}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* ŞİFRE ALANI */}
            <div className="mb-4">
              <label className="form-label text-muted small fw-bold">ŞİFRE</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-secondary">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  name="sifre"
                  className="form-control bg-light border-start-0 ps-0"
                  placeholder="******"
                  value={form.sifre}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2 rounded-pill fw-bold shadow-sm" disabled={loading}>
              {loading ? <div className="spinner-border spinner-border-sm"></div> : "GİRİŞ YAP"}
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-muted">Hesabınız yok mu? </span>
            <Link to="/kayit" className="text-decoration-none fw-bold">Kayıt Ol</Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;