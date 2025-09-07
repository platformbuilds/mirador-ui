import React from 'react';

export function StatWidget({ query, threshold }: { query: string; threshold?: number }) {
  const [value, setValue] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
      try {
        const res = await fetch(`/api/mirador/query?query=${encodeURIComponent(query)}`);
        const json = await res.json();
        const val = Number(json?.data?.result?.[0]?.value?.[1] ?? NaN);
        if (!cancelled) setValue(Number.isFinite(val) ? val : null);
      } catch (e: any) {
        if (!cancelled) setError(String(e));
      }
    }
    if (query) void load();
    return () => { cancelled = true; };
  }, [query]);

  const breached = typeof threshold === 'number' && value !== null && value > threshold;
  return (
    <div className="flex items-baseline gap-2">
      <span className={`inline-block w-2 h-2 rounded-full ${breached ? 'bg-red-500' : 'bg-emerald-500'}`} />
      {error ? (
        <span className="text-xs text-red-600">{error}</span>
      ) : (
        <span className="text-3xl font-semibold">{value ?? '—'}</span>
      )}
      {typeof threshold === 'number' && (
        <span className="text-xs text-neutral-500">thr: {threshold}</span>
      )}
    </div>
  );
}

