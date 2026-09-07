import { useState } from 'react'
import { useApp } from '../App'
import { Link } from '../router'
import { Card, Empty, Kpi, PageH, Ring, ScoreBars, scoreTone, type Tone } from '../components/ui'
import { HBars } from '../components/charts'
import {
  avgScores, byReason, fmtHours, fmtINR, shortName, summarise, thisWeek, weekAgo, workerStats,
} from '../derive'
import { RecRow } from './Sites'

const monthStart = '2026-08-07'
const accTone = (a: number): Tone | undefined => a < 80 ? 'red' : a < 92 ? 'amber' : undefined

type Period = 'week' | 'last' | 'month' | 'all'
const PERIODS: [Period, string][] = [['week', 'This week'], ['last', 'Last week'], ['month', 'Last 30 days'], ['all', 'All time']]
const lastWeekStart = '2026-08-23'

export function Performance() {
  const { data } = useApp()
  const [period, setPeriod] = useState<Period>('week')
  const [siteId, setSiteId] = useState('all')
  const [opId, setOpId] = useState('all')
  const live = data.sites.filter(x => x.stage === 'live')
  const operators = data.people.filter(p => p.role === 'operator' && p.active && (siteId === 'all' || p.siteId === siteId))
  const inPeriod = (r: typeof data.recordings[number]) =>
    period === 'week' ? r.date > weekAgo : period === 'last' ? r.date > lastWeekStart && r.date <= weekAgo : period === 'month' ? r.date > monthStart : true
  const recs = data.recordings.filter(r => inPeriod(r) && (siteId === 'all' || r.siteId === siteId) && (opId === 'all' || r.operatorId === opId))
  const s = summarise(recs)
  const prev = summarise(data.recordings.filter(r => r.date > lastWeekStart && r.date <= weekAgo && (siteId === 'all' || r.siteId === siteId) && (opId === 'all' || r.operatorId === opId)))
  const delta = s.acceptance - prev.acceptance
  const rejectedAmt = recs.filter(r => r.status === 'rejected').reduce((sum, r) => sum + r.minutes / 60 * (data.sites.find(x => x.id === r.siteId)?.ratePerHour ?? 0), 0)
  const reasons = byReason(recs)
  const bySite = live.filter(site => siteId === 'all' || site.id === siteId).map(site => { const ss = summarise(recs.filter(r => r.siteId === site.id)); return { label: site.name, value: ss.acceptance, to: `/sites/${site.id}`, tone: ss.acceptance < 80 ? '#C43D2F' : ss.acceptance < 92 ? '#D98E04' : '#2F8F5B', hint: `${ss.bad} of ${ss.good + ss.bad} rejected` } })
  const byStep = live.filter(site => siteId === 'all' || site.id === siteId).flatMap(site => site.process.steps.map(st => {
    const ss = summarise(recs.filter(r => r.siteId === site.id && r.stepId === st.id))
    return { label: `${st.name} · ${shortName(site.name)}`, value: ss.acceptance, count: ss.good + ss.bad, to: `/sites/${site.id}/step/${st.id}`, tone: ss.acceptance < 80 ? '#C43D2F' : ss.acceptance < 92 ? '#D98E04' : '#2F8F5B', hint: `${ss.bad} of ${ss.good + ss.bad} rejected` }
  })).filter(x => x.count >= 3).sort((a, b) => a.value - b.value).slice(0, 8)
  const byOperator = operators.map(p => { const rr = recs.filter(r => r.operatorId === p.id); const ss = summarise(rr); return { label: `${p.name} · ${shortName(data.sites.find(x => x.id === p.siteId)?.name ?? '')}`, value: ss.rejectedHours, to: `/sites/${p.siteId}/operator/${p.id}`, tone: ss.acceptance < 80 ? '#C43D2F' : ss.acceptance < 92 ? '#D98E04' : undefined, hint: `${ss.bad} recordings · ${ss.acceptance}% accepted` } }).sort((a, b) => b.value - a.value)
  const workers = workerStats(data, recs)
  const scores = avgScores(recs)
  const weakest = (['camera', 'task', 'coverage'] as const).sort((a, b) => scores[a] - scores[b])[0]
  const periodLabel = PERIODS.find(x => x[0] === period)![1].toLowerCase()
  return (
    <>
      <PageH title="Performance" sub="Why hours get rejected, and where."
        right={<div className="filters">
          <label><span>Period</span><select className="sel" value={period} onChange={e => setPeriod(e.target.value as Period)}>{PERIODS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
          <label><span>Site</span><select className="sel" value={siteId} onChange={e => { setSiteId(e.target.value); setOpId('all') }}><option value="all">All sites</option>{live.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
          <label><span>Operator</span><select className="sel" value={opId} onChange={e => setOpId(e.target.value)}><option value="all">All operators</option>{operators.map(p => <option key={p.id} value={p.id}>{p.name}{siteId === 'all' ? ` · ${shortName(data.sites.find(x => x.id === p.siteId)?.name ?? '')}` : ''}</option>)}</select></label>
        </div>} />
      <div className="kpis k4">
        <Kpi label="Acceptance" value={`${s.acceptance}%`} tone={accTone(s.acceptance)} sub={period === 'week' ? `${delta >= 0 ? '+' : ''}${delta} pts vs last week` : `${s.good + s.bad} reviewed · ${periodLabel}`} subTone={delta < 0 && period === 'week' ? 'red' : undefined} />
        <Kpi label="Hours rejected" value={fmtHours(s.rejectedHours)} sub={`${s.bad} recordings`} tone={s.rejectedHours > 8 ? 'amber' : undefined} />
        <Kpi label="Amount rejected" value={fmtINR(rejectedAmt)} sub="rejected hours × rate" tone={rejectedAmt > 0 ? 'red' : undefined} />
        <Kpi label="Weakest of the 3 scores" value={weakest[0].toUpperCase() + weakest.slice(1)} sub={`${scores[weakest]} / 100 · ${{ camera: 'is the work visible, steady, lit', task: 'right step, right worker', coverage: 'full duration, no idle gaps' }[weakest]}`} tone={scoreTone(scores[weakest]) === 'green' ? undefined : scoreTone(scores[weakest])} />
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
        <Card title={opId === 'all' ? 'Rejected hours by operator' : `Rejected hours by worker · ${operators.find(p => p.id === opId)?.name ?? ''}`}>
          <div className="cpad">{opId === 'all'
            ? (byOperator.length ? <HBars data={byOperator} format={v => fmtHours(v)} /> : <Empty title="No operators in this view" />)
            : (workers.length ? <HBars data={[...workers].sort((a, b) => b.rejectedHours - a.rejectedHours).map(w => ({ label: w.name, value: w.rejectedHours, to: `/sites/${w.siteId}/operator/${w.operatorId}/worker/${w.id}`, tone: w.acceptance < 80 ? '#C43D2F' : w.acceptance < 92 ? '#D98E04' : undefined, hint: `${w.acceptance}% accepted · ${w.mainIssue ?? ''}` }))} format={v => fmtHours(v)} /> : <Empty title="No recordings in this view" />)}</div>
        </Card>
        <div>
          {siteId === 'all' && <Card title="Acceptance by site" className="mb"><div className="cpad"><HBars data={bySite} format={v => `${v}%`} max={100} /></div></Card>}
          <Card title="Weakest steps"><div className="cpad">{byStep.length ? <HBars data={byStep} format={v => `${v}%`} max={100} /> : <Empty title="Not enough recordings yet" />}</div></Card>
        </div>
      </div>
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
