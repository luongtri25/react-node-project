import React from "react";

function formatPrice(v) {
  return `${v.toLocaleString("vi-VN")} ₫`;
}

const ProductCard = ({ product }) => {
  // Ưu tiên image (fallbackProducts), nếu không có thì lấy images[0] từ DB
  const imageSrc =
    product.image ||
    (Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : undefined);

  return (
    <div className="product-card">
      <img src={imageSrc} alt={product.name} />
      <div className="product-body">
        <div className="chip" style={{ width: "fit-content" }}>
          {product.category}
        </div>
        <h4 className="product-title">{product.name}</h4>
        <div className="product-meta">
          <span>{product.description || product.tagline || "Mô hình Pokémon 3D"}</span>
          <span role="img" aria-label="rating">
            ⭐ 4.9
          </span>
        </div>
        <div className="product-price">
          {product.price ? formatPrice(product.price) : "Liên hệ"}
        </div>
        <div className="product-actions">
          <button className="ghost-btn">Xem chi tiết</button>
          <button className="primary-btn">Đặt ngay</button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
