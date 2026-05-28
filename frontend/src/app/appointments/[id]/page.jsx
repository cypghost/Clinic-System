"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { appointmentsApi } from "@/lib/api";
import Navbar from "@/components/Navbar";
import {
  ArrowLeft, Building2, Clock, Calendar, User2,
  FileText, StickyNote, CheckCircle2, XCircle, Loader2, AlertCircle,
} from "lucide-react";

const STATUS_CONFIG = {
  pending:   { label: "Pending",   cls: "bg-amber-50 text-amber-700 border border-amber-200"       },
  confirmed: { label: "Confirmed", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-600 border border-red-200"             },
  completed: { label: "Completed", cls: "bg-zinc-100 text-zinc-500 border border-zinc-200"         },
};

function DetailRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-zinc-100 last:border-0">
      <Icon className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm text-zinc-900">{value}</p>
      </div>
    </div>
  );
}

export default function AppointmentDetailPage() {
  const router = useRouter();
  const { id }  = useParams();

  const [appt, setAppt]                   = useState(null);
  const [user, setUser]                   = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError]     = useState("");

  useEffect(() => {
    const token = localStorage.getItem("clinic_token");
    if (!token) { router.push("/login"); return; }

    try {
      const raw = localStorage.getItem("clinic_user");
      if (raw) setUser(JSON.parse(raw));
    } catch {}

    appointmentsApi.get(id)
      .then((res) => setAppt(res.data))
      .catch((err) => setError(err.message || "Failed to load appointment"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const changeStatus = async (status) => {
    setActionLoading(true);
    setActionError("");
    try {
      await appointmentsApi.update(id, { status });
      setAppt((prev) => ({ ...prev, status }));
    } catch (err) {
      setActionError(err.message || "Failed to update appointment");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (d) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2.5" />
          <span className="text-sm">Loading…</span>
        </div>
      </div>
    );
  }

  if (error || !appt) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col">
        <Navbar />
        <main className="max-w-xl mx-auto w-full px-4 py-8">
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3.5 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error || "Appointment not found"}
          </div>
          <Link href="/appointments" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 mt-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to appointments
          </Link>
        </main>
      </div>
    );
  }

  const cfg           = STATUS_CONFIG[appt.status] || STATUS_CONFIG.pending;
  const isDoctor      = user?.role === "doctor";
  const isPatient     = user?.role === "patient";
  const canAccept     = isDoctor  && appt.status === "pending";
  const canCancel     = isPatient && appt.status === "pending";

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-7">
          <Link
            href="/appointments"
            className="p-1.5 rounded-lg hover:bg-zinc-200 transition-colors text-zinc-400 hover:text-zinc-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold text-zinc-900">Appointment</h1>
              <span className={`status-badge ${cfg.cls}`}>{cfg.label}</span>
            </div>
            <p className="text-sm text-zinc-400 mt-0.5">{formatDate(appt.date)}</p>
          </div>
        </div>

        {/* Details card */}
        <div className="bg-white border border-zinc-200 rounded-xl px-5 mb-4">
          <DetailRow icon={User2}     label="Patient"    value={appt.patient_name} />
          <DetailRow icon={User2}     label="Doctor"     value={appt.doctor_name} />
          <DetailRow icon={Building2} label="Department" value={appt.department} />
          <DetailRow icon={Calendar}  label="Date"       value={formatDate(appt.date)} />
          <DetailRow icon={Clock}     label="Time"       value={appt.time} />
          <DetailRow icon={FileText}  label="Reason"     value={appt.reason} />
          {appt.notes && (
            <DetailRow icon={StickyNote} label="Notes" value={appt.notes} />
          )}
        </div>

        {/* Action error */}
        {actionError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm mb-4 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {actionError}
          </div>
        )}

        {/* Doctor: accept pending */}
        {canAccept && (
          <button
            onClick={() => changeStatus("confirmed")}
            disabled={actionLoading}
            className="btn-primary w-full mb-2"
          >
            {actionLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Accepting…</>
            ) : (
              <><CheckCircle2 className="w-4 h-4" /> Accept appointment</>
            )}
          </button>
        )}

        {/* Patient: cancel pending */}
        {canCancel && (
          <button
            onClick={() => changeStatus("cancelled")}
            disabled={actionLoading}
            className="w-full inline-flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 font-medium px-4 py-2.5 rounded-lg text-sm transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {actionLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Cancelling…</>
            ) : (
              <><XCircle className="w-4 h-4" /> Cancel appointment</>
            )}
          </button>
        )}

      </main>
    </div>
  );
}
