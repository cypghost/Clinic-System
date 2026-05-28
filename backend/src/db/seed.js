require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });

async function seed() {
  const { initDb } = require("./index");
  const db = await initDb();
  const bcrypt = require("bcryptjs");

  console.log("🌱 Seeding database...");

  const users = [
    { name: "Admin User",     email: "admin@clinic.com",   password: "admin123",   role: "admin"   },
    { name: "Dr. Sarah Melo", email: "doctor@clinic.com",  password: "doctor123",  role: "doctor"  },
    { name: "John Patient",   email: "patient@clinic.com", password: "patient123", role: "patient" },
  ];

  for (const u of users) {
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(u.email);
    if (!existing) {
      const hashed = bcrypt.hashSync(u.password, 10);
      db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)")
        .run(u.name, u.email, hashed, u.role);
      console.log(`  ✓ ${u.role}: ${u.email} / ${u.password}`);
    } else {
      console.log(`  ~ Skipped (exists): ${u.email}`);
    }
  }

  const patient = db.prepare("SELECT id FROM users WHERE email = ?").get("patient@clinic.com");

  if (patient) {
    const existing = db.prepare("SELECT COUNT(*) as c FROM appointments WHERE patient_id = ?").get(patient.id);
    if (existing.c === 0) {
      const appts = [
        { doctor_name: "Dr. Sarah Melo",  department: "Cardiology",  date: "2025-06-10", time: "09:00", reason: "Annual checkup",      status: "confirmed" },
        { doctor_name: "Dr. Alex Tadesse",department: "Neurology",   date: "2025-06-15", time: "14:30", reason: "Headache evaluation",  status: "pending"   },
        { doctor_name: "Dr. Liya Haile",  department: "Dermatology", date: "2025-06-20", time: "11:00", reason: "Skin rash follow-up",  status: "pending"   },
      ];
      for (const a of appts) {
        db.prepare("INSERT INTO appointments (patient_id, doctor_name, department, date, time, reason, status) VALUES (?,?,?,?,?,?,?)")
          .run(patient.id, a.doctor_name, a.department, a.date, a.time, a.reason, a.status);
        console.log(`  ✓ Appointment: ${a.department} on ${a.date}`);
      }
    }
  }

  console.log("\n✅ Seed complete.");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
