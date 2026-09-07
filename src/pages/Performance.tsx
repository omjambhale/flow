import { useState } from 'react'
import { useApp } from '../App'
import { Link } from '../router'
import { Card, Empty, Kpi, PageH, Ring, ScoreBars, scoreTone, type Tone } from '../components/ui'
import { HBars, Heat } from '../components/charts'
import {
  avgScores, byReason, fmtHours, fmtINR, isGood, shortName, summarise, thisWeek, weekAgo, workerStats,
} from '../derive'
import { RecRow } from './Sites'

type Win = 'week' | 'month'
const monthStart = '2026-08-07'
const accTone = (a: number): Tone | undefined => a < 80 ? 'red' : a < 92 ? 'amber' : undefined

export function Performance() {
  const { data } = useApp()
  const [win, setWin] = useState<Win>('week')
  const recs = win === 'week' ? thisWeek(data.recordings) : data.recordings.filter(r => r.date > monthStart)
  const s = summarise(recs)
  const last = summarise(data.recordings.filter(r => r.date > '2026-08-23' && r.date <= weekAgo))
  const delta = s.acceptance - last.acceptance
  const lost = recs.filter(r => r.status === 'rejected').reduce((sum, r) => sum + r.minutes / 60 * (data.sites.find(x => x.id === r.siteId)?.ratePerHour ?? 0), 0)
  const reasons = byReason(recs)
  const live = data.sites.filter(x => x.stage === 'live')
  const bySite = live.map(site => { const ss = summarise(recs.filter(r => r.siteId === site.id)); return { label: site.name, value: ss.acceptance, to: `/sites/${site.id}`, tone: ss.acceptance < 80 ? '#C43D2F' : ss.acceptance < 92 ? '#D98E04' : '#2F8F5B', hint: `${ss.bad} of ${ss.good + ss.bad} rejected` } })
  const byStep = live.flatMap(site => site.process.steps.map(st => {
    const ss = summarise(recs.filter(r => r.siteId === site.id && r.stepId === st.id))
    return { label: `${st.name} · ${shortName(site.name)}`, value: ss.acceptance, count: ss.good + ss.bad, to: `/sites/${site.id}/step/${st.id}`, tone: ss.acceptance < 80 ? '#C43D2F' : ss.acceptance < 92 ? '#D98E04' : '#2F8F5B', hint: `${ss.bad} of ${ss.good + ss.bad} rejected` }
  })).filter(x => x.count >= 3).sort((a, b) => a.value - b.value).slice(0, 8)
  const workers = workerStats(data, recs)
  const weak = [...workers].sort((a, b) => a.acceptance - b.acceptance).slice(0, 5)
  const scores = avgScores(recs)
  const weakest = (['camera', 'task', 'coverage'] as const).sort((a, b) => scores[a] - scores[b])[0]
  return (
    <>
      <PageH title="Performance" sub="Why hours get rejected, and where."
        right={<div className="seg">{(['week', 'month'] as Win[]).map(w => <button key={w} className={win === w ? 'on' : ''} onClick={() => setWin(w)}>{w === 'week' ? 'This week' : '30 days'}</button>)}</div>} />
      <div className="kpis k4">
        <Kpi label="Acceptance" value={`${s.acceptance}%`} tone={accTone(s.acceptance)} sub={win === 'week' ? `${delta >= 0 ? '+' : ''}${delta} pts vs last week` : `${s.good + s.bad} reviewed`} subTone={delta < 0 && win === 'week' ? 'red' : undefined} />
        <Kpi label="Hours lost" value={fmtHours(s.rejectedHours)} sub={`${s.bad} recordings`} tone={s.rejectedHours > 8 ? 'amber' : undefined} />
        <Kpi label="Money lost" value={fmtINR(lost)} sub="rejected × rate" tone={lost > 0 ? 'red' : undefined} />
        <Kpi label="Weakest score" value={weakest[0].toUpperCase() + weakest.slice(1)} sub={`${scores[weakest]} / 100`} tone={scoreTone(scores[weakest]) === 'green' ? undefined : scoreTone(scores[weakest])} />
      </div>

      <div className="cgrid mb">
        <Card title="Why hours were rejected" action={reasons.length ? { to: '/performance/reason/0', label: 'See recordings' } : undefined}>
          <div className="cpad">{reasons.length ? <HBars data={reasons.map((r, i) => ({ label: r.reason, value: r.hours, to: `/performance/reason/${i}`, hint: `${r.count} recordings` }))} format={v => fmtHours(v)} /> : <Empty title="Nothing rejected" />}</div>
        </Card>
        <Card title="The three scores">
          <div className="ring-wrap" style={{ padding: '18px' }}><Ring value={s.acceptance} size={150} /><ScoreBars {...scores} /></div>
        </Card>
      </div>

      <div className="cgrid mb">
        <Card title="Acceptance by site">
          <div className="cpad"><HBars data={bySite} format={v => `${v}%`} max={100} /></div>
          <div className="card-h" style={{ borderTop: '1px solid var(--line)', borderBottom: 0 }}><h3 style={{ fontSize: 14 }}>Weakest steps</h3></div>
          <div className="cpad">{byStep.length ? <HBars data={byStep} format={v => `${v}%`} max={100} /> : <Empty title="Not enough recordings yet" />}</div>
        </Card>
        <Card title="Rejected hours by operator · 30 days">
          <div className="cpad"><HBars data={data.people.filter(p => p.role === 'operator' && p.active).map(p => { const rr = data.recordings.filter(r => r.operatorId === p.id && r.date > monthStart && r.status === 'rejected'); return { label: `${p.name} · ${shortName(data.sites.find(x => x.id === p.siteId)?.name ?? '')}`, value: Math.round(rr.reduce((t, r) => t + r.minutes, 0) / 6) / 10, to: `/sites/${p.siteId}/operator/${p.id}`, hint: `${rr.length} recordings` } }).sort((a, b) => b.value - a.value)} format={v => fmtHours(v)} /></div>
        </Card>
      </div>

      <Card title={`Workers who need help · ${weak.length}`} action={{ to: '/performance/workers', label: `All ${workers.length} workers` }}>
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>Worker</th><th>Site</th><th className="num">Hours</th><th className="num">Accepted</th><th className="num">Camera</th><th className="num">Task</th><th className="num">Coverage</th><th>Main issue</th></tr></thead>
          <tbody>{weak.map(w => (
            <tr key={w.id}>
              <td><Link to={`/sites/${w.siteId}/operator/${w.operatorId}/worker/${w.id}`}>{w.name}</Link></td>
              <td className="small muted">{data.sites.find(x => x.id === w.siteId)?.name}</td>
              <td className="num">{fmtHours(w.acceptedHours)}</td>
              <td className={`num ${accTone(w.acceptance) ?? ''}`}>{w.acceptance}%</td>
              <td className={`num ${scoreTone(w.scores.camera) === 'green' ? '' : scoreTone(w.scores.camera)}`}>{w.scores.camera}</td>
              <td className={`num ${scoreTone(w.scores.task) === 'green' ? '' : scoreTone(w.scores.task)}`}>{w.scores.task}</td>
              <td className={`num ${scoreTone(w.scores.coverage) === 'green' ? '' : scoreTone(w.scores.coverage)}`}>{w.scores.coverage}</td>
              <td className="small muted">{w.mainIssue ?? '—'}</td>
            </tr>
          ))}</tbody>
        </table></div>
      </Card>
    </>
  )
}


/* ---------- worker-level analysis ---------- */

type SortKey = 'name' | 'acceptedHours' | 'acceptance' | 'camera' | 'task' | 'coverage' | 'steps' | 'recordings'

export function Workers() {
  const { data } = useApp()
  const [siteId, setSite] = useState<string>('all')
  const [sort, setSort] = useState<SortKey>('acceptance')
  const [asc, setAsc] = useState(true)
  const live = data.sites.filter(s => s.stage === 'live')
  const recs = data.recordings.filter(r => siteId === 'all' || r.siteId === siteId)
  const rows = workerStats(data, recs)
  const val = (w: typeof rows[number], k: SortKey) => k === 'camera' || k === 'task' || k === 'coverage' ? w.scores[k] : k === 'name' ? w.name : w[k]
  const sorted = [...rows].sort((a, b) => { const x = val(a, sort), y = val(b, sort); return (x < y ? -1 : x > y ? 1 : 0) * (asc ? 1 : -1) })
  const th = (k: SortKey, label: string, num = true) => <th className={`${num ? 'num' : ''} ${sort === k ? 'on' : ''}`} onClick={() => { if (sort === k) setAsc(!asc); else { setSort(k); setAsc(k === 'name' || k === 'acceptance') } }}>{label}{sort === k ? (asc ? ' ↑' : ' ↓') : ''}</th>
  // heatmap: workers × steps (accepted hours) for one site
  const heatSite = siteId === 'all' ? live[0] : live.find(s => s.id === siteId)!
  const heatRows = rows.filter(w => w.siteId === heatSite.id)
  const cells = heatRows.map(w => heatSite.process.steps.map(st => Math.round(recs.filter(r => r.workerId === w.id && r.stepId === st.id && isGood(r)).reduce((s, r) => s + r.minutes, 0) / 60)))
  return (
    <>
      <PageH title="Workers" sub="Every recording carries the worker, camera, step and task — so every number here is per person."
        right={<div className="seg">{[{ id: 'all', name: 'All sites' }, ...live].map(s => <button key={s.id} className={siteId === s.id ? 'on' : ''} onClick={() => setSite(s.id)}>{s.id === 'all' ? s.name : shortName(s.name)}</button>)}</div>} />
      <Card className="mb">
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr>{th('name', 'Worker', false)}<th>Site</th>{th('recordings', 'Recordings')}{th('acceptedHours', 'Hours')}{th('acceptance', 'Accepted')}{th('camera', 'Camera')}{th('task', 'Task')}{th('coverage', 'Coverage')}{th('steps', 'Steps')}<th>Main issue</th></tr></thead>
          <tbody>{sorted.map(w => (
            <tr key={w.id}>
              <td><Link to={`/sites/${w.siteId}/operator/${w.operatorId}/worker/${w.id}`}>{w.name}</Link></td>
              <td className="small muted">{shortName(data.sites.find(x => x.id === w.siteId)?.name ?? '')}</td>
              <td className="num">{w.recordings}</td>
              <td className="num">{fmtHours(w.acceptedHours)}</td>
              <td className={`num ${accTone(w.acceptance) ?? ''}`}>{w.acceptance}%</td>
              <td className={`num ${scoreTone(w.scores.camera) === 'green' ? '' : scoreTone(w.scores.camera)}`}>{w.scores.camera}</td>
              <td className={`num ${scoreTone(w.scores.task) === 'green' ? '' : scoreTone(w.scores.task)}`}>{w.scores.task}</td>
              <td className={`num ${scoreTone(w.scores.coverage) === 'green' ? '' : scoreTone(w.scores.coverage)}`}>{w.scores.coverage}</td>
              <td className="num">{w.steps}</td>
              <td className="small muted">{w.acceptance < 92 && w.mainIssue ? w.mainIssue : '—'}</td>
            </tr>
          ))}</tbody>
        </table></div>
      </Card>
      <Card title={`Accepted hours by worker and step · ${heatSite.name}`}>
        <div className="cpad"><Heat rows={heatRows.map(w => w.name)} cols={heatSite.process.steps.map(s => s.name)} cells={cells} format={v => `${v}h`} rowTo={i => `/sites/${heatSite.id}/operator/${heatRows[i].operatorId}/worker/${heatRows[i].id}`} /></div>
      </Card>
    </>
  )
}

export function ReasonList({ index }: { index: number }) {
  const { data } = useApp()
  const reasons = byReason(data.recordings.filter(r => r.date > monthStart))
  const r = reasons[index]
  if (!r) return <Empty title="Nothing here" />
  return (
    <>
      <PageH title={r.reason} sub={`${r.count} recordings · ${fmtHours(r.hours)} · last 30 days`}
        right={<div className="seg sm">{reasons.map((x, i) => <Link key={i} to={`/performance/reason/${i}`}><button className={i === index ? 'on' : ''}>{x.count}× {x.reason.split(' ').slice(0, 3).join(' ')}</button></Link>)}</div>} />
      <Card><div className="list">{r.recordings.sort((a, b) => b.date.localeCompare(a.date)).map(x => <RecRow key={x.id} id={x.id} />)}</div></Card>
    </>
  )
}
