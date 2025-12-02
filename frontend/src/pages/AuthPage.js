import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function AuthPage({ auth, setAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    const endpoint =
      mode === "register"
        ? "http://localhost:5000/api/auth/register"
        : "http://localhost:5000/api/auth/login";
    const payload = mode === "register"
      ? { name: form.name, email: form.email, password: form.password }
      : { email: form.email, password: form.password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Auth failed");
      setAuth({ token: data.token, user: data.user });
      setMessage(mode === "login" ? "Đăng nhập thành công" : "Đăng ký thành công");
      // redirect home sau 1s
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="page">
      <Header />
      <section className="section">
        <div className="section-header">
          <h3 className="section-title">Đăng nhập / Đăng ký</h3>
        </div>
        <form
          className="newsletter"
          onSubmit={handleSubmit}
          style={{ gridTemplateColumns: "1fr" }}
          autoComplete="off"
        >
          <div className="auth-toggle">
            <button
              type="button"
              className={`filter-chip ${mode === "login" ? "active" : ""}`}
              onClick={() => setMode("login")}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              className={`filter-chip ${mode === "register" ? "active" : ""}`}
              onClick={() => setMode("register")}
            >
              Đăng ký
            </button>
          </div>
          {mode === "register" && (
            <input
              name="name"
              placeholder="Tên của bạn"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          )}
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            name="password"
            type="password"
            placeholder="Mật khẩu"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button type="submit">{mode === "login" ? "Đăng nhập" : "Đăng ký"}</button>
          {auth?.user && (
            <div className="alert-box" style={{ marginTop: 8 }}>
              Đang đăng nhập: {auth.user.email} ({auth.user.role || "user"})
            </div>
          )}
          {message && (
            <div className="alert-box" style={{ marginTop: 8 }}>
              {message}
            </div>
          )}
        </form>
      </section>
      <Footer />
    </div>
  );
}
