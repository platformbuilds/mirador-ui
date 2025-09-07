import React from 'react';
import { TimelineChart } from '../components/timeline/TimelineChart';

type Correlation = {
  orgId: string;
  window: { start: number; end: number; step: string };
  indicators: {
    infrastructure: { cpu: any; mem: any; disk: any };
    business: { success: any };
  };
  findings: Array<{ at: number; type: string; message: string }>;
};

function api(path: string, init?: RequestInit) {
  const token = localStorage.getItem('token');
  return fetch(`/api${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });
}

export default function TimelinePage() {
  const now = Math.floor(Date.now() / 1000);
  const [orgId, setOrgId] = React.useState('001');
  const [start, setStart] = React.useState(now - 15 * 60);
  const [end, setEnd] = React.useState(now);
  const [step, setStep] = React.useState('30s');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<Correlation | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api('/timeline/correlate', {
        method: 'POST',
        body: JSON.stringify({ orgId, start, end, step }),
      });
      if (!res.ok) throw new Error(await res.text());
      const json = (await res.json()) as Correlation;
      setData(json);
    } catch (e: any) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { void load(); }, []);

  const [newEvent, setNewEvent] = React.useState({ at: end, type: 'manual', message: '' });

  async function copyExport() {
    if (!data) return;
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  }

  return (
    <div className="container">
      <h1>Timeline Correlation</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void load();
        }}
        className="grid gap-2 grid-cols-1 sm:grid-cols-5 mb-4"
      >
        <label className="flex items-center gap-2">
          <span>Org</span>
          <input value={orgId} onChange={(e) => setOrgId(e.target.value)} />
        </label>
        <label className="flex items-center gap-2">
          <span>Start</span>
          <input type="number" value={start} onChange={(e) => setStart(Number(e.target.value))} />
        </label>
        <label className="flex items-center gap-2">
          <span>End</span>
          <input type="number" value={end} onChange={(e) => setEnd(Number(e.target.value))} />
        </label>
        <label className="flex items-center gap-2">
          <span>Step</span>
          <input value={step} onChange={(e) => setStep(e.target.value)} />
        </label>
        <button type="submit">Refresh</button>
      </form>

      {loading && <p>Loading…</p>}
      {error && <pre>{error}</pre>}
      {data && (
        <>
          <div className="mb-2 text-sm">
            <span className="mr-4">Severity: <strong>{data.severity || 'n/a'}</strong></span>
            <span>Confidence: <strong>{Math.round((data.confidence || 0) * 100)}%</strong></span>
            <button className="ml-4" onClick={(e) => { e.preventDefault(); void copyExport(); }}>Copy JSON</button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3">
              <TimelineChart
                data={data}
                width={960}
                height={480}
                onBrush={(s, e) => { setStart(s); setEnd(e); }}
                onEventChange={(idx, at) => {
                  const next = { ...data };
                  next.findings = data.findings.map((f, i) => (i === idx ? { ...f, at } : f));
                  setData(next);
                }}
              />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Error Patterns</h3>
              <pre className="text-xs max-h-48 overflow-auto">{JSON.stringify(data.errors?.patterns, null, 2)}</pre>
              <h3 className="font-semibold mt-4 mb-2">Traces Summary</h3>
              <pre className="text-xs">{JSON.stringify(data.tracesSummary, null, 2)}</pre>
              <h3 className="font-semibold mt-4 mb-2">Manual Correlation</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                setData({ ...data, findings: [...data.findings, newEvent] });
              }} className="space-y-2">
                <div>
                  <label className="block text-xs">Timestamp (sec)</label>
                  <input type="number" value={newEvent.at} onChange={(e) => setNewEvent({ ...newEvent, at: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-xs">Type</label>
                  <input value={newEvent.type} onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs">Message</label>
                  <input value={newEvent.message} onChange={(e) => setNewEvent({ ...newEvent, message: e.target.value })} />
                </div>
                <button type="submit">Add Event</button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
