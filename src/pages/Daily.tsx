import { useState } from 'react'
import { useApp } from '../App'
import { Link, useRoute } from '../router'
import { Card, Empty, Kpi, PageH } from '../components/ui'
import { TODAY, dailyReport, fmtDate, fmtHours, fmtINR, pct, yesterday } from '../derive'

const lag = (min: number) =>
  min < 120 ? 'Up to date'
  : min < 1440 ? `${Math.floor(min / 60)} h behind`
  : `${Math.floor(min / 1440)} days behind`

const lastDays = (n: number) => {
  const out: string[] = []
  for (let i = 1; i <= n; i++) {
    const d = new Date(TODAY + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() - i)
    out.push(d.toISOString().slice(0, 10))
  }
  return out
}

/** The daily report. One question: does anything need the partner today?
 *  The email that goes out at 8 am is a rendering of this page, so there is one source of truth. */
export function Daily() {
  const { data } = useApp()
  const { go } = useRoute()
  const days = lastDays(7)
  const [date, setDate] = useState(days[0])
  const r = dailyReport(data, date)
  const reviewed = r.acceptedHours + r.rejectedHours
  const acceptance = reviewed > 0 ? pct(r.acceptedHours, reviewed) : 0
  const recordings = r.sites.reduce((sum, x) => sum + x.recordings, 0)
  const dayRecs = data.recordings.filter(x => x.date === date)
  const reviewHours = Math.round(dayRecs.filter(x => x.status === 'review' || x.status === 'uploading').reduce((sum, x) => sum + x.minutes, 0) / 60 * 10) / 10
  return (
    <>
      <PageH title="Daily report" sub={`${fmtDate(r.date)} · across your live sites`}
        right={<div className="filters"><label><span>Day</span>
          <select className="sel" value={date} onChange={e => setDate(e.target.value)}>
            {days.map(d => <option key={d} value={d}>{fmtDate(d)}</option>)}
          </select></label></div>} />

      <div className="kpis k4">
        <Kpi label="Recorded" value={fmtHours(r.hours)} sub={`${recordings} recordings`} tone={r.hours === 0 ? 'red' : undefined} />
        <Kpi label="Under review" value={fmtHours(reviewHours)} sub="verdict within two working days" />
        <Kpi label="Accepted" value={fmtHours(r.acceptedHours)} sub={reviewed > 0 ? `${fmtINR(r.amount)} · ${acceptance}% of what was reviewed` : 'nothing reviewed yet'} tone={reviewed > 0 && acceptance < 80 ? 'red' : undefined} />
        <Kpi label="Rejected" value={fmtHours(r.rejectedHours)} sub={r.rejectedHours > 0 ? 'record these again' : 'nothing so far'} tone={r.rejectedHours > 0 ? 'red' : undefined} />
      </div>

      <Card title={r.actions.length ? `Needs you today · ${r.actions.length}` : 'Nothing needs you today'} className="mb">
        {r.actions.length === 0
          ? <div className="cpad"><Empty title="All running" hint="Every site uploaded, attendance is fine and no hardware is missing." /></div>
          : <div className="list">
              {r.actions.slice(0, 3).map((a, i) => (
                <Link key={i} to={a.href} className="row">
                  <span className="kind" style={{ background: '#C43D2F', alignSelf: 'flex-start' }} />
                  <div className="main"><div className="t">{a.text}</div><div className="s">{a.site}</div></div>
                  <div className="arrow">›</div>
                </Link>
              ))}
              {r.actions.length > 3 && <div className="small muted" style={{ padding: '10px 18px' }}>and {r.actions.length - 3} more, on the sites below</div>}
            </div>}
      </Card>

      <Card title={`Your sites on ${fmtDate(r.date)}`}>
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>Site</th><th className="num">Recorded</th><th className="num">Accepted</th><th className="num">Workers</th><th className="num">Acceptance<div className="small muted" style={{ fontWeight: 400 }}>this week</div></th><th>Upload</th><th></th></tr></thead>
          <tbody>
            {r.sites.map(x => (
              <tr key={x.site.id} className="click" onClick={() => go(`/sites/${x.site.id}`)}>
                <td><Link to={`/sites/${x.site.id}`}>{x.site.name}</Link><div className="small muted">{x.site.city}</div></td>
                <td className="num">{x.hours > 0 ? fmtHours(x.hours) : <span className="red">nothing</span>}</td>
                <td className="num">{fmtHours(x.acceptedHours)}</td>
                <td className={`num ${x.present < x.scheduled * 0.7 ? 'red' : ''}`}>{x.present}<span className="muted"> / {x.scheduled}</span></td>
                <td className={`num ${x.acceptance < 80 ? 'red' : x.acceptance < 92 ? 'amber' : ''}`}>{x.acceptance}%</td>
                <td className={x.uploadLagMin > 1440 ? 'red' : ''}>{lag(x.uploadLagMin)}</td>
                <td className="arrow">›</td>
              </tr>
            ))}
            {r.sites.length === 0 && <tr><td colSpan={7}><Empty title="No live sites yet" /></td></tr>}
          </tbody>
        </table></div>
      </Card>

      <div className="small muted" style={{ marginTop: 14 }}>
        This report reaches you by email every morning. Turn it off or change the time in <Link to="/profile">your profile</Link>.
      </div>
    </>
  )
}
