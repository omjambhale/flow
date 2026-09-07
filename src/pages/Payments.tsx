import { useApp } from '../App'
import { Card, Chip, Empty, Kpi, PageH, Row, toneOf } from '../components/ui'
import { fmtDate, fmtHours, fmtINR, invoiceDeductions, invoiceGross, invoiceNet, invoiceRejectedHours, invoiceStatusLabel, money, titleOf } from '../derive'

export function Payments() {
  const { data } = useApp()
  const m = money(data)
  const order = ['review', 'disputed', 'scheduled', 'submitted', 'draft', 'paid']
  const invoices = [...m.invoices].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status) || (b.to > a.to ? 1 : -1))
  return (
    <>
      <PageH title="Payments" sub="Every rupee here traces back to a recording Humyn accepted." />
      <div className="kpis k3">
        <Kpi label="Paid so far" value={fmtINR(m.paid)} sub="since you joined" />
        <Kpi label="Payable now" value={fmtINR(m.payable)} sub={m.next ? `next payout ${fmtDate(m.next)}` : 'nothing scheduled yet'} />
        <Kpi label="Under review" value={fmtINR(m.review)} sub="Humyn is checking these hours" />
      </div>
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
  const inv = data.invoices.find(i => i.id === id)
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
