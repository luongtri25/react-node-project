import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function AuthPage({ auth, setAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  // If already logged in, redirect by role
  useEffect(() => {
    if (!auth?.user) return;
    if (auth.user.role === "admin") navigate("/admin");
    else navigate("/");
  }, [auth, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const endpoint =
      mode === "register"
        ? "http://localhost:5000/api/auth/register"
        : "http://localhost:5000/api/auth/login";

    const payload =
      mode === "register"
        ? { name: form.name.trim(), email: form.email.trim(), password: form.password }
        : { email: form.email.trim(), password: form.password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Auth failed");

      setAuth({ token: data.token, user: data.user });
      setMessage(mode === "login" ? "Đăng nhập thành công" : "Đăng ký thành công");

      if (mode === "login" && data?.user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setMessage(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  // Load Google Identity Services script
  useEffect(() => {
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      if (window.google) setGoogleReady(true);
      else existing.onload = () => setGoogleReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleReady(true);
    document.body.appendChild(script);
  }, []);

  const handleGoogleResponse = useCallback(
    async (response) => {
      setMessage(null);
      setGoogleLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: response.credential }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.message || "Google login failed");

        setAuth({ token: data.token, user: data.user });
        if (data?.user?.role === "admin") navigate("/admin");
        else navigate("/");
      } catch (err) {
        setMessage(err.message || "Có lỗi xảy ra");
      } finally {
        setGoogleLoading(false);
      }
    },
    [navigate, setAuth]
  );

  // Initialize and render Google button when script + env ready
  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!googleReady || !window.google || !clientId) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleResponse,
    });
    const btn = document.getElementById("google-btn");
    if (btn) {
      btn.innerHTML = "";
      window.google.accounts.id.renderButton(btn, {
        theme: "outline",
        size: "large",
        width: "100%",
      });
    }
  }, [googleReady, handleGoogleResponse]);

  return (
    <div className="page">
      <Header auth={auth} />
      <section className="section">
        <div className="section-header">
          <h3 className="section-title">Đăng nhập / Đăng ký</h3>
        </div>

        <form
          className="newsletter"
          onSubmit={handleSubmit}
          style={{ gridTemplateColumns: "1fr", gap: 12 }}
          autoComplete="off"
        >
          <div className="auth-toggle" role="tablist" aria-label="Chọn chế độ">
            <button
              type="button"
              className={`filter-chip ${mode === "login" ? "active" : ""}`}
              onClick={() => setMode("login")}
              aria-pressed={mode === "login"}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              className={`filter-chip ${mode === "register" ? "active" : ""}`}
              onClick={() => setMode("register")}
              aria-pressed={mode === "register"}
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

          <button type="submit" disabled={loading} className="primary-btn">
            {loading
              ? mode === "login"
                ? "Đang đăng nhập..."
                : "Đang đăng ký..."
              : mode === "login"
              ? "Đăng nhập"
              : "Đăng ký"}
          </button>

          <div style={{ marginTop: 12 }}>
            <div id="google-btn" style={{ display: "flex", justifyContent: "center" }} />
            {!process.env.REACT_APP_GOOGLE_CLIENT_ID && (
              <div className="alert-box" style={{ marginTop: 8 }}>
                Chưa cấu hình REACT_APP_GOOGLE_CLIENT_ID
              </div>
            )}
            {googleLoading && (
              <div className="muted" style={{ marginTop: 6 }}>
                Đang đăng nhập Google...
              </div>
            )}
          </div>

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

          <div style={{ marginTop: 6, fontSize: 13 }} className="muted">
            Bằng việc đăng ký hoặc đăng nhập, bạn đồng ý với{" "}
            <a href="/terms">Điều khoản sử dụng</a> của chúng tôi.
          </div>
        </form>
      </section>
      <Footer />
    </div>
  );
}
