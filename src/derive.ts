// Every number on screen is computed here from the dataset — nothing is typed in.

import type { Dataset, Invoice, Person, Recording, Scores, Site, SiteHealth, Step } from './types'

export const hrs = (minutes: number) => Math.round(minutes / 60 * 10) / 10
export const fmtHours = (h: number) => {
  const whole = Math.floor(h)
  const m = Math.round((h - whole) * 60)
  return whole === 0 && m > 0 ? `${m} min` : m ? `${whole}h ${m}m` : `${whole}h`
}
export const fmtINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')
export const fmtDate = (iso?: string) => iso ? new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'
export const pct = (a: number, b: number) => b === 0 ? 0 : Math.round(a / b * 100)

export const TODAY = '2026-09-06'
export const weekAgo = (() => { const d = new Date(TODAY + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() - 7); return d.toISOString().slice(0, 10) })()

export const isGood = (r: Recording) => r.status === 'accepted' || r.status === 'paid'

export type Quality = 'Great' | 'Good' | 'Needs work'
export const qualityWord = (acceptance: number, total: number): Quality =>
  total === 0 ? 'Good' : acceptance >= 92 ? 'Great' : acceptance >= 80 ? 'Good' : 'Needs work'

/* ----- recordings ----- */

export const titleOf = (d: Dataset, r: Recording) => {
  const site = d.sites.find(s => s.id === r.siteId)!
  const step = site.process.steps.find(s => s.id === r.stepId)!
  const task = step.tasks.find(t => t.id === r.taskId)!
  const worker = d.people.find(p => p.id === r.workerId)
  return { site, step, task, worker, label: `Step ${step.order} of ${site.process.steps.length} · ${step.name} · ${task.name}` }
}

export const summarise = (recs: Recording[]) => {
  const uploaded = recs.filter(r => r.status !== 'uploading')
  const good = recs.filter(isGood)
  const bad = recs.filter(r => r.status === 'rejected')
  const reviewed = good.length + bad.length
  const goodMin = good.reduce((s, r) => s + r.minutes, 0)
  const badMin = bad.reduce((s, r) => s + r.minutes, 0)
  const acceptance = reviewed === 0 ? 100 : pct(good.length, reviewed)
  return {
    count: recs.length, uploaded: uploaded.length, good: good.length, bad: bad.length,
    inReview: recs.filter(r => r.status === 'review').length,
    uploading: recs.filter(r => r.status === 'uploading').length,
    acceptedHours: hrs(goodMin), rejectedHours: hrs(badMin),
    recordedHours: hrs(recs.reduce((s, r) => s + r.minutes, 0)),
    acceptance, quality: qualityWord(acceptance, reviewed),
  }
}

export const avgScores = (recs: Recording[]): Scores => {
  const scored = recs.filter(r => r.scores)
  if (!scored.length) return { camera: 0, task: 0, coverage: 0 }
  const s = scored.reduce((acc, r) => ({ camera: acc.camera + r.scores!.camera, task: acc.task + r.scores!.task, coverage: acc.coverage + r.scores!.coverage }), { camera: 0, task: 0, coverage: 0 })
  return { camera: Math.round(s.camera / scored.length), task: Math.round(s.task / scored.length), coverage: Math.round(s.coverage / scored.length) }
}

export const thisWeek = (recs: Recording[]) => recs.filter(r => r.date > weekAgo)

/* ----- sites ----- */

export const stepExpected = (s: Step) => s.tasks.reduce((sum, t) => sum + t.workers * t.hoursPerWorker, 0)
export const siteTarget = (s: Site) => s.process.steps.reduce((sum, st) => sum + stepExpected(st), 0)

export const siteRecordings = (d: Dataset, siteId: string) => d.recordings.filter(r => r.siteId === siteId)

export const siteHealth = (d: Dataset, s: Site): SiteHealth => {
  if (s.stage === 'closed') return 'closed'
  if (s.stage !== 'live') return 'setting-up'
  if (s.paused) return 'paused'
  const sum = summarise(thisWeek(siteRecordings(d, s.id)))
  if (s.uploadLagMin > 24 * 60 || sum.acceptance < 80 || s.presentToday < s.scheduledToday * 0.7) return 'attention'
  return 'collecting'
}

export const healthLabel: Record<SiteHealth, string> = {
  collecting: 'Collecting', 'setting-up': 'Setting up', paused: 'Paused', attention: 'Needs attention', closed: 'Completed',
}

export const stageLabel: Record<Site['stage'], string> = {
  review: 'Humyn is reviewing the site', recce: 'Humyn is reviewing the recce', hardware: 'Hardware on its way', live: 'Live', closed: 'Completed',
}

export const attentionReasons = (d: Dataset, s: Site): string[] => {
  const out: string[] = []
  if (s.stage !== 'live') return out
  if (s.uploadLagMin > 24 * 60) out.push(`No upload for ${Math.floor(s.uploadLagMin / 1440)} days`)
  const sum = summarise(thisWeek(siteRecordings(d, s.id)))
  if (sum.acceptance < 80) out.push(`Acceptance ${sum.acceptance}% this week`)
  if (s.presentToday < s.scheduledToday * 0.7) out.push(`Only ${s.presentToday} of ${s.scheduledToday} present today`)
  const missing = d.assets.filter(a => a.siteId === s.id && (a.status === 'missing' || a.status === 'damaged'))
  if (missing.length) out.push(`${missing.length} hardware item${missing.length > 1 ? 's' : ''} missing or damaged`)
  return out
}

/* ----- people ----- */

export const personRecordings = (d: Dataset, p: Person) =>
  d.recordings.filter(r => p.role === 'operator' ? r.operatorId === p.id : p.role === 'worker' ? r.workerId === p.id : r.siteId === p.siteId)

export const reports = (d: Dataset, id: string) => d.people.filter(p => p.reportsTo === id)

/* ----- money ----- */

// gross = every reviewed hour × rate; deductions = the rejected hours; net = what is paid
export const invoiceRejectedHours = (i: Invoice) => i.adjustments.reduce((s, a) => s + a.hours, 0)
export const invoiceGross = (i: Invoice) => (i.approvedHours + invoiceRejectedHours(i)) * i.ratePerHour
export const invoiceDeductions = (i: Invoice) => i.adjustments.reduce((s, a) => s + a.amount, 0)
export const invoiceNet = (i: Invoice) => i.approvedHours * i.ratePerHour

export const money = (d: Dataset, siteIds?: string[]) => {
  const inv = d.invoices.filter(i => !siteIds || siteIds.includes(i.siteId))
  const paid = inv.filter(i => i.status === 'paid').reduce((s, i) => s + invoiceNet(i), 0)
  const payable = inv.filter(i => i.status === 'scheduled' || i.status === 'submitted').reduce((s, i) => s + invoiceNet(i), 0)
  const review = inv.filter(i => i.status === 'review' || i.status === 'disputed').reduce((s, i) => s + invoiceNet(i), 0)
  const next = inv.filter(i => i.status === 'scheduled').map(i => i.expectedPaymentOn!).sort()[0]
  return { paid, payable, review, next, invoices: inv }
}

/** accepted hours per week for the last n weeks, oldest first — for the small trend line */
export const weeklyAccepted = (recs: Recording[], n = 6) => {
  const out: number[] = []
  for (let w = n - 1; w >= 0; w--) {
    const end = new Date(TODAY + 'T00:00:00Z'); end.setUTCDate(end.getUTCDate() - w * 7)
    const start = new Date(end); start.setUTCDate(start.getUTCDate() - 7)
    const a = start.toISOString().slice(0, 10), b = end.toISOString().slice(0, 10)
    out.push(hrs(recs.filter(r => isGood(r) && r.date > a && r.date <= b).reduce((s, r) => s + r.minutes, 0)))
  }
  return out
}

export const statusLabel: Record<Recording['status'], string> = {
  uploading: 'Uploading', review: 'In review', accepted: 'Accepted', rejected: 'Needs work', paid: 'Paid',
}
export const invoiceStatusLabel: Record<Invoice['status'], string> = {
  draft: 'Draft', submitted: 'Submitted', review: 'Under review', scheduled: 'Scheduled', paid: 'Paid', disputed: 'Disputed',
}

/* ----- v2.1 analysis helpers ----- */

export const weekLabels = (n = 6) => {
  const out: string[] = []
  for (let w = n - 1; w >= 0; w--) {
    const end = new Date(TODAY + 'T00:00:00Z'); end.setUTCDate(end.getUTCDate() - w * 7)
    out.push(w === 0 ? 'This week' : end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' }))
  }
  return out
}

/** accepted and rejected hours per week, oldest first */
export const weeklyFunnel = (recs: Recording[], n = 6) => {
  const out: { accepted: number; rejected: number }[] = []
  for (let w = n - 1; w >= 0; w--) {
    const end = new Date(TODAY + 'T00:00:00Z'); end.setUTCDate(end.getUTCDate() - w * 7)
    const start = new Date(end); start.setUTCDate(start.getUTCDate() - 7)
    const a = start.toISOString().slice(0, 10), b = end.toISOString().slice(0, 10)
    const inW = recs.filter(r => r.date > a && r.date <= b)
    out.push({ accepted: hrs(inW.filter(isGood).reduce((s, r) => s + r.minutes, 0)), rejected: hrs(inW.filter(r => r.status === 'rejected').reduce((s, r) => s + r.minutes, 0)) })
  }
  return out
}

/** rejected hours grouped by reason, largest first */
export const byReason = (recs: Recording[]) => {
  const m = new Map<string, Recording[]>()
  for (const r of recs) if (r.status === 'rejected' && r.reason) m.set(r.reason, [...(m.get(r.reason) ?? []), r])
  return [...m.entries()].map(([reason, list]) => ({ reason, count: list.length, hours: hrs(list.reduce((s, r) => s + r.minutes, 0)), recordings: list })).sort((a, b) => b.hours - a.hours)
}

export interface WorkerStat {
  id: string; name: string; siteId: string; operatorId?: string
  recordings: number; acceptedHours: number; rejectedHours: number; acceptance: number
  scores: Scores; mainIssue?: string; steps: number; quality: Quality; lastDate: string
}

export const workerStats = (d: Dataset, recs = d.recordings): WorkerStat[] =>
  d.people.filter(p => p.role === 'worker').map(p => {
    const mine = recs.filter(r => r.workerId === p.id)
    const s = summarise(mine)
    const issues = byReason(mine)
    return {
      id: p.id, name: p.name, siteId: p.siteId, operatorId: p.reportsTo,
      recordings: mine.length, acceptedHours: s.acceptedHours, rejectedHours: s.rejectedHours, acceptance: s.acceptance,
      scores: avgScores(mine), mainIssue: issues[0]?.reason, steps: new Set(mine.map(r => r.stepId)).size, quality: s.quality,
      lastDate: mine.map(r => r.date).sort().pop() ?? '',
    }
  }).filter(w => w.recordings > 0)

/** cameras with hours recorded in the window; zero-output cameras are the hardware problem to surface */
export const cameraOutput = (d: Dataset, recs = d.recordings) =>
  d.assets.filter(a => a.type === 'camera').map(a => {
    const mine = recs.filter(r => r.cameraId === a.id)
    return { asset: a, hours: hrs(mine.reduce((s, r) => s + r.minutes, 0)), recordings: mine.length, acceptance: summarise(mine).acceptance }
  })

export const assetsAtRisk = (d: Dataset, siteId?: string) =>
  d.assets.filter(a => (!siteId || a.siteId === siteId) && (a.status === 'missing' || a.status === 'damaged'))
export const assetValue = (list: { value: number }[]) => list.reduce((s, a) => s + a.value, 0)

/** short site name for chart labels: "Sri Ganesh", "Shakti" */
export const shortName = (name: string) => { const w = name.split(' '); return w[0].length <= 4 && w[1] ? `${w[0]} ${w[1]}` : w[0] }
