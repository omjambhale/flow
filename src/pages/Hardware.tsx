import { useApp } from '../App'
import { Link } from '../router'
import { Card, Empty, Kpi, PageH } from '../components/ui'
import { HBars } from '../components/charts'
import type { Asset } from '../types'
import { assetValue, assetsAtRisk, cameraOutput, fmtHours, fmtINR, shortName, thisWeek } from '../derive'

const TYPES: [Asset['type'], string][] = [['camera', 'Cameras'], ['sd', 'SD cards'], ['powerbank', 'Power banks'], ['mount', 'Mounts'], ['reader', 'Readers'], ['cable', 'Cables'], ['junction', 'Junction boxes']]

export function Hardware() {
  const { data } = useApp()
  const all = data.assets
  const custody = all.filter(a => a.status !== 'transit')
  const transit = all.filter(a => a.status === 'transit')
  const risk = assetsAtRisk(data)
  const idle = all.filter(a => a.status === 'idle')
  const cams = custody.filter(a => a.type === 'camera')
  const out = cameraOutput(data, thisWeek(data.recordings)).filter(c => c.asset.status !== 'transit')
  const zero = out.filter(c => c.hours === 0)
  const sites = data.sites.filter(s => all.some(a => a.siteId === s.id))
  const types = TYPES.filter(([t]) => all.some(a => a.type === t))
  return (
    <>
      <PageH title="Hardware" sub="Humyn's equipment in your custody. You are liable for its value until it is returned." />
      <div className="kpis">
        <Kpi label="In custody" value={custody.length} sub={`${sites.filter(s => s.stage === 'live').length} sites`} />
        <Kpi label="Value in custody" value={fmtINR(assetValue(custody))} sub="replacement cost" />
        <Kpi label="At risk" value={risk.length ? fmtINR(assetValue(risk)) : '₹0'} sub={`${risk.length} missing or damaged`} tone={risk.length ? 'red' : undefined} />
        <Kpi label="Idle cameras" value={idle.length} sub={idle.length ? `${fmtINR(assetValue(idle))} not earning` : 'all in use'} tone={idle.length ? 'amber' : undefined} />
        <Kpi label="Zero output" value={zero.length} sub="cameras, this week" tone={zero.length ? 'red' : undefined} />
        <Kpi label="In transit" value={transit.length} sub={transit.length ? fmtINR(assetValue(transit)) : '—'} />
      </div>

      <Card className="mb">
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>Site</th>{types.map(([t, l]) => <th key={t} className="num">{l}</th>)}<th className="num">Value</th><th className="num">At risk</th><th className="num">Idle</th></tr></thead>
          <tbody>{sites.map(s => {
            const mine = all.filter(a => a.siteId === s.id)
            const r = assetsAtRisk(data, s.id)
            const i = mine.filter(a => a.status === 'idle')
            return (
              <tr key={s.id}>
                <td><Link to={`/hardware/${s.id}`}>{s.name}</Link>{s.stage !== 'live' && <span className="small muted"> · in transit</span>}</td>
                {types.map(([t]) => <td key={t} className="num">{mine.filter(a => a.type === t).length || '—'}</td>)}
                <td className="num">{fmtINR(assetValue(mine))}</td>
                <td className={`num ${r.length ? 'red' : ''}`}>{r.length ? fmtINR(assetValue(r)) : '—'}</td>
                <td className={`num ${i.length ? 'amber' : ''}`}>{i.length || '—'}</td>
              </tr>
            )
          })}
            <tr style={{ fontWeight: 700 }}>
              <td>Total</td>
              {types.map(([t]) => <td key={t} className="num">{all.filter(a => a.type === t).length}</td>)}
              <td className="num">{fmtINR(assetValue(all))}</td>
              <td className={`num ${risk.length ? 'red' : ''}`}>{risk.length ? fmtINR(assetValue(risk)) : '—'}</td>
              <td className={`num ${idle.length ? 'amber' : ''}`}>{idle.length || '—'}</td>
            </tr>
          </tbody>
        </table></div>
      </Card>

      <div className="cgrid">
        <Card title={`Needs action · ${risk.length + idle.length}`}>
          {risk.length + idle.length === 0 ? <Empty title="Everything accounted for" /> : (
            <div className="tbl-wrap"><table className="tbl">
              <thead><tr><th>Item</th><th>Site</th><th>Holder</th><th>Status</th><th className="num">Value</th></tr></thead>
              <tbody>{[...risk, ...idle].map(a => (
                <tr key={a.id}>
                  <td>{a.label} <span className="small muted">{a.id}</span></td>
                  <td className="small"><Link to={`/hardware/${a.siteId}`}>{shortName(data.sites.find(s => s.id === a.siteId)?.name ?? '')}</Link></td>
                  <td className="small">{data.people.find(p => p.id === a.holderId)?.name ?? '—'}</td>
                  <td className={a.status === 'idle' ? 'amber' : 'red'}>{a.status === 'idle' ? 'Idle' : a.status === 'missing' ? 'Missing' : 'Damaged'}</td>
                  <td className="num">{fmtINR(a.value)}</td>
                </tr>
              ))}</tbody>
            </table></div>
          )}
        </Card>
        <Card title={`Camera output this week · ${cams.length} cameras`}>
          <div className="cpad"><HBars data={[...out].sort((a, b) => a.hours - b.hours).map(c => ({ label: `${c.asset.id} · ${shortName(data.sites.find(s => s.id === c.asset.siteId)?.name ?? '')}`, value: c.hours, tone: c.hours === 0 ? '#C43D2F' : undefined, to: `/hardware/${c.asset.siteId}`, hint: `${c.recordings} recordings · ${c.acceptance}% accepted` }))} format={v => fmtHours(v)} /></div>
        </Card>
      </div>
    </>
  )
}
