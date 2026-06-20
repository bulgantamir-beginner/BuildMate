import React, { useState, useEffect, useRef } from "react";
import { useBuild } from "../context/BuildContext";

const CATEGORIES = [
  { id: "cpu", label: "Процессор (CPU)", icon: "memory", color: "#ff6b6b" },
  {
    id: "motherboard",
    label: "Motherboard",
    icon: "developer_board",
    color: "#feca57",
  },
  { id: "gpu", label: "Видео карт (GPU)", icon: "grid_on", color: "#6c63ff" },
  { id: "ram", label: "Санах ой (RAM)", icon: "storage", color: "#00d4ff" },
  { id: "storage", label: "Хадгалах Зай", icon: "sd_card", color: "#00ff88" },
  { id: "psu", label: "Цахилгааны Эх Үүсвэр", icon: "bolt", color: "#ff9f43" },
  { id: "cooler", label: "CPU Cooler", icon: "air", color: "#74b9ff" },
  { id: "case", label: "Кейс", icon: "computer", color: "#a29bfe" },
];

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

function CompatBar({ score }) {
  const color = score >= 80 ? "#00ff88" : score >= 50 ? "#ffcc00" : "#ff4466";
  return (
    <div style={{ marginTop: 6 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
          Нийцлийн оноо
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>
          {score}/100
        </span>
      </div>
      <div
        style={{
          height: 6,
          background: "var(--bg-elevated)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${score}%`,
            height: "100%",
            background: color,
            borderRadius: 3,
            transition: "width 0.5s",
          }}
        />
      </div>
    </div>
  );
}

export default function BuilderPage({ goToParts }) {
  const {
    build,
    compatibility,
    isChecking,
    isSaving,
    buildName,
    setPart,
    removePart,
    clearBuild,
    checkCompatibility,
    saveBuild,
  } = useBuild();
  const [saveName, setSaveName] = useState("");
  const [showSave, setShowSave] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const partCount = Object.values(build).filter(Boolean).length;
  const totalPrice = Object.values(build).reduce(
    (s, p) => s + (p?.price || 0),
    0,
  );

  const debounceRef = useRef(null);
  useEffect(() => {
    if (partCount < 2) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      checkCompatibility();
    }, 600);
    return () => clearTimeout(debounceRef.current);
  }, [build]);

  const handleCheck = async () => {
    await checkCompatibility();
  };

  const handleSave = async () => {
    if (!saveName.trim()) return;
    try {
      await saveBuild(saveName, "");
      setSaveMsg("Build амжилттай хадгалагдлаа!");
      setShowSave(false);
      setSaveName("");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch {
      setSaveMsg("Алдаа гарлаа");
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--text)" }}>
            PC Builder
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              marginTop: 2,
            }}
          >
            {partCount}/8 эд анги сонгогдсон · Нийт:{" "}
            <span style={{ color: "var(--green)", fontWeight: 700 }}>
              ${totalPrice.toLocaleString()}
            </span>
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {saveMsg && (
            <span
              style={{
                color: "var(--green)",
                fontSize: 13,
                alignSelf: "center",
              }}
            >
              {saveMsg}
            </span>
          )}
          <button
            onClick={clearBuild}
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              background: "var(--red-dim)",
              color: "var(--red)",
              border: "1px solid var(--red)30",
              cursor: "pointer",
            }}
          >
            Цэвэрлэх
          </button>
          {partCount >= 2 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 10,
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                fontSize: 12,
                color: "var(--text-secondary)",
              }}
            >
              {isChecking ? (
                <>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--yellow)",
                      display: "inline-block",
                      animation: "pulse 1s infinite",
                    }}
                  />
                  Шалгаж байна...
                </>
              ) : (
                <>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--green)",
                      display: "inline-block",
                    }}
                  />
                  Автомат шалгалт
                </>
              )}
            </div>
          )}
          <button
            onClick={() => setShowSave(true)}
            disabled={partCount === 0}
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              opacity: partCount === 0 ? 0.5 : 1,
            }}
          >
            Хадгалах
          </button>
        </div>
      </div>

      {showSave && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#000000aa",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "var(--bg-card)",
              borderRadius: 16,
              padding: 28,
              width: 360,
              border: "1px solid var(--border)",
            }}
          >
            <h3
              style={{
                fontWeight: 800,
                color: "var(--text)",
                marginBottom: 16,
              }}
            >
              Build Хадгалах
            </h3>
            <input
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Build-ийн нэр..."
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                color: "var(--text)",
                fontSize: 14,
                marginBottom: 16,
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setShowSave(false)}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 10,
                  background: "var(--bg-elevated)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Болих
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  flex: 2,
                  padding: 10,
                  borderRadius: 10,
                  background: "var(--accent)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                {isSaving ? "Хадгалж байна..." : "Хадгалах"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 20,
          alignItems: "start",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 12,
          }}
        >
          {CATEGORIES.map((cat) => {
            const part = build[cat.id];
            return (
              <div
                key={cat.id}
                style={{
                  background: "var(--bg-card)",
                  border: `1px solid ${part ? cat.color + "40" : "var(--border)"}`,
                  borderRadius: 14,
                  padding: 16,
                  transition: "border-color 0.2s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      background: cat.color + "20",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      className="material-icons"
                      style={{ color: cat.color, fontSize: 18 }}
                    >
                      {cat.icon}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {cat.label}
                  </span>
                </div>

                {part ? (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                      }}
                    >
                      {part.image_url && (
                        <img
                          src={part.image_url}
                          alt={part.name}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 8,
                            objectFit: "cover",
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "var(--text)",
                            marginBottom: 2,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {part.name}
                        </div>
                        <div
                          style={{ fontSize: 11, color: "var(--text-muted)" }}
                        >
                          {part.brand}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginTop: 6,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "var(--green)",
                            }}
                          >
                            ${parseFloat(part.price).toLocaleString()}
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: TIER_COLORS[part.tier],
                              background: TIER_COLORS[part.tier] + "20",
                              padding: "2px 7px",
                              borderRadius: 99,
                            }}
                          >
                            {TIER_LABELS[part.tier] || part.tier}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                      <button
                        onClick={() => goToParts(cat.id)}
                        style={{
                          flex: 1,
                          padding: "7px 0",
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 700,
                          background: "var(--bg-elevated)",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border)",
                          cursor: "pointer",
                        }}
                      >
                        Солих
                      </button>
                      <button
                        onClick={() => removePart(cat.id)}
                        style={{
                          padding: "7px 10px",
                          borderRadius: 8,
                          fontSize: 11,
                          background: "var(--red-dim)",
                          color: "var(--red)",
                          border: "1px solid var(--red)20",
                          cursor: "pointer",
                        }}
                      >
                        <span
                          className="material-icons"
                          style={{ fontSize: 14 }}
                        >
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => goToParts(cat.id)}
                    style={{
                      width: "100%",
                      padding: "22px 0",
                      borderRadius: 10,
                      background: "var(--bg-elevated)",
                      border: "1.5px dashed var(--border)",
                      color: "var(--text-muted)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = cat.color;
                      e.currentTarget.style.color = cat.color;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.color = "var(--text-muted)";
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: 18 }}>
                      add
                    </span>
                    {cat.label} нэмэх
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ position: "sticky", top: 20 }}>
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 18,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--text-muted)",
                letterSpacing: 1.5,
                marginBottom: 14,
              }}
            >
              НИЙТ ҮНЭ
            </div>
            <div
              style={{ fontSize: 30, fontWeight: 900, color: "var(--green)" }}
            >
              ${totalPrice.toLocaleString()}
            </div>
            <div
              style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}
            >
              {partCount} эд анги
            </div>
            <div
              style={{
                borderTop: "1px solid var(--border)",
                marginTop: 14,
                paddingTop: 14,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {CATEGORIES.map((cat) => {
                const p = build[cat.id];
                if (!p) return null;
                return (
                  <div
                    key={cat.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{ fontSize: 11, color: "var(--text-secondary)" }}
                    >
                      {cat.label}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--text)",
                      }}
                    >
                      ${parseFloat(p.price).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {partCount < 2 && (
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: 18,
                textAlign: "center",
              }}
            >
              <span
                className="material-icons"
                style={{
                  fontSize: 28,
                  color: "var(--text-muted)",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                shield
              </span>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  marginBottom: 4,
                }}
              >
                НИЙЦЛИЙН ШАЛГАЛТ
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  lineHeight: 1.6,
                }}
              >
                2+ эд анги сонгосны дараа автоматаар шалгана
              </div>
            </div>
          )}
          {partCount >= 2 && isChecking && !compatibility && (
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: 18,
                textAlign: "center",
              }}
            >
              <span
                className="material-icons"
                style={{
                  fontSize: 28,
                  color: "var(--accent-light)",
                  display: "block",
                  marginBottom: 8,
                  animation: "pulse 1s infinite",
                }}
              >
                sync
              </span>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Шалгаж байна...
              </div>
            </div>
          )}
          {compatibility && (
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: 18,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  letterSpacing: 1.5,
                  marginBottom: 12,
                }}
              >
                НИЙЦЛИЙН ШАЛГАЛТ
              </div>
              <CompatBar score={compatibility.compatibility?.score || 0} />
              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  marginTop: 10,
                  lineHeight: 1.5,
                }}
              >
                {compatibility.compatibility?.summary}
              </p>

              {compatibility.compatibility?.issues?.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  {compatibility.compatibility.issues.map((issue, i) => (
                    <div
                      key={i}
                      style={{
                        background: "var(--red-dim)",
                        border: "1px solid var(--red)30",
                        borderRadius: 8,
                        padding: "8px 10px",
                        marginBottom: 6,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "var(--red)",
                          marginBottom: 2,
                        }}
                      >
                        {issue.component}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-secondary)",
                          lineHeight: 1.4,
                        }}
                      >
                        {issue.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {compatibility.compatibility?.warnings?.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  {compatibility.compatibility.warnings.map((w, i) => (
                    <div
                      key={i}
                      style={{
                        background: "var(--yellow-dim)",
                        border: "1px solid var(--yellow)30",
                        borderRadius: 8,
                        padding: "8px 10px",
                        marginBottom: 6,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "var(--yellow)",
                          marginBottom: 2,
                        }}
                      >
                        {w.component}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-secondary)",
                          lineHeight: 1.4,
                        }}
                      >
                        {w.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {compatibility.compatibility?.suggestions?.map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 6,
                    marginTop: 6,
                  }}
                >
                  <span
                    className="material-icons"
                    style={{
                      fontSize: 14,
                      color: "var(--green)",
                      marginTop: 1,
                    }}
                  >
                    check_circle
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--text-secondary)",
                      lineHeight: 1.4,
                    }}
                  >
                    {s.message}
                  </span>
                </div>
              ))}

              {compatibility.performance && (
                <div
                  style={{
                    marginTop: 14,
                    borderTop: "1px solid var(--border)",
                    paddingTop: 14,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      letterSpacing: 1,
                      marginBottom: 10,
                    }}
                  >
                    ГҮЙЦЭТГЭЛ
                  </div>
                  {[
                    ["Тоглоом", compatibility.performance.gaming, "#6c63ff"],
                    ["Ажил", compatibility.performance.productivity, "#00d4ff"],
                  ].map(([label, val, col]) => (
                    <div key={label} style={{ marginBottom: 8 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 11,
                          color: "var(--text-secondary)",
                          marginBottom: 3,
                        }}
                      >
                        <span>{label}</span>
                        <span style={{ fontWeight: 700, color: col }}>
                          {val}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: 5,
                          background: "var(--bg-elevated)",
                          borderRadius: 3,
                        }}
                      >
                        <div
                          style={{
                            width: `${val}%`,
                            height: "100%",
                            background: col,
                            borderRadius: 3,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  {compatibility.performance.bottleneck && (
                    <div
                      style={{
                        background: "var(--yellow-dim)",
                        borderRadius: 8,
                        padding: "8px 10px",
                        marginTop: 8,
                        fontSize: 11,
                        color: "var(--yellow)",
                        fontWeight: 600,
                      }}
                    >
                      ⚠ {compatibility.performance.bottleneck}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
