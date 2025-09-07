import React from 'react';
import { TimelineChart } from '../timeline/TimelineChart';

export function TimelinePreview({ orgId, height = 240 }: { orgId?: string; height?: number }) {
  const [data, setData] = React.useState<any | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
      try {
        const now = Math.floor(Date.now() / 1000);
        const body = { orgId: orgId || '001', start: now - 15 * 60, end: now, step: '30s' };
        const res = await fetch('/api/timeline/correlate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setError(String(e));
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [orgId]);
  if (error) return <div className="text-xs text-red-600">{error}</div>;
  if (!data) return <div className="text-xs text-neutral-500">Loading…</div>;
  return <TimelineChart data={data} width={600} height={height} />;
}

