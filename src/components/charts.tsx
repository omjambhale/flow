// Small dependency-free SVG charts. One question per chart, no legends needed:
// a single series is named by its title; status colours are reserved for state.
import { useState, type ReactNode } from 'react'
import { Link } from '../router'

export const C = { coral: '#FF6E42', ink: '#161516', mute: '#7A7672', line: '#E6E2DD', grid: '#EFECE8', green: '#2F8F5B', amber: '#D98E04', red: '#C43D2F', soft: '#FFD1C0' }

const W = 600

export interface Datum { label: string; value: number; sub?: number; to?: string; tone?: string; hint?: string }

/** Vertical bars, optionally with a second stacked segment (sub) drawn in a lighter tint. */
export function Bars({ data, height = 160, format = (v: number) => String(v), subLabel, valueLabel }: { data: Datum[]; height?: number; format?: (v: number) => string; subLabel?: string; valueLabel?: string }) {
  const [hover, setHover] = useState<number | null>(null)
  const w = W / Math.max(1, data.length)
  const max = Math.max(1, ...data.map(d => d.value + (d.sub ?? 0)))
  const ticks = [0, 0.5, 1].map(t => Math.round(max * t))
  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${height}`} style={{ width: '100%', height: 'auto' }} onMouseLeave={() => setHover(null)}>
        {ticks.map(t => <line key={t} x1="0" x2={W} y1={height - 22 - (t / max) * (height - 34)} y2={height - 22 - (t / max) * (height - 34)} stroke={C.grid} strokeWidth="1" />)}
        {data.map((d, i) => {
          const h = (d.value / max) * (height - 34)
          const hs = ((d.sub ?? 0) / max) * (height - 34)
          const x = i * w + w * 0.22, bw = w * 0.56
          const y = height - 22 - h
          const on = hover === i
          return (
            <g key={i} onMouseEnter={() => setHover(i)} style={{ cursor: d.to ? 'pointer' : 'default' }}>
              <rect x={i * w} y="0" width={w} height={height} fill="transparent" />
              {hs > 0 && <rect x={x} y={y - hs - 2} width={bw} height={hs} fill={C.soft} rx="3" />}
              <rect x={x} y={y} width={bw} height={h} fill={d.tone ?? C.coral} rx="3" opacity={hover === null || on ? 1 : .45} />
            </g>
          )
        })}
      </svg>
      <div className="chart-x">{data.map((d, i) => <span key={i} style={{ width: `${w / W * 100}%` }} className={hover === i ? 'on' : ''}>{d.to ? <Link to={d.to}>{d.label}</Link> : d.label}</span>)}</div>
      <div className="chart-tip">{hover !== null
        ? <><b>{data[hover].label}</b> · {valueLabel ?? ''} {format(data[hover].value)}{data[hover].sub !== undefined ? <> · {subLabel ?? ''} {format(data[hover].sub!)}</> : ''}{data[hover].hint ? <> · {data[hover].hint}</> : ''}</>
        : <span className="muted">Hover a bar</span>}</div>
    </div>
  )
}

/** Horizontal bars for "which category" questions — label, bar, value; rows link when `to` is set. */
export function HBars({ data, format = (v: number) => String(v), max: maxIn }: { data: Datum[]; format?: (v: number) => string; max?: number }) {
  const max = maxIn ?? Math.max(1, ...data.map(d => d.value))
  return (
    <div className="hbars">
      {data.map((d, i) => {
        const inner = (
          <>
            <span className="hl">{d.label}</span>
            <span className="hb"><i style={{ width: `${(d.value / max) * 100}%`, background: d.tone ?? C.coral }} /></span>
            <b>{format(d.value)}</b>
          </>
        )
        return d.to ? <Link key={i} to={d.to} className="hrow" title={d.hint}>{inner}</Link> : <div key={i} className="hrow" title={d.hint}>{inner}</div>
      })}
    </div>
  )
}

/** Line for change-over-time; single series. */
export function Trend({ points, labels, height = 120, format = (v: number) => String(v) }: { points: number[]; labels: string[]; height?: number; format?: (v: number) => string }) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(1, ...points)
  const n = points.length
  const xs = points.map((_, i) => (i / (n - 1)) * W)
  const ys = points.map(v => height - 18 - (v / max) * (height - 30))
  const path = xs.map((x, i) => `${i ? 'L' : 'M'}${x},${ys[i]}`).join(' ')
  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${height}`} style={{ width: '100%', height: 'auto' }} onMouseLeave={() => setHover(null)}>
        {[0.5, 1].map(t => <line key={t} x1="0" x2={W} y1={height - 18 - t * (height - 30)} y2={height - 18 - t * (height - 30)} stroke={C.grid} strokeWidth="1" />)}
        <path d={`${path} L${W},${height - 18} L0,${height - 18} Z`} fill={C.coral} opacity=".08" />
        <path d={path} fill="none" stroke={C.coral} strokeWidth="2.5" strokeLinejoin="round" />
        {xs.map((x, i) => <g key={i} onMouseEnter={() => setHover(i)}><rect x={x - W / 2 / (n - 1)} y="0" width={W / (n - 1)} height={height} fill="transparent" /><circle cx={x} cy={ys[i]} r={hover === i ? 6 : 4} fill={C.coral} stroke="#fff" strokeWidth="2" /></g>)}
        {hover !== null && <line x1={xs[hover]} x2={xs[hover]} y1="0" y2={height - 18} stroke={C.mute} strokeWidth="1" strokeDasharray="4 4" />}
      </svg>
      <div className="chart-x">{labels.map((l, i) => <span key={i} style={{ width: `${100 / n}%` }} className={hover === i ? 'on' : ''}>{l}</span>)}</div>
      <div className="chart-tip">{hover !== null ? <><b>{labels[hover]}</b> · {format(points[hover])}</> : <span className="muted">Hover a point</span>}</div>
    </div>
  )
}

/** Heatmap: rows × columns, one hue light→dark by value. */
export function Heat({ rows, cols, cells, format = (v: number) => String(v), rowTo }: { rows: string[]; cols: string[]; cells: number[][]; format?: (v: number) => string; rowTo?: (i: number) => string | undefined }) {
  const max = Math.max(1, ...cells.flat())
  return (
    <div className="heat" style={{ gridTemplateColumns: `160px repeat(${cols.length}, 1fr)` }}>
      <div />
      {cols.map(c => <div key={c} className="hc">{c}</div>)}
      {rows.map((r, i) => (
        <RowFrag key={r}>
          <div className="hr">{rowTo?.(i) ? <Link to={rowTo(i)!}>{r}</Link> : r}</div>
          {cells[i].map((v, j) => {
            const t = v / max
            return <div key={j} className="cell" title={`${r} · ${cols[j]} · ${format(v)}`} style={{ background: v === 0 ? '#F5F3F0' : `rgba(255,110,66,${0.15 + t * 0.85})`, color: t > 0.55 ? '#fff' : C.ink }}>{v ? format(v) : ''}</div>
          })}
        </RowFrag>
      ))}
    </div>
  )
}
const RowFrag = ({ children }: { children: ReactNode }) => <>{children}</>
