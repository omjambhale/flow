import { useApp } from '../App'
import { Link } from '../router'
import { Card, Chip, Empty, PageH, ScoreBars, toneOf } from '../components/ui'
import { fmtDate, fmtHours, fmtINR, statusLabel, titleOf } from '../derive'

export function RecordingPage({ id }: { id: string }) {
  const { data } = useApp()
  const r = data.recordings.find(x => x.id === id)
  if (!r) return <Empty title="Recording not found" />
  const t = titleOf(data, r)
  const op = data.people.find(p => p.id === r.operatorId)
  const cam = data.assets.find(a => a.id === r.cameraId)
  const inv = r.invoiceId ? data.invoices.find(i => i.id === r.invoiceId) : undefined
  const value = r.minutes / 60 * t.site.ratePerHour
  const label = statusLabel[r.status]
  return (
    <>
      <PageH title={t.label} sub={`${t.worker?.name ?? ''} · recorded by ${op?.name ?? ''} · ${fmtDate(r.date)} · ${fmtHours(r.minutes / 60)}`} right={<Chip tone={toneOf(label)}>{label}</Chip>} />
      <div className="grid2">
        <div>
          <div className="video">
            <div className="play"><svg width="26" height="26" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg></div>
            <div className="tag">{r.id} · {cam?.label ?? r.cameraId} {cam?.pairedWith ? `· ${cam.pairedWith}` : ''} · {r.minutes} min</div>
          </div>
          <div className="small muted" style={{ marginTop: 8 }}>Playback connects to the recording store in the live build.</div>
        </div>
        <div>
          {r.scores ? (
            <Card title={r.status === 'rejected' ? 'What Humyn found' : 'How Humyn rated it'}>
              <div style={{ padding: 18 }}><ScoreBars {...r.scores} /></div>
              {r.reason && (
                <div style={{ padding: '0 18px 18px' }}>
                  <div className="why">
                    <b>{r.reason}</b>
                    <details className="more">
                      <summary>Read why →</summary>
                      <p>{r.feedback}</p>
                      <p><b>Next time:</b> {r.fix}</p>
                    </details>
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card title={r.status === 'uploading' ? 'Still uploading' : 'Waiting for Humyn review'}>
              <div className="empty">{r.status === 'uploading' ? 'The SD card has not synced fully yet.' : 'Humyn reviews within two working days of upload.'}</div>
            </Card>
          )}
          {(
            <Card className="mt">
              <div className="row">
                <div className="main">
                  <div className="t">{r.status === 'rejected' ? `${fmtINR(value)} not paid` : r.status === 'paid' ? `${fmtINR(value)} paid` : r.status === 'accepted' ? `${fmtINR(value)} payable` : `Worth ${fmtINR(value)} if accepted`}</div>
                  <div className="s">{fmtHours(r.minutes / 60)} × {fmtINR(t.site.ratePerHour)} per hour{inv ? <> · <Link to={`/payments/${inv.id}`} style={{ color: 'var(--coral)', fontWeight: 600 }}>invoice {inv.number}</Link></> : ''}</div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
