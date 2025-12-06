import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Header = ({ auth, logout }) => {
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();
  const [activeSection, setActiveSection] = useState("#hero");

  const handleLogout = () => {
    if (logout) logout(navigate);
  };

  const isHome = pathname === "/";
  const isSection = (targetHash) =>
    isHome && (activeSection === targetHash || (!hash && targetHash === "#hero"));
  const activeClass = (cond) => (cond ? "active" : "");
  const isCartPage = pathname.startsWith("/cart") || pathname.startsWith("/checkout");
  const isOrdersPage = pathname.startsWith("/orders");
  const isAdminPage = pathname.startsWith("/admin");

  useEffect(() => {
    if (!isHome) return;
    const sections = ["#hero", "#categories", "#products", "#deals", "#about", "#contact", "#order"];
    const handleScroll = () => {
      let current = "#hero";
      const offset = 140;
      sections.forEach((id) => {
        const el = document.querySelector(id);
        if (el) {
          const { top } = el.getBoundingClientRect();
          if (top - offset <= 0) {
            current = id;
          }
        }
      });
      setActiveSection(current);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  return (
    <>
      <div className="topbar">
        <div className="container topbar-inner">
          <span>Hotline: 1900 0099 | Zalo/Facebook: nShop Pokemon</span>
          <span>Freeship đơn từ 499k • Nhận in theo file bạn gửi</span>
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
            <Link className={`nav-link ${activeClass(isHome)}`} to="/">
              Trang chủ
            </Link>
            <a className={`nav-link ${activeClass(isSection("#categories"))}`} href="/#categories">
              Danh mục
            </a>
            <a className={`nav-link ${activeClass(isSection("#products"))}`} href="/#products">
              Sản phẩm
            </a>
            <a className={`nav-link ${activeClass(isSection("#deals"))}`} href="/#deals">
              Ưu đãi
            </a>
            <a className={`nav-link ${activeClass(isSection("#about"))}`} href="/#about">
              Giới thiệu
            </a>
            <a className={`nav-link ${activeClass(isSection("#contact"))}`} href="/#contact">
              Liên hệ
            </a>
            <Link className={`nav-link ${activeClass(isCartPage)}`} to="/cart">
              Giỏ hàng
            </Link>
            {auth?.token && (
              <Link className={`nav-link ${activeClass(isOrdersPage)}`} to="/orders">
                Lịch sử đơn
              </Link>
            )}
            {auth?.user?.role === "admin" && (
              <Link className={`nav-link ${activeClass(isAdminPage)}`} to="/admin">
                Admin
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
