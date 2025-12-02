import React from "react";

const Header = () => {
  return (
    <>
      <div className="topbar">
        <div className="container">
          <span>Hotline: 1900 0099 | Zalo/Facebook: nShop Pokémon</span>
          <span>Freeship đơn từ 499k · Nhận in theo file bạn gửi</span>
        </div>
      </div>

      <header className="navbar">
        <div className="nav-inner">
          <div className="brand">
            <span>PKM</span> PokeShop 3D
          </div>
          <div className="nav-links">
            <a className="nav-link" href="#hero">
              Trang chủ
            </a>
            <a className="nav-link" href="#categories">
              Danh mục
            </a>
            <a className="nav-link" href="#products">
              Sản phẩm
            </a>
            <a className="nav-link" href="#deals">
              Ưu đãi
            </a>
            <a className="nav-link" href="#about">
              Giới thiệu
            </a>
            <a className="nav-link" href="#contact">
              Liên hệ
            </a>
            <a className="cta-btn" href="#order">
              Đặt in nhanh
            </a>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
