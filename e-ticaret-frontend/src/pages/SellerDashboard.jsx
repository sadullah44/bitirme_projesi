import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { uploadFile } from "../services/fileService";
import { 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    getMyProducts
} from "../services/productService"; 
import { getSellerOrders } from "../services/siparisService";

function SellerDashboard() {
  const { role } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState("my-products");

  const [orders, setOrders] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // ✅ STATİK KATEGORİ LİSTESİ (Backend’den çekilmiyor artık!)
  const staticCategories = [
    { anaKategori: "Giyim", genderRequired: true, altKategoriler: ["Tişört", "Pantolon", "Mont","Kazak","Triko"] },
    { anaKategori: "Ayakkabı", genderRequired: true, altKategoriler: ["Spor Ayakkabı", "Bot"] },
    { anaKategori: "Aksesuar", genderRequired: true, altKategoriler: ["Kolye", "Bileklik"] },
    { anaKategori: "Elektronik", genderRequired: false, altKategoriler: ["Telefon", "Bilgisayar", "Tablet"] }
  ];

  const [categoryTree] = useState(staticCategories);

  const [mainCategory, setMainCategory] = useState("");
  const [gender, setGender] = useState("");
  const [subCategory, setSubCategory] = useState("");

  const [product, setProduct] = useState({
    id: "",
    isim: "",
    marka: "",
    fiyat: "",
    stok: "",
    aciklama: "",
    resimUrl: ""
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  if (role !== "ROLE_SELLER") return <div className="text-center mt-5">Yetkisiz Erişim</div>;

  // ------------------- VERİ ÇEK -------------------
  useEffect(() => {
    if (activeTab === "orders") fetchOrders();
    if (activeTab === "my-products") fetchMyProducts();
  }, [activeTab]);

  const fetchOrders = () => {
    setOrdersLoading(true);
    getSellerOrders()
      .then((res) => setOrders(res.data))
      .catch((err) => console.error(err))
      .finally(() => setOrdersLoading(false));
  };

  const fetchMyProducts = () => {
    setLoading(true);
    getMyProducts()
      .then((res) => setMyProducts(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  // ------------------- KATEGORİ YARDIMCILAR -------------------
  const getSelectedCategoryObject = () => {
    return categoryTree.find((cat) => cat.anaKategori === mainCategory);
  };

  const getSubCategories = () => {
    const catObj = getSelectedCategoryObject();
    if (!catObj) return [];
    return catObj.altKategoriler || [];
  };

  const isGenderNeeded = () => {
    const catObj = getSelectedCategoryObject();
    return catObj ? catObj.genderRequired : false;
  };

  // ------------------- FORM İŞLEMLERİ -------------------
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let uploadedImageUrl = product.resimUrl;

      if (selectedFile) {
        const uploadRes = await uploadFile(selectedFile);
        uploadedImageUrl = uploadRes.data;
      }

      const catObj = getSelectedCategoryObject();
      const cinsiyetValue = catObj && catObj.genderRequired ? gender : "Diğer";

      const productData = {
        ...product,
        anaKategori: mainCategory,
        kategori: subCategory,
        cinsiyet: cinsiyetValue,
        resimUrl: uploadedImageUrl,
        fiyat: Number(product.fiyat),
        stok: Number(product.stok)
      };

      if (isEditing) {
        await updateProduct(product.id, productData);
        alert("Ürün güncellendi!");
      } else {
        await addProduct(productData);
        alert("Ürün başarıyla eklendi!");
      }

      resetForm();
      setActiveTab("my-products");

    } catch (error) {
      console.error("Hata:", error);
      alert("İşlem başarısız!");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item) => {
    setProduct({
      id: item.id,
      isim: item.isim,
      marka: item.marka,
      fiyat: item.fiyat,
      stok: item.stok,
      aciklama: item.aciklama,
      resimUrl: item.resimUrl
    });

    setMainCategory("");
    setSubCategory("");
    setGender("");

    setPreview(item.resimUrl);
    setIsEditing(true);
    setActiveTab("add-product");
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Bu ürünü silmek istiyor musunuz?")) {
      try {
        await deleteProduct(id);
        fetchMyProducts();
      } catch (error) {
        alert("Silme işlemi başarısız.");
      }
    }
  };

  const resetForm = () => {
    setProduct({ isim: "", marka: "", fiyat: "", stok: "", aciklama: "", resimUrl: "" });
    setMainCategory("");
    setSubCategory("");
    setGender("");
    setSelectedFile(null);
    setPreview(null);
    setIsEditing(false);
  };

  // ------------------- UI -------------------
  return (
    <div className="container py-5">
      <div className="row">

        {/* SOL MENÜ */}
        <div className="col-md-3 mb-4">
          <div className="card border-0 shadow-sm sticky-top" style={{ top: "100px" }}>
            <div className="card-body">
              <h5 className="fw-bold text-success mb-3">
                <i className="bi bi-shop me-2"></i>Satıcı Paneli
              </h5>

              <div className="list-group list-group-flush">
                <button
                  className={`list-group-item list-group-item-action ${
                    activeTab === "my-products" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("my-products")}
                >
                  <i className="bi bi-grid me-2"></i> Ürünlerim
                </button>

                <button
                  className={`list-group-item list-group-item-action ${
                    activeTab === "add-product" ? "active" : ""
                  }`}
                  onClick={() => {
                    resetForm();
                    setActiveTab("add-product");
                  }}
                >
                  <i className="bi bi-plus-circle me-2"></i> Ürün Ekle
                </button>

                <button
                  className={`list-group-item list-group-item-action ${
                    activeTab === "orders" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("orders")}
                >
                  <i className="bi bi-box-seam me-2"></i> Gelen Siparişler
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ İÇERİK */}
        <div className="col-md-9">

          {/* ---------------- ÜRÜN LİSTESİ ---------------- */}
          {activeTab === "my-products" && (
            <div className="card border-0 shadow-sm p-4">
              <h3 className="fw-bold mb-4">Ürünlerim</h3>

              {loading ? (
                <div className="text-center">
                  <div className="spinner-border text-primary"></div>
                </div>
              ) : myProducts.length === 0 ? (
                <div className="alert alert-info">Henüz ürün eklemediniz.</div>
              ) : (
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
                      {myProducts.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img
                                src={item.resimUrl || "https://placehold.co/50"}
                                alt=""
                                className="rounded me-2"
                                style={{ width: "40px", height: "40px", objectFit: "cover" }}
                              />

                              <div>
                                <div className="fw-bold text-truncate" style={{ maxWidth: "200px" }}>
                                  {item.isim}
                                </div>
                                <small className="text-muted">
                                  {item.anaKategori}
                                  {item.cinsiyet && item.cinsiyet !== "Diğer"
                                    ? ` / ${item.cinsiyet}`
                                    : ""}
                                </small>
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
                            <button
                              onClick={() => handleEditClick(item)}
                              className="btn btn-sm btn-outline-primary me-2"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>

                            <button
                              onClick={() => handleDeleteClick(item.id)}
                              className="btn btn-sm btn-outline-danger"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>

                  </table>
                </div>
              )}
            </div>
          )}

          {/* ---------------- ÜRÜN EKLEME FORMU ---------------- */}
          {activeTab === "add-product" && (
            <div className="card border-0 shadow-sm p-4">
              <h3 className="fw-bold mb-4">{isEditing ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}</h3>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">

                  {/* Resim */}
                  <div className="col-12 text-center mb-3">
                    <div
                      className="border rounded p-3 d-inline-block position-relative"
                      style={{ width: "200px", height: "200px", background: "#f8f9fa" }}
                    >
                      {preview ? (
                        <img
                          src={preview}
                          alt="Önizleme"
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      ) : (
                        <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                          <i className="bi bi-camera fs-1"></i>
                          <small>Resim Seç</small>
                        </div>
                      )}

                      <input
                        type="file"
                        className="position-absolute top-0 start-0 w-100 h-100 opacity-0"
                        style={{ cursor: "pointer" }}
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Ürün Adı</label>
                    <input
                      className="form-control"
                      value={product.isim}
                      onChange={(e) => setProduct({ ...product, isim: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Marka</label>
                    <input
                      className="form-control"
                      value={product.marka}
                      onChange={(e) => setProduct({ ...product, marka: e.target.value })}
                      required
                    />
                  </div>

                  {/* Ana Kategori */}
                  <div className="col-md-6">
                    <label className="form-label">Ana Kategori</label>
                    <select
                      className="form-select"
                      value={mainCategory}
                      onChange={handleMainCategoryChange}
                      required
                    >
                      <option value="">Seçiniz...</option>
                      {categoryTree.map((cat) => (
                        <option key={cat.anaKategori} value={cat.anaKategori}>
                          {cat.anaKategori}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Alt Kategori */}
                  <div className="col-md-6">
                    <label className="form-label">Alt Kategori</label>
                    <select
                      className="form-select"
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      disabled={!mainCategory}
                      required
                    >
                      <option value="">
                        {!mainCategory ? "Önce Ana Kategori Seçin" : "Seçiniz..."}
                      </option>

                      {getSubCategories().map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cinsiyet — sadece gerekli olan kategorilerde */}
                  {isGenderNeeded() && (
                    <div className="col-md-6">
                      <label className="form-label">Cinsiyet</label>
                      <select
                        className="form-select"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        required
                      >
                        <option value="">Seçiniz...</option>
                        <option value="Bayan">Bayan</option>
                        <option value="Bay">Bay</option>
                      </select>
                    </div>
                  )}

                  <div className="col-md-6">
                    <label className="form-label">Fiyat</label>
                    <input
                      type="number"
                      className="form-control"
                      value={product.fiyat}
                      onChange={(e) => setProduct({ ...product, fiyat: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Stok</label>
                    <input
                      type="number"
                      className="form-control"
                      value={product.stok}
                      onChange={(e) => setProduct({ ...product, stok: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Açıklama</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={product.aciklama}
                      onChange={(e) => setProduct({ ...product, aciklama: e.target.value })}
                    ></textarea>
                  </div>

                  {/* Butonlar */}
                  <div className="col-12 mt-4 d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-success flex-grow-1 py-2 fw-bold"
                      disabled={loading}
                    >
                      {loading ? "İşleniyor..." : isEditing ? "Güncelle" : "Yayınla"}
                    </button>

                    {isEditing && (
                      <button
                        type="button"
                        className="btn btn-secondary px-4"
                        onClick={() => {
                          resetForm();
                          setActiveTab("my-products");
                        }}
                      >
                        Vazgeç
                      </button>
                    )}
                  </div>

                </div>
              </form>
            </div>
          )}

          {/* ---------------- SİPARİŞLER ---------------- */}
          {activeTab === "orders" && (
            <div className="card border-0 shadow-sm p-4">
              <h3 className="fw-bold mb-4">Gelen Siparişler</h3>

              {ordersLoading ? (
                <div className="text-center">
                  <div className="spinner-border text-primary"></div>
                </div>
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
                      {orders?.map((order) => (
                        <tr key={order.siparisNo}>
                          <td><small>#{order.siparisNo}</small></td>
                          <td>{order.kullaniciEposta}</td>
                          <td>
                            <ul className="list-unstyled mb-0 small">
                              {order.satirlar?.map((it, i) => (
                                <li key={i}>{it.adet}x {it.urunIsmi}</li>
                              ))}
                            </ul>
                          </td>
                          <td className="fw-bold text-success">{order.toplamTutar} ₺</td>
                          <td>
                            <span className="badge bg-warning text-dark">Hazırlanıyor</span>
                          </td>
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
