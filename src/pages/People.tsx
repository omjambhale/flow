import { useApp } from '../App'
import { Card, Chip, Empty, Kpi, PageH, Ring, Row, ScoreBars, toneOf } from '../components/ui'
import { avgScores, fmtHours, summarise, thisWeek } from '../derive'
import { RecRow } from './Sites'

export function OperatorPage({ siteId, id }: { siteId: string; id: string }) {
  const { data } = useApp()
  const p = data.people.find(x => x.id === id)
  if (!p) return <Empty title="Operator not found" />
  const recs = data.recordings.filter(r => r.operatorId === id)
  const week = summarise(thisWeek(recs))
  const all = summarise(recs)
  const workers = data.people.filter(w => w.reportsTo === id)
  const cams = data.assets.filter(a => a.holderId === id && a.type === 'camera')
  return (
    <>
      <PageH title={p.name} sub={`Operator · ${data.sites.find(s => s.id === siteId)?.name ?? ''} · ${cams.map(c => c.id).join(', ') || 'no camera assigned'}`}
        right={<Chip tone={toneOf(week.quality)}>{week.quality} this week</Chip>} />
      <div className="kpis k3">
        <Kpi label="Accepted this week" value={fmtHours(week.acceptedHours)} sub={`${week.count} recordings`} />
        <Kpi label="Needs work this week" value={String(week.bad)} sub={`${fmtHours(week.rejectedHours)} not paid`} to="/performance" />
        <Kpi label="All time" value={fmtHours(all.acceptedHours)} sub={`${all.acceptance}% accepted`} />
      </div>
      <Card className="mb">
        <div className="ring-wrap"><Ring value={all.acceptance} size={160} /><ScoreBars {...avgScores(recs)} /></div>
      </Card>
      <Card title={`Workers · ${workers.length}`} className="mb">
        <div className="list">
          {workers.length === 0 && <Empty title="No workers assigned" />}
          {workers.map(w => {
            const s = summarise(data.recordings.filter(r => r.workerId === w.id))
            return <Row key={w.id} to={`/sites/${siteId}/operator/${id}/worker/${w.id}`} title={w.name} sub={`${s.count} recordings`} chip={<Chip tone={toneOf(s.quality)}>{s.quality}</Chip>} end={fmtHours(s.acceptedHours)} endSub="accepted" />
          })}
        </div>
      </Card>
      <Card title="Recent recordings">
        <div className="list">
          {[...recs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 15).map(r => <RecRow key={r.id} id={r.id} hideSite />)}
        </div>
      </Card>
    </>
  )
}

export function WorkerPage({ siteId, opId, id }: { siteId: string; opId: string; id: string }) {
  const { data } = useApp()
  const w = data.people.find(x => x.id === id)
  if (!w) return <Empty title="Worker not found" />
  const recs = data.recordings.filter(r => r.workerId === id)
  const s = summarise(recs)
  const site = data.sites.find(x => x.id === siteId)
  const steps = new Set(recs.map(r => r.stepId))
  return (
    <>
      <PageH title={w.name} sub={`Worker · ${site?.name ?? ''} · recorded by ${data.people.find(p => p.id === opId)?.name ?? ''}`} right={<Chip tone={toneOf(s.quality)}>{s.quality}</Chip>} />
      <div className="kpis k3">
        <Kpi label="Accepted" value={fmtHours(s.acceptedHours)} sub={`${s.acceptance}% of reviewed`} />
        <Kpi label="Recordings" value={String(s.count)} sub={`${s.bad} need work`} />
        <Kpi label="Steps covered" value={`${steps.size} of ${site?.process.steps.length ?? 0}`} sub={[...steps].map(id => site?.process.steps.find(x => x.id === id)?.name).filter(Boolean).join(', ')} />
      </div>
      <Card title="Recordings">
        <div className="list">
          {recs.length === 0 && <Empty title="No recordings yet" />}
          {[...recs].sort((a, b) => b.date.localeCompare(a.date)).map(r => <RecRow key={r.id} id={r.id} hideSite />)}
        </div>
      </Card>
    </>
  )
}
