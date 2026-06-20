import React from 'react'

const FEATURES = [
  { icon: 'build', color: '#6c63ff', title: 'PC Builder', desc: 'Эд ангиудаа сонгон байгуулах' },
  { icon: 'auto_awesome', color: '#00d4ff', title: 'Санал Болгох', desc: 'Хэрэгцээндээ тохирсон build' },
  { icon: 'verified', color: '#00ff88', title: 'Нийцлийн Шалгалт', desc: 'Socket, DDR, PSU бүгдийг шалгана' },
  { icon: 'compare', color: '#ffcc00', title: 'Build Харьцуулах', desc: 'Хоёр build-ийг зэрэгцүүлэх' },
  { icon: 'smart_toy', color: '#ff6b6b', title: 'AI Туслах', desc: 'PC-ийн мэргэжилтэн AI асуулт хариулт' },
  { icon: 'bookmark', color: '#a29bfe', title: 'Хадгалах', desc: 'Своих build-ийг хадгалах' },
]

export default function HomePage({ navigate }) {
  return (
    <div style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--accent-dim) 0%, var(--bg-card) 100%)',
        borderRadius: 20, padding: 40, marginBottom: 32, border: '1px solid var(--border)',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'var(--accent)', borderRadius: '50%', opacity: 0.06 }} />
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-light)', letterSpacing: 2, marginBottom: 12 }}>PC BUILDER СИСТЕМ</div>
        <h1 style={{ fontSize: 40, fontWeight: 900, color: 'var(--text)', letterSpacing: -1, lineHeight: 1.1, marginBottom: 12 }}>
          BuildMate-д<br />
          <span style={{ color: 'var(--accent-light)' }}>тавтай морил</span>
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 28, maxWidth: 480, lineHeight: 1.6 }}>
          Өөрийн гэсэн PC-г тохирсон эд ангиудаар байгуул. AI туслахаараа нийцлийг шалгаж, хамгийн сайн сонголтыг гарга.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button onClick={() => navigate('builder')}
            style={{ background: 'var(--accent)', color: '#fff', padding: '12px 24px', borderRadius: 12, fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-icons" style={{ fontSize: 18 }}>build</span>
            Build эхлэх
          </button>
          <button onClick={() => navigate('recommend')}
            style={{ background: 'var(--bg-elevated)', color: 'var(--text)', padding: '12px 24px', borderRadius: 12, fontWeight: 700, fontSize: 14, border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-icons" style={{ fontSize: 18 }}>auto_awesome</span>
            Санал авах
          </button>
        </div>
      </div>

      {/* Features */}
      <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1.5, marginBottom: 16 }}>БОЛОМЖУУД</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
        {FEATURES.map(f => (
          <div key={f.title}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14, cursor: 'pointer', transition: 'border-color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = f.color + '80'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ width: 40, height: 40, borderRadius: 10, background: f.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-icons" style={{ color: f.color, fontSize: 20 }}>{f.icon}</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 3 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tip box */}
      <div style={{ background: 'var(--cyan-dim)', border: '1px solid var(--cyan)30', borderRadius: 14, padding: '16px 20px', marginTop: 28, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span className="material-icons" style={{ color: 'var(--cyan)', fontSize: 20, marginTop: 1 }}>tips_and_updates</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--cyan)', marginBottom: 4 }}>Зөвлөмж</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            AMD Ryzen процессор AM5 socket ашигладаг бол Intel Core процессор LGA1700 socket ашигладаг. Socket таарахгүй бол motherboard-т суулгах боломжгүй. BuildMate энэ бүхнийг автоматаар шалгана.
          </div>
        </div>
      </div>
    </div>
  )
}
