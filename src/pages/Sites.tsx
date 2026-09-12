import { useApp } from '../App'
import { Link, useRoute } from '../router'
import { Bar, Card, Chip, D, Empty, ExpectedActual, Kpi, PageH, Row, toneOf, type Tone } from '../components/ui'
import { HBars } from '../components/charts'
import type { Site, Step } from '../types'
import {
  assetValue, assetsAtRisk, byReason, cameraOutput, fmtDate, fmtHours, fmtINR, healthLabel, hrs, isGood, pct, siteHealth, siteRecordings,
  siteTarget, stageLabel, statusLabel, projectDays, attentionReasons, stepExpected, summarise, thisWeek, titleOf, workerStats, taskCoverage, workerTaskHours, CAP_HOURS,
} from '../derive'

const stepDone = (recs: ReturnType<typeof siteRecordings>, step: Step) => hrs(recs.filter(r => r.stepId === step.id && isGood(r)).reduce((s, r) => s + r.minutes, 0))
const lagText = (min: number) => min === 0 ? 'Up to date' : min < 60 ? `${min} min` : min < 1440 ? `${Math.floor(min / 60)} h` : `${Math.floor(min / 1440)} days`
const lagTone = (min: number): Tone | undefined => min > 1440 ? 'red' : min > 240 ? 'amber' : undefined
const accTone = (a: number): Tone | undefined => a < 80 ? 'red' : a < 92 ? 'amber' : undefined
const presTone = (p: number, s: number): Tone | undefined => s === 0 ? undefined : p < s * 0.7 ? 'red' : p < s * 0.9 ? 'amber' : undefined

/** CSV of everything worth keeping from a finished site — summary, then hours by step. */
const siteReportUrl = (site: Site) => {
  const rows: string[][] = [
    ['Site', site.name], ['Site ID', site.id], ['Location', `${site.city}, ${site.state}`], ['Type', site.type],
    ['Started', site.startedOn], ['Closed', site.closedOn ?? ''], ['Process', site.process.name],
    ['Accepted hours', String(site.finalHours ?? 0)], ['Rate per hour (INR)', String(site.ratePerHour)], ['Paid (INR)', String(site.paidTotal ?? 0)], [],
    ['Step', 'Name', 'Tasks', 'Expected hours'],
    ...site.process.steps.map(st => [String(st.order), st.name, st.tasks.map(t => t.name).join('; '), String(stepExpected(st))]),
  ]
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  return 'data:text/csv;charset=utf-8,' + encodeURIComponent('\ufeff' + csv)
}

/* ---------- level 0: live sites first, onboarding folded ---------- */

export function Sites() {
  const { data } = useApp()
  const order = { attention: 0, collecting: 1, paused: 2, 'setting-up': 3 }
  const live = data.sites.filter(s => s.stage === 'live').sort((a, b) => order[siteHealth(data, a)] - order[siteHealth(data, b)])
  const onboarding = data.sites.filter(s => s.stage !== 'live' && s.stage !== 'closed')
  const past = data.sites.filter(s => s.stage === 'closed')
  const week = summarise(thisWeek(data.recordings))
  const cams = data.assets.filter(a => a.type === 'camera' && a.status !== 'transit')
  const camsOn = cams.filter(a => a.status === 'in-use').length
  const risk = assetsAtRisk(data)
  const workersTotal = data.people.filter(p => p.role === 'worker' && p.active && live.some(s => s.id === p.siteId)).length
  const workersThisWeek = new Set(thisWeek(data.recordings).map(r => r.workerId)).size
  return (
    <>
      <PageH title="Sites" right={<div style={{ display: 'flex', gap: 10 }}>
        <Link to="/daily" className="btn ghost">Daily report</Link>
        <a href="/" className="btn ghost">+ Add a site</a>
      </div>} />
      <div className="kpis k4">
        <Kpi label="Accepted this week" value={fmtHours(week.acceptedHours)} sub={`${fmtHours(summarise(data.recordings).acceptedHours)} all time`} to="/performance" />
        <Kpi label="Acceptance" value={`${week.acceptance}%`} tone={accTone(week.acceptance)} sub={`${week.bad} need work`} to="/performance" />
        <Kpi label="Workers recording" value={`${workersThisWeek}/${workersTotal}`} sub="this week" tone={workersThisWeek < workersTotal * 0.7 ? 'amber' : undefined} to="/performance/workers" />
        <Kpi label="Cameras recording" value={`${camsOn}/${cams.length}`} sub={risk.length ? `${risk.length} missing or damaged` : 'all accounted for'} subTone={risk.length ? 'red' : undefined} tone={camsOn < cams.length ? 'amber' : undefined} to="/hardware" />
      </div>
      <div className="sites">
        {live.length === 0 && <Card><Empty title="No live sites yet" /></Card>}
        {live.map(s => <SiteCard key={s.id} site={s} />)}
      </div>
      {onboarding.length > 0 && (
        <details className="card fold mt" open>
          <summary>Setting up · {onboarding.length}</summary>
          <div className="onb">
            {onboarding.map(s => <OnboardingRow key={s.id} site={s} />)}
          </div>
        </details>
      )}
      {past.length > 0 && (
        <details className="card fold mt past">
          <summary>Past sites · {past.length}</summary>
          <div className="list">
            {past.map(s => (
              <Link key={s.id} to={`/sites/${s.id}`} className="row">
                <span className="dot grey" />
                <div className="main"><div className="t">{s.name}</div><div className="s">{s.city} · {s.type} · {fmtDate(s.startedOn)} – {fmtDate(s.closedOn)}</div></div>
                <div className="end"><b>{fmtHours(s.finalHours ?? 0)} accepted</b>{fmtINR(s.paidTotal ?? 0)} paid · {s.id}</div>
                <span className="arrow">›</span>
              </Link>
            ))}
          </div>
        </details>
      )}
    </>
  )
}

function SiteCard({ site }: { site: Site }) {
  const { data } = useApp()
  const health = siteHealth(data, site)
  const recs = siteRecordings(data, site.id)
  const all = summarise(recs)
  const week = summarise(thisWeek(recs))
  const target = siteTarget(site)
  const cams = data.assets.filter(a => a.siteId === site.id && a.type === 'camera')
  const camsOn = cams.filter(a => a.status === 'in-use').length
  const risk = assetsAtRisk(data, site.id)
  const siteWorkers = data.people.filter(p => p.role === 'worker' && p.active && p.siteId === site.id).length
  const siteWorkersWeek = new Set(thisWeek(recs).map(r => r.workerId)).size
  const dot: Tone = health === 'attention' ? 'red' : 'green'
  return (
    <Link to={`/sites/${site.id}`} className="card sitec">
      <div className="top"><span className={`dot ${dot}`} /><h3>{site.name}</h3><span className="id">{site.id}</span></div>
      <div className="loc">{site.city} · {site.type}</div>
      <Bar value={all.acceptedHours} max={target} tone={all.acceptedHours >= target ? 'green' : undefined} label={[`${fmtHours(all.acceptedHours)} of ${fmtHours(target)} target`, `${pct(all.acceptedHours, target)}%`]} />
      <div className="dg" style={{ marginTop: 12 }}>
        <D e="Acceptance" v={`${week.acceptance}%`} tone={accTone(week.acceptance)} />
        <D e="Workers" v={siteWorkersWeek} small={`/ ${siteWorkers}`} tone={siteWorkersWeek < siteWorkers * 0.7 ? 'amber' : undefined} />
        <D e="Hardware" v={camsOn} small={`/ ${cams.length} cameras`} tone={camsOn < cams.length ? 'amber' : undefined} />
        <D e="Missing" v={risk.length || '—'} small={risk.length ? `hardware · ${fmtINR(assetValue(risk))}` : undefined} tone={risk.length ? 'red' : undefined} />
      </div>
    </Link>
  )
}

function OnboardingRow({ site }: { site: Site }) {
  const stages: Site['stage'][] = ['review', 'recce', 'hardware']
  const idx = stages.indexOf(site.stage)
  return (
    <Link to={`/sites/${site.id}`} className="row">
      <span className="dot amber" />
      <div className="main"><div className="t">{site.name}</div><div className="s">{site.city} · {site.type}</div></div>
      <div className="stg">{stages.map((s, i) => <i key={s} className={i < idx ? 'd' : i === idx ? 'n' : ''} />)}</div>
      <div className="end" style={{ width: 210 }}>{stageLabel[site.stage]}</div>
      <span className="arrow">›</span>
    </Link>
  )
}

/* ---------- level 1: one site ---------- */

export function SiteDetail({ id }: { id: string }) {
  const { data } = useApp()
  const { go } = useRoute()
  const site = data.sites.find(s => s.id === id)
  if (!site) return <Empty title="Site not found" />
  const health = siteHealth(data, site)
  const recs = siteRecordings(data, site.id)
  const all = summarise(recs)
  const week = summarise(thisWeek(recs))
  const target = siteTarget(site)
  const hw = data.assets.filter(a => a.siteId === site.id)
  const risk = assetsAtRisk(data, site.id)
  const cams = hw.filter(a => a.type === 'camera')
  const camsOn = site.stage === 'live' ? cams.filter(a => a.status === 'in-use').length : 0
  const steps = site.process.steps
  const cur = steps.find(st => stepDone(recs, st) < stepExpected(st))
  const behind = [...steps].sort((a, b) => (stepDone(recs, a) / stepExpected(a)) - (stepDone(recs, b) / stepExpected(b)))[0]
  const workers = workerStats(data, recs).sort((a, b) => b.acceptedHours - a.acceptedHours)
  const ops = data.people.filter(p => p.siteId === site.id && p.role === 'operator' && p.active)
  const sups = data.people.filter(p => p.siteId === site.id && p.role === 'supervisor' && p.active)
  const bad = recs.filter(r => r.status === 'rejected').sort((a, b) => b.date.localeCompare(a.date))
  const reasons = byReason(thisWeek(recs))
  const coverage = taskCoverage(data, site).sort((a, b) => b.overCap - a.overCap || b.hours - a.hours)
  if (site.stage === 'closed') {
    return (
      <>
        <PageH title={site.name} sub={`${site.id} · ${site.city}, ${site.state} · ${site.type} · ${fmtDate(site.startedOn)} – ${fmtDate(site.closedOn)}`}
          right={<div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Chip tone="grey">Completed</Chip><a className="btn ghost" href={siteReportUrl(site)} download={`${site.id}-${site.name.replace(/\s+/g, '-')}-report.csv`}>Download site report</a></div>} />
        <div className="kpis k4">
          <Kpi label="Accepted" value={fmtHours(site.finalHours ?? 0)} sub="all time" />
          <Kpi label="Paid" value={fmtINR(site.paidTotal ?? 0)} sub={`${fmtINR(site.ratePerHour)} per hour`} />
          <Kpi label="Process" value={site.process.name} sub={`${steps.length} steps`} />
          <Kpi label="Hardware" value="Returned" sub="custody closed" />
        </div>
        <Card title="Steps in this process"><div className="cpad"><HBars data={steps.map(st => ({ label: `${st.order}. ${st.name}`, value: stepExpected(st) }))} format={v => `${v}h`} /></div></Card>
      </>
    )
  }
  if (site.stage !== 'live') {
    return (
      <>
        <PageH title={site.name} sub={`${site.id} · ${site.city}, ${site.state} · ${site.type}`} right={<Chip tone="amber">{stageLabel[site.stage]}</Chip>} />
        <div className="kpis k4">
          <Kpi label="Stage" value={stageLabel[site.stage]} dot="amber" />
          <Kpi label="Process" value={site.process.name} sub={`${steps.length} steps`} />
          <Kpi label="Target" value={fmtHours(target)} sub="expected hours" />
          <Kpi label="Hardware" value={hw.length} sub={hw.length ? `${fmtINR(assetValue(hw))} · ${hw[0].status === 'transit' ? 'in transit' : 'allocated'}` : 'not allocated yet'} to={hw.length ? `/sites/${site.id}/hardware` : undefined} />
        </div>
        <Card title="Steps in this process"><div className="cpad"><HBars data={steps.map(st => ({ label: `${st.order}. ${st.name}`, value: stepExpected(st) }))} format={v => `${v}h`} /></div></Card>
      </>
    )
  }
  const days = projectDays(site)
  const hoursPct = pct(all.acceptedHours, target)
  // Red when the calendar is well ahead of the hours actually banked — that is the site in trouble.
  const paceTone: Tone | undefined = !days?.daysPct ? undefined
    : days.overdue > 0 || days.daysPct - hoursPct >= 25 ? 'red'
    : days.daysPct - hoursPct >= 12 ? 'amber' : undefined
  return (
    <>
      <PageH title={site.name} sub={`${site.id} · ${site.city}, ${site.state} · ${site.type} · since ${fmtDate(site.startedOn)}`}
        right={<span title={attentionReasons(data, site).join(' · ') || undefined}><Chip tone={toneOf(healthLabel[health])}>{healthLabel[health]}</Chip></span>} />
      <div className="kpis">
        <Kpi label="Progress" value={`${hoursPct}%`} sub={`${fmtHours(all.acceptedHours)} of ${fmtHours(target)}`} />
        <Kpi label="Days" value={days ? (days.total ? `${days.elapsed}/${days.total}` : String(days.elapsed)) : '—'}
          tone={paceTone}
          sub={!days ? 'not started' : days.overdue > 0 ? `${days.overdue} days past the end date` : days.endsOn ? `ends ${fmtDate(days.endsOn)}` : 'open-ended'}
          subTone={days && days.overdue > 0 ? 'red' : undefined} />
        <Kpi label="Acceptance" value={`${week.acceptance}%`} tone={accTone(week.acceptance)} sub="this week" />
        <Kpi label="Workers" value={`${site.presentToday}/${site.scheduledToday}`} sub="on site today" tone={presTone(site.presentToday, site.scheduledToday)} to={`/sites/${site.id}/today`} />
        <Kpi label="Hardware" value={hw.length} sub={`${camsOn}/${cams.length} cameras recording`} subTone={camsOn < cams.length ? 'amber' : undefined} to={`/sites/${site.id}/hardware`} />
        <Kpi label="Hardware value" value={fmtINR(assetValue(hw))} sub={risk.length ? `${fmtINR(assetValue(risk))} at risk` : `${hw.length} pieces`} subTone={risk.length ? 'red' : undefined} to={`/sites/${site.id}/hardware`} />
      </div>

      <Card title={<>Process map <span className="muted small">· {site.process.name}</span></>} action={behind ? { to: `/sites/${site.id}/step/${behind.id}`, label: `Furthest behind: ${behind.name} · ${Math.round(stepDone(recs, behind))}h of ${stepExpected(behind)}h` } : undefined} className="mb">
        <div className="chain" style={{ padding: '14px 18px 16px' }}>
          {steps.map(st => {
            const exp = stepExpected(st), d = stepDone(recs, st)
            const state = d >= exp ? 'done' : d > 0 ? 'behind' : ''
            return (
              <Link key={st.id} to={`/sites/${site.id}/step/${st.id}`} className={`stepc ${state} ${cur?.id === st.id ? 'cur' : ''}`}>
                <div className="n">Step {st.order} of {steps.length}</div>
                <div className="nm">{st.name}</div>
                <Bar value={d} max={exp} tone={state === 'done' ? 'green' : state === 'behind' ? 'amber' : 'grey'} thin />
                <div className="h"><b>{Math.round(d)}h</b> / {exp}h</div>
              </Link>
            )
          })}
        </div>
      </Card>

      <Card title="Task coverage" className="mb">
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>Task</th><th>Step</th><th className="num">Hours</th><th className="num">Share</th><th className="num">Workers</th><th className="num">Over cap</th><th></th></tr></thead>
          <tbody>{coverage.map(c => (
            <tr key={c.task.id} className="click" onClick={() => go(`/sites/${site.id}/step/${c.step.id}`)}>
              <td><Link to={`/sites/${site.id}/step/${c.step.id}`}>{c.task.name}</Link></td>
              <td className="small muted">{c.step.order}. {c.step.name}</td>
              <td className="num">{fmtHours(c.hours)}</td>
              <td className="num"><div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}><span className="bar thin" style={{ width: 60 }}><i style={{ width: `${Math.min(100, c.share * 3)}%` }} /></span>{c.share}%</div></td>
              <td className={`num ${c.workers < c.expectedWorkers ? 'amber' : ''}`}>{c.workers}<span className="muted"> / {c.expectedWorkers}</span></td>
              <td className={`num ${c.overCap ? 'red' : ''}`}>{c.overCap ? `${c.overCap} · ${fmtHours(c.overHours)} not counted` : '—'}</td>
              <td className="arrow">›</td>
            </tr>
          ))}</tbody>
        </table></div>
      </Card>

      <div className="cgrid">
        <div>
          <Card title={`Your team here · ${sups.length + ops.length}`} action={{ to: `/sites/${site.id}/people`, label: 'All people' }} className="mb">
            <div className="tbl-wrap"><table className="tbl">
              <thead><tr><th>Person</th><th>Role</th><th className="num">Workers</th><th className="num">This week</th><th className="num">Accepted</th><th></th></tr></thead>
              <tbody>
                {sups.map(p => (
                  <tr key={p.id} className="click" onClick={() => go(`/sites/${site.id}/people`)}>
                    <td><Link to={`/sites/${site.id}/people`}>{p.name}</Link></td><td className="small muted">Supervisor</td>
                    <td className="num">{data.people.filter(w => w.role === 'worker' && w.active && w.siteId === site.id).length}</td>
                    <td className="num">{fmtHours(week.acceptedHours)}</td>
                    <td className={`num ${accTone(week.acceptance) ?? ''}`}>{week.acceptance}%</td>
                    <td className="arrow">›</td>
                  </tr>
                ))}
                {ops.map(p => {
                  const s = summarise(thisWeek(recs.filter(r => r.operatorId === p.id)))
                  return (
                    <tr key={p.id} className="click" onClick={() => go(`/sites/${site.id}/people`)}>
                      <td><Link to={`/sites/${site.id}/people`}>{p.name}</Link></td><td className="small muted">Operator</td>
                      <td className="num">{data.people.filter(w => w.reportsTo === p.id && w.active).length}</td>
                      <td className="num">{fmtHours(s.acceptedHours)}</td>
                      <td className={`num ${accTone(s.acceptance) ?? ''}`}>{s.acceptance}%</td>
                      <td className="arrow">›</td>
                    </tr>
                  )
                })}
              </tbody>
            </table></div>
          </Card>
          <Card title={`Latest rejections · ${bad.length} total`}>
            <div className="list">
              {bad.slice(0, 5).map(r => <RecRow key={r.id} id={r.id} hideSite />)}
              {bad.length === 0 && <Empty title="No rejections" />}
            </div>
          </Card>
        </div>
        <div>
          <Card title={`Needs work this week · ${week.bad}`} action={{ to: '/performance', label: 'Analysis' }} className="mb">
            <div className="cpad">
              {reasons.length === 0 ? <Empty title="Nothing rejected this week" /> : <HBars data={reasons.map(r => ({ label: r.reason, value: r.hours, hint: `${r.count} recordings` }))} format={v => fmtHours(v)} />}
            </div>
          </Card>
          <Card title="Operators to talk to" action={{ to: `/sites/${site.id}/people`, label: 'All people' }}>
            <div className="tbl-wrap"><table className="tbl">
              <thead><tr><th>Operator</th><th className="num">Rejected</th><th className="num">Accepted</th><th>Main issue</th><th></th></tr></thead>
              <tbody>
                {ops.map(p => { const rr = thisWeek(recs.filter(r => r.operatorId === p.id)); return { p, s: summarise(rr), issue: byReason(rr)[0]?.reason } })
                  .sort((a, b) => b.s.rejectedHours - a.s.rejectedHours).map(({ p, s, issue }) => (
                  <tr key={p.id} className="click" onClick={() => go(`/sites/${site.id}/operator/${p.id}`)}>
                    <td><Link to={`/sites/${site.id}/operator/${p.id}`}>{p.name}</Link><div className="small muted">{data.people.filter(w => w.reportsTo === p.id && w.active).length} workers</div></td>
                    <td className={`num ${s.rejectedHours > 0 ? 'red' : ''}`}>{fmtHours(s.rejectedHours)}</td>
                    <td className={`num ${accTone(s.acceptance) ?? ''}`}>{s.acceptance}%</td>
                    <td className="small muted">{issue ?? '—'}</td>
                    <td className="arrow">›</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
            <div className="small muted" style={{ padding: '10px 18px 14px' }}>This week. An operator's number is the sum of their workers' rejected hours — fix it with the operator, not the worker.</div>
          </Card>
        </div>
      </div>
    </>
  )
}

/* ---------- level 2: a step's task map ---------- */

export function StepDetail({ id, step: stepId }: { id: string; step: string }) {
  const { data } = useApp()
  const site = data.sites.find(s => s.id === id)
  const step = site?.process.steps.find(s => s.id === stepId)
  if (!site || !step) return <Empty title="Step not found" />
  const recs = siteRecordings(data, site.id).filter(r => r.stepId === step.id)
  const done = stepDone(recs, step)
  const exp = stepExpected(step)
  const s = summarise(recs)
  const idx = site.process.steps.findIndex(x => x.id === step.id)
  const prev = site.process.steps[idx - 1], next = site.process.steps[idx + 1]
  const workers = workerStats(data, recs).sort((a, b) => b.acceptedHours - a.acceptedHours)
  const capRows = workerTaskHours(data, recs).sort((a, b) => b.hours - a.hours)
  const { go } = useRoute()
  return (
    <>
      <PageH title={`Step ${step.order} of ${site.process.steps.length} · ${step.name}`} sub={`${site.process.name} · ${site.name}`}
        right={<div style={{ display: 'flex', gap: 8 }}>{prev && <Link className="btn ghost" to={`/sites/${site.id}/step/${prev.id}`}>‹ {prev.name}</Link>}{next && <Link className="btn ghost" to={`/sites/${site.id}/step/${next.id}`}>{next.name} ›</Link>}</div>} />
      <div className="kpis k4">
        <Kpi label="Done" value={fmtHours(done)} sub={`of ${exp}h expected`} />
        <Kpi label="Still needed" value={fmtHours(Math.max(0, exp - done))} tone={done < exp * 0.5 ? 'amber' : undefined} sub={`${pct(done, exp)}% there`} />
        <Kpi label="Acceptance" value={`${s.acceptance}%`} tone={accTone(s.acceptance)} sub={`${s.bad} need work`} />
        <Kpi label="Workers" value={`${workers.length}/${step.tasks.reduce((sum, t) => sum + t.workers, 0)}`} sub="recorded / assigned" />
      </div>
      <div className="cgrid mb">
        <Card title="Tasks · expected vs done">
          <div className="list">
            {step.tasks.map(t => {
              const tr = recs.filter(r => r.taskId === t.id)
              const d = hrs(tr.filter(isGood).reduce((sum, r) => sum + r.minutes, 0))
              const e = t.workers * t.hoursPerWorker
              return (
                <div className="row" key={t.id}>
                  <div className="main">
                    <div className="t">{t.name} <span className="muted small">· {t.workers} workers × {t.hoursPerWorker}h</span></div>
                    <div style={{ marginTop: 8 }}><ExpectedActual expected={e} actual={d} /></div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
        <Card title={<>Workers on this step <span className="muted small">· {CAP_HOURS}h cap per task</span></>}>
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>Worker</th><th>Task</th><th className="num">Hours</th><th style={{ width: 140 }}>Towards cap</th><th>Status</th></tr></thead>
            <tbody>{capRows.map(x => {
              const w = data.people.find(p => p.id === x.workerId); const t = step.tasks.find(tt => tt.id === x.taskId)
              return (
                <tr key={`${x.workerId}-${x.taskId}`} className="click" onClick={() => go(`/sites/${site.id}/operator/${w?.reportsTo}/worker/${x.workerId}`)}>
                  <td><Link to={`/sites/${site.id}/operator/${w?.reportsTo}/worker/${x.workerId}`}>{w?.name}</Link></td>
                  <td className="small muted">{t?.name}</td>
                  <td className="num">{fmtHours(x.hours)}</td>
                  <td><Bar value={Math.min(x.hours, CAP_HOURS)} max={CAP_HOURS} tone={x.over > 0 ? 'red' : x.room < 4 ? 'amber' : 'green'} thin /></td>
                  <td className={x.over > 0 ? 'red' : x.room < 4 ? 'amber' : 'green'}>{x.over > 0 ? `${fmtHours(x.over)} over · move to another task` : x.room < 4 ? `${fmtHours(x.room)} left` : `${fmtHours(x.room)} left`}</td>
                </tr>
              )
            })}</tbody>
          </table></div>
        </Card>
      </div>
      <Card title={`Recordings · ${recs.length}`}>
        <div className="list">
          {recs.length === 0 && <Empty title="Nothing recorded for this step yet" />}
          {[...recs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30).map(r => <RecRow key={r.id} id={r.id} hideSite />)}
        </div>
      </Card>
    </>
  )
}

export function RecRow({ id, hideSite }: { id: string; hideSite?: boolean }) {
  const { data } = useApp()
  const r = data.recordings.find(x => x.id === id)!
  const t = titleOf(data, r)
  const op = data.people.find(p => p.id === r.operatorId)
  return (
    <Row to={`/recording/${r.id}`} lead={<div className="thumb">▶ {r.minutes}m</div>}
      title={`${t.label} · ${t.worker?.name ?? ''}`}
      sub={`${fmtDate(r.date)} · ${op?.name ?? ''}${hideSite ? '' : ` · ${t.site.name}`}${r.reason ? ` · ${r.reason}` : ''}`}
      chip={<Chip tone={toneOf(statusLabel[r.status])}>{statusLabel[r.status]}</Chip>} end={fmtHours(r.minutes / 60)} />
  )
}

/* ---------- site sub-pages ---------- */

export function SitePeople({ id }: { id: string }) {
  const { data } = useApp()
  const { go } = useRoute()
  const site = data.sites.find(s => s.id === id)
  if (!site) return <Empty title="Site not found" />
  const recs = siteRecordings(data, id)
  const sup = data.people.filter(p => p.siteId === id && p.role === 'supervisor')
  const ops = data.people.filter(p => p.siteId === id && p.role === 'operator')
  const workers = workerStats(data, recs).sort((a, b) => a.acceptance - b.acceptance)
  return (
    <>
      <PageH title="People" sub={`${site.name} · supervisor ${sup.map(s => s.name).join(', ') || '—'}`} right={<Link to="/profile" className="btn ghost">+ Add a person</Link>} />
      <div className="cgrid">
        <Card title={`Operators · ${ops.length}`}>
          <div className="list">
            {ops.map(p => {
              const s = summarise(thisWeek(recs.filter(r => r.operatorId === p.id)))
              return <Row key={p.id} to={`/sites/${id}/operator/${p.id}`} title={p.name} sub={p.active ? `${data.people.filter(w => w.reportsTo === p.id && w.active).length} workers · ${s.count} recordings this week` : 'Deactivated'}
                chip={p.active ? <Chip tone={toneOf(s.quality)}>{s.quality}</Chip> : <Chip tone="grey">Inactive</Chip>} end={fmtHours(s.acceptedHours)} endSub="accepted" />
            })}
          </div>
        </Card>
        <Card title={`Workers · ${workers.length}`}>
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>Worker</th><th>Operator</th><th className="num">Hours</th><th className="num">Accepted</th><th></th></tr></thead>
            <tbody>{workers.map(w => (
              <tr key={w.id} className="click" onClick={() => go(`/sites/${id}/operator/${w.operatorId}/worker/${w.id}`)}>
                <td><Link to={`/sites/${id}/operator/${w.operatorId}/worker/${w.id}`}>{w.name}</Link></td>
                <td className="small"><Link to={`/sites/${id}/operator/${w.operatorId}`} onClick={e => e.stopPropagation()}>{data.people.find(p => p.id === w.operatorId)?.name}</Link></td>
                <td className="num">{fmtHours(w.acceptedHours)}</td>
                <td className={`num ${accTone(w.acceptance) ?? ''}`}>{w.acceptance}%</td>
                <td className="arrow">›</td>
              </tr>
            ))}</tbody>
          </table></div>
        </Card>
      </div>
    </>
  )
}

const assetLabel: Record<string, string> = { 'in-use': 'In use', idle: 'Idle', transit: 'In transit', missing: 'Missing', damaged: 'Damaged' }
const holder = (d: ReturnType<typeof useApp>['data'], id?: string) => id ? d.people.find(p => p.id === id)?.name ?? id : '—'

export function SiteHardware({ id }: { id: string }) {
  const { data } = useApp()
  const site = data.sites.find(s => s.id === id)
  if (!site) return <Empty title="Site not found" />
  const hw = data.assets.filter(a => a.siteId === id)
  const risk = assetsAtRisk(data, id)
  const idle = hw.filter(a => a.status === 'idle')
  const groups = [...new Set(hw.map(a => a.label))]
  const out = cameraOutput(data, thisWeek(siteRecordings(data, id))).filter(c => c.asset.siteId === id)
  return (
    <>
      <PageH title="Hardware" sub={`${site.name} · Humyn's equipment in your custody`} />
      <div className="kpis k4">
        <Kpi label="Hardware" value={hw.length} sub={hw[0]?.status === 'transit' ? 'in transit' : 'in custody'} />
        <Kpi label="Value" value={fmtINR(assetValue(hw))} sub="you are liable for this" />
        <Kpi label="At risk" value={risk.length ? fmtINR(assetValue(risk)) : '₹0'} sub={`${risk.length} missing or damaged`} tone={risk.length ? 'red' : undefined} />
        <Kpi label="Idle cameras" value={idle.length} sub="no output this week" tone={idle.length ? 'amber' : undefined} />
      </div>
      {site.stage === 'live' && (
        <Card title="Camera output this week" className="mb">
          <div className="cpad"><HBars data={out.map(c => ({ label: `${c.asset.id} · ${holder(data, c.asset.holderId)}`, value: c.hours, tone: c.hours === 0 ? '#C43D2F' : undefined, hint: `${c.recordings} recordings · ${c.acceptance}% accepted` }))} format={v => fmtHours(v)} /></div>
        </Card>
      )}
      {groups.map(g => {
        const items = hw.filter(a => a.label === g)
        return (
          <Card key={g} title={`${g} · ${items.length} · ${fmtINR(assetValue(items))}`} className="mb">
            <div className="tbl-wrap"><table className="tbl">
              <thead><tr><th>ID</th><th>Serial</th><th>Holder</th><th>Paired</th><th>Status</th><th className="num">Value</th></tr></thead>
              <tbody>{items.map(a => (
                <tr key={a.id}>
                  <td>{a.id}</td><td className="small muted">{a.serial}</td><td>{holder(data, a.holderId)}</td><td className="small muted">{a.pairedWith ?? '—'}</td>
                  <td><span className={`dot ${toneOf(assetLabel[a.status])}`} /> {assetLabel[a.status]}</td>
                  <td className="num">{fmtINR(a.value)}</td>
                </tr>
              ))}</tbody>
            </table></div>
          </Card>
        )
      })}
    </>
  )
}

export function SiteToday({ id }: { id: string }) {
  const { data } = useApp()
  const site = data.sites.find(s => s.id === id)
  if (!site) return <Empty title="Site not found" />
  const cams = data.assets.filter(a => a.siteId === id && a.type === 'camera')
  const todayRecs = data.recordings.filter(r => r.siteId === id && r.date >= '2026-09-05')
  const stuck = data.recordings.filter(r => r.siteId === id && r.status === 'uploading')
  return (
    <>
      <PageH title="Today" sub={site.name} />
      <div className="kpis k4">
        <Kpi label="Workers" value={`${site.presentToday}/${site.scheduledToday}`} sub={`${pct(site.presentToday, site.scheduledToday)}% attendance`} tone={presTone(site.presentToday, site.scheduledToday)} />
        <Kpi label="Cameras recording" value={`${cams.filter(c => c.status === 'in-use').length}/${cams.length}`} tone={cams.some(c => c.status !== 'in-use') ? 'amber' : undefined} />
        <Kpi label="Upload" value={lagText(site.uploadLagMin)} sub="since last sync" tone={lagTone(site.uploadLagMin)} />
        <Kpi label="Waiting to upload" value={stuck.length} sub={fmtHours(hrs(stuck.reduce((s, r) => s + r.minutes, 0)))} tone={stuck.length > 5 ? 'amber' : undefined} />
      </div>
      <Card title={`Recorded in the last two days · ${todayRecs.length}`}>
        <div className="list">
          {todayRecs.length === 0 && <Empty title="Nothing recorded yet today" />}
          {todayRecs.map(r => <RecRow key={r.id} id={r.id} hideSite />)}
        </div>
      </Card>
    </>
  )
}
