import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { uploadFile } from "../services/fileService";
import { 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    getMyProducts 
} from "../services/productService"; 
import { getSellerOrders, shipOrderItem } from "../services/siparisService";

function SellerDashboard() {
    const { role, user } = useContext(AuthContext); 
    const [activeTab, setActiveTab] = useState("my-products");

    // State'ler
    const [orders, setOrders] = useState([]);
    const [myProducts, setMyProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [trackingInputs, setTrackingInputs] = useState({});

    // Kategori State'leri
    const staticCategories = [
        { anaKategori: "Giyim", genderRequired: true, altKategoriler: ["Tişört", "Pantolon", "Mont","Kazak","Triko"] },
        { anaKategori: "Ayakkabı", genderRequired: true, altKategoriler: ["Spor Ayakkabı", "Bot","Klasik Ayakkabı"] },
        { anaKategori: "Aksesuar", genderRequired: true, altKategoriler: ["Kolye", "Bileklik","Kol Saati"] },
        { anaKategori: "Elektronik", genderRequired: false, altKategoriler: ["Telefon", "Bilgisayar", "Tablet","Kulak İçi Kulaklık","Kulak Üstü Kulaklık","Hoparlör","Telefon Aksesuarları"] }
    ];

    const [mainCategory, setMainCategory] = useState("");
    const [gender, setGender] = useState("");
    const [subCategory, setSubCategory] = useState("");
    const [product, setProduct] = useState({ id: "", isim: "", marka: "", fiyat: "", stok: "", aciklama: "", resimUrl: "" });
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // 🔥 KRİTİK: Kullanıcı email bilgisini güvenli bir şekilde al
    const myEmail = typeof user === 'string' ? user : (user?.sub || user?.email || localStorage.getItem("user"));

    // Yetki Kontrolü
    if (role !== "ROLE_SELLER") return <div className="text-center mt-5"><h5>Yetkisiz Erişim</h5></div>;

    // Veri Çekme
    useEffect(() => {
        if (activeTab === "orders") fetchOrders();
        if (activeTab === "my-products") fetchMyProducts();
    }, [activeTab]);

    const fetchOrders = () => {
        setOrdersLoading(true);
        getSellerOrders()
            .then((res) => {
                console.log("Gelen Siparişler:", res.data); // Hata ayıklama için
                setOrders(res.data);
            })
            .catch((err) => console.error("Siparişler çekilemedi:", err))
            .finally(() => setOrdersLoading(false));
    };

    const fetchMyProducts = () => {
        setLoading(true);
        getMyProducts()
            .then((res) => setMyProducts(res.data))
            .catch((err) => console.error("Ürünler çekilemedi:", err))
            .finally(() => setLoading(false));
    };

    // Kategori Yardımcıları
    const getSelectedCategoryObject = () => staticCategories.find((cat) => cat.anaKategori === mainCategory);
    const getSubCategories = () => getSelectedCategoryObject()?.altKategoriler || [];
    const isGenderNeeded = () => getSelectedCategoryObject()?.genderRequired || false;

    const handleMainCategoryChange = (e) => { 
        setMainCategory(e.target.value); 
        setSubCategory(""); 
        setGender(""); 
    };

    const handleFileChange = (e) => { 
        const file = e.target.files[0]; 
        if (file) { 
            setSelectedFile(file); 
            setPreview(URL.createObjectURL(file)); 
        } 
    };

    // Form İşlemleri
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let finalImageUrl = product.resimUrl;
            if (selectedFile) {
                const uploadRes = await uploadFile(selectedFile);
                finalImageUrl = uploadRes.data;
            }

            // Backend modeline uygun hale getirme
            const productData = {
                ...product,
                resimUrl: finalImageUrl,
                anaKategori: mainCategory,
                kategori: subCategory,
                cinsiyet: gender
            };

            // 🔥🔥 DÜZELTME BURADA 🔥🔥
            // Eğer yeni ekleme yapıyorsak (Düzenleme değilse), ID alanını paketten siliyoruz.
            if (!isEditing) {
                delete productData.id; 
            }

            if (isEditing) {
                await updateProduct(product.id, productData);
                alert("Ürün güncellendi!");
            } else {
                await addProduct(productData);
                alert("Ürün eklendi!");
            }
            
            resetForm();
            setActiveTab("my-products");
            fetchMyProducts();
        } catch (error) {
            console.error(error); // Hatayı konsola yazdıralım ki görelim
            alert("İşlem başarısız.");
        }
    };
    const handleEditClick = (item) => {
        setProduct(item);
        setMainCategory(item.anaKategori || "");
        setSubCategory(item.kategori || "");
        setGender(item.cinsiyet || "");
        setPreview(item.resimUrl);
        setIsEditing(true);
        setActiveTab("add-product");
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm("Ürünü silmek istediğinize emin misiniz?")) {
            await deleteProduct(id);
            fetchMyProducts();
        }
    };

    const resetForm = () => {
        setProduct({ id: "", isim: "", marka: "", fiyat: "", stok: "", aciklama: "", resimUrl: "" });
        setMainCategory(""); setSubCategory(""); setGender("");
        setSelectedFile(null); setPreview(null); setIsEditing(false);
    };

    const handleShipItem = async (siparisId, urunId) => {
        const kargoNo = trackingInputs[urunId];
        if (!kargoNo) { alert("Lütfen kargo takip numarası giriniz."); return; }
        
        try {
            await shipOrderItem(siparisId, urunId, kargoNo);
            alert("Ürün kargoya verildi!");
            fetchOrders();
        } catch (error) { 
            alert("İşlem başarısız."); 
        }
    };

    return (
        <div className="container py-5">
            <div className="row">
                {/* SOL MENÜ */}
                <div className="col-md-3 mb-4">
                    <div className="card border-0 shadow-sm sticky-top" style={{ top: "100px" }}>
                        <div className="card-body text-center border-bottom mb-3">
                            <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{width:"50px", height:"50px"}}>
                                <i className="bi bi-person-badge fs-4"></i>
                            </div>
                            <h6 className="fw-bold mb-0">{myEmail}</h6>
                            <small className="text-muted">Mağaza Paneli</small>
                        </div>
                        <div className="card-body pt-0">
                            <div className="list-group list-group-flush">
                                <button className={`list-group-item list-group-item-action border-0 mb-1 rounded ${activeTab === "my-products" ? "bg-success text-white" : ""}`} onClick={() => setActiveTab("my-products")}>
                                    <i className="bi bi-grid me-2"></i> Ürünlerim
                                </button>
                                <button className={`list-group-item list-group-item-action border-0 mb-1 rounded ${activeTab === "add-product" ? "bg-success text-white" : ""}`} onClick={() => { resetForm(); setActiveTab("add-product"); }}>
                                    <i className="bi bi-plus-circle me-2"></i> Ürün Ekle
                                </button>
                                <button className={`list-group-item list-group-item-action border-0 mb-1 rounded ${activeTab === "orders" ? "bg-success text-white" : ""}`} onClick={() => setActiveTab("orders")}>
                                    <i className="bi bi-box-seam me-2"></i> Gelen Siparişler
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SAĞ İÇERİK */}
                <div className="col-md-9">
                    {activeTab === "my-products" && (
                        <div className="card border-0 shadow-sm p-4">
                            <h3 className="fw-bold mb-4">Mağazamdaki Ürünler</h3>
                            {loading ? (
                                <div className="text-center"><div className="spinner-border text-success"></div></div>
                            ) : myProducts.length === 0 ? (
                                <div className="alert alert-info border-0">Mağazanızda henüz ürün yok.</div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead>
                                            <tr>
                                                <th>Görsel</th>
                                                <th>Ürün Adı</th>
                                                <th>Fiyat</th>
                                                <th>Stok</th>
                                                <th>İşlemler</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {myProducts.map(p => (
                                                <tr key={p.id}>
                                                    <td><img src={p.resimUrl} alt="" style={{width: "50px", height:"50px", objectFit:"cover"}} className="rounded"/></td>
                                                    <td><div className="fw-bold">{p.isim}</div><small className="text-muted">{p.marka}</small></td>
                                                    <td className="fw-bold">{p.fiyat} ₺</td>
                                                    <td>{p.stok}</td>
                                                    <td>
                                                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditClick(p)}><i className="bi bi-pencil"></i></button>
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteClick(p.id)}><i className="bi bi-trash"></i></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "add-product" && (
                        <div className="card border-0 shadow-sm p-4">
                            <h3 className="fw-bold mb-4">{isEditing ? "Ürünü Güncelle" : "Yeni Ürün Ekle"}</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small">Ürün Adı</label>
                                        <input type="text" className="form-control shadow-sm" value={product.isim} onChange={(e) => setProduct({...product, isim: e.target.value})} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small">Marka</label>
                                        <input type="text" className="form-control shadow-sm" value={product.marka} onChange={(e) => setProduct({...product, marka: e.target.value})} required />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-bold small">Ana Kategori</label>
                                        <select className="form-select shadow-sm" value={mainCategory} onChange={handleMainCategoryChange} required>
                                            <option value="">Seçiniz</option>
                                            {staticCategories.map(c => <option key={c.anaKategori} value={c.anaKategori}>{c.anaKategori}</option>)}
                                        </select>
                                    </div>
                                    {isGenderNeeded() && (
                                        <div className="col-md-4">
                                            <label className="form-label fw-bold small">Cinsiyet</label>
                                            <select className="form-select shadow-sm" value={gender} onChange={(e) => setGender(e.target.value)} required>
                                                <option value="">Seçiniz</option>
                                                <option value="Erkek">Erkek</option>
                                                <option value="Kadın">Kadın</option>
                                                <option value="Unisex">Unisex</option>
                                            </select>
                                        </div>
                                    )}
                                    <div className="col-md-4">
                                        <label className="form-label fw-bold small">Alt Kategori</label>
                                        <select className="form-select shadow-sm" value={subCategory} onChange={(e) => setSubCategory(e.target.value)} required>
                                            <option value="">Seçiniz</option>
                                            {getSubCategories().map(sc => <option key={sc} value={sc}>{sc}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small">Fiyat (₺)</label>
                                        <input type="number" className="form-control shadow-sm" value={product.fiyat} onChange={(e) => setProduct({...product, fiyat: e.target.value})} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small">Stok Adedi</label>
                                        <input type="number" className="form-control shadow-sm" value={product.stok} onChange={(e) => setProduct({...product, stok: e.target.value})} required />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-bold small">Ürün Açıklaması</label>
                                        <textarea className="form-control shadow-sm" rows="3" value={product.aciklama} onChange={(e) => setProduct({...product, aciklama: e.target.value})}></textarea>
                                    </div>
                                    <div className="col-md-12">
                                        <label className="form-label fw-bold small">Ürün Görseli</label>
                                        <input type="file" className="form-control shadow-sm" onChange={handleFileChange} />
                                        {preview && (
                                            <div className="mt-2 position-relative d-inline-block">
                                                <img src={preview} alt="Önizleme" className="rounded border" style={{width: "120px", height: "120px", objectFit: "cover"}} />
                                                <button type="button" className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1" onClick={() => {setPreview(null); setSelectedFile(null)}}><i className="bi bi-x"></i></button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-12 text-end mt-4">
                                        <button type="button" className="btn btn-light me-2 rounded-pill px-4" onClick={resetForm}>Vazgeç</button>
                                        <button type="submit" className="btn btn-success rounded-pill px-4">{isEditing ? "Güncelle" : "Kaydet"}</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* 3. SEKME: GELEN SİPARİŞLER */}
{activeTab === "orders" && (
    <div className="card border-0 shadow-sm p-4">
        <h3 className="fw-bold mb-4">Gelen Siparişler</h3>
        {ordersLoading ? (
            <div className="text-center"><div className="spinner-border text-primary"></div></div>
        ) : orders.length === 0 ? (
            <div className="alert alert-info">Henüz sipariş almadınız.</div>
        ) : (
            <div className="table-responsive">
                <table className="table table-bordered align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>Sipariş Bilgisi</th>
                            <th>Ürün</th>
                            <th>Durum / Aksiyon</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => {
                            // DEBUG: Eğer hala gelmiyorsa konsola bakıp saticiId neymiş gör:
                            // console.log("Siparişteki Ürünler:", order.urunler);
                            // console.log("Benim Bilgim (myEmail):", myEmail);

                            // ÖNEMLİ: Eğer filtreleme çalışmıyorsa şimdilik filtreyi kaldırıp 
                            // tüm ürünleri görmek için .filter'ı silebilirsin:
                            const myItems = order.urunler; // Şimdilik tümünü gösterelim

                            return myItems.map((item, index) => (
                                <tr key={`${order.id}-${item.urunId}-${index}`}>
                                    <td className="bg-light">
                                        <small className="text-muted d-block">#{order.siparisNo}</small>
                                        <div className="fw-bold">{order.kullaniciEposta}</div>
                                        <div className="small">{new Date(order.siparisTarihi).toLocaleDateString("tr-TR")}</div>
                                        <div className="mt-2 text-primary small">
                                            <i className="bi bi-geo-alt"></i> {order.teslimatAdresi?.baslik || "Adres Belirtilmemiş"}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="fw-bold">{item.urunAdi}</div>
                                        <div>{item.miktar} Adet x {item.fiyat} ₺</div>
                                        <div className="text-success fw-bold">{item.fiyat * item.miktar} ₺</div>
                                        {/* Eğer saticiId yanlışsa buradan kontrol edebilirsin */}
                                        <div className="text-muted small" style={{fontSize: '10px'}}>Satıcı: {item.saticiId}</div>
                                    </td>
                                    <td>
                                        {item.durum === "KARGOYA_VERILDI" ? (
                                            <div className="text-success">
                                                <i className="bi bi-check-circle-fill me-2"></i>Kargolandı
                                                <div className="small text-muted mt-1">Takip: {item.kargoTakipNo}</div>
                                            </div>
                                        ) : (
                                            <div className="d-flex flex-column gap-2">
                                                <span className="badge bg-warning text-dark align-self-start">Hazırlanıyor</span>
                                                <input 
                                                    type="text" 
                                                    className="form-control form-control-sm" 
                                                    placeholder="Kargo Takip No"
                                                    value={trackingInputs[item.urunId] || ""}
                                                    onChange={(e) => setTrackingInputs(prev => ({ ...prev, [item.urunId]: e.target.value }))}
                                                />
                                                <button className="btn btn-sm btn-primary" onClick={() => handleShipItem(order.id, item.urunId)}>
                                                    Kargoya Ver
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ));
                        })}
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