// Partner Dashboard v2 — data model.
// Everything a partner sees is derived from these entities. The Humyn team never
// types into this model by hand: partners create sites and people, cameras
// create recordings, Humyn's review produces verdicts, and payments follow.

export type Role = 'owner' | 'supervisor' | 'operator'

export type SiteStage =
  | 'review'      // site identification submitted, Humyn reviewing
  | 'recce'       // recce submitted / reviewing
  | 'hardware'    // hardware custody in progress
  | 'live'        // collecting
  | 'closed'      // collection finished; kept for history

export type SiteHealth = 'collecting' | 'setting-up' | 'paused' | 'attention' | 'closed'

export interface Task {
  id: string
  name: string
  /** workers assigned to this task */
  workers: number
  /** expected hours per worker; default 20 */
  hoursPerWorker: number
}

export interface Step {
  id: string
  order: number
  name: string
  tasks: Task[]
}

export interface Process {
  id: string
  name: string
  steps: Step[]
}

export interface Site {
  id: string
  name: string
  city: string
  state: string
  type: string
  stage: SiteStage
  paused?: boolean
  /** ₹ per accepted hour agreed for this site */
  ratePerHour: number
  process: Process
  /** minutes since last successful upload sync */
  uploadLagMin: number
  scheduledToday: number
  presentToday: number
  startedOn: string
  /** planned last day of collection, from the recce; omit for open-ended sites */
  endsOn?: string
  /** for closed sites */
  closedOn?: string
  finalHours?: number
  paidTotal?: number
}

export interface Person {
  id: string
  name: string
  role: Role | 'worker'
  siteId: string
  phone?: string
  /** operator or supervisor this person reports to */
  reportsTo?: string
  active: boolean
}

export type AssetType = 'camera' | 'sd' | 'powerbank' | 'mount' | 'cable' | 'reader' | 'junction'
export type AssetStatus = 'in-use' | 'idle' | 'transit' | 'missing' | 'damaged'

export interface Asset {
  id: string
  type: AssetType
  label: string
  serial: string
  siteId: string
  holderId?: string
  status: AssetStatus
  value: number
  pairedWith?: string
}

export type RecordingStatus = 'uploading' | 'review' | 'accepted' | 'rejected' | 'paid'

export interface Scores {
  camera: number
  task: number
  coverage: number
}

export interface Recording {
  id: string
  siteId: string
  stepId: string
  taskId: string
  operatorId: string
  workerId: string
  cameraId: string
  date: string          // ISO date
  minutes: number
  status: RecordingStatus
  scores?: Scores
  reason?: string       // one line, plain words
  feedback?: string     // Humyn's full note
  fix?: string          // what to do next time
  invoiceId?: string
}

export type InvoiceStatus = 'draft' | 'submitted' | 'review' | 'scheduled' | 'paid' | 'disputed'

export interface Adjustment {
  id: string
  reason: string
  hours: number
  amount: number
  recordingIds: string[]
}

export interface Invoice {
  id: string
  number: string
  siteId: string
  periodLabel: string
  from: string
  to: string
  status: InvoiceStatus
  approvedHours: number
  ratePerHour: number
  adjustments: Adjustment[]
  submittedOn?: string
  reviewStartedOn?: string
  expectedPaymentOn?: string
  paidOn?: string
  reference?: string
  query?: { amount: number; owner: string; status: string; dueInDays: number }
}

export type NotificationKind = 'ops' | 'quality' | 'hardware' | 'payment'

export interface Notice {
  id: string
  kind: NotificationKind
  text: string
  siteId?: string
  href: string
  minutesAgo: number
  resolved: boolean
}

export interface Partner {
  id: string
  org: string
  ownerName: string
  email: string
  phone: string
  since: string
}

export interface Dataset {
  partner: Partner
  sites: Site[]
  people: Person[]
  assets: Asset[]
  recordings: Recording[]
  invoices: Invoice[]
  notices: Notice[]
}
