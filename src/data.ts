export type SiteStatus = 'Live' | 'Ready' | 'Review' | 'At risk' | 'Paused'

export type Site = {
  id: string
  name: string
  city: string
  state: string
  type: string
  project: string
  status: SiteStatus
  stage: string
  manager: string
  shifts: number
  workers: number
  present: number
  cameras: number
  activeCameras: number
  operators: number
  requiredOperators: number
  accepted: number
  acceptance: number
  uploadLag: number
  readiness: number
  nextAction: string
}

export const sites: Site[] = [
  { id: 'HL-MH-104', name: 'Pragati Auto Components', city: 'Pune', state: 'Maharashtra', type: 'Automotive', project: 'Atlas', status: 'Live', stage: 'Live', manager: 'Meera Joshi', shifts: 2, workers: 84, present: 71, cameras: 60, activeCameras: 56, operators: 3, requiredOperators: 3, accepted: 318, acceptance: 91.4, uploadLag: 1.8, readiness: 100, nextAction: 'Review 2 quality exceptions' },
  { id: 'HL-GJ-207', name: 'Shakti Precision Works', city: 'Ahmedabad', state: 'Gujarat', type: 'Metal fabrication', project: 'Atlas', status: 'At risk', stage: 'Live', manager: 'Vikram Solanki', shifts: 2, workers: 62, present: 48, cameras: 48, activeCameras: 36, operators: 2, requiredOperators: 3, accepted: 186, acceptance: 77.8, uploadLag: 14.2, readiness: 100, nextAction: 'Assign 1 operator to Shift B' },
  { id: 'HL-TN-089', name: 'Kaveri Textiles Unit 2', city: 'Coimbatore', state: 'Tamil Nadu', type: 'Textiles', project: 'Loom', status: 'Live', stage: 'Live', manager: 'Ananya Ravi', shifts: 3, workers: 110, present: 96, cameras: 72, activeCameras: 68, operators: 4, requiredOperators: 4, accepted: 402, acceptance: 94.2, uploadLag: 0.7, readiness: 100, nextAction: 'No urgent action' },
  { id: 'HL-KA-141', name: 'Nandi Electronics', city: 'Bengaluru', state: 'Karnataka', type: 'Electronics', project: 'Atlas', status: 'Ready', stage: 'Ready', manager: 'Saira Khan', shifts: 2, workers: 76, present: 0, cameras: 40, activeCameras: 0, operators: 2, requiredOperators: 2, accepted: 0, acceptance: 0, uploadLag: 0, readiness: 92, nextAction: 'Upload facility agreement' },
  { id: 'HL-RJ-063', name: 'Marudhar Packaging', city: 'Jaipur', state: 'Rajasthan', type: 'Packaging', project: 'Loom', status: 'Review', stage: 'Task review', manager: 'Arjun Rathore', shifts: 2, workers: 55, present: 0, cameras: 32, activeCameras: 0, operators: 2, requiredOperators: 2, accepted: 0, acceptance: 0, uploadLag: 0, readiness: 68, nextAction: 'Remap rejected sealing task' },
  { id: 'HL-UP-118', name: 'Ganga Foods Processing', city: 'Noida', state: 'Uttar Pradesh', type: 'Food processing', project: 'Harvest', status: 'Paused', stage: 'Paused', manager: 'Rohit Kumar', shifts: 1, workers: 42, present: 0, cameras: 24, activeCameras: 0, operators: 1, requiredOperators: 2, accepted: 88, acceptance: 82.3, uploadLag: 31.5, readiness: 100, nextAction: 'Resolve access permission expiry' },
]

export type Person = {
  id: string
  name: string
  role: 'Site manager' | 'Operator' | 'Worker'
  siteId: string
  shift: string
  job: string
  skill: string
  hand: 'Right' | 'Left' | 'Ambidextrous'
  status: 'Active' | 'Absent' | 'Invite pending' | 'Inactive'
  consent: 'Valid' | 'Expiring' | 'Missing'
  lastActive: string
  recorded: number
  uploaded: number
  accepted: number
  acceptance: number
  app: string
  training: number
  operatorInCharge?: string
  supervisorInCharge?: string
  cameraAssigned?: string
  sdCardAssigned?: string
  uploadDevice?: string
}

export const people: Person[] = [
  { id: 'P-2041', name: 'Meera Joshi', role: 'Site manager', siteId: 'HL-MH-104', shift: 'A + B', job: 'Operations lead', skill: 'Site operations', hand: 'Right', status: 'Active', consent: 'Valid', lastActive: '8 min ago', recorded: 0, uploaded: 0, accepted: 0, acceptance: 0, app: '2.14.1', training: 100 },
  { id: 'P-2088', name: 'Nikhil Patil', role: 'Operator', siteId: 'HL-MH-104', shift: 'A', job: 'Camera operator', skill: 'Mounting L2', hand: 'Right', status: 'Active', consent: 'Valid', lastActive: '4 min ago', recorded: 48.2, uploaded: 46.8, accepted: 43.6, acceptance: 93.2, app: '2.14.1', training: 100 },
  { id: 'P-2130', name: 'Pooja More', role: 'Operator', siteId: 'HL-MH-104', shift: 'B', job: 'Camera operator', skill: 'Mounting L2', hand: 'Left', status: 'Active', consent: 'Valid', lastActive: '21 min ago', recorded: 44.1, uploaded: 42.7, accepted: 38.9, acceptance: 91.1, app: '2.14.1', training: 92 },
  { id: 'P-3312', name: 'Vikram Solanki', role: 'Site manager', siteId: 'HL-GJ-207', shift: 'A + B', job: 'Site lead', skill: 'Site operations', hand: 'Right', status: 'Active', consent: 'Valid', lastActive: '13 min ago', recorded: 0, uploaded: 0, accepted: 0, acceptance: 0, app: '2.13.8', training: 100 },
  { id: 'P-3370', name: 'Irfan Sheikh', role: 'Operator', siteId: 'HL-GJ-207', shift: 'A', job: 'Camera operator', skill: 'Mounting L1', hand: 'Right', status: 'Active', consent: 'Valid', lastActive: '37 min ago', recorded: 39.4, uploaded: 30.1, accepted: 23.7, acceptance: 78.7, app: '2.13.8', training: 78 },
  { id: 'P-3384', name: 'Rhea Desai', role: 'Operator', siteId: 'HL-GJ-207', shift: 'B', job: 'Camera operator', skill: 'Mounting L1', hand: 'Right', status: 'Absent', consent: 'Valid', lastActive: 'Yesterday', recorded: 31.8, uploaded: 29.6, accepted: 22.4, acceptance: 75.7, app: '2.14.1', training: 83 },
  { id: 'P-4401', name: 'Ananya Ravi', role: 'Site manager', siteId: 'HL-TN-089', shift: 'All shifts', job: 'Site lead', skill: 'Site operations', hand: 'Left', status: 'Active', consent: 'Valid', lastActive: '2 min ago', recorded: 0, uploaded: 0, accepted: 0, acceptance: 0, app: '2.14.1', training: 100 },
  { id: 'P-4433', name: 'Karthik Selvan', role: 'Operator', siteId: 'HL-TN-089', shift: 'A', job: 'Camera operator', skill: 'Mounting L3', hand: 'Right', status: 'Active', consent: 'Valid', lastActive: '6 min ago', recorded: 55.8, uploaded: 55.1, accepted: 52.7, acceptance: 95.6, app: '2.14.1', training: 100 },
  { id: 'W-7804', name: 'Nisha Kumari', role: 'Worker', siteId: 'HL-UP-118', shift: 'A', job: 'Packing associate', skill: 'Carton sealing', hand: 'Right', status: 'Inactive', consent: 'Expiring', lastActive: '6 days ago', recorded: 21.4, uploaded: 19.8, accepted: 16.1, acceptance: 81.3, app: '—', training: 67, operatorInCharge: 'Amit Verma', supervisorInCharge: 'Rohit Kumar', cameraAssigned: 'CAM-0244', sdCardAssigned: 'SD-7402', uploadDevice: 'PHN-0094' },
  { id: 'W-6240', name: 'Devika S.', role: 'Worker', siteId: 'HL-TN-089', shift: 'B', job: 'Machine operator', skill: 'Power loom', hand: 'Left', status: 'Active', consent: 'Valid', lastActive: '11 min ago', recorded: 47.6, uploaded: 47.2, accepted: 45.3, acceptance: 96, app: '—', training: 100, operatorInCharge: 'Karthik Selvan', supervisorInCharge: 'Ananya Ravi', cameraAssigned: 'CAM-0591', sdCardAssigned: 'SD-9917', uploadDevice: 'PHN-0112' },
]

export type ActionItem = {
  id: string
  severity: 'Critical' | 'High' | 'Medium' | 'Low'
  type: string
  title: string
  siteId: string
  age: string
  owner: string
  state: 'Open' | 'Acknowledged' | 'Resolved'
  due: string
  detail: string
  next: string
}

export const initialActions: ActionItem[] = [
  { id: 'ACT-1092', severity: 'Critical', type: 'Upload failure', title: '12 SD cards pending over 24 hours', siteId: 'HL-UP-118', age: '31h', owner: 'Rohit Kumar', state: 'Open', due: 'Today, 12:00', detail: 'The site phone last synced yesterday at 02:14 IST. 96.4 GB remains queued across 12 cards.', next: 'Connect the upload station to stable broadband, retry batches UP-811–822, then escalate if no progress in 30 minutes.' },
  { id: 'ACT-1086', severity: 'High', type: 'Staffing gap', title: 'Shift B is short by 1 operator', siteId: 'HL-GJ-207', age: '4h', owner: 'Vikram Solanki', state: 'Open', due: 'Today, 14:00', detail: '48 assigned cameras require 3 operators. Only 2 are available; one is marked absent.', next: 'Reassign a trained operator or reduce the active camera plan to 40.' },
  { id: 'ACT-1077', severity: 'High', type: 'Quality correction', title: 'Recollect 8.6h of welding task footage', siteId: 'HL-GJ-207', age: '19h', owner: 'Irfan Sheikh', state: 'Acknowledged', due: 'Tomorrow, 10:00', detail: 'Repeated camera occlusion affects 14 samples. Humyn Labs requested remounting and recollection.', next: 'Complete retraining, attach two calibration samples and submit for recheck.' },
  { id: 'ACT-1069', severity: 'Medium', type: 'Readiness', title: 'Facility agreement is missing', siteId: 'HL-KA-141', age: '2d', owner: 'Saira Khan', state: 'Open', due: '5 Sep', detail: 'All other go-live items are complete. The planned start is blocked until the signed agreement is approved.', next: 'Upload the signed facility agreement and verify the signatory details.' },
  { id: 'ACT-1054', severity: 'Medium', type: 'Hardware', title: 'Camera CAM-0387 return is overdue', siteId: 'HL-MH-104', age: '3d', owner: 'Meera Joshi', state: 'Open', due: 'Overdue', detail: 'The camera was issued to Nikhil Patil for inspection and has not been checked back in.', next: 'Confirm holder and condition, then record recovery or create an incident.' },
  { id: 'ACT-1042', severity: 'Low', type: 'Payment query', title: 'Invoice INV-2026-081 awaiting clarification', siteId: 'HL-TN-089', age: '1d', owner: 'Partner finance', state: 'Acknowledged', due: '7 Sep', detail: 'The invoice amount differs from the approved payable estimate by ₹18,420.', next: 'Review adjustment ADJ-440 and respond with a corrected invoice or dispute note.' },
]

export const production = [
  { id: 'REC-88210', date: '03 Sep 2026', shift: 'A', siteId: 'HL-MH-104', task: 'CNC loading', worker: 'Worker 184', operator: 'Nikhil Patil', camera: 'CAM-0421', raw: 7.8, uploaded: 7.6, accepted: 7.1, status: 'Accepted' },
  { id: 'REC-88211', date: '03 Sep 2026', shift: 'A', siteId: 'HL-MH-104', task: 'Torque assembly', worker: 'Worker 201', operator: 'Nikhil Patil', camera: 'CAM-0418', raw: 7.5, uploaded: 7.4, accepted: 6.8, status: 'Accepted' },
  { id: 'REC-88216', date: '03 Sep 2026', shift: 'B', siteId: 'HL-GJ-207', task: 'MIG welding', worker: 'Worker 067', operator: 'Irfan Sheikh', camera: 'CAM-0312', raw: 6.9, uploaded: 5.1, accepted: 3.8, status: 'Rejected' },
  { id: 'REC-88217', date: '03 Sep 2026', shift: 'B', siteId: 'HL-GJ-207', task: 'Deburring', worker: 'Worker 073', operator: 'Irfan Sheikh', camera: 'CAM-0308', raw: 6.4, uploaded: 4.8, accepted: 3.9, status: 'Partial' },
  { id: 'REC-88220', date: '03 Sep 2026', shift: 'A', siteId: 'HL-TN-089', task: 'Loom threading', worker: 'Worker 440', operator: 'Karthik Selvan', camera: 'CAM-0576', raw: 7.9, uploaded: 7.9, accepted: 7.6, status: 'Accepted' },
  { id: 'REC-88221', date: '03 Sep 2026', shift: 'B', siteId: 'HL-TN-089', task: 'Fabric inspection', worker: 'Worker 511', operator: 'Karthik Selvan', camera: 'CAM-0584', raw: 7.7, uploaded: 7.6, accepted: 7.3, status: 'Accepted' },
  { id: 'REC-88092', date: '02 Sep 2026', shift: 'A', siteId: 'HL-MH-104', task: 'CNC loading', worker: 'Worker 192', operator: 'Pooja More', camera: 'CAM-0427', raw: 7.6, uploaded: 7.4, accepted: 6.9, status: 'Accepted' },
  { id: 'REC-88099', date: '02 Sep 2026', shift: 'A', siteId: 'HL-GJ-207', task: 'MIG welding', worker: 'Worker 080', operator: 'Irfan Sheikh', camera: 'CAM-0316', raw: 7.1, uploaded: 6.3, accepted: 4.6, status: 'Rejected' },
  { id: 'REC-88112', date: '02 Sep 2026', shift: 'C', siteId: 'HL-TN-089', task: 'Power loom', worker: 'Devika S.', operator: 'Karthik Selvan', camera: 'CAM-0591', raw: 7.8, uploaded: 7.7, accepted: 7.5, status: 'Accepted' },
]

export type QualityIssue = {
  id: string
  siteId: string
  sample: string
  reason: string
  severity: 'Critical' | 'High' | 'Medium'
  hours: number
  owner: string
  due: string
  state: 'New' | 'Acknowledged' | 'Retraining' | 'Recollecting' | 'HL recheck' | 'Closed'
  note: string
  evidence: string
}

export const qualityIssues: QualityIssue[] = [
  { id: 'QI-492', siteId: 'HL-GJ-207', sample: 'SMP-28771', reason: 'Camera occlusion', severity: 'High', hours: 8.6, owner: 'Irfan Sheikh', due: '04 Sep', state: 'Recollecting', note: 'Worker forearm is obscured during the weld setup sequence.', evidence: '2 calibration clips required' },
  { id: 'QI-488', siteId: 'HL-MH-104', sample: 'SMP-28609', reason: 'Incorrect field of view', severity: 'Medium', hours: 2.3, owner: 'Pooja More', due: '03 Sep', state: 'HL recheck', note: 'Mount angle corrected. Replacement sample submitted 18:42 IST.', evidence: 'Calibration clip attached' },
  { id: 'QI-481', siteId: 'HL-UP-118', sample: 'SMP-28211', reason: 'Missing task segment', severity: 'High', hours: 6.1, owner: 'Rohit Kumar', due: 'Overdue', state: 'Acknowledged', note: 'Packing task ends before pallet label verification.', evidence: 'Retraining not recorded' },
  { id: 'QI-474', siteId: 'HL-TN-089', sample: 'SMP-28098', reason: 'Low illumination', severity: 'Medium', hours: 1.4, owner: 'Karthik Selvan', due: '05 Sep', state: 'New', note: 'Night shift sample is below the illumination threshold.', evidence: 'Example frame available' },
]

export type Asset = {
  id: string
  qr: string
  serial: string
  type: 'Camera' | 'SD card' | 'Phone' | 'Accessory kit'
  siteId: string
  holder: string
  status: 'In use' | 'Available' | 'In transit' | 'Overdue' | 'Damaged' | 'Missing'
  received: string
  daysHeld: number
  lastMove: string
  expectedReturn: string
  paired?: string
  exposure: number
}

export const assets: Asset[] = [
  { id: 'CAM-0421', qr: 'QR-C421', serial: 'HLC8-44P2', type: 'Camera', siteId: 'HL-MH-104', holder: 'Nikhil Patil', status: 'In use', received: '12 Aug, 11:22', daysHeld: 22, lastMove: 'Mounted · 06:04', expectedReturn: '18 Sep', paired: 'SD-9281', exposure: 68000 },
  { id: 'CAM-0387', qr: 'QR-C387', serial: 'HLC8-39K7', type: 'Camera', siteId: 'HL-MH-104', holder: 'Nikhil Patil', status: 'Overdue', received: '03 Aug, 15:10', daysHeld: 31, lastMove: 'Issued for inspection · 29 Aug', expectedReturn: '31 Aug', paired: '—', exposure: 68000 },
  { id: 'CAM-0312', qr: 'QR-C312', serial: 'HLC7-31J5', type: 'Camera', siteId: 'HL-GJ-207', holder: 'Irfan Sheikh', status: 'In use', received: '19 Aug, 09:42', daysHeld: 15, lastMove: 'Unmounted · 13:58', expectedReturn: '24 Sep', paired: 'SD-8812', exposure: 68000 },
  { id: 'CAM-0316', qr: 'QR-C316', serial: 'HLC7-32B1', type: 'Camera', siteId: 'HL-GJ-207', holder: 'Vikram Solanki', status: 'Damaged', received: '19 Aug, 09:42', daysHeld: 15, lastMove: 'Incident raised · 02 Sep', expectedReturn: '05 Sep', paired: '—', exposure: 68000 },
  { id: 'CAM-0576', qr: 'QR-C576', serial: 'HLC9-58A4', type: 'Camera', siteId: 'HL-TN-089', holder: 'Karthik Selvan', status: 'In use', received: '09 Aug, 17:30', daysHeld: 25, lastMove: 'Mounted · 05:54', expectedReturn: '30 Sep', paired: 'SD-9917', exposure: 68000 },
  { id: 'SD-9281', qr: 'QR-S9281', serial: 'SDX-9281', type: 'SD card', siteId: 'HL-MH-104', holder: 'Nikhil Patil', status: 'In use', received: '12 Aug, 11:22', daysHeld: 22, lastMove: 'Paired with CAM-0421', expectedReturn: '18 Sep', paired: 'CAM-0421', exposure: 6200 },
  { id: 'SD-8812', qr: 'QR-S8812', serial: 'SDX-8812', type: 'SD card', siteId: 'HL-GJ-207', holder: 'Irfan Sheikh', status: 'In use', received: '19 Aug, 09:42', daysHeld: 15, lastMove: 'Paired with CAM-0312', expectedReturn: '24 Sep', paired: 'CAM-0312', exposure: 6200 },
  { id: 'PHN-0094', qr: 'QR-P094', serial: 'PX6A-0094', type: 'Phone', siteId: 'HL-UP-118', holder: 'Rohit Kumar', status: 'Available', received: '18 Jul, 12:11', daysHeld: 47, lastMove: 'Last sync · 02 Sep', expectedReturn: '10 Sep', exposure: 24000 },
  { id: 'KIT-0160', qr: 'QR-K160', serial: 'KIT-160', type: 'Accessory kit', siteId: 'HL-KA-141', holder: 'Saira Khan', status: 'In transit', received: '—', daysHeld: 0, lastMove: 'Dispatched · 02 Sep', expectedReturn: '15 Oct', exposure: 18500 },
]

export const uploads = [
  { id: 'UP-822', siteId: 'HL-UP-118', device: 'SD-7402', lastSync: '02 Sep, 02:14', age: 31.5, size: '12.8 GB', reason: 'Connection interrupted', retries: 3, eta: 'Blocked', status: 'Failed' },
  { id: 'UP-821', siteId: 'HL-UP-118', device: 'SD-7398', lastSync: '02 Sep, 02:14', age: 31.5, size: '10.1 GB', reason: 'Phone storage full', retries: 2, eta: 'Blocked', status: 'Failed' },
  { id: 'UP-790', siteId: 'HL-GJ-207', device: 'SD-8812', lastSync: '03 Sep, 13:31', age: 2.1, size: '7.6 GB', reason: 'Low bandwidth', retries: 1, eta: '18:10', status: 'Pending' },
  { id: 'UP-788', siteId: 'HL-MH-104', device: 'SD-9281', lastSync: '03 Sep, 14:52', age: 0.8, size: '3.2 GB', reason: '—', retries: 0, eta: '16:20', status: 'Uploading' },
  { id: 'UP-773', siteId: 'HL-TN-089', device: 'SD-9917', lastSync: '03 Sep, 15:01', age: 0.2, size: '8.4 GB', reason: '—', retries: 0, eta: 'Completed', status: 'Completed' },
]

export const invoices = [
  { id: 'INV-2026-081', period: 'Aug 2026', siteId: 'HL-TN-089', accepted: 402, rate: 425, gross: 170850, adjustments: -18420, amount: 152430, status: 'Under review', expected: '12 Sep 2026', paid: '—' },
  { id: 'INV-2026-078', period: 'Aug 2026', siteId: 'HL-MH-104', accepted: 318, rate: 425, gross: 135150, adjustments: -6800, amount: 128350, status: 'Scheduled', expected: '08 Sep 2026', paid: '—' },
  { id: 'INV-2026-071', period: 'Jul 2026', siteId: 'HL-GJ-207', accepted: 186, rate: 410, gross: 76260, adjustments: -4300, amount: 71960, status: 'Paid', expected: '18 Aug 2026', paid: '17 Aug 2026' },
  { id: 'INV-2026-069', period: 'Jul 2026', siteId: 'HL-UP-118', accepted: 88, rate: 400, gross: 35200, adjustments: -9200, amount: 26000, status: 'Disputed', expected: '21 Aug 2026', paid: '—' },
]

export const trendData = [
  { day: '28 Aug', recorded: 136, uploaded: 126, accepted: 109 },
  { day: '29 Aug', recorded: 149, uploaded: 139, accepted: 121 },
  { day: '30 Aug', recorded: 142, uploaded: 134, accepted: 118 },
  { day: '31 Aug', recorded: 158, uploaded: 151, accepted: 133 },
  { day: '01 Sep', recorded: 162, uploaded: 154, accepted: 139 },
  { day: '02 Sep', recorded: 171, uploaded: 161, accepted: 144 },
  { day: '03 Sep', recorded: 168, uploaded: 151, accepted: 132 },
]

export const qualityMix = [
  { name: 'Occlusion', value: 38, color: '#BA3B44' },
  { name: 'Field of view', value: 25, color: '#C8872D' },
  { name: 'Task incomplete', value: 21, color: '#5E7B92' },
  { name: 'Lighting', value: 16, color: '#7FAE87' },
]

export const milestones = [
  { date: '04 Sep', label: 'Shakti quality recheck', siteId: 'HL-GJ-207', type: 'Quality', owner: 'Irfan Sheikh' },
  { date: '05 Sep', label: 'Nandi planned go-live', siteId: 'HL-KA-141', type: 'Go-live', owner: 'Saira Khan' },
  { date: '08 Sep', label: 'Pragati payment release', siteId: 'HL-MH-104', type: 'Payment', owner: 'Partner finance' },
  { date: '10 Sep', label: 'Ganga hardware pickup', siteId: 'HL-UP-118', type: 'Pickup', owner: 'Rohit Kumar' },
]

export const docs = [
  { title: 'Collection operations SOP', version: 'v4.8', date: '28 Aug 2026', owner: 'Humyn Labs Ops', language: 'English · हिन्दी', page: 'Live Operations', note: 'Clarified zero-output escalation.' },
  { title: 'Camera mounting quality guide', version: 'v3.2', date: '18 Aug 2026', owner: 'Data Quality', language: 'English · हिन्दी · தமிழ்', page: 'Quality', note: 'New occlusion examples.' },
  { title: 'Site Identification guidance', version: 'v2.5', date: '07 Aug 2026', owner: 'Partner Success', language: 'English', page: 'Sites', note: 'Updated evidence checklist.' },
  { title: 'Hardware custody & returns', version: 'v3.0', date: '01 Aug 2026', owner: 'Logistics', language: 'English · हिन्दी', page: 'Hardware', note: 'Added partial-return process.' },
]

export const siteName = (id: string) => sites.find((site) => site.id === id)?.name ?? id
