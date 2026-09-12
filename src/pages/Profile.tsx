import { useState, type FormEvent } from 'react'
import { useApp } from '../App'
import { Card, Chip, Empty, PageH, Row } from '../components/ui'
import type { Person, PartnerBilling } from '../types'
import { fmtDate, yesterday } from '../derive'
import { Link } from '../router'

// People created in this session live here until an API exists.
const added: Person[] = []

export function Profile() {
  const { data } = useApp()
  const [tick, setTick] = useState(0)
  const [form, setForm] = useState({ name: '', phone: '', siteId: '', role: 'operator' as 'operator' | 'supervisor' })
  const [prefs, setPrefs] = useState({ channel: 'whatsapp', lang: 'en', low: false, ops: true, quality: true, payment: true, hardware: true })
  const [daily, setDaily] = useState({ on: true, time: '08:00', channel: 'email', sites: 'all', extra: '' })
  const [editBill, setEditBill] = useState(false)
  const blank: PartnerBilling = { legalName: data.partner.org, address: '', state: '', gstin: '', pan: '', bankName: '', accountNumber: '', ifsc: '' }
  const [bill, setBill] = useState<PartnerBilling>(data.partner.billing ?? blank)
  const saveBill = (e: FormEvent) => {
    e.preventDefault()
    data.partner.billing = { ...bill, gstin: bill.gstin?.trim() || undefined }
    setEditBill(false); setTick(tick + 1)
  }
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
          <Card title="Billing details" className="mb">
            {editBill ? (
              <form className="form" onSubmit={saveBill}>
                <div className="f" style={{ gridColumn: '1 / -1' }}><label>Legal name <small>· as registered</small></label><input value={bill.legalName} onChange={e => setBill({ ...bill, legalName: e.target.value })} required /></div>
                <div className="f" style={{ gridColumn: '1 / -1' }}><label>Registered address</label><input value={bill.address} onChange={e => setBill({ ...bill, address: e.target.value })} required /></div>
                <div className="f"><label>State</label><input value={bill.state} onChange={e => setBill({ ...bill, state: e.target.value })} placeholder="e.g. Karnataka" required /></div>
                <div className="f"><label>GST number <small>· leave blank if not registered</small></label><input value={bill.gstin ?? ''} onChange={e => setBill({ ...bill, gstin: e.target.value.toUpperCase() })} placeholder="15 characters" /></div>
                <div className="f"><label>PAN</label><input value={bill.pan ?? ''} onChange={e => setBill({ ...bill, pan: e.target.value.toUpperCase() })} /></div>
                <div className="f"><label>Bank</label><input value={bill.bankName ?? ''} onChange={e => setBill({ ...bill, bankName: e.target.value })} placeholder="Bank and branch" /></div>
                <div className="f"><label>Account number</label><input value={bill.accountNumber ?? ''} onChange={e => setBill({ ...bill, accountNumber: e.target.value })} /></div>
                <div className="f"><label>IFSC</label><input value={bill.ifsc ?? ''} onChange={e => setBill({ ...bill, ifsc: e.target.value.toUpperCase() })} /></div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button className="btn" type="submit">Save</button>
                  <button className="btn ghost" type="button" onClick={() => setEditBill(false)}>Cancel</button>
                  <span className="small muted">These print on every invoice you raise.</span>
                </div>
              </form>
            ) : data.partner.billing ? (
              <>
                <div className="row"><div className="main"><div className="t">{data.partner.billing.legalName}</div><div className="s">{data.partner.billing.address} · {data.partner.billing.state}</div></div></div>
                <div className="row"><div className="main"><div className="t">{data.partner.billing.gstin ? `GSTIN ${data.partner.billing.gstin}` : 'Not registered under GST'}</div><div className="s">{data.partner.billing.pan ? `PAN ${data.partner.billing.pan}` : 'PAN not added'}</div></div></div>
                <div className="row"><div className="main"><div className="t">{data.partner.billing.bankName ?? 'Bank not added'}</div><div className="s">{data.partner.billing.accountNumber ?? '—'}{data.partner.billing.ifsc ? ` · IFSC ${data.partner.billing.ifsc}` : ''}</div></div></div>
                <div className="small muted" style={{ padding: '12px 18px', borderTop: '1px solid var(--line)' }}>
                  <a onClick={() => setEditBill(true)} style={{ cursor: 'pointer' }}>Edit these</a> — they print on every invoice you raise from Payments.
                </div>
              </>
            ) : (
              <div className="cpad"><Empty title="Not added yet" hint="Your legal name, address, GST number and bank account. Entered once, then every invoice fills itself in." />
                <div style={{ textAlign: 'center', paddingBottom: 18 }}><button className="btn" onClick={() => setEditBill(true)}>Add billing details</button></div>
              </div>
            )}
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
          <Card title="Daily report" className="mb">
            <div className="toggle"><span>Send me a daily report</span><button className={`sw ${daily.on ? 'on' : ''}`} onClick={() => setDaily({ ...daily, on: !daily.on })} aria-label="toggle" /></div>
            {daily.on && (
              <>
                <div className="toggle"><span>Arrives at</span>
                  <div className="seg">{['07:00', '08:00', '09:00'].map(x => <button key={x} className={daily.time === x ? 'on' : ''} onClick={() => setDaily({ ...daily, time: x })}>{x}</button>)}</div>
                </div>
                <div className="toggle"><span>Send it by</span>
                  <div className="seg">{[['email', 'Email'], ['whatsapp', 'WhatsApp'], ['both', 'Both']].map(([k, l]) => <button key={k} className={daily.channel === k ? 'on' : ''} onClick={() => setDaily({ ...daily, channel: k })}>{l}</button>)}</div>
                </div>
                <div className="toggle"><span>Cover</span>
                  <div className="seg">{[['all', 'All live sites'], ['attention', 'Only sites needing attention']].map(([k, l]) => <button key={k} className={daily.sites === k ? 'on' : ''} onClick={() => setDaily({ ...daily, sites: k })}>{l}</button>)}</div>
                </div>
                <div className="form" style={{ borderTop: '1px solid var(--line)' }}>
                  <div className="f" style={{ gridColumn: '1 / -1' }}><label>Also send to <small>· optional, comma separated</small></label><input value={daily.extra} onChange={e => setDaily({ ...daily, extra: e.target.value })} placeholder="accounts@yourcompany.in" /></div>
                </div>
              </>
            )}
            <div className="small muted" style={{ padding: '12px 18px', borderTop: '1px solid var(--line)' }}>
              <Link to="/daily">See {fmtDate(yesterday())}'s report</Link> — the same thing that lands in your inbox.
            </div>
          </Card>

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
