import type { ReactNode } from 'react'
import { Link } from '../router'

export type Tone = 'green' | 'amber' | 'red' | 'grey' | 'ink'

export const Chip = ({ tone, children }: { tone: Tone; children: ReactNode }) => (
  <span className={`chip ${tone}`}><i />{children}</span>
)

export const toneOf = (word: string): Tone =>
  /great|accepted|paid|collecting|done|in use|live|active/i.test(word) ? 'green'
    : /good|review|scheduled|submitted|setting|transit|idle|behind|uploading/i.test(word) ? 'amber'
      : /needs|missing|damaged|attention|disputed|rejected|paused|deactivated/i.test(word) ? 'red' : 'grey'

export function Stat({ label, value, sub, to, spark }: { label: string; value: string; sub?: ReactNode; to?: string; spark?: number[] }) {
  const body = (
    <>
      <div className="lbl">{label}</div>
      <div className="val">{value}</div>
      {sub && <div className="sub">{sub}</div>}
      {spark && <Spark data={spark} />}
    </>
  )
  return to ? <Link to={to} className="stat link">{body}</Link> : <div className="stat">{body}</div>
}

export const Stats = ({ children }: { children: ReactNode }) => <div className="stats">{children}</div>

export function Bar({ value, max, tone, thin, label }: { value: number; max: number; tone?: Tone; thin?: boolean; label?: [string, string] }) {
  const p = max <= 0 ? 0 : Math.min(100, Math.round(value / max * 100))
  return (
    <div>
      <div className={`bar ${tone ?? ''} ${thin ? 'thin' : ''}`}><i style={{ width: `${p}%` }} /></div>
      {label && <div className="bar-l"><span>{label[0]}</span><span>{label[1]}</span></div>}
    </div>
  )
}

export function Spark({ data, w = 96, h = 28 }: { data: number[]; w?: number; h?: number }) {
  const max = Math.max(1, ...data)
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * (h - 4) - 2}`).join(' ')
  return (
    <svg className="spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <polyline points={pts} fill="none" stroke="#FF6E42" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={w} cy={h - (data[data.length - 1] / max) * (h - 4) - 2} r="3" fill="#FF6E42" />
    </svg>
  )
}

export function Ring({ value, size = 180, label = 'accepted', good = 92, ok = 80, unit = '%' }: { value: number; size?: number; label?: string; good?: number; ok?: number; unit?: string }) {
  const r = size / 2 - 12
  const c = 2 * Math.PI * r
  const tone = value >= good ? '#2F8F5B' : value >= ok ? '#D98E04' : '#C43D2F'
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${value}% ${label}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EFECE8" strokeWidth="14" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone} strokeWidth="14" strokeLinecap="round"
        strokeDasharray={`${c * value / 100} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontFamily="Rethink Sans, sans-serif" fontWeight="700" fontSize={size / 5} fill="#161516">{value}{unit}</text>
      <text x="50%" y={size / 2 + size / 7} textAnchor="middle" fontSize="12" fill="#7A7672">{label}</text>
    </svg>
  )
}

export const scoreTone = (v: number): Tone => v >= 85 ? 'green' : v >= 70 ? 'amber' : 'red'

export function QualityScore({ value, prev }: { value: number; prev?: number }) {
  const d = prev === undefined ? undefined : value - prev
  return (
    <div className="ring-wrap">
      <Ring value={value} size={150} label="out of 100" good={85} ok={70} unit="" />
      <div>
        <div className="t" style={{ fontWeight: 700, fontSize: 16 }}>{value >= 85 ? 'Good' : value >= 70 ? 'Needs work' : 'Poor'}</div>
        <div className="small muted" style={{ marginTop: 6, lineHeight: 1.5 }}>Humyn scores every reviewed recording out of 100 on how well the work was captured. 85 and above is good; below 70 hours start getting rejected.</div>
        {d !== undefined && <div className={`small ${d < 0 ? 'red' : 'muted'}`} style={{ marginTop: 8 }}>{d >= 0 ? '+' : ''}{d} pts vs last week</div>}
      </div>
    </div>
  )
}

export function ScoreBars({ camera, task, coverage }: { camera: number; task: number; coverage: number }) {
  const rows: [string, string, number][] = [
    ['Camera', 'visible, steady, lit', camera],
    ['Task', 'right step, right worker', task],
    ['Coverage', 'full duration, no gaps', coverage],
  ]
  return (
    <div className="scores">
      {rows.map(([k, d, v]) => (
        <div className="score" key={k}>
          <div className="k">{k}<span className="d">{d}</span></div>
          <Bar value={v} max={100} tone={scoreTone(v)} />
          <b>{v}</b>
        </div>
      ))}
    </div>
  )
}

export function Card({ title, action, children, className }: { title?: ReactNode; action?: { to: string; label: string }; children: ReactNode; className?: string }) {
  return (
    <section className={`card ${className ?? ''}`}>
      {title && <div className="card-h"><h3>{title}</h3>{action && <Link to={action.to}>{action.label} →</Link>}</div>}
      {children}
    </section>
  )
}

export function Row({ to, title, sub, end, endSub, chip, lead }: { to?: string; title: ReactNode; sub?: ReactNode; end?: ReactNode; endSub?: ReactNode; chip?: ReactNode; lead?: ReactNode }) {
  const inner = (
    <>
      {lead}
      <div className="main"><div className="t">{title}</div>{sub && <div className="s">{sub}</div>}</div>
      {chip}
      {(end || endSub) && <div className="end">{end && <b>{end}</b>}{endSub}</div>}
      {to && <span className="arrow">›</span>}
    </>
  )
  return to ? <Link to={to} className="row">{inner}</Link> : <div className="row">{inner}</div>
}

export const Empty = ({ title, hint }: { title: string; hint?: string }) => (
  <div className="empty"><b>{title}</b>{hint}</div>
)

export const PageH = ({ title, sub, right }: { title: string; sub?: ReactNode; right?: ReactNode }) => (
  <div className="page-h"><div><h1>{title}</h1>{sub && <p>{sub}</p>}</div>{right}</div>
)

export function ExpectedActual({ expected, actual }: { expected: number; actual: number }) {
  const max = Math.max(expected, actual, 1)
  return (
    <div className="eva">
      <div className="l"><span>Expected</span><Bar value={expected} max={max} tone="grey" thin /><b>{Math.round(expected)}h</b></div>
      <div className="l"><span>Done</span><Bar value={actual} max={max} tone={actual >= expected ? 'green' : 'amber'} thin /><b>{Math.round(actual)}h</b></div>
    </div>
  )
}

/** Compact KPI tile: label, value (coloured only when it is a problem), optional sub line. */
export function Kpi({ label, value, sub, tone, subTone, to, dot, spark }: { label: string; value: ReactNode; sub?: ReactNode; tone?: Tone; subTone?: Tone; to?: string; dot?: Tone; spark?: number[] }) {
  const body = (
    <>
      <div className="lbl">{dot && <span className={`dot ${dot}`} />}{label}</div>
      <div className={`val ${tone ?? ''}`}>{value}</div>
      {sub && <div className={`sub ${subTone ?? ''}`}>{sub}</div>}
      {spark && <Spark data={spark} w={80} h={24} />}
    </>
  )
  return to ? <Link to={to} className="kpi link">{body}</Link> : <div className="kpi">{body}</div>
}

/** One cell of a data grid on a card: eyebrow + value; red/amber when the value itself is the problem. */
export const D = ({ e, v, tone, small }: { e: string; v: ReactNode; tone?: Tone; small?: ReactNode }) => (
  <div><div className="e">{e}</div><div className={`v ${tone ?? ''}`}>{v}{small && <small> {small}</small>}</div></div>
)
