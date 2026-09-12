import { useState, type FormEvent } from 'react'
import { useApp } from '../App'
import type { Invoice as InvoiceT } from '../types'
import { Card, Chip, Empty, Kpi, PageH, Row, toneOf } from '../components/ui'
import {
  GST_RATE, HUMYN_BILLING, TODAY, fmtDate, fmtHours, fmtINR, gstLines, inWords, invoiceDeductions, invoiceGross,
  invoiceNet, invoiceRejectedHours, invoiceStatusLabel, isGood, money, recentPeriods, titleOf,
} from '../derive'
import { Link } from '../router'

// Invoices uploaded in this session live here until an API exists.
const uploaded: InvoiceT[] = []

type Mode = 'none' | 'template' | 'upload'

export function Payments() {
  const { data } = useApp()
  const [mode, setMode] = useState<Mode>('none')
  const [tick, setTick] = useState(0)
  const bill = data.partner.billing
  const periods = recentPeriods(4)
  const live = data.sites.filter(x => x.stage === 'live')

  // ----- template path: everything comes from accepted hours, the partner only checks it -----
  const [t, setT] = useState({ siteId: live[0]?.id ?? '', period: 0, number: `${live[0]?.id ?? 'INV'}-${TODAY.slice(2, 4)}${TODAY.slice(5, 7)}` })
  const tSite = data.sites.find(x => x.id === t.siteId)
  const tPeriod = periods[t.period]
  const tRecs = data.recordings.filter(r => r.siteId === t.siteId && r.date >= tPeriod.from && r.date <= tPeriod.to && isGood(r))
  const tHours = Math.round(tRecs.reduce((sum, r) => sum + r.minutes, 0) / 60 * 10) / 10
  const tTaxable = tHours * (tSite?.ratePerHour ?? 0)
  const tTax = gstLines(tTaxable, bill?.state, bill?.gstin)
  const tTotal = tTaxable + tTax.reduce((sum, l) => sum + l.amount, 0)
  const issue = () => {
    if (!tSite || tHours <= 0) return
    uploaded.unshift({
      id: t.number, number: t.number, siteId: tSite.id, periodLabel: tPeriod.label,
      from: tPeriod.from, to: tPeriod.to, status: 'submitted', approvedHours: tHours,
      ratePerHour: tSite.ratePerHour, adjustments: [], submittedOn: TODAY,
    })
    setMode('none'); setTick(tick + 1)
  }

  // ----- upload path, for partners who raise invoices in their own system -----
  const [form, setForm] = useState({ siteId: '', period: '', number: '', amount: '', file: '' })
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const site = data.sites.find(x => x.id === form.siteId); if (!site) return
    const amt = Number(form.amount)
    uploaded.unshift({ id: form.number, number: form.number, siteId: site.id, periodLabel: form.period, from: TODAY, to: TODAY, status: 'submitted', approvedHours: Math.round(amt / site.ratePerHour * 10) / 10, ratePerHour: site.ratePerHour, adjustments: [], submittedOn: TODAY })
    setForm({ siteId: '', period: '', number: '', amount: '', file: '' }); setMode('none'); setTick(tick + 1)
  }

  const m = money({ ...data, invoices: [...uploaded, ...data.invoices] })
  const order = ['review', 'disputed', 'scheduled', 'submitted', 'draft', 'paid']
  const invoices = [...m.invoices].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status) || (b.to > a.to ? 1 : -1))
  return (
    <>
      <PageH title="Payments" sub="Every rupee here traces back to a recording Humyn accepted."
        right={<div style={{ display: 'flex', gap: 10 }}>
          <button className="btn" onClick={() => setMode(mode === 'template' ? 'none' : 'template')}>Raise an invoice</button>
          <button className="btn ghost" onClick={() => setMode(mode === 'upload' ? 'none' : 'upload')}>Upload my own</button>
        </div>} />
      <div className="kpis k3">
        <Kpi label="Payable now" value={fmtINR(m.payable)} sub={m.next ? `next payout ${fmtDate(m.next)}` : 'nothing scheduled yet'} />
        <Kpi label="Under review" value={fmtINR(m.review)} sub="Humyn is checking these hours" />
        <Kpi label="Paid so far" value={fmtINR(m.paid)} sub="since you joined" />
      </div>

      {mode === 'template' && (
        <Card title="Raise an invoice" className="mb">
          {!bill ? (
            <div className="cpad">
              <Empty title="Add your billing details first" hint="Your legal name, address, GST number and bank account print on every invoice. You only enter them once." />
              <div style={{ textAlign: 'center', paddingBottom: 18 }}><Link to="/profile" className="btn">Add billing details</Link></div>
            </div>
          ) : (
            <>
              <div className="form" style={{ borderBottom: '1px solid var(--line)' }}>
                <div className="f"><label>Site</label>
                  <select value={t.siteId} onChange={e => setT({ ...t, siteId: e.target.value })}>
                    {live.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                  </select>
                </div>
                <div className="f"><label>Period</label>
                  <select value={t.period} onChange={e => setT({ ...t, period: Number(e.target.value) })}>
                    {periods.map((p, i) => <option key={p.from} value={i}>{p.label}</option>)}
                  </select>
                </div>
                <div className="f"><label>Invoice number</label><input value={t.number} onChange={e => setT({ ...t, number: e.target.value })} /></div>
                <div className="f"><label>Invoice date</label><input value={fmtDate(TODAY)} readOnly /></div>
              </div>

              <div className="inv-sheet" id="inv-sheet">
                <div className="inv-head">
                  <div>
                    <div className="e">From</div>
                    <b>{bill.legalName}</b>
                    <span>{bill.address}</span>
                    <span>{bill.gstin ? <>GSTIN <span className="ui">{bill.gstin}</span></> : 'Not registered under GST'}</span>
                    {bill.pan && <span>PAN <span className="ui">{bill.pan}</span></span>}
                  </div>
                  <div>
                    <div className="e">Bill to</div>
                    <b>{HUMYN_BILLING.legalName}</b>
                    <span>{HUMYN_BILLING.address}</span>
                    <span>GSTIN <span className="ui">{HUMYN_BILLING.gstin}</span></span>
                  </div>
                  <div className="inv-meta">
                    <div className="kv"><span>{bill.gstin ? 'Tax invoice' : 'Bill of supply'}</span><b className="ui">{t.number}</b></div>
                    <div className="kv"><span>Date</span><b>{fmtDate(TODAY)}</b></div>
                    <div className="kv"><span>Period</span><b>{tPeriod.label}</b></div>
                    <div className="kv"><span>Place of supply</span><b>{HUMYN_BILLING.state}</b></div>
                  </div>
                </div>

                <table className="tbl inv-lines">
                  <thead><tr><th>Description</th><th>SAC</th><th className="num">Hours</th><th className="num">Rate</th><th className="num">Amount</th></tr></thead>
                  <tbody>
                    <tr>
                      <td>Data collection services · {tSite?.name}<div className="small muted">Hours accepted by Humyn Labs, {tPeriod.label}</div></td>
                      <td className="ui">{HUMYN_BILLING.sac}</td>
                      <td className="num">{tHours.toFixed(1)}</td>
                      <td className="num">{fmtINR(tSite?.ratePerHour ?? 0)}</td>
                      <td className="num">{fmtINR(tTaxable)}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="calc">
                  <div className="ln"><span>Taxable value</span><span>{fmtINR(tTaxable)}</span></div>
                  {tTax.map(l => <div className="ln" key={l.label}><span>{l.label} @ {l.rate}%</span><span>{fmtINR(l.amount)}</span></div>)}
                  {tTax.length === 0 && <div className="ln muted"><span>No GST — not registered</span><span>₹0</span></div>}
                  <div className="ln tot"><span>Total</span><span>{fmtINR(tTotal)}</span></div>
                </div>
                <div className="inv-foot">
                  <div><div className="e">Amount in words</div><b>{inWords(tTotal)}</b></div>
                  <div><div className="e">Pay to</div><span>{bill.bankName} · {bill.accountNumber} · IFSC {bill.ifsc}</span></div>
                  <div className="small muted">{HUMYN_BILLING.terms}</div>
                </div>
              </div>

              <div className="inv-actions">
                <button className="btn" onClick={issue} disabled={tHours <= 0}>Issue this invoice to Humyn</button>
                <button className="btn ghost" onClick={() => window.print()}>Print or save as PDF</button>
                <span className="small muted">
                  {tHours > 0
                    ? `${fmtHours(tHours)} accepted at ${tSite?.name} in this period. ${GST_RATE}% GST applied as ${tTax[0]?.label ?? 'none'}.`
                    : 'Nothing accepted at this site in this period yet — pick another period.'}
                </span>
              </div>
            </>
          )}
        </Card>
      )}

      {mode === 'upload' && (
        <Card title="Upload your own invoice" className="mb">
          <form className="form" onSubmit={submit}>
            <div className="f"><label>Site</label>
              <select value={form.siteId} onChange={e => setForm({ ...form, siteId: e.target.value })} required>
                <option value="">Choose a site</option>
                {live.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
              </select>
            </div>
            <div className="f"><label>Period</label><input value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} placeholder="e.g. 8–14 September" required /></div>
            <div className="f"><label>Invoice number</label><input value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} placeholder="Your invoice number" required /></div>
            <div className="f"><label>Total (₹)</label><input value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value.replace(/[^\d]/g, '') })} inputMode="numeric" placeholder="Including tax" required /></div>
            <div className="f" style={{ gridColumn: '1 / -1' }}><label>Invoice file <small>· PDF</small></label><input type="file" accept="application/pdf" onChange={e => setForm({ ...form, file: e.target.files?.[0]?.name ?? '' })} /></div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, alignItems: 'center' }}>
              <button className="btn" type="submit" disabled={!form.siteId || !form.period || !form.number || !form.amount}>Submit to Humyn</button>
              <button className="btn ghost" type="button" onClick={() => setMode('none')}>Cancel</button>
              <span className="small muted">Bill to {HUMYN_BILLING.legalName}, GSTIN {HUMYN_BILLING.gstin}. The rules are in Help &amp; SOPs.</span>
            </div>
          </form>
        </Card>
      )}

      <Card title="Invoices">
        <div className="list">
          {invoices.length === 0 && <Empty title="No invoices yet" hint="Your first invoice appears after the first week of accepted recordings." />}
          {invoices.map(i => {
            const site = data.sites.find(s => s.id === i.siteId)
            return (
              <Row key={i.id} to={`/payments/${i.id}`} title={i.periodLabel} sub={`${site?.name ?? i.siteId} · ${i.number}`}
                chip={<Chip tone={toneOf(invoiceStatusLabel[i.status])}>{invoiceStatusLabel[i.status]}</Chip>}
                end={fmtINR(invoiceNet(i))} endSub={`${fmtHours(i.approvedHours)} accepted`} />
            )
          })}
        </div>
      </Card>
    </>
  )
}

export function Invoice({ id }: { id: string }) {
  const { data } = useApp()
  const inv = [...uploaded, ...data.invoices].find(i => i.id === id)
  if (!inv) return <Empty title="Invoice not found" />
  const site = data.sites.find(s => s.id === inv.siteId)
  const steps = [
    { k: 'Submitted', d: inv.submittedOn, done: !!inv.submittedOn },
    { k: 'Review started', d: inv.reviewStartedOn, done: !!inv.reviewStartedOn },
    { k: inv.paidOn ? 'Paid' : 'Expected payment', d: inv.paidOn ?? inv.expectedPaymentOn, done: !!inv.paidOn },
  ]
  const nowIdx = steps.findIndex(s => !s.done)
  return (
    <>
      <PageH title={`${inv.periodLabel} · ${site?.name ?? ''}`} sub={`Invoice ${inv.number}`} right={<Chip tone={toneOf(invoiceStatusLabel[inv.status])}>{invoiceStatusLabel[inv.status]}</Chip>} />
      <div className="grid2">
        <Card title="How the amount is worked out">
          <div className="calc">
            <div className="ln"><span>Reviewed hours × rate</span><span>{fmtHours(inv.approvedHours + invoiceRejectedHours(inv))} × {fmtINR(inv.ratePerHour)}</span></div>
            <div className="ln"><span>Gross</span><span>{fmtINR(invoiceGross(inv))}</span></div>
            {inv.adjustments.map(a => (
              <a key={a.id} href={`#${a.id}`} className="ln neg" style={{ cursor: 'pointer' }} onClick={e => { e.preventDefault(); document.getElementById(a.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}>
                <span>− {a.reason} ({fmtHours(a.hours)})</span><span>− {fmtINR(a.amount)}</span>
              </a>
            ))}
            {inv.adjustments.length === 0 && <div className="ln muted"><span>No hours rejected</span><span>− ₹0</span></div>}
            <div className="ln tot"><span>You receive</span><span>{fmtINR(invoiceNet(inv))}</span></div>
          </div>
          {inv.adjustments.length > 0 && <div className="small muted" style={{ padding: '0 18px 14px' }}>Deductions total {fmtINR(invoiceDeductions(inv))}. Tap one to see the recordings behind it.</div>}
        </Card>
        <div>
          <Card title="Where it is">
            <div className="timeline">
              {steps.map((s, i) => (
                <div key={s.k} className={`tl ${s.done ? 'done' : i === nowIdx ? 'now' : ''}`}><b>{s.k}</b><span>{fmtDate(s.d)}</span></div>
              ))}
            </div>
            {inv.reference && <div className="small muted" style={{ padding: '0 18px 14px' }}>Bank reference {inv.reference}</div>}
          </Card>
          {inv.query && (
            <Card title="Open query" className="mt">
              <div className="row"><div className="main"><div className="t">{fmtINR(inv.query.amount)} · {inv.query.status}</div><div className="s">With {inv.query.owner} · answer due in {inv.query.dueInDays} days</div></div></div>
            </Card>
          )}
        </div>
      </div>
      {inv.adjustments.map(a => {
        const recs = data.recordings.filter(r => a.recordingIds.includes(r.id))
        return (
          <Card key={a.id} title={<span id={a.id}>{a.reason} · {fmtHours(a.hours)} not paid</span>} className="mt">
            <div className="list">
              {recs.map(r => {
                const t = titleOf(data, r)
                return <Row key={r.id} to={`/recording/${r.id}`} title={`${t.label} · ${t.worker?.name ?? ''}`} sub={`${fmtDate(r.date)} · ${fmtHours(r.minutes / 60)}`} lead={<div className="thumb">▶</div>} end={`− ${fmtINR(r.minutes / 60 * inv.ratePerHour)}`} />
              })}
            </div>
          </Card>
        )
      })}
    </>
  )
}
