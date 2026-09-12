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

export const qualityScore = (recs: Recording[]): number => {
  const a = avgScores(recs)
  const scored = recs.filter(r => r.scores).length
  return scored ? Math.round((a.camera + a.task + a.coverage) / 3) : 0
}

export const thisWeek = (recs: Recording[]) => recs.filter(r => r.date > weekAgo)

/* ----- sites ----- */

export const stepExpected = (s: Step) => s.tasks.reduce((sum, t) => sum + t.workers * t.hoursPerWorker, 0)
export const siteTarget = (s: Site) => s.process.steps.reduce((sum, st) => sum + stepExpected(st), 0)

export const siteRecordings = (d: Dataset, siteId: string) => d.recordings.filter(r => r.siteId === siteId)

/** How far through its planned run a site is. null when it has not started. */
export interface ProjectDays { elapsed: number; total?: number; daysPct?: number; overdue: number; endsOn?: string }
const DAY = 86400000
export const projectDays = (s: Site): ProjectDays | null => {
  if (!s.startedOn) return null
  const start = Date.parse(s.startedOn + 'T00:00:00Z')
  const today = Date.parse((s.closedOn || TODAY) + 'T00:00:00Z')
  const elapsed = Math.max(1, Math.round((today - start) / DAY) + 1)
  if (!s.endsOn) return { elapsed, overdue: 0 }
  const total = Math.max(1, Math.round((Date.parse(s.endsOn + 'T00:00:00Z') - start) / DAY) + 1)
  return { elapsed, total, daysPct: pct(elapsed, total), overdue: Math.max(0, elapsed - total), endsOn: s.endsOn }
}

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
  if (missing.length) out.push(`${missing.length} hardware missing or damaged`)
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

/** One operator, across every site they have recorded at. A partner controls operators, so this is
 *  the level at which they can actually fix quality. */
export interface OperatorStat {
  id: string; name: string; active: boolean; homeSiteId: string; siteIds: string[]
  recordings: number; acceptedHours: number; rejectedHours: number; rejectedAmount: number
  acceptance: number; quality: number; workers: number; cameras: number
  mainIssue?: string; lastDate: string
}

export const operatorStats = (d: Dataset, recs = d.recordings): OperatorStat[] =>
  d.people.filter(p => p.role === 'operator').map(p => {
    const mine = recs.filter(r => r.operatorId === p.id)
    const s = summarise(mine)
    const rejectedAmount = mine.filter(r => r.status === 'rejected')
      .reduce((sum, r) => sum + r.minutes / 60 * (d.sites.find(x => x.id === r.siteId)?.ratePerHour ?? 0), 0)
    return {
      id: p.id, name: p.name, active: p.active, homeSiteId: p.siteId,
      siteIds: [...new Set([p.siteId, ...mine.map(r => r.siteId)])].filter(Boolean),
      recordings: mine.length, acceptedHours: s.acceptedHours, rejectedHours: s.rejectedHours, rejectedAmount,
      acceptance: s.acceptance, quality: qualityScore(mine),
      workers: new Set(mine.map(r => r.workerId)).size,
      cameras: new Set(mine.map(r => r.cameraId)).size,
      mainIssue: byReason(mine)[0]?.reason, lastDate: mine.map(r => r.date).sort().pop() ?? '',
    }
  })

/** the same operator, split by the sites they work at */
export const operatorBySite = (d: Dataset, operatorId: string, recs = d.recordings) => {
  const mine = recs.filter(r => r.operatorId === operatorId)
  return [...new Set(mine.map(r => r.siteId))].map(siteId => {
    const at = mine.filter(r => r.siteId === siteId)
    const s = summarise(at)
    return { site: d.sites.find(x => x.id === siteId)!, ...s, quality: qualityScore(at), recordings: at.length }
  }).filter(x => x.site)
}

export const assetsAtRisk = (d: Dataset, siteId?: string) =>
  d.assets.filter(a => (!siteId || a.siteId === siteId) && (a.status === 'missing' || a.status === 'damaged'))
export const assetValue = (list: { value: number }[]) => list.reduce((s, a) => s + a.value, 0)

/** short site name for chart labels: "Annapoorna", "Shakti" */
export const shortName = (name: string) => { const w = name.split(' '); return w[0].length <= 4 && w[1] ? `${w[0]} ${w[1]}` : w[0] }

/* ----- task coverage and the 20-hour rule ----- */
export const CAP_HOURS = 20

/** per worker × task accepted hours; over = hours beyond the cap that will not count */
export const workerTaskHours = (d: Dataset, recs: Recording[]) => {
  const m = new Map<string, { workerId: string; taskId: string; stepId: string; siteId: string; hours: number }>()
  for (const r of recs) {
    if (!isGood(r)) continue
    const k = `${r.workerId}|${r.taskId}`
    const e = m.get(k) ?? { workerId: r.workerId, taskId: r.taskId, stepId: r.stepId, siteId: r.siteId, hours: 0 }
    e.hours += r.minutes / 60
    m.set(k, e)
  }
  return [...m.values()].map(e => ({ ...e, hours: Math.round(e.hours * 10) / 10, over: Math.max(0, Math.round((e.hours - CAP_HOURS) * 10) / 10), room: Math.max(0, Math.round((CAP_HOURS - e.hours) * 10) / 10) }))
}

/** for one site: every task with hours, share of site hours, workers recorded, and cap status */
export const taskCoverage = (d: Dataset, site: Site) => {
  const recs = siteRecordings(d, site.id)
  const wt = workerTaskHours(d, recs)
  const total = wt.reduce((s, x) => s + x.hours, 0)
  return site.process.steps.flatMap(st => st.tasks.map(t => {
    const rows = wt.filter(x => x.taskId === t.id)
    const hours = Math.round(rows.reduce((s, x) => s + x.hours, 0) * 10) / 10
    return {
      step: st, task: t, hours, share: total ? Math.round(hours / total * 100) : 0,
      workers: rows.length, expectedWorkers: t.workers, expected: t.workers * t.hoursPerWorker,
      overCap: rows.filter(x => x.over > 0).length, overHours: Math.round(rows.reduce((s, x) => s + x.over, 0) * 10) / 10,
      underCap: rows.filter(x => x.room > 0).length, room: Math.round(rows.reduce((s, x) => s + x.room, 0) * 10) / 10,
    }
  }))
}


/* ----- invoicing -----
   Humyn's own details print in the bill-to block of every partner invoice.
   XXX values are placeholders for finance to confirm before this goes live. */
export const HUMYN_BILLING = {
  legalName: 'Humynai Private Limited',
  address: '837/1 Binnamangala, 1st Stage, 100 ft Road, Indiranagar, Bengaluru 560038, Karnataka',
  state: 'Karnataka',
  gstin: '29XXXXXXXXXXXZX',
  sac: '998319',
  email: 'invoices@humynlabs.ai',
  terms: 'Paid on the next 15-day cycle after Humyn approves the hours.',
}
export const GST_RATE = 18

export interface TaxLine { label: string; rate: number; amount: number }
/** CGST + SGST inside Karnataka, IGST everywhere else in India. No tax lines when the partner is not GST-registered. */
export const gstLines = (taxable: number, partnerState?: string, gstin?: string): TaxLine[] => {
  if (!gstin) return []
  const half = GST_RATE / 2
  return (partnerState ?? '').trim().toLowerCase() === HUMYN_BILLING.state.toLowerCase()
    ? [{ label: 'CGST', rate: half, amount: taxable * half / 100 }, { label: 'SGST', rate: half, amount: taxable * half / 100 }]
    : [{ label: 'IGST', rate: GST_RATE, amount: taxable * GST_RATE / 100 }]
}

/* ----- daily report ----- */
export interface DailyLine {
  site: Site; hours: number; recordings: number; acceptedHours: number; rejectedHours: number
  present: number; scheduled: number; acceptance: number; uploadLagMin: number
}
export interface DailyReport {
  date: string; hours: number; acceptedHours: number; rejectedHours: number; amount: number
  actions: { site: string; text: string; href: string }[]
  sites: DailyLine[]
}

export const yesterday = (from = TODAY) => {
  const d = new Date(from + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

/** One day across every live site: what happened, and what needs the partner today. */
export const dailyReport = (d: Dataset, date: string): DailyReport => {
  const live = d.sites.filter(s => s.stage === 'live')
  const sites: DailyLine[] = live.map(site => {
    const day = d.recordings.filter(r => r.siteId === site.id && r.date === date)
    const s = summarise(day)
    const week = summarise(thisWeek(siteRecordings(d, site.id)))
    return {
      site, hours: hrs(day.reduce((sum, r) => sum + r.minutes, 0)), recordings: day.length,
      acceptedHours: s.acceptedHours, rejectedHours: s.rejectedHours,
      present: site.presentToday, scheduled: site.scheduledToday,
      acceptance: week.acceptance, uploadLagMin: site.uploadLagMin,
    }
  })
  const actions: DailyReport['actions'] = []
  live.forEach(site => attentionReasons(d, site).forEach(text =>
    actions.push({ site: shortName(site.name), text, href: `/sites/${site.id}` })))
  d.invoices.filter(i => i.query).forEach(i =>
    actions.push({ site: shortName(d.sites.find(s => s.id === i.siteId)?.name ?? ''), text: `Query open on invoice ${i.number}`, href: `/payments/${i.id}` }))
  const all = d.recordings.filter(r => r.date === date)
  const sum = summarise(all)
  return {
    date,
    hours: hrs(all.reduce((s, r) => s + r.minutes, 0)),
    acceptedHours: sum.acceptedHours, rejectedHours: sum.rejectedHours,
    amount: all.filter(isGood).reduce((s, r) => s + r.minutes / 60 * (d.sites.find(x => x.id === r.siteId)?.ratePerHour ?? 0), 0),
    actions, sites,
  }
}

/** Indian-format amount in words, which a tax invoice has to carry. */
export const inWords = (n: number): string => {
  const a = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
    'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
  const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
  const two = (x: number): string => x < 20 ? a[x] : b[Math.floor(x / 10)] + (x % 10 ? '-' + a[x % 10] : '')
  const three = (x: number): string => x >= 100 ? `${a[Math.floor(x / 100)]} hundred${x % 100 ? ' ' + two(x % 100) : ''}` : two(x)
  let r = Math.round(n)
  if (r === 0) return 'Zero rupees only'
  const parts: string[] = []
  const cr = Math.floor(r / 10000000); r %= 10000000
  const lk = Math.floor(r / 100000); r %= 100000
  const th = Math.floor(r / 1000); r %= 1000
  if (cr) parts.push(`${three(cr)} crore`)
  if (lk) parts.push(`${three(lk)} lakh`)
  if (th) parts.push(`${three(th)} thousand`)
  if (r) parts.push(three(r))
  const t = parts.join(' ')
  return t.charAt(0).toUpperCase() + t.slice(1) + ' rupees only'
}

/** the last n seven-day windows ending yesterday, for invoice periods */
export const recentPeriods = (n = 4) => {
  const out: { from: string; to: string; label: string }[] = []
  for (let i = 0; i < n; i++) {
    const to = new Date(TODAY + 'T00:00:00Z'); to.setUTCDate(to.getUTCDate() - 1 - i * 7)
    const from = new Date(to); from.setUTCDate(from.getUTCDate() - 6)
    const f = from.toISOString().slice(0, 10), t = to.toISOString().slice(0, 10)
    out.push({ from: f, to: t, label: `${fmtDate(f)} – ${fmtDate(t)}` })
  }
  return out
}
