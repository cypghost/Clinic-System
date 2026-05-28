const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require("../db");

/**
 * POST /api/auth/register
 * Body: { name, email, password, role? }
 */
router.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  const role = "patient"; // public registration always creates patients

  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email, and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const { lastInsertRowid } = db
    .prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)")
    .run(name, email.toLowerCase(), hashedPassword, role);

  const user = db.prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?").get(lastInsertRowid);

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  return res.status(201).json({ token, user });
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const user = db
    .prepare("SELECT id, name, email, password, role, created_at FROM users WHERE email = ?")
    .get(email.toLowerCase());

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  const { password: _pw, ...safeUser } = user;
  return res.json({ token, user: safeUser });
});

/**
 * GET /api/auth/me
 * Returns current user from token
 */
router.get("/me", require("../middleware/auth").authenticate, (req, res) => {
  const user = db
    .prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?")
    .get(req.user.id);

  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({ user });
});

module.exports = router;
