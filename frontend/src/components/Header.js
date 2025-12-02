import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = ({ auth, logout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (logout) logout(navigate);
  };

  return (
    <>
      <div className="topbar">
        <div className="container topbar-inner">
          <span>Hotline: 1900 0099 | Zalo/Facebook: nShop PokAcmon</span>
          <span>Freeship đơn từ 499k · Nhận in theo file bạn gửi</span>
          <div className="topbar-auth">
            {auth?.user ? (
              <>
                <span className="user-email">{auth.user.email}</span>
                <button className="btn btn-sm btn-outline-light" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </>
            ) : (
              <Link className="btn btn-sm btn-outline-light" to="/auth">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>

      <header className="navbar">
        <div className="nav-inner">
          <div
            className="brand"
            role="button"
            style={{ cursor: "pointer" }}
            onClick={() => {
              navigate("/");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            PokeShop3D
          </div>
          <div className="nav-links">
            <a className="nav-link" href="/#hero">
              Trang chủ
            </a>
            <a className="nav-link" href="/#categories">
              Danh mục
            </a>
            <a className="nav-link" href="/#products">
              Sản phẩm
            </a>
            <a className="nav-link" href="/#deals">
              Ưu đãi
            </a>
            <a className="nav-link" href="/#about">
              Giới thiệu
            </a>
            <a className="nav-link" href="/#contact">
              Liên hệ
            </a>
            <a className="cta-btn" href="/#order">
              Đặt in nhanh
            </a>
            <Link className="nav-link" to="/cart">
              Giỏ hàng
            </Link>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
