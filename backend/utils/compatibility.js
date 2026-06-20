function parseCPUMetadata(cpuName) {
  const name = String(cpuName).toUpperCase();
  let gen = null;
  let year = 2020;
  let tierScore = 3;

  if (name.includes("INTEL") || name.includes("CORE")) {
    const intelMatch = name.match(/I[3579]-?(\d{2,5})/);
    if (intelMatch) {
      const numStr = intelMatch[1];
      if (numStr.length === 4) gen = parseInt(numStr.substring(0, 1));
      else if (numStr.length === 5) gen = parseInt(numStr.substring(0, 2));
      else gen = parseInt(numStr);

      if (gen) {
        if (gen <= 4) year = 2013;
        else if (gen === 6) year = 2015;
        else if (gen === 7) year = 2017;
        else if (gen === 8) year = 2018;
        else if (gen === 9) year = 2019;
        else if (gen === 10) year = 2020;
        else if (gen === 11) year = 2021;
        else if (gen === 12) year = 2022;
        else if (gen === 13) year = 2023;
        else if (gen === 14) year = 2024;
        else if (gen >= 15) year = 2025;
      }
    }
  } else if (name.includes("AMD") || name.includes("RYZEN")) {
    const amdMatch = name.match(/RYZEN\s+[3579]\s+(\d)/);
    if (amdMatch) {
      gen = parseInt(amdMatch[1]);
      if (gen === 1 || gen === 2) year = 2017;
      else if (gen === 3) year = 2019;
      else if (gen === 5) year = 2020;
      else if (gen === 7) year = 2022;
      else if (gen === 9) year = 2024;
    }
  }

  if (name.includes("I9") || name.includes("RYZEN 9")) tierScore = 5;
  else if (name.includes("I7") || name.includes("RYZEN 7")) tierScore = 4;
  else if (name.includes("I5") || name.includes("RYZEN 5")) tierScore = 3;
  else if (name.includes("I3") || name.includes("RYZEN 3")) tierScore = 2;

  return { gen, year, tierScore };
}

function parseGPUMetadata(gpuName) {
  const name = String(gpuName).toUpperCase();
  let year = 2020;
  let tierScore = 3;

  if (name.includes("NVIDIA") || name.includes("RTX") || name.includes("GTX")) {
    const numMatch = name.match(/(50\d{2}|40\d{2}|30\d{2}|20\d{2}|10\d{2})/);
    if (numMatch) {
      const series = numMatch[1];
      if (series.startsWith("10")) year = 2016;
      else if (series.startsWith("20")) year = 2018;
      else if (series.startsWith("30")) year = 2020;
      else if (series.startsWith("40")) year = 2022;
      else if (series.startsWith("50")) year = 2025;
    }
    if (name.includes("90")) tierScore = 5;
    else if (name.includes("80")) tierScore = 4;
    else if (name.includes("70")) tierScore = 3.5;
    else if (name.includes("60")) tierScore = 2.5;
    else tierScore = 2;
  } else if (
    name.includes("AMD") ||
    name.includes("RADEON") ||
    name.includes("RX")
  ) {
    const numMatch = name.match(/(7900|7800|7700|7600|6900|6800|6700|6600)/);
    if (numMatch) {
      const model = numMatch[1];
      if (model.startsWith("6")) year = 2020;
      else if (model.startsWith("7")) year = 2022;
    }
    if (name.includes("900")) tierScore = 5;
    else if (name.includes("800")) tierScore = 4;
    else if (name.includes("700") || name.includes("600")) tierScore = 3;
  }

  return { year, tierScore };
}

function checkCompatibility(build) {
  const issues = [],
    warnings = [],
    suggestions = [];
  const { cpu, motherboard, ram, gpu, psu, cooler, storage } = build;
  const pcCase = build.case;

  if (cpu && motherboard) {
    const cpuSocket = (cpu.socket || cpu.specs?.socket || "")
      .trim()
      .toUpperCase();
    const mbSocket = (motherboard.socket || motherboard.specs?.socket || "")
      .trim()
      .toUpperCase();
    if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
      issues.push({
        type: "error",
        component: "CPU + Motherboard",
        message: `Socket таарахгүй байна: CPU нь ${cpuSocket} боловч Motherboard нь ${mbSocket} сокетийг дэмждэг`,
        severity: "critical",
      });
    }
  }
  if (ram && motherboard) {
    const chipset = (
      motherboard.chipset ||
      motherboard.specs?.chipset ||
      ""
    ).toUpperCase();
    const ramType = (ram.type || ram.specs?.type || "").toUpperCase();
    const maxRam = parseInt(motherboard.specs?.max_ram_capacity || 128);
    const buildRamCap = parseInt(ram.specs?.capacity || 16);

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
    const mbWantsDDR5 =
      ddr5Chipsets.some((c) => chipset.includes(c)) ||
      motherboard.specs?.ram_type === "DDR5";

    if (ramType.includes("DDR5") && !mbWantsDDR5) {
      issues.push({
        type: "error",
        component: "RAM + Motherboard",
        message: `DDR5 RAM нь зөвхөн DDR4 дэмждэг хавтантай тохирохгүй`,
        severity: "critical",
      });
    } else if (ramType.includes("DDR4") && mbWantsDDR5) {
      issues.push({
        type: "error",
        component: "RAM + Motherboard",
        message: `DDR4 RAM нь шинэ үеийн DDR5 хавтантай тохирохгүй`,
        severity: "critical",
      });
    }

    if (buildRamCap > maxRam) {
      issues.push({
        type: "error",
        component: "RAM Capacity",
        message: `Сонгосон RAM-ны хэмжээ (${buildRamCap}GB) нь хавтангийн дэмжих дээд хэмжээнээс (${maxRam}GB) хэтэрсэн байна.`,
        severity: "high",
      });
    }
  }
  if (cpu && gpu) {
    const cpuMeta = parseCPUMetadata(cpu.name);
    const gpuMeta = parseGPUMetadata(gpu.name);
    const yearGap = Math.abs(cpuMeta.year - gpuMeta.year);
    const tierGap = gpuMeta.tierScore - cpuMeta.tierScore;

    if (tierGap >= 2.5) {
      warnings.push({
        type: "warning",
        component: "CPU + GPU Bottleneck",
        message: `Ноцтой Bottleneck үүсэж байна! Хэт удаан процессор (${cpu.name}) нь хүчирхэг график картын (${gpu.name}) нөөцийг түгжин, шаардлагатай хурдыг гаргаж чадахгүй.`,
        severity: "critical",
      });
    } else if (cpuMeta.year < gpuMeta.year && yearGap >= 4 && tierGap >= 1) {
      warnings.push({
        type: "warning",
        component: "CPU + GPU Bottleneck",
        message: `Үеийн зөрүүтэй Bottleneck үүсэж байна! Хуучин CPU (${cpu.name}) нь шинэ график картыг хязгаарлаж байна.`,
        severity: "high",
      });
    }
  }

  if (psu && (cpu || gpu)) {
    const cpuTdp = parseInt(cpu?.tdp || cpu?.specs?.tdp || 65);
    const gpuTdp = parseInt(gpu?.tdp || gpu?.specs?.tdp || 150);
    const wattage = parseInt(psu.wattage || psu.specs?.wattage || 0);

    const totalTDP = cpuTdp + gpuTdp + 150;
    const recommended = Math.ceil(totalTDP * 1.25);

    if (wattage > 0 && wattage < totalTDP) {
      issues.push({
        type: "error",
        component: "PSU",
        message: `Тэжээл хүрэлцэхгүй: Системд хамгийн багадаа ~${totalTDP}W хэрэгтэй (Таных: ${wattage}W). Систем ачаалалаа даахгүй унтрах эрсдэлтэй байна.`,
        severity: "critical",
      });
    }
  }

  if (pcCase) {
    const caseForms = pcCase.formFactor || pcCase.specs?.form_factors || [];
    const caseFArr = Array.isArray(caseForms)
      ? caseForms.map((f) => f.toUpperCase())
      : [String(caseForms).toUpperCase()];

    if (motherboard) {
      const mbForm = (
        motherboard.formFactor ||
        motherboard.specs?.form_factor ||
        ""
      ).toUpperCase();
      if (
        caseFArr.length &&
        mbForm &&
        !caseFArr.some((f) => f.includes(mbForm) || mbForm.includes(f))
      ) {
        issues.push({
          type: "error",
          component: "Motherboard + Case",
          message: `Кейс нь ${mbForm} хэлбэрийн эх хавтан багтааж чадахгүй (Хэт жижиг)`,
          severity: "critical",
        });
      }
    }

    if (gpu) {
      const gpuLength = parseFloat(gpu.specs?.length || gpu.length || 0);
      const maxGpuLength = parseFloat(
        pcCase.specs?.max_gpu_length || pcCase.maxGpuLength || 999,
      );
      if (gpuLength > 0 && gpuLength > maxGpuLength) {
        issues.push({
          type: "error",
          component: "GPU + Case",
          message: `График карт уртаараа кейсэнд багтахгүй! Картын урт: ${gpuLength}mm, Кейсний хязгаар: ${maxGpuLength}mm.`,
          severity: "critical",
        });
      }
    }
  }

  let deduction = issues.length * 25 + warnings.length * 12;
  const hasCriticalBottleneck = warnings.some(
    (w) => w.component === "CPU + GPU Bottleneck" && w.severity === "critical",
  );
  if (hasCriticalBottleneck) deduction += 28;

  const score = Math.max(0, Math.min(100, 100 - deduction));
  let summary = "Бүх зүйл тохирч байна! Сайн сонголт хийсэн байна.";
  if (issues.length > 0)
    summary = `${issues.length} ноцтой алдаа илрүүлэв. Шаардлагатай эд ангиудыг солино уу.`;

  return {
    isCompatible: issues.length === 0,
    score,
    issues,
    warnings,
    suggestions,
    summary,
  };
}

function estimatePerformance(build) {
  const { cpu, gpu, ram } = build;
  if (!cpu || !gpu || !ram) return null;

  const cpuMeta = parseCPUMetadata(cpu.name);
  const gpuMeta = parseGPUMetadata(gpu.name);

  const cpuYearFactor = Math.max(0, cpuMeta.year - 2015) * 5;
  const gpuYearFactor = Math.max(0, gpuMeta.year - 2015) * 6;

  const cpuScore = Math.min(
    100,
    Math.round((cpu.specs?.cores || 4) * 4 + cpuYearFactor),
  );
  const gpuScore = Math.min(
    100,
    Math.round((gpu.specs?.vram || 8) * 4 + gpuYearFactor),
  );
  const ramScore = Math.min(100, Math.round((ram.specs?.capacity || 16) * 1.5));

  const gaming = Math.min(
    100,
    Math.round(gpuScore * 0.6 + cpuScore * 0.3 + ramScore * 0.1),
  );
  const productivity = Math.min(
    100,
    Math.round(cpuScore * 0.6 + ramScore * 0.3 + gpuScore * 0.1),
  );
  const overall = Math.round((gaming + productivity) / 2);

  return { gaming, productivity, overall };
}

module.exports = { checkCompatibility, estimatePerformance };
