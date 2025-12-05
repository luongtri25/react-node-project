import React from "react";
import { Link } from "react-router-dom";

const currency = (v) =>
  typeof v === "number" ? `${v.toLocaleString("vi-VN")} ₫` : "Liên hệ";

const ProductCard = ({ product, onAddToCart }) => {
  const id = product._id || product.id;
  const min = product.minPrice ?? product.price ?? product.variants?.[0]?.price;
  const max = product.maxPrice ?? min;
  const priceLabel = min === max ? currency(min) : `${currency(min)} - ${currency(max)}`;
  const primaryImage =
    product.thumbnail ||
    (product.images && product.images[0]) ||
    (product.variants?.[0]?.images && product.variants[0].images[0]) ||
    "https://placehold.co/400x300?text=Pokemon";
  const rating = product.rating ?? 0;
  const reviews = product.reviewsCount ?? 0;

  return (
    <div className="product-card">
      <img src={primaryImage} alt={product.name} />
      <div className="product-body">
        <div className="chip" style={{ width: "fit-content" }}>
          {product.category || "Pokemon"}
        </div>
        <h4 className="product-title">{product.name}</h4>
        <div className="product-meta" style={{ gap: 8 }}>
          <span className="muted" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {product.description || product.pokemon || "Mô hình Pokemon 3D"}
          </span>
          <span role="img" aria-label="rating">
            {rating ? `${rating.toFixed(1)}★` : "Mới"} {reviews ? `(${reviews})` : ""}
          </span>
        </div>
        <div className="product-price">{priceLabel}</div>
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
