import React, { useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import AdminPage from "./pages/AdminPage";
import { loadAuth, saveAuth, clearAuth } from "./auth";

export default function App() {
  const [auth, setAuth] = useState(() => loadAuth());

  const authActions = useMemo(
    () => ({
      setSession: (data) => {
        setAuth(data);
        saveAuth(data);
      },
      logout: (navigate) => {
        setAuth({ token: null, user: null });
        clearAuth();
        if (navigate) navigate("/");
      },
    }),
    []
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<HomePage auth={auth} logout={authActions.logout} />}
        />
        <Route
          path="/auth"
          element={<AuthPage auth={auth} setAuth={authActions.setSession} />}
        />
        <Route
          path="/product/:id"
          element={<ProductDetail auth={auth} logout={authActions.logout} />}
        />
        <Route
          path="/cart"
          element={<CartPage auth={auth} logout={authActions.logout} />}
        />
        <Route
          path="/checkout"
          element={<CheckoutPage auth={auth} logout={authActions.logout} />}
        />
        <Route
          path="/orders"
          element={<OrdersPage auth={auth} logout={authActions.logout} />}
        />
        <Route
          path="/admin"
          element={<AdminPage auth={auth} logout={authActions.logout} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
