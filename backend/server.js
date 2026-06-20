require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const partsRouter = require("./routes/parts");
const buildsRouter = require("./routes/builds");
const aiRouter = require("./routes/ai");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/parts", partsRouter);
app.use("/api/build", buildsRouter);
app.use("/api/ai", aiRouter);

app.get("/api/categories", (req, res) => {
  res.json({
    success: true,
    data: [
      { id: "cpu", name: "Processor (CPU)", icon: "memory", color: "#ff6b6b" },
      {
        id: "motherboard",
        name: "Motherboard",
        icon: "developer-board",
        color: "#feca57",
      },
      {
        id: "gpu",
        name: "Graphics Card (GPU)",
        icon: "grid-on",
        color: "#6c63ff",
      },
      { id: "ram", name: "Memory (RAM)", icon: "storage", color: "#00d4ff" },
      { id: "storage", name: "Storage", icon: "sd-card", color: "#00ff88" },
      { id: "psu", name: "Power Supply (PSU)", icon: "bolt", color: "#ff9f43" },
      { id: "cooler", name: "CPU Cooler", icon: "air", color: "#74b9ff" },
      { id: "case", name: "Case", icon: "computer", color: "#a29bfe" },
    ],
  });
});

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (
    username === "admin" &&
    password === (process.env.ADMIN_PASSWORD || "admin123")
  ) {
    res.json({ success: true, token: "admin-token-pcbuilder" });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

app.get("/api/health", async (req, res) => {
  const pool = require("./db/pool");
  try {
    await pool.query("SELECT 1");
    res.json({
      success: true,
      message: "BuildMate API running!",
      db: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.json({
      success: true,
      message: "BuildMate API running!",
      db: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n  BuildMate API running on port ${PORT}`);
  console.log(` Health:  http://localhost:${PORT}/api/health`);
  console.log(` Parts:   http://localhost:${PORT}/api/parts`);
  console.log(` AI:      http://localhost:${PORT}/api/ai/chat`);
  console.log(`\n Setup:`);
  // console.log(`   2. node db/migrate.js   — create tables`);
  // console.log(`   3. node db/seed.js      — seed parts data`);
  // console.log(`   4. node server.js       — run server\n`);
});

module.exports = app;
