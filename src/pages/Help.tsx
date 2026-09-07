import { useState, type FormEvent } from 'react'
import { useApp } from '../App'
import { Card, Chip, Empty, PageH, Row } from '../components/ui'
import { fmtINR } from '../derive'

interface Ticket { id: string; kind: string; siteId: string; text: string; status: 'Open' | 'Answered' }
const tickets: Ticket[] = []

export function Help() {
  const { data } = useApp()
  const [tick, setTick] = useState(0)
  const [form, setForm] = useState({ kind: '', siteId: '', text: '' })
  const live = data.sites.filter(s => s.stage !== 'closed')
  const rates = [...new Set(live.map(s => s.ratePerHour))]
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.kind || !form.text.trim()) return
    tickets.unshift({ id: `RQ-${String(1000 + tickets.length + 1)}`, kind: form.kind, siteId: form.siteId, text: form.text.trim(), status: 'Open' })
    setForm({ kind: '', siteId: '', text: '' })
    setTick(tick + 1)
  }
  return (
    <>
      <PageH title="Help & SOPs" sub="Your Humyn team, the rules of the partnership, and how to do the work right." />
      <div className="help-grid">
        <div>
          <Card title="Your Humyn team" className="mb">
            <div className="contact"><div className="avatar">AK</div><div className="main"><div className="t">Ashutosh Kashyap</div><div className="s">Your partner lead · sites, recce, hardware</div></div><a className="btn ghost" href="#">WhatsApp</a></div>
            <div className="contact"><div className="avatar">PS</div><div className="main"><div className="t">Partner Success</div><div className="s">Payments, disputes, anything urgent · Mon–Sat, 9 am – 7 pm IST</div></div><a className="btn ghost" href="#">WhatsApp</a></div>
            <div className="contact"><div className="avatar">HL</div><div className="main"><div className="t">Humyn Labs office</div><div className="s">2nd Floor, Kaypee Icon, 12th Main Rd, HAL 2nd Stage, Indiranagar, Bengaluru 560008</div></div></div>
          </Card>

          <Card title="How you get paid" className="mb">
            <div className="rule"><b>Rate</b><span>{rates.map(r => fmtINR(r)).join(' / ')} per accepted hour, set per site in your agreement.</span></div>
            <div className="rule"><b>What counts</b><span>Only hours Humyn accepts after review. Uploading is not accepting.</span></div>
            <div className="rule"><b>The 20-hour rule</b><span>A worker's hours on one task count up to 20. After that, the same worker on the same task adds nothing — move them to a task with room. Every site page shows task coverage and who is at the cap.</span></div>
            <div className="rule"><b>Why</b><span>Humyn's customers need many different people doing many different tasks, not one person doing one task for weeks. Spread is worth more than volume.</span></div>
            <div className="rule"><b>Review time</b><span>Within two working days of upload. Every rejection carries a reason and a fix.</span></div>
            <div className="rule"><b>Invoices</b><span>Raised per site, per week, from accepted hours. You see the arithmetic on each invoice.</span></div>
            <div className="rule"><b>Payout</b><span>Scheduled invoices are paid on the next payout date. Bank reference shows on the invoice once paid.</span></div>
            <div className="rule"><b>Queries</b><span>Raise one from the invoice; Humyn answers within three working days.</span></div>
          </Card>

          <Card title="Hardware rules · from Annex A" className="mb">
            <div className="rule"><b>Custody</b><span>Passes to you when you confirm receipt on the portal; back to Humyn when they confirm return.</span></div>
            <div className="rule"><b>Storage</b><span>In the lockable room recorded in the recce whenever not in use.</span></div>
            <div className="rule"><b>Daily use</b><span>Every issue to and return from an operator is logged in the HumynOperator app the same day.</span></div>
            <div className="rule"><b>Loss and damage</b><span>Loss or mishandling is settled at unit value in the next payment cycle. Technical failure is on Humyn.</span></div>
            <div className="rule"><b>Reconcile</b><span>Weekly against the asset register; report any gap within 24 hours.</span></div>
            <div className="rule"><b>Return</b><span>Within 7 days of a site closing, in the packing provided.</span></div>
          </Card>
        </div>

        <div>
          <Card title="SOPs and documents" className="mb">
            <div className="list">
              <Row title="Site operations SOP" sub="How a site runs day to day · v4 · English, Hindi, Tamil" end="PDF" />
              <Row title="How to record a step" sub="Framing, labelling, when to pause · v3 · English, Hindi, Tamil" end="PDF" />
              <Row title="Camera and SD card care" sub="Charging, mounting, sync, storage · v2" end="PDF" />
              <Row title="Partnership agreement" sub="Signed" end="PDF" />
              <Row title="Hardware custody schedule" sub="Annex A · signed" end="PDF" />
              <Row title="Packing lists" sub="One per dispatch, with asset IDs" end="PDF" />
            </div>
          </Card>

          <Card title="Why recordings get rejected" className="mb">
            <div className="faq">
              <details><summary>Camera — visible, steady, lit</summary><p>The hands and the work piece must stay in frame with enough light to see them. Tighten the head strap, tilt slightly down so the bench top sits mid-frame, and check the first minute on the phone before walking away.</p></details>
              <details><summary>Task — right step, right worker</summary><p>The step and worker chosen in the app must match the footage. Pick the step after the worker has started, and reassign the camera in the app when workers swap mid-shift.</p></details>
              <details><summary>Coverage — full duration, no gaps</summary><p>Idle time is not validated. Pause when the line stops, resume when work restarts, and keep the power bank cable clipped so the clip does not end early.</p></details>
              <details><summary>How much is an hour worth to us?</summary><p>Each rejected hour is the site rate you do not receive. The Performance tab shows the reasons costing you the most this week and the workers who need help.</p></details>
            </div>
          </Card>

          <Card title="Raise a request">
            <form className="form" onSubmit={submit}>
              <div className="f"><label>About</label>
                <select value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value })} required>
                  <option value="">Choose</option>
                  {['Payment', 'Hardware', 'A rejected recording', 'A site', 'Operators or the app', 'Something else'].map(k => <option key={k}>{k}</option>)}
                </select>
              </div>
              <div className="f"><label>Site <small>· optional</small></label>
                <select value={form.siteId} onChange={e => setForm({ ...form, siteId: e.target.value })}>
                  <option value="">Not site-specific</option>
                  {live.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="f" style={{ gridColumn: '1 / -1' }}><label>What do you need?</label><input value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} placeholder="One or two lines is enough" required /></div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, alignItems: 'center' }}>
                <button className="btn" type="submit" disabled={!form.kind || !form.text.trim()}>Send to Humyn</button>
                <span className="small muted">Answered within one working day, on WhatsApp and here.</span>
              </div>
            </form>
            <div className="list" style={{ borderTop: '1px solid var(--line)' }}>
              {tickets.length === 0 && <Empty title="No open requests" />}
              {tickets.map(t => <Row key={t.id} title={`${t.kind}${t.siteId ? ` · ${data.sites.find(s => s.id === t.siteId)?.name ?? ''}` : ''}`} sub={`${t.id} · ${t.text}`} chip={<Chip tone={t.status === 'Open' ? 'amber' : 'green'}>{t.status}</Chip>} />)}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
