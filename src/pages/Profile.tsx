import { useState, type FormEvent } from 'react'
import { useApp } from '../App'
import { Card, Chip, Empty, PageH, Row } from '../components/ui'
import type { Person } from '../types'
import { fmtDate } from '../derive'

// People created in this session live here until an API exists.
const added: Person[] = []

export function Profile() {
  const { data } = useApp()
  const [tick, setTick] = useState(0)
  const [form, setForm] = useState({ name: '', phone: '', siteId: '', role: 'operator' as 'operator' | 'supervisor' })
  const [prefs, setPrefs] = useState({ channel: 'whatsapp', lang: 'en', low: false, ops: true, quality: true, payment: true, hardware: true })
  const people = [...data.people, ...added].filter(p => p.role !== 'worker')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim() || !form.siteId) return
    added.push({ id: `P${Date.now()}`, name: form.name.trim(), phone: form.phone.trim(), siteId: form.siteId, role: form.role, active: true })
    setForm({ name: '', phone: '', siteId: '', role: 'operator' })
    setTick(tick + 1)
  }
  return (
    <>
      <PageH title="Your profile" sub={`${data.partner.ownerName} · ${data.partner.org} · partner since ${fmtDate(data.partner.since)}`} />
      <div className="grid2">
        <div>
          <Card title="Account" className="mb">
            <div className="row"><div className="main"><div className="t">{data.partner.ownerName}</div><div className="s">{data.partner.email} · {data.partner.phone}</div></div></div>
            <div className="row"><div className="main"><div className="t">{data.partner.org}</div><div className="s">Partner {data.partner.id} · {data.sites.filter(x => x.stage !== 'closed').length} sites</div></div></div>
          </Card>
          <Card title="Add a supervisor or operator" className="mb">
            <form className="form" onSubmit={submit}>
              <div className="f"><label>Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" required /></div>
              <div className="f"><label>WhatsApp number</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91" required /></div>
              <div className="f"><label>Site</label>
                <select value={form.siteId} onChange={e => setForm({ ...form, siteId: e.target.value })} required>
                  <option value="">Choose a site</option>
                  {data.sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="f"><label>Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as 'operator' | 'supervisor' })}>
                  <option value="operator">Operator (records workers)</option>
                  <option value="supervisor">Supervisor (runs the site)</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, alignItems: 'center' }}>
                <button className="btn" type="submit" disabled={!form.name.trim() || !form.phone.trim() || !form.siteId}>Add and send app login</button>
                <span className="small muted">They get the Humyn app link on WhatsApp.</span>
              </div>
            </form>
          </Card>
          <Card title={`Supervisors and operators · ${people.length}`}>
            <div className="list">
              {people.length === 0 && <Empty title="No one added yet" />}
              {people.map(p => (
                <Row key={p.id} title={p.name} sub={`${p.role === 'supervisor' ? 'Supervisor' : 'Operator'} · ${data.sites.find(s => s.id === p.siteId)?.name ?? ''}${p.phone ? ` · ${p.phone}` : ''}`}
                  chip={<Chip tone={p.active ? 'green' : 'grey'}>{p.active ? 'Active' : 'Deactivated'}</Chip>}
                  end={<button className="btn ghost" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => { p.active = !p.active; setTick(tick + 1) }}>{p.active ? 'Deactivate' : 'Reactivate'}</button>} />
              ))}
            </div>
          </Card>
        </div>
        <div>
          <Card title="Notifications" className="mb">
            {([['ops', 'Site problems (no upload, low attendance)'], ['quality', 'Recordings that need work'], ['hardware', 'Hardware missing, damaged or idle'], ['payment', 'Payment changes']] as const).map(([k, l]) => (
              <div className="toggle" key={k}><span>{l}</span><button className={`sw ${prefs[k] ? 'on' : ''}`} onClick={() => setPrefs({ ...prefs, [k]: !prefs[k] })} aria-label="toggle" /></div>
            ))}
            <div className="toggle"><span>Send them by</span>
              <div className="seg">{[['whatsapp', 'WhatsApp'], ['email', 'Email'], ['app', 'In app']].map(([k, l]) => <button key={k} className={prefs.channel === k ? 'on' : ''} onClick={() => setPrefs({ ...prefs, channel: k })}>{l}</button>)}</div>
            </div>
          </Card>
          <Card title="Preferences" className="mb">
            <div className="toggle"><span>Language</span>
              <div className="seg">{[['en', 'English'], ['hi', 'हिन्दी'], ['ta', 'தமிழ்']].map(([k, l]) => <button key={k} className={prefs.lang === k ? 'on' : ''} onClick={() => setPrefs({ ...prefs, lang: k })}>{l}</button>)}</div>
            </div>
            <div className="toggle"><span>Low-bandwidth mode (no thumbnails)</span><button className={`sw ${prefs.low ? 'on' : ''}`} onClick={() => setPrefs({ ...prefs, low: !prefs.low })} aria-label="toggle" /></div>
          </Card>
        </div>
      </div>
    </>
  )
}
