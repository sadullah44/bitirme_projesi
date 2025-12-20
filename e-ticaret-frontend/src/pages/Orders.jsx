import { useEffect, useState } from "react";
import { getMyOrders } from "../services/siparisService";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    getMyOrders()
      .then((res) => {
        console.log("Sipariş Verisi:", res.data); // Gelen veriyi konsoldan inceleyebilirsin
        setOrders(res.data);
      })
      .catch((err) => {
        console.error("Siparişler alınamadı:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getStatusBadge = (status) => {
    if (!status) return "bg-secondary";
    const s = status.toUpperCase();
    if (s.includes("TESLİM")) return "bg-success";
    if (s.includes("KARGO")) return "bg-warning text-dark";
    if (s.includes("İPTAL")) return "bg-danger";
    return "bg-primary";
  };

  if (loading) return <div className="container mt-5 text-center"><h5>Yükleniyor...</h5></div>;

  return (
    <div className="container mt-5">
      <h2 className="mb-4 fw-bold">📦 Sipariş Geçmişim</h2>

      {orders.length === 0 ? (
        <div className="alert alert-info shadow-sm">Henüz hiç siparişiniz yok.</div>
      ) : (
        <div className="row">
          {orders.map((order) => (
            <div key={order.id || order.siparisNo} className="col-12 mb-4">
              <div className="card shadow-sm border-0">
                <div className="card-header bg-white border-bottom py-3">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                      <span className="text-muted small d-block">Sipariş Tarihi</span>
                      <strong className="text-dark">
                        {order.siparisTarihi ? new Date(order.siparisTarihi).toLocaleDateString() : "Tarih Bilgisi Yok"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-muted small d-block">Sipariş Özeti</span>
                      <strong className="text-dark">{order.toplamTutar?.toLocaleString() || 0} ₺</strong>
                    </div>
                    <div>
                      <span className="text-muted small d-block">Durum</span>
                      <span className={`badge ${getStatusBadge(order.genelDurum)} px-3 py-2 rounded-pill`}>
                        {order.genelDurum || "HAZIRLANIYOR"}
                      </span>
                    </div>
                    <button 
                      className="btn btn-primary btn-sm px-4 rounded-pill fw-bold"
                      onClick={() => setSelectedOrder(order)}
                    >
                      Sipariş Detayı
                    </button>
                  </div>
                </div>

                <div className="card-body">
                  <div className="d-flex align-items-center gap-3">
                    <div className="flex-grow-1">
                      <p className="mb-1 text-muted small">Teslimat Adresi</p>
                      <p className="mb-0 fw-semibold">
                        {order.teslimatAdresi?.baslik}: {order.teslimatAdresi?.adresSatiri}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- TRENDYOL STİLİ DETAY PENCERESİ (MODAL) --- */}
      {selectedOrder && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header bg-light border-0">
                  <h5 className="modal-title fw-bold">Sipariş Detayı (#{selectedOrder.siparisNo})</h5>
                  <button type="button" className="btn-close" onClick={() => setSelectedOrder(null)}></button>
                </div>
                
                <div className="modal-body p-4">
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <h6 className="fw-bold text-muted border-bottom pb-2">Teslimat Bilgileri</h6>
                      <p className="mb-0 fw-bold">{selectedOrder.teslimatAdresi?.baslik}</p>
                      <p className="small text-secondary">{selectedOrder.teslimatAdresi?.adresSatiri}</p>
                    </div>
                    <div className="col-md-6 text-md-end">
                      <h6 className="fw-bold text-muted border-bottom pb-2">Müşteri Bilgileri</h6>
                      <p className="mb-0 fw-semibold">{selectedOrder.kullaniciEposta}</p>
                    </div>
                  </div>

                  <h6 className="fw-bold mb-3 text-muted">Siparişteki Ürünler ({selectedOrder.urunler?.length || 0})</h6>
                  <div className="list-group list-group-flush border rounded shadow-sm">
                    {selectedOrder.urunler?.map((urun, index) => {
                      // GÜVENLİ HESAPLAMA: Fiyat veya Adet undefined/null ise 0 kabul et
                      const urunFiyat = urun.fiyat || 0;
                      const urunAdet = urun.adet || urun.miktar || 0;
                      const urunToplam = urunFiyat * urunAdet;

                      return (
                        <div key={index} className="list-group-item p-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex gap-3 align-items-center">
                              <div className="bg-light p-2 rounded text-center" style={{minWidth: '50px'}}>📦</div>
                              <div>
                                <h6 className="mb-1 fw-bold">{urun.isim || "İsimsiz Ürün"}</h6>
                                <p className="small text-muted mb-0">
                                  {urunFiyat.toLocaleString()} ₺ x {urunAdet} Adet
                                </p>
                                {urun.kargoTakipNo && (
                                  <div className="mt-1">
                                    <span className="badge bg-info text-dark small">
                                      {urun.kargoFirmasi}: {urun.kargoTakipNo}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-end">
                              <span className={`badge ${getStatusBadge(urun.durum)} mb-1 d-block`}>
                                  {urun.durum || "Hazırlanıyor"}
                              </span>
                              <span className="fw-bold text-primary">{urunToplam.toLocaleString()} ₺</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 p-3 rounded border-start border-primary border-4 bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold text-muted text-uppercase">Genel Toplam</span>
                      <h4 className="text-primary fw-bold mb-0">{selectedOrder.toplamTutar?.toLocaleString() || 0} ₺</h4>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light border-0">
                  <button type="button" className="btn btn-secondary px-5 rounded-pill" onClick={() => setSelectedOrder(null)}>Kapat</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Orders;