import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../App.css";

export default function CartPage({ auth, logout }) {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const token = auth?.token;

  const showToast = (text, type = "info") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 2000);
  };

  const apiFetch = useCallback(
    (url, options = {}) =>
      fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }),
    [token]
  );

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
        if (!cancelled) showToast(err.message, "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [token, apiFetch]);

  const currency = (value) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);

  const getVariantFromItem = (item) => {
    const attr = item.attributes || {};
    const variantId = attr.variantId || attr.get?.("variantId") || null;
    const variants = item.product?.variants || [];
    if (variantId) return variants.find((v) => v.variantId === variantId) || variants[0];
    return variants[0];
  };

  const getLinePrice = (item) => {
    const variant = getVariantFromItem(item);
    if (typeof item.price === "number") return item.price;
    if (variant?.price) return variant.price;
    if (typeof item.product?.minPrice === "number") return item.product.minPrice;
    return item.product?.price || 0;
  };

  const subtotal = useMemo(() => {
    return (cart.items || []).reduce((sum, item) => {
      const price = getLinePrice(item);
      return sum + price * (item.quantity || 1);
    }, 0);
  }, [cart.items]);

  const updateQuantity = async (productId, quantity, variantId) => {
    if (!token) return;
    try {
      const res = await apiFetch("http://localhost:5000/api/cart", {
        method: "POST",
        body: JSON.stringify({ productId, quantity, variantId }),
      });
      if (!res.ok) throw new Error("Cập nhật thất bại");
      const data = await res.json();
      setCart(data);
    } catch (err) {
      showToast(err.message, "error");
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
      showToast(err.message, "error");
    }
  };

  const handleCheckout = () => {
    if (!token) {
      navigate("/auth");
      return;
    }
    navigate("/checkout");
  };

  return (
    <div className="page">
      <Header auth={auth} logout={logout} />
      {toast && <div className={`toast ${toast.type}`}>{toast.text}</div>}
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

        {!loading && token && (cart.items || []).length === 0 && (
          <div className="alert-box">
            Giỏ hàng trống. <button className="secondary-btn" onClick={() => navigate('/#products')}>Xem sản phẩm</button>
          </div>
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
                const variant = getVariantFromItem(item);
                const price = getLinePrice(item);
                const attrs = item.attributes || {};
                const attrVariant = attrs.variantId || attrs.get?.("variantId");
                const sizeCm = attrs.sizeCm || attrs.get?.("sizeCm");
                const available = item.product?.stock ?? item.stock ?? null;

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
                      <div className="muted">Giá: {currency(price)}</div>
                      {(attrVariant || sizeCm) && (
                        <div className="muted">
                          Phiên bản: {sizeCm ? `${sizeCm} cm` : attrVariant}
                        </div>
                      )}
                      {available !== null && (
                        <div className="muted">Tồn kho: {available > 0 ? available : 'Hết hàng'}</div>
                      )}

                      <div className="muted">Số lượng:</div>
                      <div className="d-flex gap-2" aria-label={`Số lượng cho ${name}`}>
                        <button
                          className="ghost-btn"
                          aria-label="Giảm"
                          onClick={() =>
                            updateQuantity(
                              item.product?._id || item.product,
                              Math.max(1, (item.quantity || 1) - 1),
                              attrVariant || variant?.variantId
                            )
                          }
                        >
                          -
                        </button>
                        <span style={{ minWidth: 24, textAlign: "center" }}>{item.quantity || 1}</span>
                        <button
                          className="primary-btn"
                          aria-label="Tăng"
                          onClick={() =>
                            updateQuantity(
                              item.product?._id || item.product,
                              (item.quantity || 1) + 1,
                              attrVariant || variant?.variantId
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div className="product-price">{currency(price * (item.quantity || 1))}</div>
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
                <div className="h5 mb-0">Tạm tính: {currency(subtotal)}</div>
                <div className="hero-actions">
                  <button
                    className="secondary-btn"
                    type="button"
                    onClick={() => navigate("/#products")}
                  >
                    Tiếp tục mua
                  </button>
                  <button className="cta-btn" onClick={handleCheckout} aria-label="Đặt hàng">
                    Đặt hàng
                  </button>
                </div>
              </div>
              <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
                Lưu ý: Vui lòng kiểm tra lại số lượng và phiên bản trước khi đặt.
              </div>
            </div>
          </>
        )}
      </section>
      <Footer />
    </div>
  );
}
