import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { uploadFile } from "../services/fileService";
import { addProduct } from "../services/productService";
import { getSellerOrders } from "../services/siparisService"; // <-- YENİ

function SellerDashboard() {
  const { role } = useContext(AuthContext);
  
  // Hangi sekme açık? "add-product" veya "orders"
  const [activeTab, setActiveTab] = useState("add-product");

  // --- ÜRÜN EKLEME STATE'LERİ ---
  const [product, setProduct] = useState({
    isim: "", marka: "", kategori: "Telefon", fiyat: "", stok: "", aciklama: "", resimUrl: ""
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- SİPARİŞ STATE'LERİ ---
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Güvenlik
  if (role !== "ROLE_SELLER") return <div className="text-center mt-5">Yetkisiz Erişim</div>;

  // Siparişleri Çek (Sadece 'orders' sekmesine geçince)
  useEffect(() => {
    if (activeTab === "orders") {
        setOrdersLoading(true);
        getSellerOrders()
            .then(res => {
              console.log("GELEN SİPARİŞ VERİSİ:", res.data); // <--- Bunu ekle ve F12 Console'a bak
              setOrders(res.data);
          })
            .catch(err => console.error(err))
            .finally(() => setOrdersLoading(false));
    }
  }, [activeTab]);

  // Dosya Seçimi
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // Ürün Kaydetme
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        let uploadedImageUrl = product.resimUrl;
        if (selectedFile) {
            const uploadRes = await uploadFile(selectedFile);
            uploadedImageUrl = uploadRes.data;
        }
        const newProduct = { ...product, resimUrl: uploadedImageUrl, fiyat: Number(product.fiyat), stok: Number(product.stok) };
        await addProduct(newProduct);
        alert("Ürün başarıyla eklendi!");
        setProduct({ isim: "", marka: "", kategori: "Telefon", fiyat: "", stok: "", aciklama: "", resimUrl: "" });
        setSelectedFile(null);
        setPreview(null);
    } catch (error) {
        console.error("Hata:", error);
        alert("İşlem başarısız!");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row">
        
        {/* SOL: Menü */}
        <div className="col-md-3">
            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <h5 className="fw-bold text-success mb-3"><i className="bi bi-shop me-2"></i>Satıcı Paneli</h5>
                    <div className="list-group list-group-flush">
                        <button 
                            className={`list-group-item list-group-item-action ${activeTab === 'add-product' ? 'active' : ''}`}
                            onClick={() => setActiveTab('add-product')}
                        >
                            <i className="bi bi-plus-circle me-2"></i> Ürün Ekle
                        </button>
                        <button 
                            className={`list-group-item list-group-item-action ${activeTab === 'orders' ? 'active' : ''}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            <i className="bi bi-box-seam me-2"></i> Gelen Siparişler
                        </button>
                        <button className="list-group-item list-group-item-action disabled">Ayarlar</button>
                    </div>
                </div>
            </div>
        </div>

        {/* SAĞ: İçerik */}
        <div className="col-md-9">
            
            {/* 1. ÜRÜN EKLEME FORMU */}
            {activeTab === 'add-product' && (
                <div className="card border-0 shadow-sm p-4">
                    <h3 className="fw-bold mb-4">Yeni Ürün Ekle</h3>
                    <form onSubmit={handleSubmit}>
                        {/* ... (Form İçeriği AYNI KALSIN - Kısaltmak için yazmıyorum, seninkiyle aynı) ... */}
                        {/* ... BURAYA SENİN MEVCUT FORM KODLARINI YAPIŞTIR ... */}
                         <div className="row g-3">
                            <div className="col-12 text-center mb-3">
                                <div className="border rounded p-3 d-inline-block position-relative" style={{width: "200px", height: "200px", background: "#f8f9fa"}}>
                                    {preview ? (
                                        <img src={preview} alt="Önizleme" style={{width: "100%", height: "100%", objectFit: "contain"}} />
                                    ) : (
                                        <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                                            <i className="bi bi-camera fs-1"></i><small>Resim Seç</small>
                                        </div>
                                    )}
                                    <input type="file" className="position-absolute top-0 start-0 w-100 h-100 opacity-0" style={{cursor: "pointer"}} onChange={handleFileChange} required />
                                </div>
                            </div>
                            <div className="col-md-6"><label className="form-label">Ürün Adı</label><input className="form-control" value={product.isim} onChange={e => setProduct({...product, isim: e.target.value})} required /></div>
                            <div className="col-md-6"><label className="form-label">Marka</label><input className="form-control" value={product.marka} onChange={e => setProduct({...product, marka: e.target.value})} required /></div>
                            <div className="col-md-4">
                                <label className="form-label">Kategori</label>
                                <select className="form-select" value={product.kategori} onChange={e => setProduct({...product, kategori: e.target.value})}>
                                    <option>Telefon</option><option>Bilgisayar</option><option>Elektronik</option><option>Giyim</option><option>Ayakkabı</option>
                                </select>
                            </div>
                            <div className="col-md-4"><label className="form-label">Fiyat</label><input type="number" className="form-control" value={product.fiyat} onChange={e => setProduct({...product, fiyat: e.target.value})} required /></div>
                            <div className="col-md-4"><label className="form-label">Stok</label><input type="number" className="form-control" value={product.stok} onChange={e => setProduct({...product, stok: e.target.value})} required /></div>
                            <div className="col-12"><label className="form-label">Açıklama</label><textarea className="form-control" rows="3" value={product.aciklama} onChange={e => setProduct({...product, aciklama: e.target.value})}></textarea></div>
                            <div className="col-12 mt-4"><button type="submit" className="btn btn-success w-100 py-2 fw-bold" disabled={loading}>{loading ? "Yükleniyor..." : "Ürünü Yayınla"}</button></div>
                        </div>
                    </form>
                </div>
            )}

            {/* 2. SİPARİŞ LİSTESİ */}
            {activeTab === 'orders' && (
                <div className="card border-0 shadow-sm p-4">
                    <h3 className="fw-bold mb-4">Gelen Siparişler</h3>
                    
                    {ordersLoading ? (
                        <div className="text-center"><div className="spinner-border text-primary"></div></div>
                    ) : orders?.length === 0 ? (
                        <div className="alert alert-info">Henüz sipariş yok.</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Sipariş No</th>
                                        <th>Müşteri</th>
                                        <th>Ürünler</th>
                                        <th>Tutar</th>
                                        <th>Durum</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders?.map(order => (
                                        <tr key={order.siparisNo}>
                                            <td><small>#{order.siparisNo}</small></td>
                                            <td>{order.kullaniciEposta}</td>
                                            <td>
                                                <ul className="list-unstyled mb-0 small">
                                                    {order.satirlar?.map((item, idx) => (
                                                        <li key={idx}>
                                                            {item.adet}x {item.urunIsmi}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td className="fw-bold text-success">{order.toplamTutar} ₺</td>
                                            <td><span className="badge bg-warning text-dark">Hazırlanıyor</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

        </div>
      </div>
    </div>
  );
}

export default SellerDashboard;