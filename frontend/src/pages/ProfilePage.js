import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ProfilePage({ auth, logout, setAuth }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    avatar: "",
  });

  useEffect(() => {
    if (!auth?.token) {
      navigate("/auth");
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:5000/api/profile", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.message || "Không tải được thông tin");
        if (!cancelled) {
          setForm({
            name: data.name || "",
            email: data.email || "",
            avatar: data.avatar || "",
          });
        }
      } catch (err) {
        if (!cancelled) setMessage(err.message || "Có lỗi xảy ra");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [auth, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!auth?.token) {
      navigate("/auth");
      return;
    }
    const payload = {
      name: form.name,
      avatar: form.avatar,
    };
    try {
      setSaving(true);
      const res = await fetch("http://localhost:5000/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Cập nhật thất bại");
      setMessage("Đã lưu thông tin");
      if (setAuth) {
        setAuth({ token: auth.token, user: { ...auth.user, ...data } });
      }
    } catch (err) {
      setMessage(err.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <Header auth={auth} logout={logout} />
      <section className="section">
        <div className="section-header">
          <h3 className="section-title">Thông tin cá nhân</h3>
        </div>

        {message && <div className="alert-box">{message}</div>}
        {loading ? (
          <div className="alert-box">Đang tải thông tin...</div>
        ) : (
          <form
            className="newsletter"
            onSubmit={handleSubmit}
            style={{ gridTemplateColumns: "1fr", gap: 12, maxWidth: 480 }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {form.avatar ? (
                  <img
                    src={form.avatar}
                    alt="Avatar"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span className="muted">No avatar</span>
                )}
              </div>
            </div>

            <input
              name="name"
              placeholder="Họ và tên"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input name="email" placeholder="Email" value={form.email} disabled />

            <button type="submit" className="primary-btn" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </form>
        )}
      </section>
      <Footer />
    </div>
  );
}
