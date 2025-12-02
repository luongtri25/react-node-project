import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../App.css";

export default function CartPage({ auth, logout }) {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const token = auth?.token;

  const apiFetch = (url, options = {}) =>
    fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await apiFetch("http://localhost:5000/api/cart");
        if (!res.ok) throw new Error("Không tải được giỏ hàng");
        const data = await res.json();
        if (!cancelled) setCart(data || { items: [] });
      } catch (err) {
        if (!cancelled) setMessage(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const subtotal = useMemo(
    () =>
      (cart.items || []).reduce((sum, item) => {
        const price = item.price || item.product?.price || 0;
        return sum + price * (item.quantity || 1);
      }, 0),
    [cart.items]
  );

  const updateQuantity = async (productId, quantity) => {
    if (!token) return;
    try {
      const res = await apiFetch("http://localhost:5000/api/cart", {
        method: "POST",
        body: JSON.stringify({ productId, quantity }),
      });
      if (!res.ok) throw new Error("Cập nhật thất bại");
      const data = await res.json();
      setCart(data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const removeItem = async (productId) => {
    if (!token) return;
    try {
      const res = await apiFetch(`http://localhost:5000/api/cart/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Xóa thất bại");
      const data = await res.json();
      setCart(data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleCheckout = async () => {
    if (!token) {
      navigate("/auth");
      return;
    }
    try {
      const items = (cart.items || []).map((i) => ({
        productId: i.product?._id || i.product,
        quantity: i.quantity || 1,
      }));
      const res = await apiFetch("http://localhost:5000/api/orders", {
        method: "POST",
        body: JSON.stringify({ items, shipping: {}, payment: {}, note: "Đặt nhanh" }),
      });
      if (!res.ok) throw new Error("Đặt hàng thất bại");
      setMessage("Đặt hàng thành công! Giỏ hàng đã được làm trống.");
      setCart({ items: [] });
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="page">
      <Header auth={auth} logout={logout} />
      <section className="section">
        <div className="section-header">
          <h3 className="section-title">Giỏ hàng</h3>
          <a
            className="nav-link"
            href="/#products"
            onClick={(e) => {
              e.preventDefault();
              navigate("/#products");
            }}
          >
            ← Tiếp tục mua sắm
          </a>
        </div>

        {!token && (
          <div className="alert-box">
            Bạn cần <Link to="/auth">đăng nhập</Link> để xem giỏ hàng.
          </div>
        )}

        {loading && <div className="alert-box">Đang tải giỏ hàng...</div>}
        {message && <div className="alert-box">{message}</div>}

        {!loading && token && (cart.items || []).length === 0 && (
          <div className="alert-box">Giỏ hàng trống.</div>
        )}

        {!loading && token && (cart.items || []).length > 0 && (
          <>
            <div className="hero-card" style={{ display: "grid", gap: 12 }}>
              {(cart.items || []).map((item) => {
                const img =
                  item.image ||
                  item.product?.images?.[0] ||
                  "https://placehold.co/120x90?text=Pokemon";
                const name = item.name || item.product?.name || "Sản phẩm";
                const price = item.price || item.product?.price || 0;
                return (
                  <div
                    key={item.product?._id || item.product}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "100px 1fr auto",
                      gap: 12,
                      alignItems: "center",
                      borderBottom: "1px solid var(--border)",
                      paddingBottom: 10,
                    }}
                  >
                    <img src={img} alt={name} style={{ width: "100%", borderRadius: 8 }} />
                    <div>
                      <div className="product-title">{name}</div>
                      <div className="muted">Giá: {price.toLocaleString("vi-VN")} ₫</div>
                      <div className="muted">Số lượng:</div>
                      <div className="d-flex gap-2">
                        <button
                          className="ghost-btn"
                          onClick={() =>
                            updateQuantity(item.product?._id || item.product, Math.max(1, (item.quantity || 1) - 1))
                          }
                        >
                          -
                        </button>
                        <span style={{ minWidth: 24, textAlign: "center" }}>{item.quantity || 1}</span>
                        <button
                          className="primary-btn"
                          onClick={() =>
                            updateQuantity(item.product?._id || item.product, (item.quantity || 1) + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div className="product-price">
                        {(price * (item.quantity || 1)).toLocaleString("vi-VN")} ₫
                      </div>
                      <button
                        className="ghost-btn"
                        onClick={() => removeItem(item.product?._id || item.product)}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hero-card" style={{ marginTop: 16 }}>
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
                <div className="h5 mb-0">Tạm tính: {subtotal.toLocaleString("vi-VN")} ₫</div>
                <div className="hero-actions">
                  <button
                    className="secondary-btn"
                    type="button"
                    onClick={() => navigate("/#products")}
                  >
                    Tiếp tục mua
                  </button>
                  <button className="cta-btn" onClick={handleCheckout}>
                    Đặt hàng
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
      <Footer />
    </div>
  );
}
