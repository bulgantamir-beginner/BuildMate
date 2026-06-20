import React, { useState, useRef, useEffect } from 'react'
import { sendAiMessage } from '../services/api'
import { useBuild } from '../context/BuildContext'

const QUICK = [
  'Bottleneck гэж юу вэ?',
  'Миний build-ийг шинжлэх',
  'DDR4 vs DDR5 ялгаа',
  'Socket гэж юу вэ?',
  'GPU сонгоход юу харах вэ?',
  'PSU wattage хэрхэн тооцох?',
]

function MsgBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 16 }}>
      {!isUser && (
        <div style={{ width: 30, height: 30, borderRadius: 10, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 8, marginTop: 2 }}>
          <span className="material-icons" style={{ color: 'var(--accent-light)', fontSize: 16 }}>smart_toy</span>
        </div>
      )}
      <div style={{
        maxWidth: '75%', padding: '10px 14px', borderRadius: isUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
        background: isUser ? 'var(--accent)' : 'var(--bg-card)',
        border: isUser ? 'none' : '1px solid var(--border)',
        fontSize: 13, lineHeight: 1.6, color: isUser ? '#fff' : 'var(--text)',
        whiteSpace: 'pre-wrap'
      }}>
        {msg.content}
      </div>
    </div>
  )
}

export default function AiPage() {
  const { build } = useBuild()
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Сайн байна уу! Би BuildMate AI туслах. PC-ийн аль ч асуудлаар надаас асуугаарай — нийцлийн шалгалт, эд ангийн тайлбар, bottleneck шинжилгээ гэх мэт.' }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const sessionId = useRef(`session-${Date.now()}`)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    const newMsgs = [...messages, { role: 'user', content: msg }]
    setMessages(newMsgs)
    setLoading(true)
    try {
      const currentBuild = {}
      Object.entries(build).forEach(([k, v]) => { if (v) currentBuild[k] = v })
      const res = await sendAiMessage(msg, sessionId.current, currentBuild, messages.slice(-8))
      setMessages(m => [...m, { role: 'assistant', content: res.reply }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Алдаа гарлаа. AI холболтоо шалгана уу.' }])
    }
    setLoading(false)
  }

  const hasBuild = Object.values(build).some(Boolean)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-icons" style={{ color: 'var(--accent-light)', fontSize: 20 }}>smart_toy</span>
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>AI Туслах</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{hasBuild ? 'Таны build-ийг мэдэж байна' : 'PC-ийн мэргэжлийн туслах'}</div>
        </div>
      </div>

      {/* Quick questions */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {QUICK.map(q => (
          <button key={q} onClick={() => send(q)}
            style={{ padding: '5px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent-light)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {messages.map((m, i) => <MsgBubble key={i} msg={m} />)}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 30, height: 30, borderRadius: 10, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-icons" style={{ color: 'var(--accent-light)', fontSize: 16 }}>smart_toy</span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)', animation: `pulse 1.2s ${i*0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)', display: 'flex', gap: 10 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="PC-ийн талаар асуугаарай..."
          style={{ flex: 1, padding: '11px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)', fontSize: 13 }} />
        <button onClick={() => send()} disabled={!input.trim() || loading}
          style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: !input.trim() || loading ? 0.5 : 1 }}>
          <span className="material-icons" style={{ color: '#fff', fontSize: 20 }}>send</span>
        </button>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:.3;transform:scale(.8)} 50%{opacity:1;transform:scale(1)} }`}</style>
    </div>
  )
}
