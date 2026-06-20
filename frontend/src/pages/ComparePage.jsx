import React, { useState } from "react";
import { getSavedBuilds, compareBuilds } from "../services/api";

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

export default function ComparePage() {
  const [saved, setSaved] = useState([]);
  const [loadedSaved, setLoadedSaved] = useState(false);
  const [sel1, setSel1] = useState("");
  const [sel2, setSel2] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const loadSaved = async () => {
    if (loadedSaved) return;
    try {
      setSaved(await getSavedBuilds());
      setLoadedSaved(true);
    } catch {
      setMsg("Хадгалсан build-ийг уншихад алдаа гарлаа");
    }
  };

  const compare = async () => {
    if (!sel1 || !sel2) return;
    const b1 = saved.find((b) => b.id === sel1);
    const b2 = saved.find((b) => b.id === sel2);
    setLoading(true);
    try {
      // 1. Бэкэндээс ирсэн parts-ийг объект болгож хөрвүүлэх хамгаалалт
      let p1Ids = b1?.parts || {};
      let p2Ids = b2?.parts || {};

      if (typeof p1Ids === "string") p1Ids = JSON.parse(p1Ids);
      if (typeof p2Ids === "string") p2Ids = JSON.parse(p2Ids);

      // 2. Зөвхөн цэвэр UUID-нуудыг нь ялгаж авах
      const cleanBuild1 = {};
      const cleanBuild2 = {};

      Object.keys(p1Ids).forEach((cat) => {
        if (p1Ids[cat]) {
          cleanBuild1[cat] = p1Ids[cat].id || p1Ids[cat];
        }
      });
      Object.keys(p2Ids).forEach((cat) => {
        if (p2Ids[cat]) {
          cleanBuild2[cat] = p2Ids[cat].id || p2Ids[cat];
        }
      });

      // 3. Бэкэнд рүү илгээх
      const res = await compareBuilds(
        cleanBuild1,
        cleanBuild2,
        b1?.name,
        b2?.name,
      );
      setResult(res);
    } catch (err) {
      console.error("Харьцуулахад алдаа гарлаа:", err);
      setMsg("Харьцуулахад алдаа гарлаа");
    }
    setLoading(false);
  };

  const scoreColor = (s) =>
    s >= 80 ? "var(--green)" : s >= 50 ? "var(--yellow)" : "var(--red)";

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1
        style={{
          fontSize: 24,
          fontWeight: 900,
          color: "var(--text)",
          marginBottom: 4,
        }}
      >
        Build Харьцуулах
      </h1>
      <p
        style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          marginBottom: 24,
        }}
      >
        Хоёр хадгалсан build-ийг зэрэгцүүлэн харьцуулах
      </p>

      {msg && (
        <div
          style={{
            background: "var(--red-dim)",
            border: "1px solid var(--red)30",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 13,
            color: "var(--red)",
            marginBottom: 16,
          }}
        >
          {msg}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 20,
        }}
      >
        {[
          { label: "1-р Build", val: sel1, set: setSel1 },
          { label: "2-р Build", val: sel2, set: setSel2 },
        ].map(({ label, val, set }) => (
          <div key={label}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--text-muted)",
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              {label}
            </div>
            <select
              value={val}
              onChange={(e) => set(e.target.value)}
              onFocus={loadSaved}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                color: val ? "var(--text)" : "var(--text-muted)",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              <option value="">— Build сонгох —</option>
              {saved.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} (${parseFloat(b.totalPrice).toLocaleString()})
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <button
        onClick={compare}
        disabled={!sel1 || !sel2 || sel1 === sel2 || loading}
        style={{
          width: "100%",
          padding: "13px 0",
          borderRadius: 12,
          background: "var(--accent)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 14,
          border: "none",
          cursor: "pointer",
          opacity: !sel1 || !sel2 || sel1 === sel2 ? 0.5 : 1,
          marginBottom: 28,
        }}
      >
        {loading ? "Харьцуулж байна..." : "Харьцуулах"}
      </button>

      {result && (
        <div>
          {/* Score row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              marginBottom: 14,
            }}
          >
            {[result.build1, result.build2].map((b, i) => (
              <div
                key={i}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  padding: 18,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "var(--text)",
                    marginBottom: 6,
                  }}
                >
                  {b.name}
                </div>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 900,
                    color: scoreColor(b.compatibility?.score || 0),
                  }}
                >
                  {b.compatibility?.score || 0}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    marginBottom: 10,
                  }}
                >
                  Нийцлийн оноо
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: "var(--green)",
                  }}
                >
                  ${parseFloat(b.totalPrice || 0).toLocaleString()}
                </div>
                {b.performance && (
                  <div style={{ marginTop: 12, textAlign: "left" }}>
                    {[
                      ["Тоглоом", b.performance.gaming, "#6c63ff"],
                      ["Ажил", b.performance.productivity, "#00d4ff"],
                    ].map(([lbl, val, col]) => (
                      <div key={lbl} style={{ marginBottom: 6 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 11,
                            color: "var(--text-secondary)",
                            marginBottom: 2,
                          }}
                        >
                          <span>{lbl}</span>
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
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Parts comparison */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "100px 1fr 1fr",
                background: "var(--bg-elevated)",
                padding: "10px 16px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                }}
              >
                ЭД АНГИ
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--accent-light)",
                }}
              >
                {result.build1.name}
              </div>
              <div
                style={{ fontSize: 11, fontWeight: 700, color: "var(--cyan)" }}
              >
                {result.build2.name}
              </div>
            </div>
            {Object.keys(CAT_LABELS).map((cat) => {
              const p1 = result.build1.parts?.[cat];
              const p2 = result.build2.parts?.[cat];
              if (!p1 && !p2) return null;
              return (
                <div
                  key={cat}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "100px 1fr 1fr",
                    padding: "10px 16px",
                    borderBottom: "1px solid var(--border)",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                    }}
                  >
                    {CAT_LABELS[cat]}
                  </div>
                  {[p1, p2].map((p, i) => (
                    <div key={i}>
                      {p ? (
                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "var(--text)",
                              marginBottom: 1,
                            }}
                          >
                            {p.name}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--green)",
                              fontWeight: 700,
                            }}
                          >
                            ${parseFloat(p.price || 0).toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <span
                          style={{ fontSize: 12, color: "var(--text-muted)" }}
                        >
                          —
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
