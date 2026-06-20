import React, { useState, useEffect, useRef } from 'react'
import { getParts, createPart, updatePart, deletePart, adminLogin } from '../services/api'

const CATEGORIES = [
  { id: 'cpu', label: 'Процессор (CPU)' },
  { id: 'motherboard', label: 'Motherboard' },
  { id: 'gpu', label: 'Видео карт (GPU)' },
  { id: 'ram', label: 'Санах ой (RAM)' },
  { id: 'storage', label: 'Хадгалах Зай' },
  { id: 'psu', label: 'Цахилгааны Эх Үүсвэр (PSU)' },
  { id: 'cooler', label: 'CPU Cooler' },
  { id: 'case', label: 'Кейс' },
]

const TIERS = ['budget', 'mid-range', 'high-end', 'flagship']
const TIER_LABELS = { budget: 'Хямд', 'mid-range': 'Дунд', 'high-end': 'Өндөр', flagship: 'Топ' }

const SPEC_FIELDS = {
  cpu: [
    { key: 'socket', label: 'Socket', placeholder: 'AM5, LGA1700, LGA1851', required: true },
    { key: 'cores', label: 'Цөм (Cores)', type: 'number', placeholder: '8', required: true },
    { key: 'threads', label: 'Thread', type: 'number', placeholder: '16' },
    { key: 'baseClock', label: 'Base Clock (GHz)', type: 'number', step: '0.1', placeholder: '3.6' },
    { key: 'boostClock', label: 'Boost Clock (GHz)', type: 'number', step: '0.1', placeholder: '5.2', required: true },
    { key: 'tdp', label: 'TDP (Watt)', type: 'number', placeholder: '65', required: true },
    { key: 'cache', label: 'Cache', placeholder: '32MB L3' },
    { key: 'architecture', label: 'Architecture', placeholder: 'Zen 4, Raptor Lake' },
    { key: 'integratedGraphics', label: 'Integrated Graphics', placeholder: 'Radeon 780M / байхгүй' },
    { key: 'memoryType', label: 'RAM Төрөл', placeholder: 'DDR5, DDR4' },
    { key: 'maxMemory', label: 'Хамгийн их RAM (GB)', type: 'number', placeholder: '128' },
    { key: 'pcieLanes', label: 'PCIe Lanes', type: 'number', placeholder: '24' },
    { key: 'pcieVersion', label: 'PCIe Хувилбар', placeholder: '5.0' },
  ],
  motherboard: [
    { key: 'socket', label: 'CPU Socket', placeholder: 'AM5, LGA1700', required: true },
    { key: 'chipset', label: 'Chipset', placeholder: 'X670E, Z790, B650', required: true },
    { key: 'formFactor', label: 'Form Factor', placeholder: 'ATX, mATX, ITX', required: true },
    { key: 'memoryType', label: 'RAM Төрөл', placeholder: 'DDR5, DDR4', required: true },
    { key: 'memorySlots', label: 'RAM Slot тоо', type: 'number', placeholder: '4' },
    { key: 'maxMemory', label: 'Хамгийн их RAM (GB)', type: 'number', placeholder: '128' },
    { key: 'memorySpeed', label: 'RAM Хурд (MHz)', placeholder: '6000' },
    { key: 'pcieSlots', label: 'PCIe x16 Slot тоо', type: 'number', placeholder: '2' },
    { key: 'pcieVersion', label: 'PCIe Хувилбар', placeholder: '5.0' },
    { key: 'm2Slots', label: 'M.2 Slot тоо', type: 'number', placeholder: '3' },
    { key: 'sataSlots', label: 'SATA Port тоо', type: 'number', placeholder: '6' },
    { key: 'usb3Ports', label: 'USB 3.0+ Port тоо', type: 'number', placeholder: '6' },
    { key: 'wifi', label: 'WiFi', placeholder: 'WiFi 6E / байхгүй' },
    { key: 'bluetooth', label: 'Bluetooth', placeholder: 'BT 5.3 / байхгүй' },
    { key: 'vrm', label: 'VRM Phases', placeholder: '14+2+1' },
  ],
  gpu: [
    { key: 'vram', label: 'VRAM (GB)', type: 'number', placeholder: '12', required: true },
    { key: 'type', label: 'VRAM Төрөл', placeholder: 'GDDR6X, GDDR6, GDDR7', required: true },
    { key: 'tdp', label: 'TDP / TBP (Watt)', type: 'number', placeholder: '200', required: true },
    { key: 'coreClock', label: 'Core Clock (MHz)', type: 'number', placeholder: '2520' },
    { key: 'boostClock', label: 'Boost Clock (MHz)', type: 'number', placeholder: '2800' },
    { key: 'memoryClock', label: 'Memory Clock (MHz)', type: 'number', placeholder: '21000' },
    { key: 'memoryBus', label: 'Memory Bus (bit)', type: 'number', placeholder: '192' },
    { key: 'cudaCores', label: 'CUDA / Stream Processors', type: 'number', placeholder: '7680' },
    { key: 'pcieInterface', label: 'PCIe Interface', placeholder: 'PCIe 4.0 x16' },
    { key: 'displayPorts', label: 'DisplayPort тоо', type: 'number', placeholder: '3' },
    { key: 'hdmiPorts', label: 'HDMI тоо', type: 'number', placeholder: '1' },
    { key: 'hdmiVersion', label: 'HDMI Хувилбар', placeholder: '2.1' },
    { key: 'powerConnectors', label: 'Цахилгааны Холбоос', placeholder: '1x 16-pin / 2x 8-pin' },
    { key: 'length', label: 'Урт (mm)', type: 'number', placeholder: '336' },
    { key: 'dlss', label: 'DLSS / FSR', placeholder: 'DLSS 3 / FSR 3' },
    { key: 'raytracing', label: 'Ray Tracing', placeholder: '3-р үе / байхгүй' },
  ],
  ram: [
    { key: 'capacity', label: 'Хэмжээ (GB)', type: 'number', placeholder: '32', required: true },
    { key: 'type', label: 'RAM Төрөл', placeholder: 'DDR5, DDR4', required: true },
    { key: 'speed', label: 'Хурд (MHz)', type: 'number', placeholder: '6000', required: true },
    { key: 'latency', label: 'CAS Latency', placeholder: 'CL30' },
    { key: 'voltage', label: 'Voltage (V)', type: 'number', step: '0.05', placeholder: '1.35' },
    { key: 'sticks', label: 'Stick тоо', type: 'number', placeholder: '2' },
    { key: 'formFactor', label: 'Form Factor', placeholder: 'DIMM, SO-DIMM' },
    { key: 'xmp', label: 'XMP / EXPO', placeholder: 'XMP 3.0' },
    { key: 'rgb', label: 'RGB', placeholder: 'Тийм / Үгүй' },
    { key: 'heatSpreader', label: 'Heat Spreader', placeholder: 'Тийм / Үгүй' },
  ],
  storage: [
    { key: 'capacity', label: 'Хэмжээ (GB)', type: 'number', placeholder: '1000', required: true },
    { key: 'type', label: 'Төрөл', placeholder: 'NVMe SSD, SATA SSD, HDD', required: true },
    { key: 'interface', label: 'Interface', placeholder: 'M.2 PCIe 4.0, SATA III', required: true },
    { key: 'readSpeed', label: 'Унших Хурд (MB/s)', type: 'number', placeholder: '7000', required: true },
    { key: 'writeSpeed', label: 'Бичих Хурд (MB/s)', type: 'number', placeholder: '6500', required: true },
    { key: 'tbw', label: 'TBW (TB)', type: 'number', placeholder: '600' },
    { key: 'nandType', label: 'NAND Төрөл', placeholder: 'TLC, QLC' },
    { key: 'controller', label: 'Controller', placeholder: 'Phison E26' },
    { key: 'formFactorSize', label: 'Form Factor', placeholder: 'M.2 2280, 3.5"' },
    { key: 'rpm', label: 'RPM (HDD)', type: 'number', placeholder: '7200' },
  ],
  psu: [
    { key: 'wattage', label: 'Чадал (Watt)', type: 'number', placeholder: '850', required: true },
    { key: 'efficiency', label: 'Efficiency', placeholder: '80+ Gold, 80+ Platinum', required: true },
    { key: 'modular', label: 'Modular', placeholder: 'Fully / Semi / Non-Modular' },
    { key: 'formFactor', label: 'Form Factor', placeholder: 'ATX, SFX' },
    { key: 'fanSize', label: 'Сэнсний хэмжээ (mm)', type: 'number', placeholder: '135' },
    { key: 'pciePins', label: '12VHPWR / PCIe Pin', placeholder: '1x 16-pin, 4x 6+2-pin' },
    { key: 'sataConnectors', label: 'SATA Connector тоо', type: 'number', placeholder: '8' },
    { key: 'cpuConnectors', label: 'CPU 8-pin тоо', type: 'number', placeholder: '2' },
    { key: 'length', label: 'Урт (mm)', type: 'number', placeholder: '160' },
    { key: 'activePFC', label: 'Active PFC', placeholder: 'Тийм / Үгүй' },
    { key: 'warranty', label: 'Баталгаа', placeholder: '10 жил' },
  ],
  cooler: [
    { key: 'type', label: 'Cooler Төрөл', placeholder: 'Air / 240mm AIO / 360mm AIO', required: true },
    { key: 'compatibleSockets', label: 'Тохирох Socket-үүд', placeholder: 'AM4,AM5,LGA1700 (таслалаар)', required: true },
    { key: 'tdpSupport', label: 'Дэмжих TDP (Watt)', type: 'number', placeholder: '250', required: true },
    { key: 'fanSize', label: 'Сэнсний хэмжээ (mm)', type: 'number', placeholder: '120' },
    { key: 'fanCount', label: 'Сэнсний тоо', type: 'number', placeholder: '2' },
    { key: 'maxRpm', label: 'Хамгийн их RPM', type: 'number', placeholder: '2000' },
    { key: 'noise', label: 'Шуугиан (dBA)', type: 'number', step: '0.1', placeholder: '28.3' },
    { key: 'radiatorSize', label: 'Radiator хэмжээ (мм, AIO)', placeholder: '240, 360' },
    { key: 'height', label: 'Өндөр (мм, Air)', type: 'number', placeholder: '165' },
    { key: 'rgb', label: 'RGB', placeholder: 'Тийм / Үгүй' },
    { key: 'warranty', label: 'Баталгаа', placeholder: '6 жил' },
  ],
  case: [
    { key: 'formFactor', label: 'Дэмжих Form Factor', placeholder: 'ATX,mATX,ITX (таслалаар)', required: true },
    { key: 'type', label: 'Кейсийн Төрөл', placeholder: 'Full Tower / Mid Tower / Mini-ITX' },
    { key: 'maxGpuLength', label: 'GPU-ийн хамгийн их урт (мм)', type: 'number', placeholder: '420' },
    { key: 'maxCoolerHeight', label: 'Cooler-ийн хамгийн их өндөр (мм)', type: 'number', placeholder: '170' },
    { key: 'maxPsuLength', label: 'PSU-ийн хамгийн их урт (мм)', type: 'number', placeholder: '200' },
    { key: 'driveBays35', label: '3.5" Drive Bay тоо', type: 'number', placeholder: '2' },
    { key: 'driveBays25', label: '2.5" Drive Bay тоо', type: 'number', placeholder: '4' },
    { key: 'frontFanSlots', label: 'Урд Сэнсний Slot', placeholder: '3x 120mm / 2x 140mm' },
    { key: 'topFanSlots', label: 'Дээд Сэнсний Slot', placeholder: '2x 120mm' },
    { key: 'rearFanSlots', label: 'Ар Сэнсний Slot', placeholder: '1x 120mm' },
    { key: 'maxRadiatorSupport', label: 'AIO Radiator Дэмжих', placeholder: '360mm' },
    { key: 'frontIo', label: 'Урд I/O', placeholder: 'USB-C 3.2, 2x USB-A, Аудио' },
    { key: 'material', label: 'Материал', placeholder: 'Steel + Tempered Glass' },
    { key: 'sidePanelType', label: 'Хажуу Хавтан', placeholder: 'Tempered Glass' },
    { key: 'rgb', label: 'RGB', placeholder: 'Тийм / Үгүй' },
    { key: 'dimensions', label: 'Хэмжээс (мм)', placeholder: '480 x 210 x 455' },
  ],
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('bm-admin') === 'true')
  const [loginUser, setLoginUser] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginErr, setLoginErr] = useState('')
  const [parts, setParts] = useState([])
  const [tab, setTab] = useState('list')
  const [filterCat, setFilterCat] = useState('cpu')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ category: 'cpu', name: '', brand: '', tier: 'mid-range', price: '', image: null })
  const [specForm, setSpecForm] = useState({})
  const [editId, setEditId] = useState(null)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState('success')

  const showMsg = (text, type = 'success') => { setMsg(text); setMsgType(type); setTimeout(() => setMsg(''), 4000) }

  const handleLogin = async (e) => {
    e.preventDefault()
    try { await adminLogin(loginUser, loginPass); sessionStorage.setItem('bm-admin', 'true'); setAuthed(true) }
    catch { setLoginErr('Нэвтрэх нэр эсвэл нууц үг буруу байна') }
  }

  useEffect(() => { if (authed) loadParts() }, [authed, filterCat])

  const loadParts = () => {
    setLoading(true)
    getParts(filterCat).then(d => { setParts(d || []); setLoading(false) }).catch(() => setLoading(false))
  }

  const resetForm = () => {
    setForm({ category: filterCat, name: '', brand: '', tier: 'mid-range', price: '', image: null })
    setSpecForm({})
    setEditId(null)
  }

  const handleEdit = (part) => {
    setEditId(part.id)
    setForm({ category: part.category, name: part.name, brand: part.brand, tier: part.tier, price: part.price, image: null })
    const s = part.specs || {}
    const flat = {}
    ;(SPEC_FIELDS[part.category] || []).forEach(({ key }) => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
      flat[key] = s[snakeKey] ?? s[key] ?? part[key] ?? ''
      if (Array.isArray(flat[key])) flat[key] = flat[key].join(', ')
    })
    setSpecForm(flat)
    setTab('form')
    window.scrollTo(0, 0)
  }

  const handleDelete = async (part) => {
    if (!confirm(`"${part.name}" устгах уу?`)) return
    await deletePart(part.id); showMsg('Эд анги устгагдлаа'); loadParts()
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const fd = new FormData()
      fd.append('category', form.category); fd.append('name', form.name)
      fd.append('brand', form.brand); fd.append('tier', form.tier); fd.append('price', form.price)
      if (form.image) fd.append('image', form.image)
      ;(SPEC_FIELDS[form.category] || []).forEach(({ key }) => {
        if (specForm[key] !== undefined && specForm[key] !== '') fd.append(key, specForm[key])
      })
      if (editId) { await updatePart(editId, fd); showMsg('Амжилттай шинэчлэгдлэа!') }
      else { await createPart(fd); showMsg('Шинэ эд анги нэмэгдлэа!') }
      resetForm(); setTab('list'); loadParts()
    } catch (err) { showMsg('Алдаа: ' + (err.response?.data?.message || err.message), 'error') }
    setLoading(false)
  }

  const sf = (key) => ({ value: specForm[key] ?? '', onChange: e => setSpecForm(p => ({ ...p, [key]: e.target.value })) })
  const ff = (key) => ({ value: form[key] ?? '', onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) })

  const IS = { width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 9, color: 'var(--text)', fontSize: 13, marginTop: 4 }
  const LS = { fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block' }

  const HINTS = {
    cpu: 'Socket: AM5 (Ryzen 7000+) · LGA1700 (Intel 12/13/14th) · LGA1851 (Intel 15th)\nTDP: стандарт 65W · өндөр гүйцэтгэл 125-170W',
    motherboard: 'Socket нь CPU-тэй таарах ёстой · Z790/X670/B650 → DDR5 · B550/Z590 → DDR4\nChipset: Intel → Z790/B760/H610, AMD → X670E/X670/B650/A520',
    gpu: 'TDP: RTX 4090=450W, RTX 4070=200W, RX 7900 XTX=355W\nPSU = GPU TDP + CPU TDP + 100W × 1.25',
    ram: 'DDR5 → Z790/X670/B650 chipset-тэй · DDR4 → B550/Z590/Z490 chipset-тэй\nХурд: DDR5 минимум 5600MHz, DDR4 минимум 3200MHz',
    psu: 'Wattage: GPU+CPU TDP нийлбэр × 1.25 = санал болгох чадал\n80+ Gold → стандарт, 80+ Platinum → хямдасна',
    cooler: 'Socket: AM4,AM5,LGA1700 гэж таслалаар тусгаарла\nTDP дэмжих: CPU TDP-ээс 25-50W их байх хэрэгтэй',
    storage: 'NVMe PCIe 4.0: 7000 MB/s унших · SATA SSD: 550 MB/s · HDD: 150 MB/s\nInterface заавал бичнэ — nийцлийн шалгалтад ашиглана',
    case: 'Form Factor: ATX,mATX,ITX гэж таслалаар бич\nGPU урт, Cooler өндөр заавал оруул — нийцлийн шалгалтад шаардлагатай',
  }

  if (!authed) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: 36, width: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, background: 'var(--accent-dim)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <span className="material-icons" style={{ color: 'var(--accent-light)', fontSize: 26 }}>admin_panel_settings</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)' }}>Админ нэвтрэх</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>BuildMate удирдлагын хэсэг</div>
        </div>
        <form onSubmit={handleLogin}>
          {loginErr && <div style={{ background: 'var(--red-dim)', border: '1px solid var(--red)30', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--red)', marginBottom: 14 }}>{loginErr}</div>}
          <div style={{ marginBottom: 14 }}><label style={LS}>Нэвтрэх нэр</label><input value={loginUser} onChange={e => setLoginUser(e.target.value)} placeholder="admin" required style={IS} /></div>
          <div style={{ marginBottom: 20 }}><label style={LS}>Нууц үг</label><input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="••••••••" required style={IS} /></div>
          <button type="submit" style={{ width: '100%', padding: 11, borderRadius: 10, background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>Нэвтрэх</button>
        </form>
      </div>
    </div>
  )

  const specFields = SPEC_FIELDS[form.category] || []

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)' }}>Админ Самбар</h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Эд ангиудын мэдээлэл удирдах</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { resetForm(); setTab('form') }} style={{ padding: '9px 18px', borderRadius: 10, background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="material-icons" style={{ fontSize: 16 }}>add</span>Шинэ эд анги
          </button>
          <button onClick={() => { sessionStorage.removeItem('bm-admin'); setAuthed(false) }} style={{ padding: '9px 14px', borderRadius: 10, background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 13 }}>Гарах</button>
        </div>
      </div>

      {msg && <div style={{ background: msgType === 'success' ? 'var(--green-dim)' : 'var(--red-dim)', border: `1px solid ${msgType === 'success' ? 'var(--green)' : 'var(--red)'}30`, borderRadius: 10, padding: '10px 16px', fontSize: 13, color: msgType === 'success' ? 'var(--green)' : 'var(--red)', marginBottom: 16 }}>{msg}</div>}

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-card)', padding: 4, borderRadius: 12, width: 'fit-content', border: '1px solid var(--border)' }}>
        {[{ id: 'list', label: 'Жагсаалт', icon: 'list' }, { id: 'form', label: editId ? 'Засах' : 'Нэмэх', icon: editId ? 'edit' : 'add_circle' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '7px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, background: tab === t.id ? 'var(--accent-dim)' : 'transparent', color: tab === t.id ? 'var(--accent-light)' : 'var(--text-secondary)' }}>
            <span className="material-icons" style={{ fontSize: 15 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {tab === 'list' && (
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setFilterCat(c.id)} style={{ padding: '7px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, border: `1px solid ${filterCat === c.id ? 'var(--accent)' : 'var(--border)'}`, background: filterCat === c.id ? 'var(--accent-dim)' : 'var(--bg-elevated)', color: filterCat === c.id ? 'var(--accent-light)' : 'var(--text-secondary)', cursor: 'pointer' }}>{c.label}</button>
            ))}
          </div>
          {loading ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Уншиж байна...</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {parts.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Эд анги байхгүй байна. Шинэ нэмнэ үү.</div>}
              {parts.map(p => (
                <div key={p.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} /> : <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span className="material-icons" style={{ fontSize: 20, color: 'var(--text-muted)' }}>memory</span></div>}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                      {p.brand} · {TIER_LABELS[p.tier] || p.tier}
                      {p.socket ? ` · ${p.socket}` : ''}{p.cores ? ` · ${p.cores}c` : ''}{p.vram ? ` · ${p.vram}GB` : ''}{p.wattage ? ` · ${p.wattage}W` : ''}{p.capacity ? ` · ${p.capacity}GB` : ''}{p.chipset ? ` · ${p.chipset}` : ''}
                    </div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--green)', flexShrink: 0, marginRight: 8 }}>${parseFloat(p.price).toLocaleString()}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => handleEdit(p)} style={{ padding: '7px 12px', borderRadius: 8, background: 'var(--accent-dim)', color: 'var(--accent-light)', border: '1px solid var(--accent)30', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Засах</button>
                    <button onClick={() => handleDelete(p)} style={{ padding: '7px 10px', borderRadius: 8, background: 'var(--red-dim)', color: 'var(--red)', border: 'none', cursor: 'pointer' }}><span className="material-icons" style={{ fontSize: 15 }}>delete</span></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'form' && (
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>
            {/* Base info */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, alignSelf: 'start' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 16 }}>ҮНДСЭН МЭДЭЭЛЭЛ</div>
              <div style={{ marginBottom: 13 }}><label style={LS}>Ангилал *</label><select value={form.category} onChange={e => { setForm(p => ({ ...p, category: e.target.value })); setSpecForm({}) }} style={IS}>{CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></div>
              <div style={{ marginBottom: 13 }}><label style={LS}>Нэр *</label><input {...ff('name')} placeholder="Ryzen 7 7700X" required style={IS} /></div>
              <div style={{ marginBottom: 13 }}><label style={LS}>Брэнд *</label><input {...ff('brand')} placeholder="AMD, Intel, NVIDIA..." required style={IS} /></div>
              <div style={{ marginBottom: 13 }}><label style={LS}>Зэрэглэл *</label><select {...ff('tier')} style={IS}>{TIERS.map(t => <option key={t} value={t}>{TIER_LABELS[t]} ({t})</option>)}</select></div>
              <div style={{ marginBottom: 13 }}><label style={LS}>Үнэ (USD) *</label><input {...ff('price')} type="number" step="0.01" placeholder="299.99" required style={IS} /></div>
              <div><label style={LS}>Зураг (сонголтоор)</label><input type="file" accept="image/*" onChange={e => setForm(p => ({ ...p, image: e.target.files[0] }))} style={{ ...IS, padding: '7px 10px' }} /></div>
            </div>

            {/* Spec fields */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 6 }}>ТЕХНИКИЙН ҮЗҮҮЛЭЛТ</div>
              <div style={{ background: 'var(--cyan-dim)', border: '1px solid var(--cyan)30', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--cyan)', marginBottom: 16, whiteSpace: 'pre-line' }}>
                ⚡ {HINTS[form.category] || ''}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                {specFields.map(field => (
                  <div key={field.key}>
                    <label style={{ ...LS, color: field.required ? 'var(--cyan)' : 'var(--text-muted)' }}>
                      {field.label}{field.required ? ' *' : ''}
                    </label>
                    <input type={field.type || 'text'} step={field.step} placeholder={field.placeholder} required={field.required} {...sf(field.key)} style={IS} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button type="button" onClick={() => { setTab('list'); resetForm() }} style={{ flex: 1, padding: 12, borderRadius: 12, background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Болих</button>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: 12, borderRadius: 12, background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span className="material-icons" style={{ fontSize: 18 }}>{editId ? 'save' : 'add_circle'}</span>
              {loading ? 'Хадгалж байна...' : editId ? 'Шинэчлэх' : 'Нэмэх'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
