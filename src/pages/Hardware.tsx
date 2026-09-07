import { useState } from 'react'
import { useApp } from '../App'
import { Link, useRoute } from '../router'
import type { Dataset } from '../types'
import { Card, Empty, Kpi, PageH } from '../components/ui'
import { HBars } from '../components/charts'
import type { Asset } from '../types'
import { assetValue, assetsAtRisk, cameraOutput, fmtHours, fmtINR, shortName, thisWeek } from '../derive'

const TYPES: [Asset['type'], string][] = [['camera', 'Cameras'], ['sd', 'SD cards'], ['powerbank', 'Power banks'], ['mount', 'Mounts'], ['reader', 'Readers'], ['cable', 'Cables'], ['junction', 'Junction boxes']]

const hardwareCsv = (d: Dataset) => {
  const label: Record<string, string> = { 'in-use': 'In use', idle: 'Idle', transit: 'In transit', missing: 'Missing', damaged: 'Damaged' }
  const rows = [['Asset ID', 'Item', 'Serial', 'Site', 'Site ID', 'Holder', 'Status', 'Paired with', 'Value (INR)'],
    ...d.assets.map(a => [a.id, a.label, a.serial, d.sites.find(s => s.id === a.siteId)?.name ?? '', a.siteId, d.people.find(p => p.id === a.holderId)?.name ?? '', label[a.status], a.pairedWith ?? '', String(a.value)])]
  return 'data:text/csv;charset=utf-8,' + encodeURIComponent('\ufeff' + rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n'))
}

export function Hardware() {
  const { data } = useApp()
  const { go } = useRoute()
  const [siteId, setSiteId] = useState('all')
  const [opId, setOpId] = useState('all')
  const opsAll = data.people.filter(p => p.role === 'operator' && p.active && data.assets.some(a => a.holderId === p.id) && (siteId === 'all' || p.siteId === siteId))
  const all = data.assets.filter(a => (siteId === 'all' || a.siteId === siteId) && (opId === 'all' || a.holderId === opId))
  const custody = all.filter(a => a.status !== 'transit')
  const transit = all.filter(a => a.status === 'transit')
  const risk = assetsAtRisk(data)
  const idle = all.filter(a => a.status === 'idle')
  const cams = custody.filter(a => a.type === 'camera')
  const out = cameraOutput(data, thisWeek(data.recordings)).filter(c => c.asset.status !== 'transit' && all.some(a => a.id === c.asset.id))
  const zero = out.filter(c => c.hours === 0)
  const sites = data.sites.filter(s => all.some(a => a.siteId === s.id))
  const types = TYPES.filter(([t]) => all.some(a => a.type === t))
  return (
    <>
      <PageH title="Hardware" sub="Humyn's equipment in your custody. You are liable for its value until it is returned."
        right={<div className="filters">
          <label><span>Site</span><select className="sel" value={siteId} onChange={e => { setSiteId(e.target.value); setOpId('all') }}><option value="all">All sites</option>{data.sites.filter(x => data.assets.some(a => a.siteId === x.id)).map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
          <label><span>Operator</span><select className="sel" value={opId} onChange={e => setOpId(e.target.value)}><option value="all">All operators</option>{opsAll.map(p => <option key={p.id} value={p.id}>{p.name}{siteId === 'all' ? ` · ${shortName(data.sites.find(x => x.id === p.siteId)?.name ?? '')}` : ''}</option>)}</select></label>
          <a className="btn ghost" href={hardwareCsv({ ...data, assets: all })} download="humyn-hardware-list.csv">{all.length === data.assets.length ? 'Export full hardware list' : `Export ${all.length} items`}</a>
        </div>} />
      <div className="kpis">
        <Kpi label="In custody" value={custody.length} sub={opId !== 'all' ? 'with this operator' : `${sites.filter(s => s.stage === 'live').length} site${sites.filter(s => s.stage === 'live').length === 1 ? '' : 's'}`} />
        <Kpi label="Value in custody" value={fmtINR(assetValue(custody))} sub="replacement cost" />
        <Kpi label="At risk" value={risk.length ? fmtINR(assetValue(risk)) : '₹0'} sub={`${risk.length} missing or damaged`} tone={risk.length ? 'red' : undefined} />
        <Kpi label="Idle cameras" value={idle.length} sub={idle.length ? `${fmtINR(assetValue(idle))} not earning` : 'all in use'} tone={idle.length ? 'amber' : undefined} />
        <Kpi label="Zero output" value={zero.length} sub="cameras, this week" tone={zero.length ? 'red' : undefined} />
        <Kpi label="In transit" value={transit.length} sub={transit.length ? fmtINR(assetValue(transit)) : '—'} />
      </div>

      <Card className="mb">
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>Site</th>{types.map(([t, l]) => <th key={t} className="num">{l}</th>)}<th className="num">Total value</th><th className="num">At risk</th><th className="num">Idle</th></tr></thead>
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

      <Card title="By operator · who holds what" className="mb">
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>Operator</th><th>Site</th><th className="num">Cameras</th><th className="num">SD cards</th><th className="num">Power banks</th><th className="num">Other</th><th className="num">Value held</th><th className="num">Output this week</th><th>Status</th><th></th></tr></thead>
          <tbody>{opsAll.filter(p => opId === 'all' || p.id === opId).map(p => {
            const mine = all.filter(a => a.holderId === p.id)
            const n = (t: Asset['type']) => mine.filter(a => a.type === t).length
            const other = mine.filter(a => !['camera', 'sd', 'powerbank'].includes(a.type)).length
            const hrsOut = out.filter(c => c.asset.holderId === p.id).reduce((t, c) => t + c.hours, 0)
            const bad = mine.filter(a => a.status === 'missing' || a.status === 'damaged'), idleMine = mine.filter(a => a.status === 'idle')
            return (
              <tr key={p.id} className="click" onClick={() => go(`/sites/${p.siteId}/operator/${p.id}`)}>
                <td><Link to={`/sites/${p.siteId}/operator/${p.id}`}>{p.name}</Link></td>
                <td className="small muted">{shortName(data.sites.find(s => s.id === p.siteId)?.name ?? '')}</td>
                <td className="num">{n('camera')}</td><td className="num">{n('sd')}</td><td className="num">{n('powerbank')}</td><td className="num">{other || '—'}</td>
                <td className="num">{fmtINR(assetValue(mine))}</td>
                <td className={`num ${hrsOut === 0 ? 'red' : ''}`}>{fmtHours(hrsOut)}</td>
                <td className={bad.length ? 'red' : idleMine.length ? 'amber' : 'green'}>{bad.length ? `${bad.length} missing/damaged` : idleMine.length ? `${idleMine.length} idle` : 'All in use'}</td>
                <td className="arrow">›</td>
              </tr>
            )
          })}</tbody>
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
