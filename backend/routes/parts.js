const express = require("express");
const router = express.Router();
const pool = require("../db/pool");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `part_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/"))
      return cb(new Error("Images only"));
    cb(null, true);
  },
});

function flattenPart(r) {
  const s = r.specs || {};
  const e = r.extra || {};
  return {
    id: r.id,
    category: r.category,
    name: r.name,
    brand: r.brand,
    tier: r.tier,
    price: parseFloat(r.price),
    image_url: r.image_url,
    specs: s,
    socket: s.socket || e.socket,
    cores: s.cores || e.cores,
    threads: s.threads || e.threads,
    tdp: s.tdp || e.tdp,
    boostClock: s.boost_clock || e.boostClock,
    baseClock: s.base_clock || e.baseClock,
    vram: s.vram || e.vram,
    memoryType: s.memory_type || e.memoryType || s.type || e.type,
    type: s.type || e.type,
    capacity: s.capacity || e.capacity,
    speed: s.speed || e.speed,
    chipset: s.chipset || e.chipset,
    formFactor: s.form_factor || e.formFactor,
    wattage: s.wattage || e.wattage,
    efficiency: s.efficiency || e.efficiency,
    compatibleSockets: s.compatible_sockets || e.compatibleSockets,
    tdpSupport: s.tdp_support || e.tdpSupport,
    storageType: s.storage_type || e.storageType,
    readSpeed: s.read_speed || e.readSpeed,
    writeSpeed: s.write_speed || e.writeSpeed,
    interface: s.interface || e.interface,
    fanSize: s.fan_size || e.fanSize,
    noise: s.noise || e.noise,
    rgb: s.rgb || e.rgb,
  };
}

router.get("/", async (req, res) => {
  try {
    const { category, tier, brand, search, minPrice, maxPrice } = req.query;
    let query = "SELECT * FROM parts WHERE 1=1";
    const params = [];
    if (category) {
      params.push(category);
      query += ` AND category=$${params.length}`;
    }
    if (tier) {
      params.push(tier);
      query += ` AND tier=$${params.length}`;
    }
    if (brand) {
      params.push(brand);
      query += ` AND LOWER(brand)=LOWER($${params.length})`;
    }
    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      query += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(brand) LIKE $${params.length})`;
    }
    if (minPrice) {
      params.push(minPrice);
      query += ` AND price>=$${params.length}`;
    }
    if (maxPrice) {
      params.push(maxPrice);
      query += ` AND price<=$${params.length}`;
    }
    query += " ORDER BY tier, price ASC";
    const { rows } = await pool.query(query, params);
    res.json({ success: true, data: rows.map(flattenPart) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM parts WHERE id=$1", [
      req.params.id,
    ]);
    if (!rows.length)
      return res
        .status(404)
        .json({ success: false, message: "Part not found" });
    res.json({ success: true, data: flattenPart(rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const body = req.body;
    if (!body.category || !body.name || !body.brand || !body.price) {
      return res
        .status(400)
        .json({
          success: false,
          message: "category, name, brand, price required",
        });
    }
    let image_url = null;
    if (req.file) image_url = `/uploads/${req.file.filename}`;

    let parsedSpecs =
      typeof body.specs === "string"
        ? JSON.parse(body.specs || "{}")
        : body.specs || {};
    const specFields = {
      socket: body.socket,
      cores: body.cores ? parseInt(body.cores) : undefined,
      threads: body.threads ? parseInt(body.threads) : undefined,
      tdp: body.tdp ? parseInt(body.tdp) : undefined,
      boost_clock: body.boostClock ? parseFloat(body.boostClock) : undefined,
      base_clock: body.baseClock ? parseFloat(body.baseClock) : undefined,
      vram: body.vram ? parseInt(body.vram) : undefined,
      memory_type: body.memoryType || undefined,
      type: body.type || undefined,
      capacity: body.capacity ? parseInt(body.capacity) : undefined,
      speed: body.speed ? parseInt(body.speed) : undefined,
      chipset: body.chipset || undefined,
      form_factor: body.formFactor || undefined,
      wattage: body.wattage ? parseInt(body.wattage) : undefined,
      efficiency: body.efficiency || undefined,
      compatible_sockets: body.compatibleSockets
        ? Array.isArray(body.compatibleSockets)
          ? body.compatibleSockets
          : body.compatibleSockets.split(",").map((s) => s.trim())
        : undefined,
      tdp_support: body.tdpSupport ? parseInt(body.tdpSupport) : undefined,
      storage_type: body.storageType || undefined,
      read_speed: body.readSpeed ? parseInt(body.readSpeed) : undefined,
      write_speed: body.writeSpeed ? parseInt(body.writeSpeed) : undefined,
      interface: body.interface || undefined,
      fan_size: body.fanSize ? parseInt(body.fanSize) : undefined,
      noise: body.noise ? parseFloat(body.noise) : undefined,
      rgb: body.rgb === "true" || body.rgb === true,
    };
    Object.keys(specFields).forEach((k) => {
      if (specFields[k] !== undefined) parsedSpecs[k] = specFields[k];
    });

    const extra = {
      socket: parsedSpecs.socket,
      chipset: parsedSpecs.chipset,
      formFactor: parsedSpecs.form_factor,
      type: parsedSpecs.type || parsedSpecs.memory_type,
      memoryType: parsedSpecs.memory_type,
    };

    const { rows } = await pool.query(
      `INSERT INTO parts (category,name,brand,tier,price,image_url,specs,extra) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        body.category,
        body.name,
        body.brand,
        body.tier || "mid-range",
        parseFloat(body.price),
        image_url,
        JSON.stringify(parsedSpecs),
        JSON.stringify(extra),
      ],
    );
    res.json({ success: true, data: flattenPart(rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const body = req.body;
    const existing = await pool.query("SELECT * FROM parts WHERE id=$1", [
      req.params.id,
    ]);
    if (!existing.rows.length)
      return res
        .status(404)
        .json({ success: false, message: "Part not found" });
    const old = existing.rows[0];
    let image_url = old.image_url;
    if (req.file) image_url = `/uploads/${req.file.filename}`;

    let parsedSpecs =
      typeof body.specs === "string"
        ? JSON.parse(body.specs || "{}")
        : body.specs || old.specs || {};
    const specFields = {
      socket: body.socket,
      cores: body.cores ? parseInt(body.cores) : undefined,
      threads: body.threads ? parseInt(body.threads) : undefined,
      tdp: body.tdp ? parseInt(body.tdp) : undefined,
      boost_clock: body.boostClock ? parseFloat(body.boostClock) : undefined,
      base_clock: body.baseClock ? parseFloat(body.baseClock) : undefined,
      vram: body.vram ? parseInt(body.vram) : undefined,
      memory_type: body.memoryType || undefined,
      type: body.type || undefined,
      capacity: body.capacity ? parseInt(body.capacity) : undefined,
      speed: body.speed ? parseInt(body.speed) : undefined,
      chipset: body.chipset || undefined,
      form_factor: body.formFactor || undefined,
      wattage: body.wattage ? parseInt(body.wattage) : undefined,
      efficiency: body.efficiency || undefined,
      compatible_sockets: body.compatibleSockets
        ? Array.isArray(body.compatibleSockets)
          ? body.compatibleSockets
          : body.compatibleSockets.split(",").map((s) => s.trim())
        : undefined,
      tdp_support: body.tdpSupport ? parseInt(body.tdpSupport) : undefined,
      storage_type: body.storageType || undefined,
      read_speed: body.readSpeed ? parseInt(body.readSpeed) : undefined,
      write_speed: body.writeSpeed ? parseInt(body.writeSpeed) : undefined,
      interface: body.interface || undefined,
      fan_size: body.fanSize ? parseInt(body.fanSize) : undefined,
      noise: body.noise ? parseFloat(body.noise) : undefined,
      rgb:
        body.rgb !== undefined
          ? body.rgb === "true" || body.rgb === true
          : undefined,
    };
    Object.keys(specFields).forEach((k) => {
      if (specFields[k] !== undefined) parsedSpecs[k] = specFields[k];
    });
    const extra = {
      socket: parsedSpecs.socket,
      chipset: parsedSpecs.chipset,
      formFactor: parsedSpecs.form_factor,
      type: parsedSpecs.type || parsedSpecs.memory_type,
      memoryType: parsedSpecs.memory_type,
    };

    const { rows } = await pool.query(
      `UPDATE parts SET name=$1,brand=$2,tier=$3,price=$4,image_url=$5,specs=$6,extra=$7,updated_at=NOW() WHERE id=$8 RETURNING *`,
      [
        body.name || old.name,
        body.brand || old.brand,
        body.tier || old.tier,
        parseFloat(body.price) || old.price,
        image_url,
        JSON.stringify(parsedSpecs),
        JSON.stringify(extra),
        req.params.id,
      ],
    );
    res.json({ success: true, data: flattenPart(rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "DELETE FROM parts WHERE id=$1 RETURNING *",
      [req.params.id],
    );
    if (!rows.length)
      return res
        .status(404)
        .json({ success: false, message: "Part not found" });
    if (rows[0].image_url) {
      const filePath = path.join(__dirname, "..", rows[0].image_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.json({ success: true, message: "Part deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
