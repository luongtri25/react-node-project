import React, { useEffect, useMemo, useState } from "react";
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
  const [variantId, setVariantId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (text, type = "info") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 2000);
  };

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

  const selectedVariant = useMemo(() => {
    if (!product) return null;
    const variants = product.variants || [];
    if (!variants.length) return null;
    return variants.find((v) => v.variantId === variantId) || variants[0];
  }, [product, variantId]);

  useEffect(() => {
    if (!product) return;
    const variantImages = selectedVariant?.images || [];
    const baseImages = product.images || [];
    const nextImage = variantImages[0] || product.thumbnail || baseImages[0] || null;
    setSelectedImage(nextImage);
  }, [product, selectedVariant]);

  const handleAddToCart = async () => {
    if (!auth?.token) {
      showToast("Vui lòng đăng nhập để thêm giỏ hàng", "error");
      return;
    }
    if (!selectedVariant) {
      showToast("Chưa chọn phiên bản", "error");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
          variantId: selectedVariant.variantId,
          attributes: {
            variantId: selectedVariant.variantId,
            sizeCm: selectedVariant.sizeCm?.toString() || "",
            sku: selectedVariant.sku || "",
          },
        }),
      });
      if (!res.ok) throw new Error("Thêm giỏ thất bại");
      showToast("Đã thêm vào giỏ", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const galleryImages = useMemo(() => {
    const variantImages = selectedVariant?.images || [];
    const baseImages = product?.images || [];
    const thumb = product?.thumbnail ? [product.thumbnail] : [];
    const all = [...variantImages, ...thumb, ...baseImages];
    return all.filter((img, idx) => img && all.indexOf(img) === idx);
  }, [product, selectedVariant]);

  const primaryImage =
    selectedImage ||
    (selectedVariant?.images && selectedVariant.images[0]) ||
    product?.thumbnail ||
    (Array.isArray(product?.images) && product.images.length ? product.images[0] : null) ||
    "https://placehold.co/600x400?text=Pokemon";

  const price = selectedVariant?.price ?? product?.minPrice;
  const originalPrice = selectedVariant?.originalPrice;
  const stock = selectedVariant?.stock ?? product?.stockTotal;

  return (
    <div className="page">
      <Header auth={auth} logout={logout} />
      {toast && <div className={`toast ${toast.type}`}>{toast.text}</div>}
      <section className="section">
        {loading && <div className="alert-box">Đang tải sản phẩm...</div>}
        {error && <div className="alert-box">Lỗi: {error}</div>}
        {product && (
          <div className="hero-card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <img src={primaryImage} alt={product.name} style={{ width: "100%", borderRadius: 16 }} />
              {galleryImages.length > 1 && (
                <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  {galleryImages.map((img) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className={`ghost-btn ${selectedImage === img ? "active" : ""}`}
                      style={{
                        padding: 0,
                        borderRadius: 10,
                        overflow: "hidden",
                        border: selectedImage === img ? "2px solid var(--primary)" : "1px solid var(--border)",
                      }}
                    >
                      <img src={img} alt="thumb" style={{ width: 70, height: 70, objectFit: "cover" }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div className="chip">{product.category}</div>
              <h2 className="section-title" style={{ margin: "8px 0" }}>
                {product.name}
              </h2>
              <p className="muted">{product.description}</p>

              {product.variants?.length > 0 && (
                <div style={{ margin: "12px 0" }}>
                  <div className="muted" style={{ marginBottom: 8 }}>Chọn kích thước</div>
                  <div className="hero-actions" style={{ gap: 8, flexWrap: "wrap" }}>
                    {product.variants.map((v) => (
                      <button
                        key={v.variantId}
                        type="button"
                        className={`filter-chip ${selectedVariant?.variantId === v.variantId ? "active" : ""}`}
                        onClick={() => setVariantId(v.variantId)}
                      >
                        {v.sizeCm ? `${v.sizeCm} cm` : v.variantId}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="h4" style={{ color: "#d53f3f" }}>
                {formatPrice(price)}
                {originalPrice && originalPrice > price ? (
                  <span className="muted" style={{ marginLeft: 8, textDecoration: "line-through", fontSize: 16 }}>
                    {formatPrice(originalPrice)}
                  </span>
                ) : null}
              </div>

              <div className="muted">Tồn kho: {typeof stock === "number" ? stock : "N/A"}</div>
              {selectedVariant?.sku && <div className="muted">SKU: {selectedVariant.sku}</div>}

              <div className="hero-actions" style={{ marginTop: 16 }}>
                <button className="cta-btn" onClick={handleAddToCart}>
                  Thêm giỏ
                </button>
                <button className="secondary-btn" onClick={() => navigate(-1)}>
                  Quay lại
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
