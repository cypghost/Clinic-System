require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const authRoutes        = require("./routes/auth");
const appointmentRoutes = require("./routes/appointments");

async function createApp() {
  // Init DB first — all routes depend on it
  const { initDb } = require("./db");
  await initDb();

  const app = express();

  // ── Middleware ───────────────────────────────────────────────────────────
  app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  if (process.env.NODE_ENV !== "production") {
    app.use((req, _res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      next();
    });
  }

  // ── Routes ───────────────────────────────────────────────────────────────
  app.get("/api/health", (_req, res) =>
    res.json({ status: "ok", time: new Date().toISOString() })
  );
  app.use("/api/auth",         authRoutes);
  app.use("/api/appointments", appointmentRoutes);

  // ── 404 & Error handlers ─────────────────────────────────────────────────
  app.use((_req, res) => res.status(404).json({ error: "Route not found" }));
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}

const PORT = process.env.PORT || 4000;

createApp().then((app) => {
  app.listen(PORT, () => {
    console.log(`\n🏥  Clinic API running → http://localhost:${PORT}`);
    console.log(`   Health check    → http://localhost:${PORT}/api/health\n`);
  });
}).catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
