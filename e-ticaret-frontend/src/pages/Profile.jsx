import { useEffect, useState, useContext } from "react";
// YENİ: setDefaultAddress eklendi
import { getProfile, addAddress, deleteAddress, setDefaultAddress } from "../services/userService";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    baslik: "", adresSatiri: "", sehir: "", ilce: "", postaKodu: ""
  });

  const fetchProfile = () => {
    getProfile()
      .then((res) => setUser(res.data))
      .catch((err) => {
        if (err.response && err.response.status === 403) {
            logout();
            navigate("/giris");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleDelete = (baslik) => {
    if(window.confirm(`${baslik} başlıklı adresi silmek istediğinize emin misiniz?`)) {
        deleteAddress(baslik)
            .then(() => {
                fetchProfile();
            })
            .catch(err => alert("Silme işlemi başarısız."));
    }
  };

  // YENİ: Varsayılan Yapma Fonksiyonu
  const handleSetDefault = (baslik) => {
    setDefaultAddress(baslik)
        .then(() => {
            fetchProfile(); // Listeyi güncelle ki yeşil etiket yer değiştirsin
        })
        .catch(err => alert("Varsayılan ayarlanamadı."));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    addAddress(newAddress)
        .then(() => {
            alert("Yeni adres eklendi!");
            setShowModal(false);
            setNewAddress({ baslik: "", adresSatiri: "", sehir: "", ilce: "", postaKodu: "" });
            fetchProfile();
        })
        .catch(err => alert("Adres eklenirken hata oluştu."));
  };

  const handleInputChange = (e) => {
    setNewAddress({...newAddress, [e.target.name]: e.target.value});
  };

  if (loading) return <div className="container mt-5 text-center">Yükleniyor...</div>;
  if (!user) return <div className="container mt-5 text-center">Kullanıcı bilgisi bulunamadı.</div>;

  return (
    <div className="container py-5">
      <div className="row g-4">
        
        {/* SOL: Profil Kartı */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 text-center p-4">
            <div className="position-relative mx-auto mb-3" style={{ width: "100px", height: "100px" }}>
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fs-1 fw-bold w-100 h-100">
                    {user.ad.charAt(0).toUpperCase()}{user.soyad.charAt(0).toUpperCase()}
                </div>
            </div>
            <h4 className="fw-bold mb-0">{user.ad} {user.soyad}</h4>
            <p className="text-muted small">{user.eposta}</p>
            <hr />
            <div className="text-start px-3">
                <p className="mb-2"><i className="bi bi-telephone me-2 text-primary"></i> {user.telefon || "Telefon Yok"}</p>
                <p className="mb-2"><i className="bi bi-calendar3 me-2 text-primary"></i> Üye No: #{user.kullaniciNo}</p>
            </div>
          </div>
        </div>

        {/* SAĞ: Adres Listesi */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">📍 Kayıtlı Adreslerim</h4>
                <button 
                    className="btn btn-primary btn-sm rounded-pill px-3"
                    onClick={() => setShowModal(true)}
                >
                    <i className="bi bi-plus-lg me-1"></i> Yeni Adres Ekle
                </button>
            </div>

            {user.adresler && user.adresler.length > 0 ? (
                <div className="row g-3">
                    {user.adresler.map((adres, index) => (
                        <div key={index} className="col-md-6">
                            <div className={`card h-100 border-0 rounded-3 p-3 position-relative ${adres.varsayilanMi ? 'bg-white shadow-sm border border-success' : 'bg-light'}`}>
                                
                                {adres.varsayilanMi ? (
                                    <span className="position-absolute top-0 end-0 badge bg-success m-2">
                                        <i className="bi bi-check-circle me-1"></i>Varsayılan
                                    </span>
                                ) : null}

                                <h6 className="fw-bold text-dark mb-1 mt-2">
                                    <i className="bi bi-house-door me-2"></i>{adres.baslik}
                                </h6>
                                <p className="text-muted small mb-2 text-truncate">
                                    {adres.adresSatiri}
                                </p>
                                <p className="mb-0 small fw-bold text-secondary">
                                    {adres.ilce} / {adres.sehir}
                                </p>
                                
                                <div className="mt-3 d-flex gap-2">
                                    <button 
                                        className="btn btn-outline-danger btn-sm py-0 px-2" 
                                        style={{fontSize: "12px"}}
                                        onClick={() => handleDelete(adres.baslik)}
                                    >
                                        Sil
                                    </button>

                                    {/* Sadece varsayılan OLMAYANLARDA 'Varsayılan Yap' butonu göster */}
                                    {!adres.varsayilanMi && (
                                        <button 
                                            className="btn btn-outline-secondary btn-sm py-0 px-2" 
                                            style={{fontSize: "12px"}}
                                            onClick={() => handleSetDefault(adres.baslik)}
                                        >
                                            Varsayılan Yap
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="alert alert-warning text-center">Henüz kayıtlı adresiniz yok.</div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <>
            <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content rounded-4 border-0 shadow-lg">
                        <div className="modal-header">
                            <h5 className="modal-title fw-bold">Yeni Adres Ekle</h5>
                            <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleAddSubmit}>
                                <div className="mb-3">
                                    <label className="form-label small text-muted fw-bold">Adres Başlığı (Örn: İş)</label>
                                    <input className="form-control" name="baslik" value={newAddress.baslik} onChange={handleInputChange} required />
                                </div>
                                <div className="row g-2 mb-3">
                                    <div className="col-6">
                                        <label className="form-label small text-muted fw-bold">Şehir</label>
                                        <input className="form-control" name="sehir" value={newAddress.sehir} onChange={handleInputChange} required />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small text-muted fw-bold">İlçe</label>
                                        <input className="form-control" name="ilce" value={newAddress.ilce} onChange={handleInputChange} required />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small text-muted fw-bold">Açık Adres</label>
                                    <textarea className="form-control" name="adresSatiri" rows="2" value={newAddress.adresSatiri} onChange={handleInputChange} required></textarea>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small text-muted fw-bold">Posta Kodu</label>
                                    <input className="form-control" name="postaKodu" value={newAddress.postaKodu} onChange={handleInputChange} required />
                                </div>
                                <div className="d-grid">
                                    <button type="submit" className="btn btn-primary rounded-pill">Kaydet</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
      )}

    </div>
  );
}

export default Profile;