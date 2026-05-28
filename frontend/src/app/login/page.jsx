"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { Eye, EyeOff, Stethoscope, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode]     = useState("login");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [form, setForm]     = useState({ name: "", email: "", password: "" });

  const set = (field) => (e) => {
    setError("");
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let data;
      if (mode === "login") {
        data = await authApi.login(form.email, form.password);
      } else {
        if (!form.name.trim()) { setError("Name is required"); setLoading(false); return; }
        data = await authApi.register(form.name, form.email, form.password);
      }
      localStorage.setItem("clinic_token", data.token);
      localStorage.setItem("clinic_user", JSON.stringify(data.user));
      router.push("/appointments");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 mb-4">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-zinc-900">ClinicOS</h1>
          <p className="text-sm text-zinc-400 mt-1">Appointment Management</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">

          {/* Tabs */}
          <div className="flex border-b border-zinc-100 mb-6">
            {[
              { id: "login",    label: "Sign in"  },
              { id: "register", label: "Register" },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => { setMode(id); setError(""); }}
                className={`flex-1 pb-3 text-sm font-medium transition-colors duration-150 cursor-pointer ${
                  mode === id
                    ? "text-zinc-900 border-b-2 border-zinc-900 -mb-px"
                    : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="animate-fade-in">
                <label className="field-label">Full name</label>
                <input
                  type="text"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={set("name")}
                  required
                  className="input-field"
                />
              </div>
            )}

            <div>
              <label className="field-label">Email</label>
              <input
                type="email"
                placeholder="you@clinic.com"
                value={form.email}
                onChange={set("email")}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="field-label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set("password")}
                  required
                  minLength={6}
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-red-600 text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-1">
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {mode === "login" ? "Signing in…" : "Creating account…"}
                </>
              ) : (
                mode === "login" ? "Sign in" : "Create account"
              )}
            </button>
          </form>

          {/* Demo credentials */}
          {mode === "login" && (
            <div className="mt-5 pt-5 border-t border-zinc-100">
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2.5">Demo accounts</p>
              <div className="space-y-1.5">
                {[
                  { label: "Doctor",  email: "doctor@clinic.com",  pw: "doctor123"  },
                  { label: "Patient", email: "patient@clinic.com", pw: "patient123" },
                ].map((cred) => (
                  <button
                    key={cred.label}
                    type="button"
                    onClick={() => setForm({ ...form, email: cred.email, password: cred.pw })}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition-colors text-sm cursor-pointer"
                  >
                    <span className="text-zinc-600 font-medium">{cred.label}</span>
                    <span className="text-zinc-400 font-mono text-xs">{cred.email}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
