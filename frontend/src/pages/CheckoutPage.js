import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const currency = (v) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v || 0);

export default function CheckoutPage({ auth, logout }) {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    note: "",
  });
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
        const res = await fetch("http://localhost:5000/api/cart", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
        });
        if (!res.ok) throw new Error("Không tải được giỏ hàng");
        const data = await res.json();
        if (!cancelled) setCart(data || { items: [] });
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

  const items = cart.items || [];
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = item.price || item.product?.price || item.product?.minPrice || 0;
      return sum + price * (item.quantity || 1);
    }, 0);
  }, [items]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth?.token) {
      navigate("/auth");
      return;
    }
    if (!items.length) {
      showToast("Giỏ hàng trống", "error");
      return;
    }
    try {
      const payload = {
        items: items.map((i) => ({
          productId: i.product?._id || i.product,
          variantId: i.attributes?.variantId || i.attributes?.get?.("variantId") || null,
          quantity: i.quantity || 1,
        })),
        shipping: {
          address: {
            fullName: form.fullName,
            phone: form.phone,
            line1: form.address,
            city: form.city,
          },
        },
        payment: { method: "cod" },
        note: form.note,
      };

      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Đặt hàng thất bại");
      showToast("Đặt hàng thành công!", "success");
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <div className="page">
      <Header auth={auth} logout={logout} />
      {toast && <div className={`toast ${toast.type}`}>{toast.text}</div>}

      <section className="section">
        <div className="section-header">
          <h3 className="section-title">Đặt hàng</h3>
          <a className="nav-link" href="/#products" onClick={(e) => { e.preventDefault(); navigate("/#products"); }}>
            ← Tiếp tục mua sắm
          </a>
        </div>

        {loading && <div className="alert-box">Đang tải giỏ hàng...</div>}

        {!loading && items.length === 0 && (
          <div className="alert-box">Giỏ hàng trống. <button className="secondary-btn" onClick={() => navigate('/#products')}>Xem sản phẩm</button></div>
        )}

        {!loading && items.length > 0 && (
          <div className="grid" style={{ gridTemplateColumns: "2fr 1fr", gap: 16 }}>
            <form className="newsletter" onSubmit={handleSubmit} style={{ gridTemplateColumns: "1fr" }}>
              <h4 className="section-title" style={{ margin: 0 }}>Thông tin giao hàng</h4>
              <input
                name="fullName"
                placeholder="Họ và tên"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
              <input
                name="phone"
                placeholder="Số điện thoại"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <input
                name="address"
                placeholder="Địa chỉ"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
              <input
                name="city"
                placeholder="Tỉnh/Thành phố"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
              <textarea
                name="note"
                placeholder="Ghi chú đơn hàng (tùy chọn)"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
              <div className="hero-actions" style={{ justifyContent: "flex-start", flexWrap: "nowrap", gap: 12 }}>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => navigate("/cart")}
                >
                  ← Quay về giỏ hàng
                </button>
                <button
                  type="submit"
                  className="cta-btn"
                  style={{ background: "linear-gradient(90deg, #ffb703, #ff8f00)", color: "#0f172a" }}
                >
                  Xác nhận đặt hàng
                </button>
              </div>
            </form>

            <div className="hero-card" style={{ display: "grid", gap: 12 }}>
              <h4 className="section-title" style={{ margin: 0 }}>Tóm tắt đơn</h4>
              {items.map((item) => {
                const img = item.image || item.product?.images?.[0] || "https://placehold.co/80x80?text=Pokemon";
                const name = item.name || item.product?.name || "Sản phẩm";
                const price = item.price || item.product?.price || item.product?.minPrice || 0;
                const attrs = item.attributes || {};
                const sizeCm = attrs.sizeCm || attrs.get?.("sizeCm");
                const variantId = attrs.variantId || attrs.get?.("variantId");
                return (
                  <div key={item.product?._id || item.product} style={{ display: "grid", gridTemplateColumns: "80px 1fr auto", gap: 10, alignItems: "center" }}>
                    <img src={img} alt={name} style={{ width: "100%", borderRadius: 8 }} />
                    <div>
                      <div className="product-title">{name}</div>
                      {(variantId || sizeCm) && (
                        <div className="muted">Phiên bản: {sizeCm ? `${sizeCm} cm` : variantId}</div>
                      )}
                      <div className="muted">SL: {item.quantity || 1}</div>
                    </div>
                    <div className="product-price" style={{ textAlign: "right" }}>
                      {currency(price * (item.quantity || 1))}
                    </div>
                  </div>
                );
              })}
              <div className="product-title" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Tạm tính</span>
                <span>{currency(subtotal)}</span>
              </div>
            </div>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
