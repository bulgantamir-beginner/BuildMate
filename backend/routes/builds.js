const express = require("express");
const router = express.Router();
const pool = require("../db/pool");
const {
  checkCompatibility,
  estimatePerformance,
} = require("../utils/compatibility");

async function resolvePartIds(partIds) {
  const resolved = {};
  if (!partIds || typeof partIds !== "object") return resolved;

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const validIds = Object.values(partIds).filter(
    (id) => id && uuidRegex.test(id.toString()),
  );

  if (!validIds.length) return resolved;

  try {
    const placeholders = validIds.map((_, index) => `$${index + 1}`).join(", ");

    const queryText = `SELECT * FROM parts WHERE id IN (${placeholders})`;
    const { rows } = await pool.query(queryText, validIds);

    for (const [cat, id] of Object.entries(partIds)) {
      if (!id) continue;

      const r = rows.find(
        (row) =>
          row.id.toString().toLowerCase() === id.toString().toLowerCase(),
      );
      if (r) {
        resolved[cat] = {
          id: r.id,
          category: r.category,
          name: r.name,
          brand: r.brand,
          tier: r.tier,
          price: parseFloat(r.price),
          image_url: r.image_url,
          specs: r.specs,
          ...(r.extra || {}),
        };
      }
    }
  } catch (error) {
    console.error("Error resolving part IDs:", error);
  }
  return resolved;
}

router.post("/check", async (req, res) => {
  try {
    const { build } = req.body;
    const resolved = await resolvePartIds(build);
    const compatibility = checkCompatibility(resolved);
    const performance = estimatePerformance(resolved);
    const totalPrice = Object.values(resolved).reduce(
      (s, p) => s + (p.price || 0),
      0,
    );
    const totalTDP = (resolved.cpu?.tdp || 0) + (resolved.gpu?.tdp || 0) + 100;
    res.json({
      success: true,
      data: {
        compatibility,
        performance,
        totalPrice,
        totalTDP,
        partCount: Object.values(resolved).filter(Boolean).length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/save", async (req, res) => {
  try {
    const { build, name, description } = req.body;
    const resolved = await resolvePartIds(build);
    const compatibility = checkCompatibility(resolved);
    const totalPrice = Object.values(resolved).reduce(
      (s, p) => s + (p.price || 0),
      0,
    );
    const { rows } = await pool.query(
      `INSERT INTO builds (name,description,parts,compatibility_score,is_compatible,total_price)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [
        name,
        description || "",
        JSON.stringify(build),
        compatibility.score,
        compatibility.isCompatible,
        totalPrice,
      ],
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/saved", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM builds ORDER BY created_at DESC",
    );
    res.json({
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        totalPrice: parseFloat(r.total_price),
        partCount: Object.keys(r.parts || {}).filter((k) => r.parts[k]).length,
        compatibilityScore: r.compatibility_score,
        isCompatible: r.is_compatible,
        createdAt: r.created_at,
        parts: r.parts,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/saved/:id", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM builds WHERE id=$1", [
      req.params.id,
    ]);
    if (!rows.length)
      return res
        .status(404)
        .json({ success: false, message: "Build not found" });
    const b = rows[0];
    const resolved = await resolvePartIds(b.parts || {});
    res.json({
      success: true,
      data: {
        id: b.id,
        name: b.name,
        description: b.description,
        build: resolved,
        totalPrice: parseFloat(b.total_price),
        compatibilityScore: b.compatibility_score,
        isCompatible: b.is_compatible,
        createdAt: b.created_at,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/saved/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "DELETE FROM builds WHERE id=$1 RETURNING id",
      [req.params.id],
    );
    if (!rows.length)
      return res
        .status(404)
        .json({ success: false, message: "Build not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/compare", async (req, res) => {
  try {
    const { build1, build2, name1, name2 } = req.body;
    const [r1, r2] = await Promise.all([
      resolvePartIds(build1),
      resolvePartIds(build2),
    ]);
    res.json({
      success: true,
      data: {
        build1: {
          name: name1 || "Build 1",
          compatibility: checkCompatibility(r1),
          performance: estimatePerformance(r1),
          totalPrice: Object.values(r1).reduce((s, p) => s + (p.price || 0), 0),
          totalTDP: (r1.cpu?.tdp || 0) + (r1.gpu?.tdp || 0) + 100,
          parts: r1,
        },
        build2: {
          name: name2 || "Build 2",
          compatibility: checkCompatibility(r2),
          performance: estimatePerformance(r2),
          totalPrice: Object.values(r2).reduce((s, p) => s + (p.price || 0), 0),
          totalTDP: (r2.cpu?.tdp || 0) + (r2.gpu?.tdp || 0) + 100,
          parts: r2,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/recommend", async (req, res) => {
  try {
    let { useCase, budget } = req.query;
    const budgetNum = parseInt(budget) || 1500;

    if (
      useCase &&
      (useCase.toLowerCase() === "хэмнэлт" ||
        useCase.toLowerCase() === "budget")
    ) {
      useCase = "budget";
    }

    const tier =
      budgetNum >= 2500
        ? "flagship"
        : budgetNum >= 1500
          ? "high-end"
          : budgetNum >= 900
            ? "mid-range"
            : "budget";

    const configs = {
      gaming: {
        name: "Gaming Build",
        description: "Өндөр FPS тоглоомд зориулсан",
      },
      productivity: {
        name: "Productivity Build",
        description: "Контент бүтээх ба олон ажил",
      },
      budget: {
        name: "Budget Build",
        description: "Үнэ гүйцэтгэлийн зохицол",
      },
    };
    const config = configs[useCase] || configs.gaming;

    function toPartObj(r) {
      if (!r) return null;
      return {
        id: r.id,
        name: r.name,
        brand: r.brand,
        tier: r.tier,
        price: parseFloat(r.price),
        image_url: r.image_url,
        specs: r.specs,
        ...(r.extra || {}),
        socket: (r.specs?.socket || r.extra?.socket || "").trim().toUpperCase(),
        chipset: (r.specs?.chipset || r.extra?.chipset || "").toUpperCase(),
        tdp: parseInt(r.specs?.tdp || r.extra?.tdp || 65),
        wattage: parseInt(r.specs?.wattage || r.extra?.wattage || 0),
        type: (r.specs?.type || r.extra?.type || "").toUpperCase(),
      };
    }

    async function getCandidates(cat) {
      const { rows } = await pool.query(
        "SELECT * FROM parts WHERE category=$1",
        [cat],
      );
      return rows.map(toPartObj);
    }

    const [
      allCpus,
      allMbs,
      allRams,
      allGpus,
      allStorages,
      allPsus,
      allCoolers,
      allCases,
    ] = await Promise.all([
      getCandidates("cpu"),
      getCandidates("motherboard"),
      getCandidates("ram"),
      getCandidates("gpu"),
      getCandidates("storage"),
      getCandidates("psu"),
      getCandidates("cooler"),
      getCandidates("case"),
    ]);

    let recommended = null;
    let estimatedTotal = 0;
    let attempts = 0;
    const ddr5Chipsets = [
      "Z790",
      "X670E",
      "X670",
      "B650E",
      "B650",
      "Z890",
      "X870E",
      "X870",
      "B850",
      "B860",
    ];

    while (attempts < 100) {
      attempts++;

      let cpuPool = allCpus.filter((c) => c.tier === tier);
      if (!cpuPool.length) cpuPool = allCpus;
      const cpu = cpuPool[Math.floor(Math.random() * cpuPool.length)];

      let gpuPool = allGpus.filter((g) => g.tier === tier);
      if (!gpuPool.length) gpuPool = allGpus;
      const gpu = gpuPool[Math.floor(Math.random() * gpuPool.length)];

      if (!cpu || !gpu) break;

      const mbPool = allMbs.filter((mb) => mb.socket === cpu.socket);
      if (!mbPool.length) continue;
      const mb = mbPool[Math.floor(Math.random() * mbPool.length)];

      const mbWantsDDR5 = ddr5Chipsets.some((c) => mb.chipset.includes(c));
      const ramPool = allRams.filter((ram) =>
        mbWantsDDR5 ? ram.type.includes("DDR5") : ram.type.includes("DDR4"),
      );
      if (!ramPool.length) continue;
      const ram = ramPool[Math.floor(Math.random() * ramPool.length)];

      const totalTDP = cpu.tdp + gpu.tdp + 150;
      const psuPool = allPsus.filter((p) => p.wattage >= totalTDP);
      if (!psuPool.length) continue;
      const psu = psuPool[Math.floor(Math.random() * psuPool.length)];

      const storage =
        allStorages[Math.floor(Math.random() * allStorages.length)];
      const cooler =
        allCoolers[Math.floor(Math.random() * allCoolers.length)] || null;
      const pcCase = allCases[Math.floor(Math.random() * allCases.length)];

      const currentBuild = {
        cpu,
        motherboard: mb,
        gpu,
        ram,
        storage,
        psu,
        cooler,
        case: pcCase,
      };
      const currentTotal = Object.values(currentBuild).reduce(
        (s, p) => s + (p ? p.price : 0),
        0,
      );

      const minLimit = budgetNum <= 800 ? 0 : budgetNum * 0.65;

      if (currentTotal <= budgetNum && currentTotal >= minLimit) {
        recommended = currentBuild;
        estimatedTotal = currentTotal;
        break;
      }
    }

    if (!recommended) {
      return res.status(400).json({
        success: false,
        message:
          "Сонгосон төсөвт тохирох эд ангиуд олдсонгүй. Төсвөө нэмэх эсвэл өөр зориулалт сонгоно уу.",
      });
    }

    Object.keys(recommended).forEach((k) => {
      if (!recommended[k]) delete recommended[k];
    });
    res.json({
      success: true,
      data: { ...config, tier, budget: budgetNum, recommended, estimatedTotal },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Сервер дээр алдаа гарлаа." });
  }
});

module.exports = router;
