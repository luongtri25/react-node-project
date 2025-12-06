import React from "react";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="brand" style={{ color: "#e8eefc" }}>
            <span>PKM</span> PokeShop 3D
          </div>
          <p style={{ color: "#c3cbe3" }}>
            Mô hình Pokémon 3D, Pokéball LED, diorama, nhận in theo file gửi.
          </p>
        </div>

        <div>
          <h5>Dịch vụ</h5>
          <p className="muted" style={{ color: "#c3cbe3" }}>
            In theo yêu cầu, phối màu, đóng gói quà tặng, giao toàn quốc.
          </p>
        </div>

        <div>
          <h5>Liên hệ</h5>
          <p style={{ color: "#c3cbe3" }}>
            Hotline: 0388638853
            <br />
            Zalo/Facebook: nShop Pokémon
            <br />
            Email: pinguyen023@gmail.com
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
