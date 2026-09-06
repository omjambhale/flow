import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { Link, Router, match, useRoute } from './router'
import { dataset } from './data'
import type { Dataset } from './types'
import { Payments, Invoice } from './pages/Payments'
import { Sites, SiteDetail, StepDetail, SiteHardware, SiteToday, SitePeople } from './pages/Sites'
import { OperatorPage, WorkerPage } from './pages/People'
import { RecordingPage } from './pages/Recording'
import { Performance, Workers, ReasonList } from './pages/Performance'
import { Hardware } from './pages/Hardware'
import { Profile } from './pages/Profile'

// One viewer: the partner. Supervisors and operators use the phone apps, not this dashboard.
const Ctx = createContext<{ data: Dataset }>({ data: dataset })
export const useApp = () => useContext(Ctx)

const TABS = [
  { to: '/sites', label: 'Sites' },
  { to: '/hardware', label: 'Hardware' },
  { to: '/performance', label: 'Performance' },
  { to: '/payments', label: 'Payments' },
  { to: '/profile', label: 'My Profile' },
]
const HOME = '/sites'

const activeTab = (path: string) =>
  path.startsWith('/payments') ? '/payments' : path.startsWith('/performance') ? '/performance' : path.startsWith('/profile') ? '/profile' : path.startsWith('/hardware') ? '/hardware' : '/sites'

const KIND_COLOUR = { ops: '#C43D2F', quality: '#D98E04', hardware: '#383532', payment: '#2F8F5B' }
const ago = (m: number) => m < 60 ? `${m} min ago` : m < 1440 ? `${Math.floor(m / 60)} h ago` : `${Math.floor(m / 1440)} d ago`

function Shell({ children }: { children: ReactNode }) {
  const { data } = useApp()
  const { path } = useRoute()
  const [open, setOpen] = useState(false)
  const unread = data.notices.filter(n => !n.resolved).length
  return (
    <>
      <header className="hdr">
        <div className="hdr-in">
          <Link to={HOME}><img src="/humyn-logo.svg" alt="Humyn Labs" /></Link>
          <nav className="tabs">
            {TABS.map(t => <Link key={t.to} to={t.to} className={`tab ${activeTab(path) === t.to ? 'on' : ''}`}>{t.label}</Link>)}
          </nav>
          <div className="hdr-right">
            <span className="sample">Sample data</span>
            <div className="who"><b>{data.partner.ownerName}</b><span>{data.partner.org}</span></div>
            <button className="bell" aria-label="Notifications" onClick={() => setOpen(o => !o)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>
              {unread > 0 && <b>{unread}</b>}
            </button>
          </div>
        </div>
      </header>
      {open && (
        <aside className="drawer">
          <div className="card-h"><h3>Notifications</h3><a onClick={() => setOpen(false)} style={{ cursor: 'pointer' }}>Close</a></div>
          <div className="list">
            {data.notices.map(n => (
              <Link key={n.id} to={n.href} className="row" onClick={() => setOpen(false)}>
                <span className="kind" style={{ background: KIND_COLOUR[n.kind], opacity: n.resolved ? .3 : 1, alignSelf: 'flex-start' }} />
                <div className="main"><div className={n.resolved ? 'muted' : 't'}>{n.text}</div><div className="s">{ago(n.minutesAgo)}{n.resolved ? ' · resolved' : ''}</div></div>
              </Link>
            ))}
          </div>
        </aside>
      )}
      <Crumbs />
      <main>{children}</main>
    </>
  )
}

function Crumbs() {
  const { path } = useRoute()
  const { data } = useApp()
  const site = (id: string) => data.sites.find(s => s.id === id)
  const person = (id: string) => data.people.find(p => p.id === id)
  const parts: { to?: string; label: string }[] = []
  let m: Record<string, string> | null
  if ((m = match('/payments/:id', path))) parts.push({ to: '/payments', label: 'Payments' }, { label: `Invoice ${m.id}` })
  else if ((m = match('/sites/:id', path)) || (m = match('/sites/:id/:block', path)) || (m = match('/sites/:id/step/:step', path))
    || (m = match('/sites/:id/operator/:op', path)) || (m = match('/sites/:id/operator/:op/worker/:w', path))) {
    const s = site(m.id)
    parts.push({ to: '/sites', label: 'Sites' }, { to: `/sites/${m.id}`, label: s?.name ?? m.id })
    if (m.block) parts.push({ label: { people: 'People', hardware: 'Hardware', today: 'Today' }[m.block] ?? m.block })
    if (m.step) parts.push({ label: s?.process.steps.find(x => x.id === m!.step)?.name ?? 'Step' })
    if (m.op) parts.push({ to: `/sites/${m.id}/operator/${m.op}`, label: person(m.op)?.name ?? 'Operator' })
    if (m.w) parts.push({ label: person(m.w)?.name ?? 'Worker' })
  } else if ((m = match('/recording/:id', path))) {
    const r = data.recordings.find(x => x.id === m!.id)
    parts.push({ to: '/sites', label: 'Sites' })
    if (r) {
      const op = person(r.operatorId), wk = person(r.workerId)
      parts.push({ to: `/sites/${r.siteId}`, label: site(r.siteId)?.name ?? r.siteId })
      if (op) parts.push({ to: `/sites/${r.siteId}/operator/${op.id}`, label: op.name })
      if (wk && op) parts.push({ to: `/sites/${r.siteId}/operator/${op.id}/worker/${wk.id}`, label: wk.name })
    }
    parts.push({ label: m.id })
  } else if (path === '/performance/workers') parts.push({ to: '/performance', label: 'Performance' }, { label: 'Workers' })
  else if ((m = match('/performance/reason/:i', path))) parts.push({ to: '/performance', label: 'Performance' }, { label: 'Needs work' })
  else if ((m = match('/hardware/:id', path))) parts.push({ to: '/hardware', label: 'Hardware' }, { label: site(m.id)?.name ?? m.id })
  if (parts.length < 2) return <div className="crumbs" />
  return (
    <div className="crumbs">
      {parts.map((p, i) => (
        <span key={i} style={{ display: 'contents' }}>
          {i > 0 && <span className="sep">›</span>}
          {p.to && i < parts.length - 1 ? <Link to={p.to}>{p.label}</Link> : <span className="cur">{p.label}</span>}
        </span>
      ))}
    </div>
  )
}

function Routes() {
  const { path, go } = useRoute()
  useEffect(() => { if (path === '/') go(HOME, true) }, [path, go])
  let m: Record<string, string> | null
  if (path === '/payments') return <Payments />
  if ((m = match('/payments/:id', path))) return <Invoice id={m.id} />
  if (path === '/sites') return <Sites />
  if ((m = match('/sites/:id', path))) return <SiteDetail id={m.id} />
  if ((m = match('/sites/:id/people', path))) return <SitePeople id={m.id} />
  if ((m = match('/sites/:id/hardware', path))) return <SiteHardware id={m.id} />
  if ((m = match('/sites/:id/today', path))) return <SiteToday id={m.id} />
  if ((m = match('/sites/:id/step/:step', path))) return <StepDetail id={m.id} step={m.step} />
  if ((m = match('/sites/:id/operator/:op', path))) return <OperatorPage siteId={m.id} id={m.op} />
  if ((m = match('/sites/:id/operator/:op/worker/:w', path))) return <WorkerPage siteId={m.id} opId={m.op} id={m.w} />
  if ((m = match('/recording/:id', path))) return <RecordingPage id={m.id} />
  if (path === '/hardware') return <Hardware />
  if ((m = match('/hardware/:id', path))) return <SiteHardware id={m.id} />
  if (path === '/performance') return <Performance />
  if (path === '/performance/workers') return <Workers />
  if ((m = match('/performance/reason/:i', path))) return <ReasonList index={Number(m.i)} />
  if (path === '/profile') return <Profile />
  return <div className="empty"><b>Page not found</b><Link to={HOME}>Go to Sites</Link></div>
}

export default function App() {
  return (
    <Router>
      <Ctx.Provider value={{ data: dataset }}>
        <Shell><Routes /></Shell>
      </Ctx.Provider>
    </Router>
  )
}
