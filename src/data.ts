// Sample dataset for the review build. Everything here is fictional and is
// labelled "Sample data" in the UI. Replace `dataset` with the API response
// of the same shape (see types.ts) to go live.

import type {
  Asset, Dataset, Invoice, Notice, Person, Process, Recording, Site, Step,
} from './types'

/* ---------- helpers ---------- */

// Deterministic pseudo-random so the sample looks the same on every load.
let seed = 7
const rnd = () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}
const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)]
const between = (a: number, b: number) => Math.round(a + rnd() * (b - a))

const step = (order: number, name: string, tasks: [string, number, number?][]): Step => ({
  id: `s${order}`,
  order,
  name,
  tasks: tasks.map(([n, w, h], i) => ({ id: `s${order}t${i + 1}`, name: n, workers: w, hoursPerWorker: h ?? 20 })),
})

/* ---------- processes ---------- */

const foundry: Process = {
  id: 'p-foundry',
  name: 'Aluminium casting',
  steps: [
    step(1, 'Melt', [['Charge furnace', 4], ['Skim and check temperature', 3]]),
    step(2, 'Pour', [['Ladle pour', 6], ['Mould handling', 5]]),
    step(3, 'Cool', [['Shake-out', 5]]),
    step(4, 'Fettle', [['Cut runners and risers', 8], ['Grind flash', 8]]),
    step(5, 'Machine', [['CNC loading', 6], ['Drilling and tapping', 6]]),
    step(6, 'Inspect', [['Gauge check', 4], ['Visual inspection', 4]]),
    step(7, 'Pack', [['Box and label', 3]]),
  ],
}

const stamping: Process = {
  id: 'p-stamping',
  name: 'Sheet-metal stamping',
  steps: [
    step(1, 'Shear', [['Blank cutting', 4]]),
    step(2, 'Press', [['Press loading', 8], ['Die change', 2]]),
    step(3, 'Deburr', [['Hand deburr', 6]]),
    step(4, 'Weld', [['Spot weld', 6], ['MIG weld', 4]]),
    step(5, 'Paint', [['Powder coat hang', 4]]),
    step(6, 'Assemble', [['Bracket assembly', 8]]),
  ],
}

const textile: Process = {
  id: 'p-textile',
  name: 'Garment stitching',
  steps: [
    step(1, 'Cut', [['Layer and cut', 5]]),
    step(2, 'Stitch', [['Single-needle stitching', 12], ['Overlock', 8]]),
    step(3, 'Finish', [['Thread trimming', 6], ['Ironing', 6]]),
    step(4, 'Check', [['Measurement check', 4]]),
    step(5, 'Pack', [['Fold and pack', 4]]),
  ],
}

const kitchen: Process = {
  id: 'p-kitchen',
  name: 'Cloud kitchen · order to dispatch',
  steps: [
    step(1, 'Receive', [['Receive and store ingredients', 3]]),
    step(2, 'Prep', [['Wash and chop vegetables', 6], ['Marinate', 4]]),
    step(3, 'Cook', [['Cook on the range', 8], ['Fry', 4]]),
    step(4, 'Pack', [['Portion and pack orders', 6], ['Seal and label', 4]]),
    step(5, 'Dispatch', [['Hand over to riders', 3]]),
    step(6, 'Wash', [['Dishwashing', 4], ['Clean the station', 4]]),
  ],
}

const fulfilment: Process = {
  id: 'p-fulfilment',
  name: 'Fulfilment · receive to dispatch',
  steps: [
    step(1, 'Receive', [['Unload and scan', 4]]),
    step(2, 'Putaway', [['Shelve by location', 5]]),
    step(3, 'Pick', [['Pick to tote', 10]]),
    step(4, 'Pack', [['Pack and label', 8]]),
    step(5, 'Dispatch', [['Sort by route', 4], ['Load vans', 4]]),
  ],
}

/* ---------- sites ---------- */

const sites: Site[] = [
  {
    id: 'HL014', name: 'Shakti Precision Works', city: 'Bengaluru', state: 'Karnataka',
    type: 'Foundry and machining', stage: 'live', ratePerHour: 418, process: foundry,
    uploadLagMin: 35, scheduledToday: 42, presentToday: 39, startedOn: '2026-07-14', endsOn: '2027-01-10',
  },
  {
    id: 'HL021', name: 'Annapoorna Cloud Kitchen', city: 'Coimbatore', state: 'Tamil Nadu',
    type: 'Cloud kitchen', stage: 'live', ratePerHour: 390, process: kitchen,
    uploadLagMin: 4380, scheduledToday: 40, presentToday: 22, startedOn: '2026-08-03', endsOn: '2026-11-01',
  },
  {
    id: 'HL027', name: 'Anand Auto Components', city: 'Hosur', state: 'Tamil Nadu',
    type: 'Sheet-metal stamping', stage: 'hardware', ratePerHour: 418, process: stamping,
    uploadLagMin: 0, scheduledToday: 0, presentToday: 0, startedOn: '',
  },
  {
    id: 'HL031', name: 'Fresh Basket Fulfilment Centre', city: 'Belagavi', state: 'Karnataka',
    type: 'E-commerce fulfilment centre', stage: 'recce', ratePerHour: 418, process: fulfilment,
    uploadLagMin: 0, scheduledToday: 0, presentToday: 0, startedOn: '',
  },
  {
    id: 'HL006', name: 'Vijaya Auto Pressings', city: 'Peenya', state: 'Karnataka',
    type: 'Sheet-metal stamping', stage: 'closed', ratePerHour: 400, process: stamping,
    uploadLagMin: 0, scheduledToday: 0, presentToday: 0, startedOn: '2026-04-06', closedOn: '2026-06-28', finalHours: 812, paidTotal: 324800,
  },
  {
    id: 'HL009', name: 'Meenakshi Textiles', city: 'Tiruppur', state: 'Tamil Nadu',
    type: 'Textile and garments', stage: 'closed', ratePerHour: 390, process: textile,
    uploadLagMin: 0, scheduledToday: 0, presentToday: 0, startedOn: '2026-05-11', closedOn: '2026-07-19', finalHours: 640, paidTotal: 249600,
  },
]

/* ---------- people ---------- */

const people: Person[] = []
const supervisors: Record<string, string> = {}
const operators: Record<string, string[]> = {}
const workers: Record<string, string[]> = {}

const names = {
  sup: ['Rajesh Kumar', 'Lakshmi Devi', 'Suresh Babu', 'Anitha R'],
  op: ['Manoj S', 'Deepak N', 'Kavya M', 'Arun P', 'Priya K', 'Vikram T', 'Sneha R', 'Ganesh B'],
  wk: ['Basavaraj', 'Muniyappa', 'Shivakumar', 'Nagaraj', 'Ravi', 'Selvam', 'Murugan', 'Kumar', 'Mani', 'Raja',
    'Velu', 'Prakash', 'Santhosh', 'Lokesh', 'Harish', 'Naveen', 'Girish', 'Umesh', 'Mahesh', 'Sathish',
    'Dinesh', 'Rakesh', 'Yogesh', 'Ramesh', 'Ganesh', 'Karthik', 'Arjun', 'Sudhir', 'Venkat', 'Balaji'],
}
let n = 0
for (const [i, s] of sites.entries()) {
  if (s.stage !== 'live') continue
  const sup = `P${++n}`
  people.push({ id: sup, name: names.sup[i], role: 'supervisor', siteId: s.id, phone: '+91 98xxx xxxxx', active: true })
  supervisors[s.id] = sup
  operators[s.id] = []
  workers[s.id] = []
  const opCount = i === 0 ? 3 : 2
  for (let k = 0; k < opCount; k++) {
    const op = `P${++n}`
    people.push({ id: op, name: names.op[i * 3 + k], role: 'operator', siteId: s.id, reportsTo: sup, active: true })
    operators[s.id].push(op)
    const wkCount = i === 0 ? 6 : 5
    for (let w = 0; w < wkCount; w++) {
      const wk = `P${++n}`
      people.push({ id: wk, name: names.wk[(i * 20 + k * 6 + w) % names.wk.length], role: 'worker', siteId: s.id, reportsTo: op, active: true })
      workers[s.id].push(wk)
    }
  }
}
// One operator also covers two tasks at the other site — partners move operators between sites,
// and the operator report has to add up across them.
const roamer = operators.HL021?.[0]
if (roamer) {
  operators.HL014.push(roamer)
  people.filter(p => p.role === 'worker' && p.siteId === 'HL014').slice(0, 2).forEach(w => { w.reportsTo = roamer })
}

// one deactivated operator, to show the state
people.push({ id: `P${++n}`, name: 'Sanjay V', role: 'operator', siteId: 'HL014', reportsTo: supervisors.HL014, active: false })

/* ---------- hardware ---------- */

const assets: Asset[] = []
let a = 0
const addAsset = (siteId: string, type: Asset['type'], label: string, value: number, count: number, holders: string[] = [], status: Asset['status'] = 'in-use') => {
  for (let i = 0; i < count; i++) {
    const id = `${type.toUpperCase().slice(0, 3)}-${String(++a).padStart(3, '0')}`
    assets.push({ id, type, label, serial: `SN${between(100000, 999999)}`, siteId, holderId: holders[i % Math.max(1, holders.length)], status, value })
  }
}
addAsset('HL014', 'camera', 'GoPro Hero 13', 31300, 8, operators.HL014)
addAsset('HL014', 'sd', 'Lexar 256 GB SD card', 5015, 24, operators.HL014)
addAsset('HL014', 'powerbank', 'Power bank 20,000 mAh', 1595, 16, operators.HL014)
addAsset('HL014', 'mount', 'Head mount', 283, 8, operators.HL014)
addAsset('HL014', 'reader', 'SD card reader', 1652, 1, [supervisors.HL014])
addAsset('HL021', 'camera', 'GoPro Hero 13', 31300, 6, operators.HL021)
addAsset('HL021', 'sd', 'Lexar 256 GB SD card', 5015, 18, operators.HL021)
addAsset('HL021', 'powerbank', 'Power bank 20,000 mAh', 1595, 12, operators.HL021)
addAsset('HL021', 'mount', 'Head mount', 283, 6, operators.HL021)
addAsset('HL027', 'camera', 'GoPro Hero 13', 31300, 6, [], 'transit')
addAsset('HL027', 'sd', 'Lexar 256 GB SD card', 5015, 18, [], 'transit')
addAsset('HL027', 'powerbank', 'Power bank 20,000 mAh', 1595, 12, [], 'transit')
addAsset('HL027', 'mount', 'Head mount', 283, 6, [], 'transit')
// a few exceptions
assets.find(x => x.siteId === 'HL021' && x.type === 'camera')!.status = 'idle'
assets.filter(x => x.siteId === 'HL021' && x.type === 'camera')[1].status = 'idle'
assets.find(x => x.siteId === 'HL014' && x.type === 'sd')!.status = 'damaged'
assets.find(x => x.siteId === 'HL021' && x.type === 'powerbank')!.status = 'missing'
// pair SD cards with cameras
for (const s of sites) {
  const cams = assets.filter(x => x.siteId === s.id && x.type === 'camera')
  const cards = assets.filter(x => x.siteId === s.id && x.type === 'sd')
  cams.forEach((c, i) => { if (cards[i]) { c.pairedWith = cards[i].id; cards[i].pairedWith = c.id } })
}

/* ---------- recordings ---------- */

const reasons = [
  { camera: [35, 60], task: [70, 95], coverage: [70, 95], reason: 'Camera pointed at the ceiling for most of the clip', feedback: 'The head mount slipped upwards about four minutes in. For the remaining 30 minutes the frame shows the roof trusses and lights, not the hands or the work piece.', fix: 'Tighten the head strap and ask the worker to look at the work piece when recording starts. Check the first minute on the phone before walking away.' },
  { camera: [40, 65], task: [70, 95], coverage: [70, 95], reason: 'Too dark to see the hands', feedback: 'Lighting at this work area is very low and the camera exposure did not compensate. Hands and tools are visible only as silhouettes.', fix: 'Record this step from the side where the light falls on the work, or ask the supervisor to switch on the lights over that area.' },
  { camera: [45, 70], task: [70, 95], coverage: [65, 90], reason: 'Hands out of frame', feedback: 'The worker\'s hands leave the frame every time the item is put down. Roughly half of the clip has no hands visible.', fix: 'Mount the camera slightly lower and tilt it down so the work surface is at the centre of the frame.' },
  { camera: [70, 95], task: [30, 55], coverage: [70, 95], reason: 'Wrong step selected on the app', feedback: 'The step chosen in the app does not match the work in the footage. The recording is good; only the label is wrong.', fix: 'Choose the step in the app after the worker has started, and confirm the step name on the screen before pressing record.' },
  { camera: [70, 95], task: [35, 60], coverage: [70, 95], reason: 'Different worker than the one selected', feedback: 'The app shows worker Nagaraj but the person in the clip is not the one registered for this camera today.', fix: 'Reassign the camera in the app when a worker swaps during the shift.' },
  { camera: [70, 95], task: [70, 95], coverage: [30, 55], reason: 'Long idle stretch, no work happening', feedback: '22 of 48 minutes show the worker waiting, with no work happening. Idle time cannot be validated.', fix: 'Pause the recording when work stops and resume when it restarts.' },
  { camera: [70, 95], task: [70, 95], coverage: [35, 60], reason: 'Recording stopped half way', feedback: 'The clip ends abruptly at 14 minutes; the power bank was disconnected.', fix: 'Check the power bank cable is clipped to the belt before the shift starts.' },
]

// each worker works on one or two steps of the process, like a real line
const workerSteps = new Map<string, Step[]>()
const stepsFor = (site: Site, workerId: string) => {
  if (!workerSteps.has(workerId)) {
    const a = pick(site.process.steps)
    const b = rnd() < 0.5 ? pick(site.process.steps) : a
    workerSteps.set(workerId, a === b ? [a] : [a, b])
  }
  return workerSteps.get(workerId)!
}

const recordings: Recording[] = []
let r = 0
const day = (offset: number) => {
  const d = new Date('2026-09-06T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - offset)
  return d.toISOString().slice(0, 10)
}
const makeRecordings = (site: Site, weeks: number, perDay: number, rejectRate: number, lagDays = 0) => {
  const ops = operators[site.id]
  const cams = assets.filter(x => x.siteId === site.id && x.type === 'camera' && x.status === 'in-use')
  for (let d = weeks * 7 - 1 + lagDays; d >= lagDays; d--) {
    for (let k = 0; k < perDay; k++) {
      const op = pick(ops)
      const wk = pick(people.filter(p => p.reportsTo === op && p.siteId === site.id))
      const st = pick(stepsFor(site, wk.id))
      const tk = pick(st.tasks)
      const minutes = between(25, 95)
      let status: Recording['status']
      if (d <= 1) status = pick(['uploading', 'review', 'review'] as const)
      else if (d <= 4) status = rnd() < rejectRate ? 'rejected' : 'accepted'
      else status = rnd() < rejectRate ? 'rejected' : d > 13 ? 'paid' : 'accepted'
      const rec: Recording = {
        id: `R${String(++r).padStart(4, '0')}`, siteId: site.id, stepId: st.id, taskId: tk.id,
        operatorId: op, workerId: wk.id, cameraId: cams[k % cams.length].id, date: day(d), minutes, status,
      }
      if (status === 'rejected') {
        const rs = pick(reasons)
        rec.scores = { camera: between(rs.camera[0], rs.camera[1]), task: between(rs.task[0], rs.task[1]), coverage: between(rs.coverage[0], rs.coverage[1]) }
        rec.reason = rs.reason; rec.feedback = rs.feedback; rec.fix = rs.fix
      } else if (status !== 'uploading' && status !== 'review') {
        rec.scores = { camera: between(78, 100), task: between(82, 100), coverage: between(75, 100) }
      }
      recordings.push(rec)
    }
  }
}
makeRecordings(sites[0], 5, 9, 0.11)
makeRecordings(sites[1], 4, 6, 0.24, 3)

// two workers who have been left on one task for weeks — the 20-hour rule in action
for (const wid of [workers.HL014[0], workers.HL014[7]]) {
  const mine = recordings.filter(r => r.workerId === wid)
  const first = mine[0]
  if (!first) continue
  for (const r of mine) { r.stepId = first.stepId; r.taskId = first.taskId; r.minutes = Math.min(120, Math.round(r.minutes * 1.5)) }
}

/* ---------- invoices ---------- */

const invoices: Invoice[] = []
const buildInvoice = (site: Site, number: string, label: string, from: string, to: string, status: Invoice['status'], extra: Partial<Invoice> = {}) => {
  const inRange = recordings.filter(x => x.siteId === site.id && x.date >= from && x.date <= to)
  const good = inRange.filter(x => x.status === 'accepted' || x.status === 'paid')
  const bad = inRange.filter(x => x.status === 'rejected')
  const approvedHours = Math.round(good.reduce((s, x) => s + x.minutes, 0) / 60 * 10) / 10
  const byReason = new Map<string, Recording[]>()
  for (const b of bad) byReason.set(b.reason!, [...(byReason.get(b.reason!) ?? []), b])
  const adjustments = [...byReason.entries()].map(([reason, recs], i) => {
    const hours = Math.round(recs.reduce((s, x) => s + x.minutes, 0) / 60 * 10) / 10
    return { id: `${number}-A${i + 1}`, reason, hours, amount: Math.round(hours * site.ratePerHour), recordingIds: recs.map(x => x.id) }
  })
  const inv: Invoice = { id: number, number, siteId: site.id, periodLabel: label, from, to, status, approvedHours, ratePerHour: site.ratePerHour, adjustments, ...extra }
  invoices.push(inv)
  for (const g of good) g.invoiceId = number
  for (const b of bad) b.invoiceId = number
}
buildInvoice(sites[0], 'HL014-2608', 'August 2026', day(35), day(14), 'paid', { submittedOn: day(13), reviewStartedOn: day(12), expectedPaymentOn: day(6), paidOn: day(6), reference: 'UTR 6321…904' })
buildInvoice(sites[0], 'HL014-2609A', '1–5 September', day(13), day(2), 'scheduled', { submittedOn: day(1), reviewStartedOn: day(1), expectedPaymentOn: day(-6) })
buildInvoice(sites[1], 'HL021-2608', 'August 2026', day(35), day(14), 'paid', { submittedOn: day(13), reviewStartedOn: day(12), expectedPaymentOn: day(6), paidOn: day(5), reference: 'UTR 6321…911' })
buildInvoice(sites[1], 'HL021-2609A', '1–5 September', day(13), day(2), 'review', { submittedOn: day(1), reviewStartedOn: day(0), expectedPaymentOn: day(-8), query: { amount: 6270, owner: 'Partner Success', status: 'Waiting for Humyn', dueInDays: 2 } })

/* ---------- notifications ---------- */

const notices: Notice[] = [
  { id: 'N1', kind: 'ops', text: 'Annapoorna Cloud Kitchen has not uploaded for 3 days', siteId: 'HL021', href: '/sites/HL021/today', minutesAgo: 40, resolved: false },
  { id: 'N2', kind: 'hardware', text: 'Power bank PB-051 marked missing at Annapoorna Cloud Kitchen', siteId: 'HL021', href: '/sites/HL021/hardware', minutesAgo: 180, resolved: false },
  { id: 'N3', kind: 'quality', text: '4 recordings need work at Shakti Precision Works this week', siteId: 'HL014', href: '/performance', minutesAgo: 600, resolved: false },
  { id: 'N4', kind: 'payment', text: 'Invoice HL014-2609A scheduled for payment', siteId: 'HL014', href: '/payments/HL014-2609A', minutesAgo: 1500, resolved: true },
  { id: 'N5', kind: 'hardware', text: 'Hardware for Anand Auto Components dispatched (Delhivery DLV-8834-2201)', siteId: 'HL027', href: '/sites/HL027/hardware', minutesAgo: 2900, resolved: true },
]

export const dataset: Dataset = {
  partner: {
    id: 'PRT-0042', org: 'Shakti Precision', ownerName: 'Meera Iyer',
    email: 'meera@shaktiprecision.in', phone: '+91 98450 12345', since: '2026-06-30',
    billing: {
      legalName: 'Shakti Precision Works Private Limited',
      address: '14/2 Industrial Suburb, Yeshwanthpur, Bengaluru 560022',
      state: 'Karnataka',
      gstin: '29ABCDE1234F1Z5',
      pan: 'ABCDE1234F',
      bankName: 'HDFC Bank, Yeshwanthpur',
      accountNumber: '50100XXXXXX789',
      ifsc: 'HDFC0000123',
    },
  },
  sites, people, assets, recordings, invoices, notices,
}
