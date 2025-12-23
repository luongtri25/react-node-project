// src/pages/HomePage.js
import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import "../App.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";

const benefits = [
  { title: "Freeship từ 499k", desc: "Giao nhanh toàn quốc, cập nhật mã vận đơn", icon: "🚚" },
  { title: "In theo yêu cầu", desc: "Nhận file bạn gửi, hỗ trợ chỉnh sửa và phối màu", icon: "🖨️" },
  { title: "Đóng gói an toàn", desc: "Chống sốc, kèm hướng dẫn bảo quản", icon: "📦" },
  { title: "Hỗ trợ 1-1", desc: "Chat ngay được tư vấn mẫu và cách thức", icon: "💬" },
];

function HomePage({ auth, logout }) {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
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
        const res = await fetch("http://localhost:5000/api/products");
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const body = await res.json();
        const items = body.data ?? body;
        if (!cancelled && Array.isArray(items) && items.length) {
          setProducts(items);
        }
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
  }, []);

  const apiFetch = (url, options = {}) =>
    fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}),
      },
    });

  const handleAddToCart = async (product) => {
    if (!auth?.token) {
      showToast("Vui lòng đăng nhập để thêm vào giỏ.", "error");
      return;
    }
    const variant = product.variants?.[0];
    try {
      const res = await apiFetch("http://localhost:5000/api/cart", {
        method: "POST",
        body: JSON.stringify({
          productId: product._id || product.id,
          variantId: variant?.variantId,
          quantity: 1,
          attributes: variant
            ? {
                variantId: variant.variantId,
                sizeCm: variant.sizeCm?.toString() || "",
                sku: variant.sku || "",
              }
            : {},
        }),
      });
      if (!res.ok) throw new Error("Thêm giỏ thất bại");
      showToast("Đã thêm vào giỏ", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const categories = useMemo(() => {
    const base = ["all"];
    products.forEach((p) => {
      if (p.category && !base.includes(p.category)) base.push(p.category);
    });
    return base;
  }, [products]);

  // Scroll to hash (e.g., /#products) when page loads or hash changes
  useEffect(() => {
    if (location.hash) {
      const target = document.querySelector(location.hash);
      if (target) {
        setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      }
    }
  }, [location]);

  const filteredProducts =
    filter === "all"
      ? products
      : products.filter((p) => (p.category || "").toLowerCase() === filter.toLowerCase());

  return (
    <div className="page">
      <Header auth={auth} logout={logout} />
      {toast && <div className={`toast ${toast.type}`}>{toast.text}</div>}

      <section id="hero" className="hero">
        <div className="hero-card">
          <div className="pill">Pokemon Store & Mô hình 3D</div>
          <h1>
            Bật trọn bộ Pokemon,
            <br />
            in 3D sống động, giao nhanh.
          </h1>
          <p>
            Hơn 1500 mẫu Pokemon, combo Pokeball, diorama LED. Đóng gói chống sốc, hỗ trợ phối màu
            theo yêu cầu.
          </p>
          <div className="hero-actions">
            <button className="cta-btn">Mua ngay</button>
            <button className="secondary-btn">Xem bảng giá</button>
          </div>
          <div className="stats">
            <div className="stat-box">
              <div className="value">4.9★</div>
              <div className="muted">Đánh giá từ fan</div>
            </div>
            <div className="stat-box">
              <div className="value">1500+</div>
              <div className="muted">Mẫu Pokemon</div>
            </div>
            <div className="stat-box">
              <div className="value">24h</div>
              <div className="muted">Xử lý đơn</div>
            </div>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="https://placehold.co/900x540/0e1a36/ffffff?text=Pokemon+Diorama+nShop"
            alt="Pokemon display"
          />
          <div className="badge-floating">Best seller tháng này</div>
        </div>
      </section>

      <section id="categories" className="section">
        <div className="section-header">
          <div>
            <h3 className="section-title">Danh mục nổi bật</h3>
            <p className="section-sub">Mô hình 3D • Legendary • Combo set • Phụ kiện Pokeball</p>
          </div>
          <a className="nav-link" href="#products">
            Xem tất cả →
          </a>
        </div>
        <div className="grid grid-4">
          <div className="category-card">
            <div className="chip">Mô hình 3D</div>
            <h4>Figurine Pokemon</h4>
            <p className="muted">Pikachu, Eevee, starter gen 1-9, phiên bản mới</p>
          </div>
          <div className="category-card">
            <div className="chip">Legendary</div>
            <h4>Rồng / Huyền thoại</h4>
            <p className="muted">Mewtwo, Rayquaza, trio chim, sơn metallic</p>
          </div>
          <div className="category-card">
            <div className="chip">Combo</div>
            <h4>Set tiến hóa</h4>
            <p className="muted">Eevee evolution, starter pack, box gift</p>
          </div>
          <div className="category-card">
            <div className="chip">Phụ kiện</div>
            <h4>Pokeball & Diorama</h4>
            <p className="muted">Ball LED, đế mica, cảnh mini kèm đèn</p>
          </div>
        </div>
      </section>

      <section id="products" className="section">
        <div className="section-header">
          <div>
            <h3 className="section-title">Sản phẩm Pokemon</h3>
            <p className="section-sub">Chọn nhanh theo danh mục hoặc xem tất cả</p>
          </div>
          <div className="filters">
            {categories.map((c) => (
              <button
                key={c}
                className={`filter-chip ${filter === c ? "active" : ""}`}
                onClick={() => setFilter(c)}
              >
                {c === "all" ? "Tất cả" : c}
              </button>
            ))}
          </div>
        </div>

        {loading && <div className="alert-box">Đang tải sản phẩm...</div>}
        {error && <div className="alert-box">Lỗi tải sản phẩm: {error}</div>}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="alert-box">Hiện chưa có sản phẩm trong mục này.</div>
        )}

        <div className="grid grid-4">
          {filteredProducts.map((p) => (
            <ProductCard key={p._id || p.id} product={p} onAddToCart={handleAddToCart} />
          ))}
        </div>
      </section>

      <section id="deals" className="section">
        <div className="deal-banner">
          <div>
            <h3>Deal Pokemon cuối tuần</h3>
            <p>Giảm 15% cho combo Pokeball + figurine, áp dụng tới Chủ nhật.</p>
            <div className="hero-actions">
              <button className="cta-btn">Nhận ưu đãi</button>
              <button className="secondary-btn">Xem chi tiết</button>
            </div>
          </div>
          <div className="alert-box" style={{ textAlign: "left" }}>
            <strong>Bonus:</strong> Tặng kèm sticker pack Pokemon cho đơn từ 300k.
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h3 className="section-title">Vì sao chọn PokeShop 3D?</h3>
        </div>
        <div className="benefits">
          {benefits.map((b) => (
            <div className="benefit-card" key={b.title}>
              <div style={{ fontSize: 24 }}>{b.icon}</div>
              <div>
                <div className="product-title">{b.title}</div>
                <div className="muted">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="section">
        <div className="section-header">
          <h3 className="section-title">Giới thiệu</h3>
        </div>
        <p className="muted">
          PokeShop 3D chuyên mô hình Pokemon in 3D, Pokeball LED, diorama. Chất liệu PLA+ và resin,
          kiểm soát chi tiết sắc nét, đóng gói chống sốc và giao toàn quốc.
        </p>
      </section>

      <section id="contact" className="section">
        <div className="section-header">
          <h3 className="section-title">Liên hệ</h3>
        </div>
        <p>Hotline: 1900 0099 • Zalo/Facebook: nShop Pokemon • Email: support@pokeshop.vn</p>
        <div className="hero-actions">
          <a className="cta-btn" href="https://zalo.me/" target="_blank" rel="noreferrer">
            Chat Zalo
          </a>
          <a className="secondary-btn" href="https://www.facebook.com/ri.to.39904/" target="_blank" rel="noreferrer">
            Facebook
          </a>
        </div>
      </section>

      <section className="section">
        <div className="newsletter">
          <div>
            <h4 className="section-title" style={{ fontSize: 20 }}>
              Nhận tin Pokemon & ưu đãi
            </h4>
            <p className="muted" style={{ margin: 0 }}>
              Giảm 10% cho đơn đầu tiên, cập nhật mẫu mới mỗi tuần.
            </p>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "2fr 1fr" }}>
            <input type="email" placeholder="Email của bạn" />
            <button>Đăng ký</button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default HomePage;

