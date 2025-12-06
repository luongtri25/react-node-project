import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const AdminHeader = ({ auth, logout }) => {
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();
  const activeClass = (cond) => (cond ? "active" : "");

  const handleLogout = () => {
    if (logout) logout(navigate);
  };

  const isSection = (targetHash) =>
    pathname === "/admin" && (hash === targetHash || (!hash && targetHash === "#dashboard"));

  return (
    <header className="navbar">
      <div className="nav-inner">
        <div
          className="brand"
          role="button"
          style={{ cursor: "pointer" }}
          onClick={() => {
            navigate("/admin");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          Admin PokeShop3D
        </div>
        <div className="nav-links">
          <a className={`nav-link ${activeClass(isSection("#dashboard"))}`} href="/admin#dashboard">
            Dashboard
          </a>
          <a className={`nav-link ${activeClass(isSection("#products"))}`} href="/admin#products">
            Sản phẩm
          </a>
          <a className={`nav-link ${activeClass(isSection("#orders"))}`} href="/admin#orders">
            Đơn hàng
          </a>
          <a className={`nav-link ${activeClass(isSection("#carts"))}`} href="/admin#carts">
            Giỏ hàng
          </a>
          <a className={`nav-link ${activeClass(isSection("#users"))}`} href="/admin#users">
            Người dùng
          </a>
          <Link className="nav-link" to="/">
            Về trang khách
          </Link>
          {auth?.user && (
            <button className="nav-link" style={{ border: "none", background: "transparent" }} onClick={handleLogout}>
              Đăng xuất
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
