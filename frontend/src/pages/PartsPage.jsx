import React, { useState, useEffect } from "react";
import { getParts } from "../services/api";
import { useBuild } from "../context/BuildContext";

const TIER_COLORS = {
  flagship: "#ffcc00",
  "high-end": "#6c63ff",
  "mid-range": "#00d4ff",
  budget: "#00ff88",
};
const TIER_LABELS = {
  flagship: "Топ",
  "high-end": "Өндөр",
  "mid-range": "Дунд",
  budget: "Хямд",
};

function specSummary(p) {
  const lines = [];
  if (p.category === "cpu") {
    if (p.socket) lines.push(`Socket: ${p.socket}`);
    if (p.cores) lines.push(`${p.cores} core`);
    if (p.tdp) lines.push(`TDP: ${p.tdp}W`);
  }
  if (p.category === "motherboard") {
    if (p.socket) lines.push(`Socket: ${p.socket}`);
    if (p.chipset) lines.push(`Chipset: ${p.chipset}`);
    if (p.formFactor) lines.push(p.formFactor);
  }
  if (p.category === "gpu") {
    if (p.vram) lines.push(`${p.vram}GB VRAM`);
    if (p.type || p.memoryType) lines.push(p.type || p.memoryType);
    if (p.tdp) lines.push(`TDP: ${p.tdp}W`);
  }
  if (p.category === "ram") {
    if (p.capacity) lines.push(`${p.capacity}GB`);
    if (p.type) lines.push(p.type);
    if (p.speed) lines.push(`${p.speed}MHz`);
  }
  if (p.category === "storage") {
    if (p.capacity) lines.push(`${p.capacity}GB`);
    if (p.type) lines.push(p.type);
  }
  if (p.category === "psu") {
    if (p.wattage) lines.push(`${p.wattage}W`);
    if (p.efficiency) lines.push(p.efficiency);
  }
  if (p.category === "cooler") {
    if (p.tdpSupport) lines.push(`TDP: ${p.tdpSupport}W`);
    if (p.fanSize) lines.push(`${p.fanSize}mm`);
  }
  if (p.category === "case") {
    if (p.formFactor) lines.push(p.formFactor);
  }
  return lines.join(" · ");
}

export default function PartsPage({ category, goBack }) {
  const { setPart } = useBuild();
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState("");

  useEffect(() => {
    setLoading(true);
    getParts(category, { search, tier })
      .then((data) => {
        setParts(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category, search, tier]);

  const handleSelect = (part) => {
    setPart(category, part);
    goBack();
  };

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <button
          onClick={goBack}
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)",
          }}
        >
          <span className="material-icons" style={{ fontSize: 18 }}>
            arrow_back
          </span>
        </button>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>
            {category?.toUpperCase()} сонгох
          </h2>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {parts.length} эд анги байна
          </p>
        </div>
      </div>

      {/* Filters */}
      <div
        style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Хайх..."
          style={{
            flex: 1,
            minWidth: 180,
            padding: "9px 14px",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            color: "var(--text)",
            fontSize: 13,
          }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          {["", "budget", "mid-range", "high-end", "flagship"].map((t) => (
            <button
              key={t}
              onClick={() => setTier(t)}
              style={{
                padding: "8px 14px",
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                border: "1px solid",
                borderColor: tier === t ? "var(--accent)" : "var(--border)",
                background:
                  tier === t ? "var(--accent-dim)" : "var(--bg-elevated)",
                color:
                  tier === t ? "var(--accent-light)" : "var(--text-secondary)",
              }}
            >
              {t === "" ? "Бүгд" : TIER_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            color: "var(--text-muted)",
          }}
        >
          Уншиж байна...
        </div>
      ) : parts.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            color: "var(--text-muted)",
          }}
        >
          Эд анги олдсонгүй
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 12,
          }}
        >
          {parts.map((part) => (
            <div
              key={part.id}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: 16,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onClick={() => handleSelect(part)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)60";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.transform = "none";
              }}
            >
              <div
                style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
              >
                {part.image_url ? (
                  <img
                    src={part.image_url}
                    alt={part.name}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 10,
                      objectFit: "cover",
                      flexShrink: 0,
                      background: "var(--bg-elevated)",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 10,
                      background: "var(--bg-elevated)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      className="material-icons"
                      style={{ color: "var(--text-muted)", fontSize: 24 }}
                    >
                      memory
                    </span>
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 6,
                      marginBottom: 2,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--text)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {part.name}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: TIER_COLORS[part.tier] || "#888",
                        background: (TIER_COLORS[part.tier] || "#888") + "20",
                        padding: "2px 7px",
                        borderRadius: 99,
                        flexShrink: 0,
                      }}
                    >
                      {TIER_LABELS[part.tier] || part.tier}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      marginBottom: 6,
                    }}
                  >
                    {part.brand}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                      marginBottom: 8,
                    }}
                  >
                    {specSummary(part)}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: "var(--green)",
                      }}
                    >
                      ${parseFloat(part.price).toLocaleString()}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--accent-light)",
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <span className="material-icons" style={{ fontSize: 14 }}>
                        add_circle
                      </span>
                      Нэмэх
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
