export function loadAuth() {
  try {
    const saved = localStorage.getItem("auth");
    return saved ? JSON.parse(saved) : { token: null, user: null };
  } catch (err) {
    return { token: null, user: null };
  }
}

export function saveAuth(data) {
  try {
    localStorage.setItem("auth", JSON.stringify(data));
  } catch (err) {
    // ignore
  }
}

export function clearAuth() {
  try {
    localStorage.removeItem("auth");
  } catch (err) {
    // ignore
  }
}
