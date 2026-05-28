"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { CalendarPlus, LayoutList, LogOut, Menu, X } from "lucide-react";

export default function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser]           = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("clinic_user");
      if (raw) setUser(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const logout = () => {
    localStorage.removeItem("clinic_token");
    localStorage.removeItem("clinic_user");
    router.push("/login");
  };

  const navLinks = [
    { href: "/appointments", label: "Appointments", icon: LayoutList },
    ...(user?.role !== "doctor"
      ? [{ href: "/appointments/create", label: "New", icon: CalendarPlus }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-zinc-200">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">

        {/* User identity */}
        <div className="flex items-center gap-2 min-w-0">
          {user ? (
            <>
              <span className="text-sm font-semibold text-zinc-900 truncate">{user.name}</span>
              <span className="text-xs text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-md capitalize shrink-0">
                {user.role}
              </span>
            </>
          ) : (
            <span className="text-sm font-medium text-zinc-400">ClinicOS</span>
          )}
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors duration-150 ${
                pathname === href
                  ? "text-blue-600 bg-blue-50 font-medium"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Sign out */}
        <div className="hidden md:flex items-center">
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-zinc-100 transition-colors text-zinc-500 cursor-pointer"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-100 bg-white px-4 py-3 space-y-1 animate-fade-in">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm transition-colors ${
                pathname === href
                  ? "text-blue-600 bg-blue-50 font-medium"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          {user && (
            <div className="px-3 py-2 text-sm text-zinc-500 border-t border-zinc-100 mt-1 pt-3">
              {user.name} · <span className="capitalize">{user.role}</span>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-md text-sm text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      )}
    </header>
  );
}
