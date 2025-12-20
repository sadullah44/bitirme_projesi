import { useEffect, useState, useContext } from "react";
import { getProfile, addAddress, deleteAddress, setDefaultAddress } from "../services/userService";
import { getMyOrders } from "../services/siparisService";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// --- KARGO TAKİP YARDIMCI FONKSİYONU ---
const getCargoTrackingUrl = (firma, takipNo) => {
    const links = {
        "Yurtiçi Kargo": `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${takipNo}`,
        "Aras Kargo": `https://www.araskargo.com.tr/kargo-takip/${takipNo}`,
        "MNG Kargo": `https://www.mngkargo.com.tr/gonderitakip/${takipNo}`,
        "Sendeo": `https://sendeo.com.tr/kargo-takip?gonderiNo=${takipNo}`
    };
    return links[firma] || "#";
};

function Profile() {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("adresler");
    const [selectedOrder, setSelectedOrder] = useState(null);

    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);
    const [newAddress, setNewAddress] = useState({
        baslik: "", adresSatiri: "", sehir: "", ilce: "", postaKodu: ""
    });

    useEffect(() => {
        getProfile()
            .then((res) => setUser(res.data))
            .catch((err) => {
                if (err.response && err.response.status === 403) {
                    logout();
                    navigate("/giris");
                }
            })
            .finally(() => setLoading(false));

        getMyOrders()
            .then((res) => setOrders(res.data))
            .catch((err) => console.error("Siparişler çekilemedi:", err));
    }, [logout, navigate]);

    const getStatusBadge = (status) => {
        if (!status) return "bg-secondary";
        const s = status.toUpperCase();
        if (s.includes("TESLİM")) return "bg-success";
        if (s.includes("KARGO")) return "bg-warning text-dark";
        if (s.includes("İPTAL")) return "bg-danger";
        return "bg-primary";
    };

    const handleDelete = (baslik) => {
        if (window.confirm(`${baslik} başlıklı adresi silmek istediğinize emin misiniz?`)) {
            deleteAddress(baslik)
                .then(() => { getProfile().then(res => setUser(res.data)); })
                .catch(err => alert("Silme işlemi başarısız."));
        }
    };

    const handleSetDefault = (baslik) => {
        setDefaultAddress(baslik)
            .then(() => { getProfile().then(res => setUser(res.data)); })
            .catch(err => alert("Varsayılan ayarlanamadı."));
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        addAddress(newAddress)
            .then(() => {
                alert("Yeni adres eklendi!");
                setShowModal(false);
                setNewAddress({ baslik: "", adresSatiri: "", sehir: "", ilce: "", postaKodu: "" });
                getProfile().then(res => setUser(res.data));
            })
            .catch(err => alert("Adres eklenirken hata oluştu."));
    };

    if (loading) return <div className="container mt-5 text-center"><h5>Yükleniyor...</h5></div>;
    if (!user) return <div className="container mt-5 text-center">Kullanıcı bilgisi bulunamadı.</div>;

    return (
        <div className="container py-5">
            <div className="row g-4">
                {/* --- SOL MENÜ --- */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top" style={{ top: "90px" }}>
                        <div className="text-center mb-4">
                            <div className="position-relative mx-auto mb-3" style={{ width: "80px", height: "80px" }}>
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fs-2 fw-bold w-100 h-100">
                                    {user.ad?.charAt(0).toUpperCase()}{user.soyad?.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <h5 className="fw-bold mb-0">{user.ad} {user.soyad}</h5>
                            <p className="text-muted small">{user.eposta}</p>
                        </div>
                        <div className="list-group list-group-flush mb-4">
                            <button className={`list-group-item list-group-item-action border-0 rounded-3 mb-2 px-3 py-2 d-flex align-items-center ${activeTab === 'adresler' ? 'bg-primary text-white' : 'text-dark'}`} onClick={() => setActiveTab('adresler')}>
                                <i className="bi bi-geo-alt me-3 fs-5"></i> Adres Bilgilerim
                            </button>
                            <button className={`list-group-item list-group-item-action border-0 rounded-3 mb-2 px-3 py-2 d-flex align-items-center ${activeTab === 'siparisler' ? 'bg-primary text-white' : 'text-dark'}`} onClick={() => setActiveTab('siparisler')}>
                                <i className="bi bi-box-seam me-3 fs-5"></i> Sipariş Geçmişim
                            </button>
                        </div>
                        <hr />
                        <button onClick={logout} className="btn btn-outline-danger w-100 rounded-pill mt-2">Çıkış Yap</button>
                    </div>
                </div>

                {/* --- SAĞ İÇERİK --- */}
                <div className="col-lg-8">
                    {/* ADRES SEKEMESİ */}
                    {activeTab === 'adresler' && (
                        <div className="card border-0 shadow-sm rounded-4 p-4">
                            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                                <h4 className="fw-bold mb-0">📍 Kayıtlı Adreslerim</h4>
                                <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={() => setShowModal(true)}>+ Yeni Adres</button>
                            </div>
                            <div className="row g-3">
                                {user.adresler?.map((adres, index) => (
                                    <div key={index} className="col-md-6">
                                        <div className={`card h-100 border-0 rounded-3 p-3 position-relative ${adres.varsayilanMi ? 'shadow-sm border border-success' : 'bg-light'}`}>
                                            <h6 className="fw-bold mt-2">{adres.baslik}</h6>
                                            <p className="small text-muted">{adres.adresSatiri}</p>
                                            <div className="mt-auto d-flex gap-2">
                                                <button className="btn btn-sm btn-link text-danger p-0" onClick={() => handleDelete(adres.baslik)}>Sil</button>
                                                {!adres.varsayilanMi && <button className="btn btn-sm btn-link text-secondary p-0" onClick={() => handleSetDefault(adres.baslik)}>Varsayılan Yap</button>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SİPARİŞ GEÇMİŞİ SEKEMESİ */}
                    {activeTab === 'siparisler' && (
                        <div className="card border-0 shadow-sm rounded-4 p-4">
                            <h4 className="fw-bold mb-4 border-bottom pb-3">📦 Sipariş Geçmişim</h4>
                            {orders.length === 0 ? (
                                <div className="alert alert-info text-center">Henüz bir siparişiniz bulunmuyor.</div>
                            ) : (
                                <div className="d-flex flex-column gap-4">
                                    {orders.map((order) => (
                                        <div key={order.id || order.siparisNo} className="card border-0 shadow-sm rounded-3 overflow-hidden border">
                                            <div className="card-header bg-white py-3 border-bottom">
                                                <div className="row align-items-center">
                                                    <div className="col-md-3 col-6 mb-2 mb-md-0">
                                                        <span className="text-muted small d-block">Sipariş No</span>
                                                        <strong className="text-dark">#{order.siparisNo}</strong>
                                                    </div>
                                                    <div className="col-md-3 col-6 mb-2 mb-md-0">
                                                        <span className="text-muted small d-block">Tarih</span>
                                                        <strong className="text-dark">{new Date(order.siparisTarihi).toLocaleDateString("tr-TR")}</strong>
                                                    </div>
                                                    <div className="col-md-3 col-6">
                                                        <span className="text-muted small d-block">Toplam</span>
                                                        <strong className="text-primary">{order.toplamTutar?.toLocaleString()} ₺</strong>
                                                    </div>
                                                    <div className="col-md-3 col-6 text-md-end">
                                                        <button className="btn btn-outline-primary btn-sm rounded-pill fw-bold" onClick={() => setSelectedOrder(order)}>
                                                            Sipariş Detayı
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-body bg-light-subtle py-2 px-3">
                                                <div className="d-flex align-items-center flex-wrap gap-2">
                                                    <span className={`badge ${getStatusBadge(order.genelDurum || order.durum)} px-3 py-2 rounded-pill`}>
                                                        {order.genelDurum || order.durum || "HAZIRLANIYOR"}
                                                    </span>

                                                    {/* ANA LİSTEDE KARGO ÖZETİ */}
                                                    {(order.genelDurum === "KARGOYA_VERILDI" || order.durum === "KARGOYA_VERILDI") && (
                                                        <div className="d-inline-flex align-items-center text-success bg-success bg-opacity-10 px-2 py-1 rounded-3 border border-success border-opacity-25 ms-md-2">
                                                            <i className="bi bi-truck me-2"></i>
                                                            <small className="fw-bold">Kargoda: {order.urunler?.[0]?.kargoTakipNo || "Takip No Bekleniyor"}</small>
                                                        </div>
                                                    )}

                                                    <small className="ms-auto text-muted">
                                                        {order.urunler?.length} Ürün içeren paket
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* --- SİPARİŞ DETAY MODALI --- */}
            {selectedOrder && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                            <div className="modal-content border-0 shadow-lg rounded-4">
                                <div className="modal-header border-bottom py-3">
                                    <h5 className="modal-title fw-bold">Sipariş Detayı (#{selectedOrder.siparisNo})</h5>
                                    <button type="button" className="btn-close" onClick={() => setSelectedOrder(null)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="row mb-4 bg-light p-3 rounded-3 g-3">
                                        <div className="col-md-6">
                                            <p className="text-muted small mb-1 fw-bold">Teslimat Adresi</p>
                                            <p className="mb-0 small">{selectedOrder.teslimatAdresi?.baslik} - {selectedOrder.teslimatAdresi?.adresSatiri}</p>
                                        </div>
                                        <div className="col-md-6 text-md-end border-md-start">
                                            <p className="text-muted small mb-1 fw-bold">Sipariş Özeti</p>
                                            <h5 className="text-primary fw-bold mb-0">{selectedOrder.toplamTutar?.toLocaleString()} ₺</h5>
                                        </div>
                                    </div>

                                    <h6 className="fw-bold mb-3">Ürünler</h6>
                                    <div className="list-group list-group-flush border rounded-3 overflow-hidden">
                                        {selectedOrder.urunler?.map((item, idx) => (
                                            <div key={idx} className="list-group-item p-3 border-bottom">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="bg-light rounded p-2 text-center" style={{ width: "50px" }}>📦</div>
                                                        <div>
                                                            <h6 className="mb-0 fw-bold">{item.urunAdi || item.isim}</h6>
                                                            <small className="text-muted">Adet: {item.miktar || item.adet} x {item.fiyat} ₺</small>
                                                        </div>
                                                    </div>
                                                    <div className="text-end">
                                                        <span className={`badge ${getStatusBadge(item.durum)} mb-1 d-block`}>{item.durum || "Hazırlanıyor"}</span>
                                                        <span className="fw-bold text-dark">{(item.fiyat || 0) * (item.miktar || item.adet || 0)} ₺</span>
                                                    </div>
                                                </div>

                                                {/* PROFESYONEL KARGO TAKİP ALANI */}
                                                {item.durum === "KARGOYA_VERILDI" && (
                                                    <div className="bg-light border rounded-3 p-3 mt-2">
                                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                                            <div>
                                                                <span className="text-muted small d-block text-uppercase fw-bold" style={{fontSize: '10px'}}>Kargo Takip</span>
                                                                <span className="fw-bold small">{item.kargoFirmasi || "Yurtiçi Kargo"} - {item.kargoTakipNo}</span>
                                                            </div>
                                                            <a href={getCargoTrackingUrl(item.kargoFirmasi || "Yurtiçi Kargo", item.kargoTakipNo)} target="_blank" rel="noreferrer" className="btn btn-sm btn-primary rounded-pill px-3">
                                                                Takip Et <i className="bi bi-box-arrow-up-right ms-1"></i>
                                                            </a>
                                                        </div>
                                                        <div className="d-flex justify-content-between position-relative px-2 pt-2">
                                                            <div className="position-absolute top-50 start-0 end-0 translate-middle-y bg-secondary-subtle" style={{ height: '3px', zIndex: 0, marginTop: '-5px' }}></div>
                                                            {[
                                                                { label: "Verildi", icon: "check-circle-fill", active: true },
                                                                { label: "Yolda", icon: "truck", active: true },
                                                                { label: "Şubede", icon: "house-door", active: false },
                                                                { label: "Teslim", icon: "person-check", active: false }
                                                            ].map((step, sIdx) => (
                                                                <div key={sIdx} className="text-center position-relative" style={{ zIndex: 1 }}>
                                                                    <div className={`rounded-circle bg-white border d-flex align-items-center justify-content-center mx-auto mb-1 ${step.active ? 'border-primary text-primary' : 'text-muted'}`} style={{ width: '28px', height: '28px', fontSize: '14px', borderWidth: '2px' }}>
                                                                        <i className={`bi bi-${step.icon}`}></i>
                                                                    </div>
                                                                    <div style={{ fontSize: '9px' }} className={`fw-bold ${step.active ? 'text-primary' : 'text-muted'}`}>{step.label}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="modal-footer bg-light">
                                    <button className="btn btn-secondary px-4 rounded-pill" onClick={() => setSelectedOrder(null)}>Kapat</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ADRES EKLEME MODALI */}
            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0">
                            <div className="modal-header">
                                <h5 className="modal-title fw-bold">Yeni Adres Ekle</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleAddSubmit}>
                                    <input className="form-control mb-3" name="baslik" placeholder="Adres Başlığı" onChange={(e) => setNewAddress({ ...newAddress, baslik: e.target.value })} required />
                                    <div className="row g-2 mb-3">
                                        <div className="col-6"><input className="form-control" name="sehir" placeholder="Şehir" onChange={(e) => setNewAddress({ ...newAddress, sehir: e.target.value })} required /></div>
                                        <div className="col-6"><input className="form-control" name="ilce" placeholder="İlçe" onChange={(e) => setNewAddress({ ...newAddress, ilce: e.target.value })} required /></div>
                                    </div>
                                    <textarea className="form-control mb-3" name="adresSatiri" placeholder="Açık Adres" onChange={(e) => setNewAddress({ ...newAddress, adresSatiri: e.target.value })} required></textarea>
                                    <input className="form-control mb-3" name="postaKodu" placeholder="Posta Kodu" onChange={(e) => setNewAddress({ ...newAddress, postaKodu: e.target.value })} required />
                                    <button type="submit" className="btn btn-primary w-100 rounded-pill">Kaydet</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;