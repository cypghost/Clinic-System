const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("clinic_token");
}

async function request(path, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    // If token is expired, clear auth state
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("clinic_token");
      localStorage.removeItem("clinic_user");
      window.location.href = "/login";
    }
    throw new Error(data.error || "Request failed");
  }

  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email, password) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (name, email, password) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  me: () => request("/api/auth/me"),
};

// ── Appointments ──────────────────────────────────────────────────────────
export const appointmentsApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return request(`/api/appointments${qs ? `?${qs}` : ""}`);
  },

  get: (id) => request(`/api/appointments/${id}`),

  create: (payload) =>
    request("/api/appointments", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id, payload) =>
    request(`/api/appointments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  remove: (id) =>
    request(`/api/appointments/${id}`, { method: "DELETE" }),
};

export { getToken };
