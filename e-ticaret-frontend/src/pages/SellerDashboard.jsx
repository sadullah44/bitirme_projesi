import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { uploadFile } from "../services/fileService";
import { addProduct, updateProduct, deleteProduct, getMyProducts } from "../services/productService"; // YENİ IMPORTLAR
import { getSellerOrders } from "../services/siparisService";

// SABİT KATEGORİLER
const STATIC_CATEGORIES = [
    "Telefon", "Bilgisayar", "Ayakkabı", 
    "Ev & Yaşam", "Spor", "Kozmetik", "Mouse", "Klavye", 
    "Bileklik", "Tablet", "Kulaklık", "Pantolon", "Tişört", 
    "Şapka", "Çanta", "Kol Saati", "Aksesuar", "Oyuncak", "Kitap", "Pardesü", "Mont", "Etek","Kazak"
].sort((a, b) => a.localeCompare(b, 'tr'));

function SellerDashboard() {
  const { role } = useContext(AuthContext);
  
  // SEKMELER: 'add-product', 'orders', 'my-products' (YENİ)
  const [activeTab, setActiveTab] = useState("my-products"); // Varsayılan olarak ürünlerimi görsün

  // --- STATE'LER ---
  const [orders, setOrders] = useState([]);
  const [myProducts, setMyProducts] = useState([]); // Ürünlerim Listesi
  const [loading, setLoading] = useState(false);

  // Ürün Formu State'i
  const [product, setProduct] = useState({
    id: "", // Düzenleme için ID gerekli
    isim: "", marka: "", kategori: "", fiyat: "", stok: "", aciklama: "", resimUrl: ""
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // Düzenleme modunda mıyız?

  // Güvenlik
  if (role !== "ROLE_SELLER") return <div className="text-center mt-5">Yetkisiz Erişim</div>;

  // --- VERİ ÇEKME İŞLEMLERİ ---
  useEffect(() => {
    if (activeTab === "orders") {
        fetchOrders();
    } else if (activeTab === "my-products") {
        fetchMyProducts();
    }
  }, [activeTab]);

  const fetchOrders = () => {
      setLoading(true);
      getSellerOrders()
          .then(res => setOrders(res.data))
          .catch(err => console.error(err))
          .finally(() => setLoading(false));
  };

  const fetchMyProducts = () => {
      setLoading(true);
      getMyProducts()
          .then(res => setMyProducts(res.data))
          .catch(err => console.error(err))
          .finally(() => setLoading(false));
  };

  // --- FORM İŞLEMLERİ ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // Kaydet veya Güncelle
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        let uploadedImageUrl = product.resimUrl;
        
        // Yeni dosya seçildiyse yükle
        if (selectedFile) {
            const uploadRes = await uploadFile(selectedFile);
            uploadedImageUrl = uploadRes.data;
        }

        const productData = { 
            ...product, 
            resimUrl: uploadedImageUrl, 
            fiyat: Number(product.fiyat), 
            stok: Number(product.stok) 
        };

        if (isEditing) {
            // GÜNCELLEME MODU
            await updateProduct(product.id, productData);
            alert("Ürün güncellendi!");
        } else {
            // YENİ EKLEME MODU
            await addProduct(productData);
            alert("Ürün başarıyla eklendi!");
        }

        // Formu Sıfırla
        resetForm();
        setActiveTab("my-products"); // Listeye dön

    } catch (error) {
        console.error("Hata:", error);
        alert("İşlem başarısız!");
    } finally {
        setLoading(false);
    }
  };

  // Düzenle Butonuna Basılınca
  const handleEditClick = (item) => {
      setProduct({
          id: item.id,
          isim: item.isim,
          marka: item.marka,
          kategori: item.kategori,
          fiyat: item.fiyat,
          stok: item.stok,
          aciklama: item.aciklama,
          resimUrl: item.resimUrl
      });
      setPreview(item.resimUrl);
      setIsEditing(true);
      setActiveTab("add-product"); // Form sekmesine geç
  };

  // Sil Butonuna Basılınca
  const handleDeleteClick = async (id) => {
      if (window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
          try {
              await deleteProduct(id);
              fetchMyProducts(); // Listeyi yenile
          } catch (error) {
              alert("Silme işlemi başarısız.");
          }
      }
  };

  const resetForm = () => {
      setProduct({ isim: "", marka: "", kategori: "", fiyat: "", stok: "", aciklama: "", resimUrl: "" });
      setSelectedFile(null);
      setPreview(null);
      setIsEditing(false);
  };

  return (
    <div className="container py-5">
      <div className="row">
        
        {/* SOL: Menü */}
        <div className="col-md-3 mb-4">
            <div className="card border-0 shadow-sm sticky-top" style={{top: "100px"}}>
                <div className="card-body">
                    <h5 className="fw-bold text-success mb-3"><i className="bi bi-shop me-2"></i>Satıcı Paneli</h5>
                    <div className="list-group list-group-flush">
                        <button 
                            className={`list-group-item list-group-item-action ${activeTab === 'my-products' ? 'active' : ''}`}
                            onClick={() => setActiveTab('my-products')}
                        >
                            <i className="bi bi-grid me-2"></i> Ürünlerim
                        </button>
                        <button 
                            className={`list-group-item list-group-item-action ${activeTab === 'add-product' ? 'active' : ''}`}
                            onClick={() => { resetForm(); setActiveTab('add-product'); }}
                        >
                            <i className="bi bi-plus-circle me-2"></i> Ürün Ekle
                        </button>
                        <button 
                            className={`list-group-item list-group-item-action ${activeTab === 'orders' ? 'active' : ''}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            <i className="bi bi-box-seam me-2"></i> Gelen Siparişler
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* SAĞ: İçerik */}
        <div className="col-md-9">
            
            {/* 1. ÜRÜNLERİM LİSTESİ (YENİ) */}
            {activeTab === 'my-products' && (
                <div className="card border-0 shadow-sm p-4">
                    <h3 className="fw-bold mb-4">Ürünlerim</h3>
                    {loading ? <div className="text-center"><div className="spinner-border text-primary"></div></div> : (
                        myProducts.length === 0 ? <div className="alert alert-info">Henüz ürün eklemediniz.</div> : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Ürün</th>
                                            <th>Fiyat</th>
                                            <th>Stok</th>
                                            <th>İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myProducts.map(item => (
                                            <tr key={item.id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <img src={item.resimUrl || "https://placehold.co/50"} alt="" className="rounded me-2" style={{width:"40px", height:"40px", objectFit:"cover"}} />
                                                        <div>
                                                            <div className="fw-bold text-truncate" style={{maxWidth: "200px"}}>{item.isim}</div>
                                                            <small className="text-muted">{item.kategori}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{item.fiyat} ₺</td>
                                                <td>
                                                    {item.stok > 0 ? (
                                                        <span className="badge bg-success">{item.stok} Adet</span>
                                                    ) : (
                                                        <span className="badge bg-danger">Tükendi</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <button onClick={() => handleEditClick(item)} className="btn btn-sm btn-outline-primary me-2">
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    <button onClick={() => handleDeleteClick(item.id)} className="btn btn-sm btn-outline-danger">
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}
                </div>
            )}

            {/* 2. ÜRÜN EKLEME / DÜZENLEME FORMU */}
            {activeTab === 'add-product' && (
                <div className="card border-0 shadow-sm p-4">
                    <h3 className="fw-bold mb-4">{isEditing ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}</h3>
                    <form onSubmit={handleSubmit}>
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
                                    <input type="file" className="position-absolute top-0 start-0 w-100 h-100 opacity-0" style={{cursor: "pointer"}} onChange={handleFileChange} />
                                </div>
                            </div>

                            <div className="col-md-6"><label className="form-label">Ürün Adı</label><input className="form-control" value={product.isim} onChange={e => setProduct({...product, isim: e.target.value})} required /></div>
                            <div className="col-md-6"><label className="form-label">Marka</label><input className="form-control" value={product.marka} onChange={e => setProduct({...product, marka: e.target.value})} required /></div>
                            
                            <div className="col-md-4">
                                <label className="form-label">Kategori</label>
                                <select className="form-select" value={product.kategori} onChange={e => setProduct({...product, kategori: e.target.value})} required>
                                    <option value="">Seçiniz...</option>
                                    {STATIC_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>

                            <div className="col-md-4"><label className="form-label">Fiyat</label><input type="number" className="form-control" value={product.fiyat} onChange={e => setProduct({...product, fiyat: e.target.value})} required /></div>
                            <div className="col-md-4"><label className="form-label">Stok</label><input type="number" className="form-control" value={product.stok} onChange={e => setProduct({...product, stok: e.target.value})} required /></div>
                            <div className="col-12"><label className="form-label">Açıklama</label><textarea className="form-control" rows="3" value={product.aciklama} onChange={e => setProduct({...product, aciklama: e.target.value})}></textarea></div>
                            
                            <div className="col-12 mt-4 d-flex gap-2">
                                <button type="submit" className="btn btn-success flex-grow-1 py-2 fw-bold" disabled={loading}>
                                    {loading ? "İşleniyor..." : (isEditing ? "Güncelle" : "Yayınla")}
                                </button>
                                {isEditing && (
                                    <button type="button" className="btn btn-secondary px-4" onClick={() => {resetForm(); setActiveTab('my-products')}}>Vazgeç</button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* 3. SİPARİŞ LİSTESİ */}
            {activeTab === 'orders' && (
                <div className="card border-0 shadow-sm p-4">
                    <h3 className="fw-bold mb-4">Gelen Siparişler</h3>
                    {/* ... (Sipariş tablosu kodun aynen korundu) ... */}
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
                                                    {order.satirlar?.map((item, idx) => <li key={idx}>{item.adet}x {item.urunIsmi}</li>)}
                                                    {order.urunler?.map((item, idx) => <li key={idx}>{item.miktar}x {item.urunAdi}</li>)}
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