const router = require("express").Router();
const { db } = require("../db");
const { authenticate } = require("../middleware/auth");

// All appointment routes require authentication
router.use(authenticate);

/**
 * GET /api/appointments
 * Patients see their own; admins/doctors see all
 * Query: ?status=pending&page=1&limit=10
 */
router.get("/", (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const { id: userId, role } = req.user;

  let query = `
    SELECT
      a.id, a.doctor_name, a.department, a.date, a.time,
      a.reason, a.notes, a.status, a.created_at,
      u.name AS patient_name, u.email AS patient_email
    FROM appointments a
    JOIN users u ON a.patient_id = u.id
    WHERE 1=1
  `;
  const params = [];

  // Patients can only see their own appointments
  if (role === "patient") {
    query += " AND a.patient_id = ?";
    params.push(userId);
  }

  if (status) {
    query += " AND a.status = ?";
    params.push(status);
  }

  query += " ORDER BY a.date ASC, a.time ASC LIMIT ? OFFSET ?";
  params.push(parseInt(limit), offset);

  const appointments = db.prepare(query).all(...params);

  // Count for pagination
  let countQuery = `SELECT COUNT(*) AS total FROM appointments a WHERE 1=1`;
  const countParams = [];
  if (role === "patient") { countQuery += " AND a.patient_id = ?"; countParams.push(userId); }
  if (status) { countQuery += " AND a.status = ?"; countParams.push(status); }

  const { total } = db.prepare(countQuery).get(...countParams);

  return res.json({
    data: appointments,
    pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
  });
});

/**
 * GET /api/appointments/:id
 */
router.get("/:id", (req, res) => {
  const { id: userId, role } = req.user;

  const appt = db.prepare(`
    SELECT a.*, u.name AS patient_name, u.email AS patient_email
    FROM appointments a
    JOIN users u ON a.patient_id = u.id
    WHERE a.id = ?
  `).get(req.params.id);

  if (!appt) return res.status(404).json({ error: "Appointment not found" });

  // Patients can only view their own
  if (role === "patient" && appt.patient_id !== userId) {
    return res.status(403).json({ error: "Access denied" });
  }

  return res.json({ data: appt });
});

/**
 * POST /api/appointments
 * Body: { doctor_name, department, date, time, reason, notes? }
 */
router.post("/", (req, res) => {
  const { doctor_name, department, date, time, reason, notes } = req.body;

  if (!doctor_name || !department || !date || !time || !reason) {
    return res.status(400).json({
      error: "doctor_name, department, date, time, and reason are required",
    });
  }

  // Basic date validation
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: "date must be in YYYY-MM-DD format" });
  }

  if (!/^\d{2}:\d{2}$/.test(time)) {
    return res.status(400).json({ error: "time must be in HH:MM format" });
  }

  const { lastInsertRowid } = db
    .prepare(`
      INSERT INTO appointments (patient_id, doctor_name, department, date, time, reason, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .run(req.user.id, doctor_name, department, date, time, reason, notes || null);

  const created = db.prepare(`
    SELECT a.*, u.name AS patient_name FROM appointments a
    JOIN users u ON a.patient_id = u.id WHERE a.id = ?
  `).get(lastInsertRowid);

  return res.status(201).json({ data: created });
});

/**
 * PATCH /api/appointments/:id
 * Allows updating status or notes
 */
router.patch("/:id", (req, res) => {
  const { id: userId, role } = req.user;
  const appt = db.prepare("SELECT * FROM appointments WHERE id = ?").get(req.params.id);

  if (!appt) return res.status(404).json({ error: "Appointment not found" });

  if (role === "patient" && appt.patient_id !== userId) {
    return res.status(403).json({ error: "Access denied" });
  }

  const { status, notes, doctor_name, department, date, time, reason } = req.body;

  const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${validStatuses.join(", ")}` });
  }

  db.prepare(`
    UPDATE appointments
    SET
      status      = COALESCE(?, status),
      notes       = COALESCE(?, notes),
      doctor_name = COALESCE(?, doctor_name),
      department  = COALESCE(?, department),
      date        = COALESCE(?, date),
      time        = COALESCE(?, time),
      reason      = COALESCE(?, reason)
    WHERE id = ?
  `).run(status, notes, doctor_name, department, date, time, reason, req.params.id);

  const updated = db.prepare("SELECT * FROM appointments WHERE id = ?").get(req.params.id);
  return res.json({ data: updated });
});

/**
 * DELETE /api/appointments/:id
 * Patients can cancel their own; admins can delete any
 */
router.delete("/:id", (req, res) => {
  const { id: userId, role } = req.user;
  const appt = db.prepare("SELECT * FROM appointments WHERE id = ?").get(req.params.id);

  if (!appt) return res.status(404).json({ error: "Appointment not found" });

  if (role === "patient" && appt.patient_id !== userId) {
    return res.status(403).json({ error: "Access denied" });
  }

  db.prepare("DELETE FROM appointments WHERE id = ?").run(req.params.id);
  return res.json({ message: "Appointment deleted" });
});

module.exports = router;
