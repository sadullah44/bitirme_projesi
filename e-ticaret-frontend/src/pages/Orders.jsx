import { useEffect, useState } from "react";
import { getMyOrders } from "../services/siparisService";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders()
      .then((res) => {
        setOrders(res.data);
      })
      .catch((err) => {
        console.error("Siparişler alınamadı:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container mt-5">Yükleniyor...</div>;

  return (
    <div className="container mt-5">
      <h2 className="mb-4">📦 Sipariş Geçmişim</h2>
      
      {orders.length === 0 ? (
        <div className="alert alert-info">Henüz hiç siparişiniz yok.</div>
      ) : (
        <div className="row">
          {orders.map((order) => (
            <div key={order.id} className="col-12 mb-4">
              <div className="card shadow-sm border-primary">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <span><strong>Sipariş No:</strong> {order.siparisNo}</span>
                  <span className="badge bg-success">{order.durum}</span>
                </div>
                <div className="card-body">
                  <p className="mb-2">
                    <strong>Tarih:</strong> {new Date(order.siparisTarihi).toLocaleString()}
                  </p>
                  <p className="mb-2">
                    <strong>Adres:</strong> {order.teslimatAdresi.baslik} - {order.teslimatAdresi.adresSatiri}
                  </p>
                  
                  <hr />
                  
                  <h6 className="card-subtitle mb-2 text-muted">Ürünler:</h6>
                  <ul className="list-group list-group-flush mb-3">
                    {order.urunler.map((urun, index) => (
                      <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>{urun.urunAdi} (x{urun.miktar})</span>
                        <span>{urun.fiyat} ₺</span>
                      </li>
                    ))}
                  </ul>

                  <h5 className="text-end text-primary">Toplam: {order.toplamTutar} ₺</h5>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;