"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { appointmentsApi } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { ArrowLeft, CalendarCheck, AlertCircle, CheckCircle2 } from "lucide-react";

const DEPARTMENTS = [
  "Cardiology", "Neurology", "Dermatology", "Orthopedics",
  "Pediatrics", "Ophthalmology", "Gynecology", "Oncology",
  "Psychiatry", "General Medicine", "Emergency",
];

const DOCTORS = {
  "Cardiology":       ["Dr. Sarah Melo",    "Dr. Kebede Alemu"  ],
  "Neurology":        ["Dr. Alex Tadesse",  "Dr. Marta Girma"   ],
  "Dermatology":      ["Dr. Liya Haile",    "Dr. Samuel Bekele" ],
  "Orthopedics":      ["Dr. Yonas Tesfaye", "Dr. Hana Mesfin"   ],
  "Pediatrics":       ["Dr. Selam Worku",   "Dr. Dawit Abebe"   ],
  "Ophthalmology":    ["Dr. Tigist Desta",  "Dr. Bereket Tesfaw"],
  "Gynecology":       ["Dr. Meron Alemu",   "Dr. Aziza Bekele"  ],
  "Oncology":         ["Dr. Alem Girma",    "Dr. Firew Haile"   ],
  "Psychiatry":       ["Dr. Rahel Tadesse", "Dr. Naod Mekonnen" ],
  "General Medicine": ["Dr. Tewodros Mamo", "Dr. Kidist Abebe"  ],
  "Emergency":        ["Dr. Yosef Girma",   "Dr. Almaz Tesfaye" ],
};

const TIME_SLOTS = [
  "08:00","08:30","09:00","09:30","10:00","10:30",
  "11:00","11:30","13:00","13:30","14:00","14:30",
  "15:00","15:30","16:00","16:30",
];

const today = () => new Date().toISOString().split("T")[0];

export default function CreateAppointmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");
  const [form, setForm]       = useState({
    department: "", doctor_name: "", date: "", time: "", reason: "", notes: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("clinic_token");
    if (!token) { router.push("/login"); return; }
    try {
      const raw = localStorage.getItem("clinic_user");
      const u = raw ? JSON.parse(raw) : null;
      if (u?.role === "doctor") router.push("/appointments");
    } catch {}
  }, [router]);

  const set = (field) => (e) => {
    setError("");
    const val = e.target ? e.target.value : e;
    setForm((f) => ({
      ...f,
      [field]: val,
      ...(field === "department" ? { doctor_name: "" } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await appointmentsApi.create(form);
      setSuccess(true);
      setTimeout(() => router.push("/appointments"), 2000);
    } catch (err) {
      setError(err.message || "Failed to create appointment");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center animate-fade-up">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-1">Appointment booked</h2>
            <p className="text-sm text-zinc-400">Redirecting to your appointments…</p>
          </div>
        </div>
      </div>
    );
  }

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
          <div>
            <h1 className="text-xl font-semibold text-zinc-900">Book appointment</h1>
            <p className="text-sm text-zinc-400 mt-0.5">Fill in the details below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Department & Doctor */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
              Department & Doctor
            </p>
            <div className="space-y-3">
              <div>
                <label className="field-label">Department</label>
                <select value={form.department} onChange={set("department")} required className="input-field">
                  <option value="" disabled>Select department</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Doctor</label>
                <select
                  value={form.doctor_name}
                  onChange={set("doctor_name")}
                  required
                  disabled={!form.department}
                  className="input-field disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>
                    {form.department ? "Select doctor" : "Select department first"}
                  </option>
                  {(DOCTORS[form.department] || []).map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
              Date & Time
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="field-label">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={set("date")}
                  min={today()}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="field-label">Time slot</label>
                <select value={form.time} onChange={set("time")} required className="input-field">
                  <option value="" disabled>Select time</option>
                  {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
              Reason for visit
            </p>
            <div className="space-y-3">
              <div>
                <label className="field-label">
                  Reason <span className="text-red-400 normal-case">*</span>
                </label>
                <input
                  type="text"
                  value={form.reason}
                  onChange={set("reason")}
                  placeholder="e.g. Annual checkup, Follow-up visit…"
                  required
                  maxLength={200}
                  className="input-field"
                />
              </div>
              <div>
                <label className="field-label">
                  Additional notes{" "}
                  <span className="normal-case text-zinc-300 font-normal">(optional)</span>
                </label>
                <textarea
                  value={form.notes}
                  onChange={set("notes")}
                  rows={3}
                  placeholder="Any relevant medical history, medications, or special requests…"
                  maxLength={500}
                  className="input-field resize-none"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Link href="/appointments" className="btn-ghost flex-1">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Booking…
                </>
              ) : (
                <>
                  <CalendarCheck className="w-4 h-4" />
                  Book appointment
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
