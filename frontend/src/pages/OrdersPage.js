import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const statusLabels = {
  created: "Chờ xử lý",
  processing: "Đang xử lý",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  refunded: "Đã hoàn tiền",
};

const currency = (v) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v || 0);

export default function OrdersPage({ auth, logout }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (text, type = "info") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 2000);
  };

  useEffect(() => {
    if (!auth?.token) {
      navigate("/auth");
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:5000/api/orders", {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
        });
        if (!res.ok) throw new Error("Không tải được đơn hàng");
        const data = await res.json();
        if (!cancelled) setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) showToast(err.message, "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [auth, navigate]);

  const grouped = useMemo(() => {
    const map = new Map();
    orders.forEach((o) => {
      const key = o.status || "created";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(o);
    });
    return map;
  }, [orders]);

  const statuses = ["created", "processing", "completed", "cancelled", "refunded"].filter(
    (s) => grouped.has(s)
  );

  return (
    <div className="page">
      <Header auth={auth} logout={logout} />
      {toast && <div className={`toast ${toast.type}`}>{toast.text}</div>}

      <section className="section">
        <div className="section-header">
          <h3 className="section-title">Lịch sử đơn hàng</h3>
          <a className="nav-link" href="/#products" onClick={(e) => { e.preventDefault(); navigate("/#products"); }}>
            ← Tiếp tục mua sắm
          </a>
        </div>

        {loading && <div className="alert-box">Đang tải đơn hàng...</div>}
        {!loading && orders.length === 0 && <div className="alert-box">Chưa có đơn hàng nào.</div>}

        {!loading &&
          statuses.map((status) => (
            <div key={status} style={{ marginBottom: 16 }}>
              <h4 className="section-title" style={{ fontSize: 18 }}>
                {statusLabels[status] || status}
              </h4>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 }}>
                {grouped.get(status)?.map((order) => (
                  <div className="hero-card" key={order._id} style={{ display: "grid", gap: 8 }}>
                    <div className="product-title">Mã đơn: {order._id.slice(-8)}</div>
                    <div className="muted">Ngày: {new Date(order.createdAt).toLocaleString("vi-VN")}</div>
                    <div className="muted">Tổng: {currency(order.total)}</div>
                    <div className="muted">Thanh toán: {order.payment?.method || "N/A"} ({order.payment?.status || "pending"})</div>
                    <div className="muted">Giao hàng: {order.shipping?.status || "pending"}</div>
                    <div className="hero-card" style={{ padding: 10, background: "var(--surface-alt)" }}>
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} style={{ display: "grid", gridTemplateColumns: "60px 1fr auto", gap: 10, alignItems: "center", marginBottom: 6 }}>
                          <img
                            src={item.image || "https://placehold.co/60x60?text=Pokemon"}
                            alt={item.name}
                            style={{ width: "100%", borderRadius: 8 }}
                          />
                          <div>
                            <div className="product-title">{item.name}</div>
                            {item.attributes?.sizeCm && (
                              <div className="muted">Size: {item.attributes.sizeCm} cm</div>
                            )}
                            <div className="muted">SL: {item.quantity}</div>
                          </div>
                          <div className="product-price" style={{ textAlign: "right" }}>
                            {currency(item.price * (item.quantity || 1))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {order.note && <div className="muted">Ghi chú: {order.note}</div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
      </section>
      <Footer />
    </div>
  );
}
