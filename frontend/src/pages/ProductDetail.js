// src/pages/ProductDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "../App.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

function formatPrice(v) {
  if (typeof v !== "number") return "Liên hệ";
  return `${v.toLocaleString("vi-VN")} ₫`;
}

export default function ProductDetail({ auth, logout }) {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Nhận dữ liệu trước từ HomePage (truyền qua navigate)
  const initialProduct = location.state?.product || null;

  const [product, setProduct] = useState(initialProduct);
  const [variantId, setVariantId] = useState(null);
  const [activeType, setActiveType] = useState("thumbnail");
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (text, type = "info") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 2000);
  };

  // ✅ Fetch lại 1 lần để update ngầm từ server
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        if (!initialProduct) setLoading(true);
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
  }, [id, initialProduct]);

  // ✅ Mặc định chọn variant đầu + thumbnail
  useEffect(() => {
    if (!product) return;

    const firstVariant = product.variants?.[0];
    if (firstVariant) {
      setVariantId(firstVariant.variantId);
    }

    setActiveType("thumbnail");
  }, [product]);

  // ✅ Variant đang chọn
  const selectedVariant = useMemo(() => {
    if (!product) return null;
    return (
      product.variants?.find((v) => v.variantId === variantId) ||
      product.variants?.[0]
    );
  }, [product, variantId]);

  // ✅ Map size → image
  const sizeImageMap = useMemo(() => {
    const map = {};
    product?.variants?.forEach((v) => {
      if (v.sizeCm && v.images?.[0]) {
        map[v.sizeCm] = v.images[0];
      }
    });
    return map;
  }, [product]);

  // ✅ Ảnh chính
  const primaryImage = useMemo(() => {
    if (!product) {
      return "https://placehold.co/600x400?text=Pokemon";
    }

    const fallback =
      product.thumbnail ||
      product.images?.[0] ||
      "https://placehold.co/600x400?text=Pokemon";

    if (activeType === "thumbnail") return fallback;

    const size = Number(activeType);
    return sizeImageMap[size] || fallback;
  }, [product, activeType, sizeImageMap]);

  const price = selectedVariant?.price ?? product?.minPrice;
  const originalPrice = selectedVariant?.originalPrice;
  const stock = selectedVariant?.stock ?? product?.stockTotal;

  // ✅ Click chọn size
  const handleSelectVariant = (v) => {
    setVariantId(v.variantId);
    setActiveType(String(v.sizeCm));
  };

  // ✅ Click thumbnail
  const handleClickThumb = (type) => {
    setActiveType(type);

    if (type !== "thumbnail" && product) {
      const size = Number(type);
      const v = product.variants?.find((x) => x.sizeCm === size);
      if (v) setVariantId(v.variantId);
    }
  };

  // ✅ Add to cart
  const handleAddToCart = async () => {
    if (!auth?.token) {
      showToast("Vui lòng đăng nhập", "error");
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
          variantId: selectedVariant.variantId,
          quantity: 1,
        }),
      });
      if (!res.ok) throw new Error("Thêm giỏ thất bại");
      showToast("Đã thêm vào giỏ", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <div className="page">
      <Header auth={auth} logout={logout} />
      {toast && <div className={`toast ${toast.type}`}>{toast.text}</div>}

      <section className="section">
        {loading && !product && (
          <div className="alert-box">Đang tải sản phẩm...</div>
        )}
        {error && <div className="alert-box">Lỗi: {error}</div>}

        {product && (
          <div
            className="hero-card"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}
          >
            {/* Ảnh */}
            <div>
              <img
                src={primaryImage}
                alt={product.name}
                style={{ width: "100%", borderRadius: 16 }}
              />

              {/* Thumbnail cố định 4 ảnh */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 10,
                  flexWrap: "wrap",
                }}
              >
                {/* Main thumbnail */}
                {product.thumbnail && (
                  <button
                    onClick={() => handleClickThumb("thumbnail")}
                    style={{
                      border:
                        activeType === "thumbnail"
                          ? "2px solid var(--primary)"
                          : "1px solid var(--border)",
                      borderRadius: 10,
                    }}
                  >
                    <img
                      src={product.thumbnail}
                      alt="thumb"
                      style={{ width: 70, height: 70 }}
                    />
                  </button>
                )}

                {/* Size 3 */}
                {sizeImageMap[3] && (
                  <button
                    onClick={() => handleClickThumb("3")}
                    style={{
                      border:
                        activeType === "3"
                          ? "2px solid var(--primary)"
                          : "1px solid var(--border)",
                      borderRadius: 10,
                    }}
                  >
                    <img
                      src={sizeImageMap[3]}
                      alt="3cm"
                      style={{ width: 70, height: 70 }}
                    />
                  </button>
                )}

                {/* Size 5 */}
                {sizeImageMap[5] && (
                  <button
                    onClick={() => handleClickThumb("5")}
                    style={{
                      border:
                        activeType === "5"
                          ? "2px solid var(--primary)"
                          : "1px solid var(--border)",
                      borderRadius: 10,
                    }}
                  >
                    <img
                      src={sizeImageMap[5]}
                      alt="5cm"
                      style={{ width: 70, height: 70 }}
                    />
                  </button>
                )}

                {/* Size 10 */}
                {sizeImageMap[10] && (
                  <button
                    onClick={() => handleClickThumb("10")}
                    style={{
                      border:
                        activeType === "10"
                          ? "2px solid var(--primary)"
                          : "1px solid var(--border)",
                      borderRadius: 10,
                    }}
                  >
                    <img
                      src={sizeImageMap[10]}
                      alt="10cm"
                      style={{ width: 70, height: 70 }}
                    />
                  </button>
                )}
              </div>
            </div>

            {/* Info */}
            <div>
              <div className="chip">{product.category}</div>
              <h2 className="section-title">{product.name}</h2>
              <p className="muted">{product.description}</p>

              {/* Chọn size */}
              {product.variants?.length > 0 && (
                <div style={{ margin: "12px 0" }}>
                  <div className="muted">Chọn kích thước</div>
                  <div
                    className="hero-actions"
                    style={{ gap: 8, flexWrap: "wrap" }}
                  >
                    {product.variants.map((v) => (
                      <button
                        key={v.variantId}
                        className={`filter-chip ${
                          selectedVariant?.variantId === v.variantId
                            ? "active"
                            : ""
                        }`}
                        onClick={() => handleSelectVariant(v)}
                      >
                        {v.sizeCm} cm
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Giá */}
              <div className="h4" style={{ color: "#d53f3f" }}>
                {formatPrice(price)}
                {originalPrice && originalPrice > price && (
                  <span
                    className="muted"
                    style={{
                      marginLeft: 8,
                      textDecoration: "line-through",
                      fontSize: 16,
                    }}
                  >
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>

              {/* Tồn kho */}
              <div className="muted">Tồn kho: {stock ?? "N/A"}</div>

              {/* Actions */}
              <div className="hero-actions" style={{ marginTop: 16 }}>
                <button className="cta-btn" onClick={handleAddToCart}>
                  Thêm giỏ
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => navigate(-1)}
                >
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
