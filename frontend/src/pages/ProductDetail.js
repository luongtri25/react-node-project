import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../App.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

function formatPrice(v) {
  if (typeof v !== "number") return "Liên hệ";
  return `${v.toLocaleString("vi-VN")} ₫`;
}

export default function ProductDetail({ auth, logout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = await res.json();
        if (!cancelled) setProduct(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleAddToCart = async () => {
    if (!auth?.token) {
      setMessage("Vui lòng đăng nhập để thêm giỏ");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ productId: product._id, quantity: 1 }),
      });
      if (!res.ok) throw new Error("Thêm giỏ thất bại");
      setMessage("Đã thêm vào giỏ");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const image =
    product?.image ||
    (Array.isArray(product?.images) && product.images.length ? product.images[0] : null) ||
    "https://placehold.co/600x400?text=Pokemon";

  return (
    <div className="page">
      <Header auth={auth} logout={logout} />
      <section className="section">
        {loading && <div className="alert-box">Đang tải sản phẩm...</div>}
        {error && <div className="alert-box">Lỗi: {error}</div>}
        {product && (
          <div className="hero-card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <img src={image} alt={product.name} style={{ width: "100%", borderRadius: 16 }} />
            </div>
            <div>
              <div className="chip">{product.category}</div>
              <h2 className="section-title" style={{ margin: "8px 0" }}>
                {product.name}
              </h2>
              <p className="muted">{product.description}</p>
              <div className="h4" style={{ color: "#d53f3f" }}>
                {formatPrice(product.price)}
              </div>
              <div className="muted">Tồn kho: {product.stock ?? "N/A"}</div>
              <div className="hero-actions" style={{ marginTop: 16 }}>
                <button className="cta-btn" onClick={handleAddToCart}>
                  Thêm giỏ
                </button>
                <button className="secondary-btn" onClick={() => navigate(-1)}>
                  Quay lại
                </button>
              </div>
              {message && <div className="alert-box" style={{ marginTop: 12 }}>{message}</div>}
            </div>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
