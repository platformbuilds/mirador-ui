import * as d3 from 'd3';
import React from 'react';

export function MiniLineChart({ query, height = 120, threshold }: { query: string; height?: number; threshold?: number }) {
  const ref = React.useRef<SVGSVGElement>(null);
  const [data, setData] = React.useState<Array<{ ts: number; v: number }>>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
      try {
        const now = Math.floor(Date.now() / 1000);
        const start = now - 15 * 60;
        const url = `/api/mirador/query_range?query=${encodeURIComponent(query)}&start=${start}&end=${now}&step=30s`;
        const res = await fetch(url);
        const json = await res.json();
        const result = json?.data?.result ?? [];
        const series = (result[0]?.values || []).map((d: any) => ({ ts: Number(d[0]) * 1000, v: Number(d[1]) }));
        if (!cancelled) setData(series);
      } catch (e: any) {
        if (!cancelled) setError(String(e));
      }
    }
    if (query) void load();
    return () => { cancelled = true; };
  }, [query]);

  React.useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();
    const width = 300;
    const h = height;
    const margin = { top: 10, right: 10, bottom: 18, left: 30 };
    const innerW = width - margin.left - margin.right;
    const innerH = h - margin.top - margin.bottom;
    const g = svg.attr('viewBox', `0 0 ${width} ${h}`).append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime().domain(d3.extent(data, (d) => d.ts) as [Date, Date]).range([0, innerW]);
    const y = d3.scaleLinear().domain([0, d3.max(data, (d) => d.v) || 1]).nice().range([innerH, 0]);
    const line = d3.line<{ ts: number; v: number }>().x((d) => x(d.ts)).y((d) => y(d.v));
    g.append('path').datum(data).attr('fill', 'none').attr('stroke', '#0ea5e9').attr('stroke-width', 1.5).attr('d', line);
    if (typeof threshold === 'number') {
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerW)
        .attr('y1', y(threshold))
        .attr('y2', y(threshold))
        .attr('stroke', '#ef4444')
        .attr('stroke-dasharray', '4,4');
    }
    g.append('g').attr('transform', `translate(0,${innerH})`).call(d3.axisBottom(x).ticks(3));
    g.append('g').call(d3.axisLeft(y).ticks(3));
  }, [data, height]);

  if (!query) return <div className="text-xs text-neutral-500">No query</div>;
  if (error) return <div className="text-xs text-red-600">{error}</div>;
  return <svg ref={ref} />;
}
