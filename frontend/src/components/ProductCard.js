import React from "react";
import { Link } from "react-router-dom";

function formatPrice(v) {
  if (typeof v !== "number") return "Liên hệ";
  return `${v.toLocaleString("vi-VN")} ₫`;
}

const ProductCard = ({ product, onAddToCart }) => {
  const id = product._id || product.id;
  const imageSrc =
    product.image ||
    (Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : undefined) ||
    "https://placehold.co/400x300?text=Pokemon";

  return (
    <div className="product-card">
      <img src={imageSrc} alt={product.name} />
      <div className="product-body">
        <div className="chip" style={{ width: "fit-content" }}>
          {product.category || "Pokemon"}
        </div>
        <h4 className="product-title">{product.name}</h4>
        <div className="product-meta">
          <span>{product.description || product.tagline || "Mô hình Pokémon 3D"}</span>
          <span role="img" aria-label="rating">
            ⭐ 4.9
          </span>
        </div>
        <div className="product-price">{formatPrice(product.price)}</div>
        <div className="product-actions">
          <Link className="ghost-btn" to={`/product/${id}`}>
            Xem chi tiết
          </Link>
          <button
            type="button"
            className="primary-btn"
            onClick={() => onAddToCart && onAddToCart(product)}
            disabled={!onAddToCart}
          >
            Thêm giỏ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
