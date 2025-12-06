import React, { useEffect, useMemo, useState } from "react";
import "../App.css";
import AdminHeader from "../components/AdminHeader";

const AdminPage = ({ auth, logout }) => {
  const [products, setProducts] = useState([]);
  const [productForms, setProductForms] = useState([]);
  const [orders, setOrders] = useState([]);
  const [carts, setCarts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roleUpdating, setRoleUpdating] = useState(null);
  const [orderUpdating, setOrderUpdating] = useState(null);
  const [productSaving, setProductSaving] = useState(null);

  const isAdmin = useMemo(() => auth?.user?.role === "admin", [auth]);

  const apiFetch = (url, options = {}) =>
    fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}),
      },
    });

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const [pRes, oRes, cRes, uRes] = await Promise.all([
          apiFetch("http://localhost:5000/api/products"),
          apiFetch("http://localhost:5000/api/orders/all"),
          apiFetch("http://localhost:5000/api/cart/all"),
          apiFetch("http://localhost:5000/api/users"),
        ]);
        if (!pRes.ok) throw new Error("Không tải được sản phẩm");
        if (!oRes.ok) throw new Error("Không tải được đơn hàng");
        if (!cRes.ok) throw new Error("Không tải được giỏ hàng");
        if (!uRes.ok) throw new Error("Không tải được người dùng");
        const pBody = await pRes.json();
        const oBody = await oRes.json();
        const cBody = await cRes.json();
        const uBody = await uRes.json();
        if (cancelled) return;
        const items = pBody.data ?? pBody;
        const prodList = Array.isArray(items) ? items : [];
        setProducts(prodList);
        setProductForms(prodList.map((p) => ({
          ...p,
          variants: (p.variants || []).map((v) => ({ ...v }))
        })));
        setOrders(Array.isArray(oBody) ? oBody : []);
        setCarts(Array.isArray(cBody) ? cBody : []);
        setUsers(Array.isArray(uBody) ? uBody : []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Lỗi tải dữ liệu");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!auth?.token || !isAdmin) {
    return (
      <div className="page">
        <AdminHeader auth={auth} logout={logout} />
        <section className="section">
          <div className="alert-box">
            Cần đăng nhập tài khoản admin để truy cập trang quản trị.
          </div>
        </section>
      </div>
    );
  }

  const handleChangeRole = async (userId, role) => {
    try {
      setRoleUpdating(userId);
      const res = await apiFetch(`http://localhost:5000/api/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Đổi role thất bại");
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: updated.role } : u)));
    } catch (err) {
      setError(err.message || "Đổi role thất bại");
    } finally {
      setRoleUpdating(null);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      setOrderUpdating(orderId);
      const res = await apiFetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Cập nhật trạng thái thất bại");
      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: updated.status } : o)));
    } catch (err) {
      setError(err.message || "Cập nhật trạng thái thất bại");
    } finally {
      setOrderUpdating(null);
    }
  };

  const updateProductForm = (id, updater) => {
    setProductForms((prev) =>
      prev.map((p) => (p._id === id || p.id === id ? updater(p) : p))
    );
  };

  const handleProductFieldChange = (id, field, value) => {
    updateProductForm(id, (p) => ({ ...p, [field]: value }));
  };

  const handleVariantFieldChange = (id, index, field, value) => {
    updateProductForm(id, (p) => {
      const variants = [...(p.variants || [])];
      variants[index] = { ...variants[index], [field]: value };
      return { ...p, variants };
    });
  };

  const handleSaveProduct = async (id) => {
    try {
      setProductSaving(id);
      const draft = productForms.find((p) => p._id === id || p.id === id);
      if (!draft) return;
      const payload = {
        name: draft.name,
        category: draft.category,
        variants: (draft.variants || []).map((v) => ({
          ...v,
          sizeCm: Number(v.sizeCm) || 0,
          price: Number(v.price) || 0,
          stock: Number(v.stock) || 0,
        })),
      };
      const res = await apiFetch(`http://localhost:5000/api/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Lưu sản phẩm thất bại");
      const updated = await res.json();
      setProducts((prev) => prev.map((p) => (p._id === id ? updated : p)));
      setProductForms((prev) =>
        prev.map((p) => (p._id === id ? { ...updated, variants: (updated.variants || []).map((v) => ({ ...v })) } : p))
      );
    } catch (err) {
      setError(err.message || "Lưu sản phẩm thất bại");
    } finally {
      setProductSaving(null);
    }
  };

  return (
    <div className="page">
      <AdminHeader auth={auth} logout={logout} />

      <section id="dashboard" className="section">
        <div className="section-header">
          <h3 className="section-title">Bảng điều khiển Admin</h3>
        </div>

        {loading && <div className="alert-box">Đang tải dữ liệu...</div>}
        {error && <div className="alert-box">Lỗi: {error}</div>}

        <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
          <div id="products" className="hero-card">
            <div className="section-header" style={{ marginBottom: 8 }}>
              <h4 className="section-title" style={{ fontSize: 20 }}>
                Sản phẩm ({products.length})
              </h4>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: "50%" }}>Tên</th>
                    <th style={{ width: "50%" }}>Danh mục</th>
                    <th>Biến thể (size / giá)</th>
                  </tr>
                </thead>
                <tbody>
                  {productForms.map((p) => (
                    <tr key={p._id || p.id}>
                      <td>
                        <input
                          value={p.name || ""}
                          onChange={(e) => handleProductFieldChange(p._id || p.id, "name", e.target.value)}
                          style={{ width: "100%", padding: 8, borderRadius: 10, border: "1px solid var(--border)" }}
                        />
                      </td>
                      <td>
                        <select
                          value={p.category || ""}
                          onChange={(e) => handleProductFieldChange(p._id || p.id, "category", e.target.value)}
                          style={{ width: "100%", padding: 8, borderRadius: 10, border: "1px solid var(--border)" }}
                        >
                          <option value="">Chọn danh mục</option>
                          <option value="Pokemon">Pokemon</option>
                          <option value="Móc khóa">Móc khóa</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ display: "grid", gap: 8 }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, fontSize: 12, color: "var(--muted)" }}>
                            <span>ID</span>
                            <span>Size (cm)</span>
                            <span>Giá (đ)</span>
                            <span>Tồn kho</span>
                          </div>
                          {(p.variants || []).map((v, idx) => (
                            <div
                              key={v.variantId || idx}
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                                gap: 8,
                                alignItems: "center",
                              }}
                            >
                              <input
                                value={v.variantId || ""}
                                onChange={(e) =>
                                  handleVariantFieldChange(p._id || p.id, idx, "variantId", e.target.value)
                                }
                                placeholder="variantId"
                                style={{ padding: 8, borderRadius: 10, border: "1px solid var(--border)" }}
                              />
                              <input
                                type="number"
                                value={v.sizeCm || ""}
                                onChange={(e) =>
                                  handleVariantFieldChange(p._id || p.id, idx, "sizeCm", e.target.value)
                                }
                                placeholder="Size (cm)"
                                style={{ padding: 8, borderRadius: 10, border: "1px solid var(--border)" }}
                              />
                              <input
                                type="number"
                                value={v.price || ""}
                                onChange={(e) =>
                                  handleVariantFieldChange(p._id || p.id, idx, "price", e.target.value)
                                }
                                placeholder="Giá (đ)"
                                style={{ padding: 8, borderRadius: 10, border: "1px solid var(--border)" }}
                              />
                              <input
                                type="number"
                                value={v.stock ?? ""}
                                onChange={(e) =>
                                  handleVariantFieldChange(p._id || p.id, idx, "stock", e.target.value)
                                }
                                placeholder="Tồn"
                                style={{ padding: 8, borderRadius: 10, border: "1px solid var(--border)" }}
                              />
                            </div>
                          ))}
                          {(p.variants || []).length === 0 && (
                            <div className="muted">Chưa có biến thể</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <button
                          className="primary-btn"
                          style={{ width: "100%" }}
                          onClick={() => handleSaveProduct(p._id || p.id)}
                          disabled={productSaving === (p._id || p.id)}
                        >
                          {productSaving === (p._id || p.id) ? "Đang lưu..." : "Lưu"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {productForms.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center" }}>
                        Chưa có sản phẩm
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div id="orders" className="hero-card">
            <div className="section-header" style={{ marginBottom: 8 }}>
              <h4 className="section-title" style={{ fontSize: 20 }}>
                Đơn hàng ({orders.length})
              </h4>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Khách</th>
                    <th>Tổng</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id}>
                      <td>{o._id}</td>
                      <td>{o.shipping?.address?.fullName || o.user || "-"}</td>
                      <td>{o.total != null ? `${o.total} đ` : "-"}</td>
                      <td>
                        <select
                          value={o.status || "created"}
                          onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                          disabled={orderUpdating === o._id}
                          style={{ padding: "8px", borderRadius: 8 }}
                        >
                          {["created", "processing", "completed", "cancelled", "refunded"].map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center" }}>
                        Chưa có đơn hàng
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div id="carts" className="hero-card">
            <div className="section-header" style={{ marginBottom: 8 }}>
              <h4 className="section-title" style={{ fontSize: 20 }}>
                Giỏ hàng
              </h4>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Số item</th>
                    <th>Cập nhật</th>
                  </tr>
                </thead>
                <tbody>
                  {carts.map((c) => (
                    <tr key={c._id}>
                      <td>{c.user?.email || c.user || "-"}</td>
                      <td>{c.items?.length || 0}</td>
                      <td>{c.updatedAt ? new Date(c.updatedAt).toLocaleString() : "-"}</td>
                    </tr>
                  ))}
                  {carts.length === 0 && (
                    <tr>
                      <td colSpan="3" style={{ textAlign: "center" }}>
                        Chưa có giỏ hàng
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div id="users" className="hero-card">
            <div className="section-header" style={{ marginBottom: 8 }}>
              <h4 className="section-title" style={{ fontSize: 20 }}>
                Người dùng
              </h4>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Tên</th>
                    <th>Role</th>
                    <th>Tạo lúc</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.email}</td>
                      <td>{u.name || "-"}</td>
                      <td>{u.role || "user"}</td>
                      <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</td>
                      <td>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            className="ghost-btn"
                            disabled={roleUpdating === u._id || u.role === "admin"}
                            onClick={() => handleChangeRole(u._id, "admin")}
                          >
                            Set admin
                          </button>
                          <button
                            className="ghost-btn"
                            disabled={roleUpdating === u._id || u.role === "user"}
                            onClick={() => handleChangeRole(u._id, "user")}
                          >
                            Set user
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center" }}>
                        Chưa có người dùng
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminPage;
