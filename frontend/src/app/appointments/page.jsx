"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { appointmentsApi } from "@/lib/api";
import Navbar from "@/components/Navbar";
import {
  CalendarPlus, Clock, Building2, User2,
  Loader2, AlertCircle, FileX2, ChevronDown,
  CheckCircle2, XCircle, CircleCheck,
} from "lucide-react";

const STATUS_CONFIG = {
  pending:   { label: "Pending",   cls: "bg-amber-50 text-amber-700 border border-amber-200"       },
  confirmed: { label: "Confirmed", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-600 border border-red-200"             },
  completed: { label: "Completed", cls: "bg-zinc-100 text-zinc-500 border border-zinc-200"         },
};

const FILTERS       = ["", "pending", "confirmed", "cancelled", "completed"];
const FILTER_LABELS = { "": "All", pending: "Pending", confirmed: "Confirmed", cancelled: "Cancelled", completed: "Completed" };

function DetailItem({ label, children }) {
  return (
    <div>
      <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">{label}</p>
      <div className="text-sm text-zinc-900">{children}</div>
    </div>
  );
}

function AppointmentCard({ appt, user, onStatusChange }) {
  const [expanded,   setExpanded]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAction = async (newStatus) => {
    if (newStatus === "cancelled") {
      if (!window.confirm("Cancel this appointment? This cannot be undone.")) return;
    }
    setSubmitting(true);
    try {
      await onStatusChange(appt.id, newStatus);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const cfg      = STATUS_CONFIG[appt.status] || STATUS_CONFIG.pending;
  const d        = new Date(appt.date + "T00:00:00");
  const month    = d.toLocaleDateString("en-US", { month: "short" });
  const day      = d.getDate();
  const fullDate = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  const canAccept   = user?.role === "doctor" && appt.status === "pending";
  const canComplete = user?.role === "doctor" && appt.status === "confirmed";
  const canCancel   = appt.status === "pending" ||
    (user?.role !== "doctor" && appt.status === "confirmed");

  return (
    <div className="bg-white border border-zinc-100 rounded-xl overflow-hidden hover:border-zinc-200 transition-colors duration-150 animate-slide-in">

      {/* Collapsed row — click anywhere to expand */}
      <div
        className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Date */}
        <div className="shrink-0 w-10 text-center">
          <div className="text-xs text-zinc-400 uppercase tracking-wide leading-none">{month}</div>
          <div className="text-2xl font-semibold text-zinc-900 leading-tight">{day}</div>
        </div>

        <div className="hidden sm:block w-px h-9 bg-zinc-100 shrink-0" />

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className="text-sm font-medium text-zinc-900">{appt.doctor_name}</span>
            <span className={`status-badge ${cfg.cls}`}>{cfg.label}</span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3" />{appt.department}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />{appt.time}
            </span>
            {appt.patient_name && (
              <span className="flex items-center gap-1">
                <User2 className="w-3 h-3" />{appt.patient_name}
              </span>
            )}
          </div>
        </div>

        {/* Chevron */}
        <ChevronDown
          className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-zinc-100 animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 pt-4 mb-4">
            {appt.patient_name && (
              <DetailItem label="Patient">
                <span className="flex items-center gap-1.5">
                  <User2 className="w-3.5 h-3.5 text-zinc-400" />
                  {appt.patient_name}
                </span>
              </DetailItem>
            )}
            <DetailItem label="Doctor">{appt.doctor_name}</DetailItem>
            <DetailItem label="Department">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                {appt.department}
              </span>
            </DetailItem>
            <DetailItem label="Date">{fullDate}</DetailItem>
            <DetailItem label="Time">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                {appt.time}
              </span>
            </DetailItem>
            <DetailItem label="Status">
              <span className={`status-badge ${cfg.cls}`}>{cfg.label}</span>
            </DetailItem>
          </div>

          {appt.reason && (
            <div className="mb-3">
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Reason</p>
              <p className="text-sm text-zinc-700">{appt.reason}</p>
            </div>
          )}

          {appt.notes && (
            <div className="mb-3">
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-zinc-700">{appt.notes}</p>
            </div>
          )}

          {(canAccept || canComplete || canCancel) && (
            <div className="pt-3 border-t border-zinc-100 flex gap-2 mt-1 flex-wrap">
              {canAccept && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleAction("confirmed"); }}
                  disabled={submitting}
                  className="btn-primary text-xs py-2 px-4"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Accept appointment
                </button>
              )}
              {canComplete && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleAction("completed"); }}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg text-emerald-600 border border-emerald-200 hover:bg-emerald-50 transition-colors cursor-pointer disabled:opacity-40"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CircleCheck className="w-3.5 h-3.5" />}
                  Mark as completed
                </button>
              )}
              {canCancel && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleAction("cancelled"); }}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg text-red-500 border border-red-200 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                  Cancel appointment
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [user, setUser]                 = useState(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await appointmentsApi.list({ status: statusFilter || undefined });
      let list = data.data;

      const raw = localStorage.getItem("clinic_user");
      const currentUser = raw ? JSON.parse(raw) : null;
      if (currentUser?.role === "doctor") {
        list = list.filter((a) => a.doctor_name === currentUser.name);
      } else {
        list = list.filter((a) => a.patient_name === currentUser.name);
      }

      setAppointments(list);
    } catch (err) {
      if (err.message?.includes("expired") || err.message?.includes("Invalid token")) {
        router.push("/login");
      } else {
        setError(err.message || "Failed to load appointments");
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, router]);

  useEffect(() => {
    const token = localStorage.getItem("clinic_token");
    if (!token) { router.push("/login"); return; }
    try {
      const raw = localStorage.getItem("clinic_user");
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    fetchAppointments();
  }, [fetchAppointments, router]);

  const handleStatusChange = async (id, status) => {
    await appointmentsApi.update(id, { status });
    setAppointments((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, status } : a));
      return statusFilter ? updated.filter((a) => a.status === statusFilter) : updated;
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <main className="max-w-4xl mx-auto w-full px-4 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Appointments</h1>
            {!loading && (
              <p className="text-sm text-zinc-400 mt-0.5">
                {appointments.length} {appointments.length === 1 ? "appointment" : "appointments"}
                {statusFilter ? ` · ${statusFilter}` : ""}
              </p>
            )}
          </div>
          {user?.role !== "doctor" && (
            <Link href="/appointments/create" className="btn-primary self-start sm:self-auto">
              <CalendarPlus className="w-4 h-4" />
              New appointment
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 mb-5 flex-wrap">
          {FILTERS.map((s) => (
            <button
              key={s || "all"}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors duration-150 cursor-pointer ${
                statusFilter === s
                  ? "bg-zinc-900 text-white font-medium"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              {FILTER_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-zinc-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2.5" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3.5 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-20">
            <FileX2 className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-zinc-600">No appointments found</p>
            <p className="text-sm text-zinc-400 mt-1">
              {statusFilter
                ? `No ${statusFilter} appointments`
                : "Book your first appointment to get started"}
            </p>
            {user?.role !== "doctor" && (
              <Link href="/appointments/create" className="btn-primary inline-flex mt-5">
                <CalendarPlus className="w-4 h-4" />
                Book appointment
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {appointments.map((appt, i) => (
              <div key={appt.id} style={{ animationDelay: `${i * 40}ms` }}>
                <AppointmentCard
                  appt={appt}
                  user={user}
                  onStatusChange={handleStatusChange}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
