import React, { useState, useEffect } from "react";
import {
  getSavedBuilds,
  getSavedBuild,
  deleteSavedBuild,
} from "../services/api";
import { useBuild } from "../context/BuildContext";

export default function SavedPage({ navigate }) {
  const { loadBuild } = useBuild();
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const load = () => {
    setLoading(true);
    getSavedBuilds()
      .then((d) => {
        setBuilds(d || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  const handleLoad = async (b) => {
    try {
      const full = await getSavedBuild(b.id);
      loadBuild(full.build, full.name);
      setMsg(`"${b.name}" build-ийг Builder-т хуулав!`);
      setTimeout(() => setMsg(""), 3000);
      if (navigate) navigate("builder");
    } catch {
      setMsg("Алдаа гарлаа");
    }
  };

  const handleDelete = async (b) => {
    if (!confirm(`"${b.name}" build-ийг устгах уу?`)) return;
    await deleteSavedBuild(b.id);
    load();
  };

  const scoreColor = (s) =>
    s >= 80 ? "#00ff88" : s >= 50 ? "#ffcc00" : "#ff4466";

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <h1
        style={{
          fontSize: 24,
          fontWeight: 900,
          color: "var(--text)",
          marginBottom: 4,
        }}
      >
        Хадгалсан Build-үүд
      </h1>
      <p
        style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          marginBottom: 20,
        }}
      >
        {builds.length} build хадгалагдсан байна
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
      ) : builds.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            color: "var(--text-muted)",
          }}
        >
          Одоогоор хадгалсан build байхгүй байна
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {builds.map((b) => (
            <div
              key={b.id}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: "var(--text)",
                      marginBottom: 2,
                    }}
                  >
                    {b.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {new Date(b.createdAt).toLocaleDateString("mn-MN")} ·{" "}
                    {b.partCount} эд анги
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 900,
                      color: "var(--green)",
                    }}
                  >
                    ${parseFloat(b.totalPrice).toLocaleString()}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: scoreColor(b.compatibilityScore),
                    }}
                  >
                    Оноо: {b.compatibilityScore}/100
                  </div>
                </div>
              </div>
              <div
                style={{
                  height: 4,
                  background: "var(--bg-elevated)",
                  borderRadius: 2,
                  marginBottom: 14,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${b.compatibilityScore}%`,
                    height: "100%",
                    background: scoreColor(b.compatibilityScore),
                    borderRadius: 2,
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => handleLoad(b)}
                  style={{
                    flex: 1,
                    padding: "9px 0",
                    borderRadius: 10,
                    background: "var(--accent-dim)",
                    color: "var(--accent-light)",
                    border: "1px solid var(--accent)40",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Builder-т нээх
                </button>
                <button
                  onClick={() => handleDelete(b)}
                  style={{
                    padding: "9px 14px",
                    borderRadius: 10,
                    background: "var(--red-dim)",
                    color: "var(--red)",
                    border: "1px solid var(--red)20",
                    cursor: "pointer",
                  }}
                >
                  <span className="material-icons" style={{ fontSize: 16 }}>
                    delete
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
