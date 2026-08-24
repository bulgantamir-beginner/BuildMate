const express = require("express");
const router = express.Router();
const pool = require("../db/pool");
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const GROQ_MODEL = "openai/gpt-oss-120b";

const SYSTEM_PROMPT = `You are PCBuilder AI, an expert PC building assistant embedded inside a BuildMate app. Your personality is friendly, enthusiastic, and knowledgeable.

CRITICAL LANGUAGE RULE: 
- Detect the language of the user's message.
- If the user asks in Mongolian (e.g., "Socket гэж юу вэ?"), you MUST reply completely in proper, grammatically correct Mongolian. Do NOT literal translate. Use natural Mongolian IT terms.
- If the user asks in English, reply in English.
- Keep responses focused and concise — no more than 200 words. Use bullet points.`;

router.post("/chat", async (req, res) => {
  try {
    const { message, sessionId, currentBuild, history } = req.body;
    if (!message)
      return res
        .status(400)
        .json({ success: false, message: "Message required" });

    let contextMsg = "";
    if (currentBuild && Object.values(currentBuild).some(Boolean)) {
      const parts = Object.entries(currentBuild)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k.toUpperCase()}: ${v.name}`)
        .join(", ");
      contextMsg = `\n\n[User's current build: ${parts}]`;
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(history || []).slice(-6).map((h) => ({
        role: h.role === "assistant" ? "assistant" : "user",
        content: h.content,
      })),
      { role: "user", content: message + contextMsg },
    ];

    console.log("⚡ Requesting Groq API Cloud...");

    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: GROQ_MODEL,
      temperature: 0.7,
      max_tokens: 800,
    });

    const reply = chatCompletion.choices[0]?.message?.content || "";
    console.log("✅ Groq Cloud responded in milliseconds!");

    if (sessionId) {
      await pool
        .query(
          "INSERT INTO ai_chats (session_id,role,content) VALUES ($1,$2,$3),($1,$4,$5)",
          [sessionId, "user", message, "assistant", reply],
        )
        .catch((err) => console.error("⚠️ DB Error:", err.message));
    }

    res.json({ success: true, reply: reply, data: { reply, sessionId } });
  } catch (err) {
    console.error("❌ Groq Error:", err.message);
    res
      .status(500)
      .json({ success: false, message: "AI error: " + err.message });
  }
});

router.post("/quick", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question)
      return res
        .status(400)
        .json({ success: false, message: "Question required" });

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: question },
      ],
      model: GROQ_MODEL,
      temperature: 0.6,
      max_tokens: 500,
    });

    const reply = chatCompletion.choices[0]?.message?.content || "";
    res.json({ success: true, reply: reply, data: { reply } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/history/:sessionId", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT role,content FROM ai_chats WHERE session_id=$1 ORDER BY created_at ASC",
      [req.params.sessionId],
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
