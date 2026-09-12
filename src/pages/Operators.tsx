import { useApp } from '../App'
import { Link, useRoute } from '../router'
import { Card, Empty, Kpi, PageH, Ring, Row, scoreTone, type Tone } from '../components/ui'
import { HBars } from '../components/charts'
import {
  assetValue, byReason, fmtDate, fmtHours, fmtINR, operatorBySite, operatorStats, personRecordings,
  qualityScore, shortName, summarise, thisWeek,
} from '../derive'

const accTone = (a: number): Tone | undefined => a < 80 ? 'red' : a < 92 ? 'amber' : undefined

const csvUrl = (rows: (string | number)[][]) => {
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  return 'data:text/csv;charset=utf-8,' + encodeURIComponent('﻿' + csv)
}

/* ---------- every operator, across every site ---------- */
export function Operators() {
  const { data } = useApp()
  const { go } = useRoute()
  const stats = operatorStats(data).filter(o => o.recordings > 0).sort((a, b) => b.rejectedHours - a.rejectedHours)
  const siteName = (id: string) => shortName(data.sites.find(s => s.id === id)?.name ?? id)
  const download = csvUrl([
    ['Operator', 'Sites', 'Recordings', 'Accepted hours', 'Rejected hours', 'Rejected value (INR)', 'Acceptance %', 'Quality score', 'Workers', 'Cameras', 'Main issue', 'Last recording'],
    ...stats.map(o => [o.name, o.siteIds.map(siteName).join('; '), o.recordings, o.acceptedHours, o.rejectedHours,
      Math.round(o.rejectedAmount), o.acceptance, o.quality, o.workers, o.cameras, o.mainIssue ?? '', o.lastDate]),
  ])
  return (
    <>
      <PageH title="Operators" sub="Every operator you employ, across every site they record at."
        right={<a className="btn ghost" href={download} download="humyn-operators.csv">Export this report</a>} />
      {stats.length === 0 ? <Card><Empty title="No operator has recorded yet" /></Card> : (
        <Card title={`Your operators · ${stats.length}`}>
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr>
              <th>Operator</th><th>Sites</th><th className="num">Accepted</th><th className="num">Rejected</th>
              <th className="num">Acceptance</th><th className="num">Quality</th><th className="num">Workers</th><th>Main issue</th><th></th>
            </tr></thead>
            <tbody>{stats.map(o => (
              <tr key={o.id} className="click" onClick={() => go(`/performance/operator/${o.id}`)}>
                <td><Link to={`/performance/operator/${o.id}`}>{o.name}</Link>{!o.active && <div className="small muted">deactivated</div>}</td>
                <td className="small">{o.siteIds.map(siteName).join(', ')}</td>
                <td className="num">{fmtHours(o.acceptedHours)}</td>
                <td className={`num ${o.rejectedHours > 0 ? 'red' : ''}`}>{o.rejectedHours > 0 ? <>{fmtHours(o.rejectedHours)}<div className="small muted">{fmtINR(o.rejectedAmount)}</div></> : '—'}</td>
                <td className={`num ${accTone(o.acceptance) ?? ''}`}>{o.acceptance}%</td>
                <td className={`num ${o.quality && scoreTone(o.quality) !== 'green' ? scoreTone(o.quality) : ''}`}>{o.quality || '—'}</td>
                <td className="num">{o.workers}</td>
                <td className="small muted">{o.mainIssue ?? '—'}</td>
                <td className="arrow">›</td>
              </tr>
            ))}</tbody>
          </table></div>
          <div className="small muted" style={{ padding: '12px 18px', borderTop: '1px solid var(--line)' }}>
            Sorted by rejected hours — the operator at the top is costing you the most. Rejected value is those hours at the site rate.
          </div>
        </Card>
      )}
    </>
  )
}

/* ---------- one operator, split by site ---------- */
export function OperatorReport({ id }: { id: string }) {
  const { data } = useApp()
  const { go } = useRoute()
  const p = data.people.find(x => x.id === id)
  if (!p) return <Empty title="Operator not found" />
  const all = personRecordings(data, p)
  const stat = operatorStats(data).find(o => o.id === id)
  const bySite = operatorBySite(data, id)
  const week = summarise(thisWeek(all))
  const reasons = byReason(all)
  const workers = data.people.filter(w => w.role === 'worker' && w.reportsTo === id)
  const held = data.assets.filter(a => a.holderId === id)
  const download = csvUrl([
    ['Operator', p.name], ['Sites', bySite.map(b => b.site.name).join('; ')], ['Recordings', all.length], [],
    ['Site', 'Recordings', 'Accepted hours', 'Rejected hours', 'Acceptance %', 'Quality'],
    ...bySite.map(b => [b.site.name, b.recordings, b.acceptedHours, b.rejectedHours, b.acceptance, b.quality]), [],
    ['Rejection reason', 'Recordings', 'Hours'],
    ...reasons.map(r => [r.reason, r.count, r.hours]),
  ])
  return (
    <>
      <PageH title={p.name} sub={`Operator · ${bySite.length} site${bySite.length === 1 ? '' : 's'}${p.phone ? ` · ${p.phone}` : ''}${p.active ? '' : ' · deactivated'}`}
        right={<a className="btn ghost" href={download} download={`${p.name.replace(/\s+/g, '-')}-report.csv`}>Export</a>} />
      <div className="kpis">
        <Kpi label="Accepted" value={fmtHours(stat?.acceptedHours ?? 0)} sub="all time" />
        <Kpi label="Rejected" value={fmtHours(stat?.rejectedHours ?? 0)} sub={fmtINR(stat?.rejectedAmount ?? 0)} tone={(stat?.rejectedHours ?? 0) > 0 ? 'red' : undefined} />
        <Kpi label="Acceptance" value={`${stat?.acceptance ?? 0}%`} tone={accTone(stat?.acceptance ?? 100)} sub={`${week.acceptance}% this week`} />
        <Kpi label="Quality score" value={stat?.quality || '—'} sub="out of 100" tone={stat?.quality && scoreTone(stat.quality) !== 'green' ? scoreTone(stat.quality) : undefined} />
        <Kpi label="Workers" value={workers.length} sub="assigned to them" />
        <Kpi label="Hardware held" value={held.length} sub={held.length ? fmtINR(assetValue(held)) : 'nothing issued'} to={`/hardware`} />
      </div>

      <div className="cgrid mb">
        <Card title="Site by site">
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>Site</th><th className="num">Accepted</th><th className="num">Rejected</th><th className="num">Acceptance</th><th className="num">Quality</th><th></th></tr></thead>
            <tbody>{bySite.map(b => (
              <tr key={b.site.id} className="click" onClick={() => go(`/sites/${b.site.id}`)}>
                <td><Link to={`/sites/${b.site.id}`}>{b.site.name}</Link><div className="small muted">{b.recordings} recordings</div></td>
                <td className="num">{fmtHours(b.acceptedHours)}</td>
                <td className={`num ${b.rejectedHours > 0 ? 'red' : ''}`}>{b.rejectedHours > 0 ? fmtHours(b.rejectedHours) : '—'}</td>
                <td className={`num ${accTone(b.acceptance) ?? ''}`}>{b.acceptance}%</td>
                <td className={`num ${b.quality && scoreTone(b.quality) !== 'green' ? scoreTone(b.quality) : ''}`}>{b.quality || '—'}</td>
                <td className="arrow">›</td>
              </tr>
            ))}
            {bySite.length === 0 && <tr><td colSpan={6}><Empty title="No recordings yet" /></td></tr>}
            </tbody>
          </table></div>
        </Card>
        <Card title="Quality">
          <div className="ring-wrap"><Ring value={qualityScore(all)} size={150} label="out of 100" good={85} ok={70} unit="" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{stat?.mainIssue ?? 'Nothing recurring'}</div>
              <div className="small muted" style={{ marginTop: 6, lineHeight: 1.5 }}>
                {stat?.mainIssue ? 'Their most common rejection reason. Fix this one thing first — it is the largest single gain available on this operator.' : 'No rejection reason repeats for this operator.'}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="cgrid mb">
        <Card title="Why their hours were rejected">
          <div className="cpad">{reasons.length
            ? <HBars data={reasons.map(r => ({ label: r.reason, value: r.hours, hint: `${r.count} recordings` }))} format={v => fmtHours(v)} />
            : <Empty title="Nothing rejected" />}</div>
        </Card>
        <Card title={`Workers under them · ${workers.length}`}>
          <div className="list">
            {workers.length === 0 && <Empty title="No workers assigned" />}
            {workers.map(w => {
              const s = summarise(data.recordings.filter(r => r.workerId === w.id))
              return <Row key={w.id} to={`/sites/${w.siteId}/operator/${id}/worker/${w.id}`} title={w.name}
                sub={`${s.count} recordings · ${data.sites.find(x => x.id === w.siteId)?.name ?? ''}`}
                end={`${s.acceptance}%`} endSub="accepted" />
            })}
          </div>
        </Card>
      </div>

      {held.length > 0 && (
        <Card title={`Hardware with ${p.name.split(' ')[0]} · ${fmtINR(assetValue(held))}`}>
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>Item</th><th>Asset ID</th><th>Status</th><th className="num">Value</th></tr></thead>
            <tbody>{held.map(a => (
              <tr key={a.id}><td>{a.label}</td><td className="ui small">{a.serial}</td>
                <td className={a.status === 'missing' || a.status === 'damaged' ? 'red' : ''}>{a.status}</td>
                <td className="num">{fmtINR(a.value)}</td></tr>
            ))}</tbody>
          </table></div>
        </Card>
      )}
      <div className="small muted" style={{ marginTop: 14 }}>Last recording {fmtDate(stat?.lastDate)}.</div>
    </>
  )
}
