import React, { useState } from "react";
import { getRecommendations } from "../services/api";
import { useBuild } from "../context/BuildContext";

const USE_CASES = [
  {
    id: "gaming",
    label: "Тоглоом",
    icon: "sports_esports",
    color: "#6c63ff",
    desc: "Өндөр FPS, дүрс чанар",
  },
  {
    id: "productivity",
    label: "Ажил",
    icon: "work",
    color: "#00d4ff",
    desc: "Контент & олон ажил",
  },
  {
    id: "budget",
    label: "Хэмнэлт",
    icon: "savings",
    color: "#00ff88",
    desc: "Хамгийн хямд үнэ",
  },
];
const BUDGETS = [
  { label: "< $800", value: 800 },
  { label: "$800-1.5k", value: 1500 },
  { label: "$1.5-2.5k", value: 2500 },
  { label: "$2.5k+", value: 4000 },
];
const CAT_LABELS = {
  cpu: "Процессор",
  motherboard: "Motherboard",
  gpu: "Видео карт",
  ram: "Санах ой",
  storage: "Хадгалах зай",
  psu: "Цахилгаан",
  cooler: "Cooler",
  case: "Кейс",
};

export default function RecommendPage({ navigate }) {
  const { loadBuild } = useBuild();
  const [useCase, setUseCase] = useState("gaming");
  const [budget, setBudget] = useState(1500);
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const generate = async () => {
    setLoading(true);
    setRec(null);
    setMsg(""); // Өмнөх алдааны мессежийг цэвэрлэх

    try {
      const data = await getRecommendations(useCase, budget);
      setRec(data);
    } catch (err) {
      // Backend-ээс ирсэн тусгай алдааны мессежийг барьж авах
      // Axios-ийн хувьд алдаа нь err.response.data.message дотор байдаг
      const errorMsg =
        err.response?.data?.message ||
        "Алдаа гарлаа. Backend холболтоо шалгана уу.";
      setMsg(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = () => {
    loadBuild(rec.recommended, rec.name);
    setMsg("Build-ийг Builder хэсэгт хуулав!");
    setTimeout(() => setMsg(""), 3000);
    if (navigate) navigate("builder");
  };

  return (
    <div style={{ padding: 28, maxWidth: 720, margin: "0 auto" }}>
      <h1
        style={{
          fontSize: 24,
          fontWeight: 900,
          color: "var(--text)",
          marginBottom: 4,
        }}
      >
        Компьютер санал болгох
      </h1>
      <p
        style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          marginBottom: 28,
        }}
      >
        Хэрэгцээ, төсөвт тохирсон build-ийг санал болгоно. Дахин дарснаар өөр
        санал гаргана.
      </p>

      {msg && (
        <div
          style={{
            background: "var(--green-dim)",
            border: "1px solid var(--green)40",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 13,
            color: "var(--green)",
            marginBottom: 16,
          }}
        >
          {msg}
        </div>
      )}

      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--text-muted)",
          letterSpacing: 1.5,
          marginBottom: 10,
        }}
      >
        ХЭРЭГЛЭХ ЗОРИУЛАЛТ
      </div>
      <div
        style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}
      >
        {USE_CASES.map((u) => (
          <button
            key={u.id}
            onClick={() => setUseCase(u.id)}
            style={{
              flex: 1,
              minWidth: 120,
              padding: "14px 10px",
              borderRadius: 14,
              border: `1.5px solid ${useCase === u.id ? u.color : "var(--border)"}`,
              background: useCase === u.id ? u.color + "15" : "var(--bg-card)",
              cursor: "pointer",
              textAlign: "center",
              transition: "all 0.15s",
            }}
          >
            <span
              className="material-icons"
              style={{
                color: useCase === u.id ? u.color : "var(--text-muted)",
                fontSize: 28,
                display: "block",
                marginBottom: 6,
              }}
            >
              {u.icon}
            </span>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: useCase === u.id ? u.color : "var(--text-secondary)",
              }}
            >
              {u.label}
            </div>
            <div
              style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}
            >
              {u.desc}
            </div>
          </button>
        ))}
      </div>

      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--text-muted)",
          letterSpacing: 1.5,
          marginBottom: 10,
        }}
      >
        ТӨСӨВ
      </div>
      <div
        style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}
      >
        {BUDGETS.map((b) => (
          <button
            key={b.value}
            onClick={() => setBudget(b.value)}
            style={{
              padding: "8px 18px",
              borderRadius: 99,
              fontSize: 13,
              fontWeight: 600,
              border: `1px solid ${budget === b.value ? "var(--accent)" : "var(--border)"}`,
              background:
                budget === b.value ? "var(--accent-dim)" : "var(--bg-card)",
              color:
                budget === b.value
                  ? "var(--accent-light)"
                  : "var(--text-secondary)",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {b.label}
          </button>
        ))}
      </div>

      <button
        onClick={generate}
        disabled={loading}
        style={{
          width: "100%",
          padding: "14px 0",
          borderRadius: 12,
          background: loading ? "var(--accent-dim)" : "var(--accent)",
          color: "#fff",
          fontSize: 15,
          fontWeight: 700,
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          marginBottom: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <span className="material-icons" style={{ fontSize: 20 }}>
          auto_awesome
        </span>
        {loading ? "Санал бэлтгэж байна..." : "Санал болгох"}
      </button>

      {rec && (
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              background:
                "linear-gradient(135deg, var(--accent-dim), var(--bg-elevated))",
              padding: "20px 22px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--text-muted)",
                letterSpacing: 1.5,
                marginBottom: 4,
              }}
            >
              {(rec.tier || "").toUpperCase()} ЗЭРЭГ
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: "var(--text)",
                marginBottom: 2,
              }}
            >
              {rec.name}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                marginBottom: 10,
              }}
            >
              {rec.description}
            </div>
            <div
              style={{ fontSize: 28, fontWeight: 900, color: "var(--green)" }}
            >
              ~${rec.estimatedTotal?.toLocaleString()}
            </div>
          </div>

          {/* Parts list */}
          {Object.entries(rec.recommended || {}).map(([cat, part]) =>
            !part ? null : (
              <div
                key={cat}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 18px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {part.image_url ? (
                  <img
                    src={part.image_url}
                    alt={part.name}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: "var(--bg-elevated)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      className="material-icons"
                      style={{ color: "var(--text-muted)", fontSize: 18 }}
                    >
                      memory
                    </span>
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--text-muted)",
                      fontWeight: 700,
                      letterSpacing: 0.8,
                    }}
                  >
                    {CAT_LABELS[cat] || cat.toUpperCase()}
                  </div>
                  <div
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
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--green)",
                    flexShrink: 0,
                  }}
                >
                  ${parseFloat(part.price).toLocaleString()}
                </div>
              </div>
            ),
          )}

          <div style={{ padding: "14px 18px" }}>
            <button
              onClick={handleLoad}
              style={{
                width: "100%",
                padding: "12px 0",
                borderRadius: 12,
                background: "var(--green-dim)",
                color: "var(--green)",
                border: "1px solid var(--green)40",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <span className="material-icons" style={{ fontSize: 18 }}>
                build
              </span>
              Builder-т хуулах →
            </button>
            <button
              onClick={generate}
              style={{
                width: "100%",
                padding: "10px 0",
                borderRadius: 12,
                background: "transparent",
                color: "var(--text-muted)",
                border: "1px solid var(--border)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                marginTop: 8,
              }}
            >
              Өөр санал харах ↺
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
