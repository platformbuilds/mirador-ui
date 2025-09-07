import * as d3 from 'd3';
import React from 'react';

type Correlation = {
  window: { start: number; end: number; step: string };
  indicators: {
    infrastructure: { cpu: any; mem: any; disk: any };
    application?: { kafkaLag?: any; cassandraReadP95?: any; redisHitRate?: any };
    business: { success: any; processing?: any };
  };
  errors?: { patterns?: any };
  severity?: string;
  confidence?: number;
  findings: Array<{ at: number; type: string; message: string }>;
};

function seriesFromProm(resp: any): Array<{ ts: number; v: number }> {
  const res = resp?.data?.data?.result ?? resp?.data?.result ?? [];
  const first = res[0];
  const values = first?.values ?? first?.value ? [first.value] : [];
  return (values as any[]).map((d: any) => {
    const [ts, v] = d;
    return { ts: Number(ts) * 1000, v: Number(v) };
  });
}

export function TimelineChart({ data, width, height, onBrush, onEventChange }: {
  data: Correlation;
  width: number;
  height: number;
  onBrush?: (start: number, end: number) => void;
  onEventChange?: (index: number, atSec: number) => void;
}) {
  const ref = React.useRef<SVGSVGElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleTime()
      .domain([new Date(data.window.start * 1000), new Date(data.window.end * 1000)])
      .range([0, innerW]);

    const tracks = 6; // 3 infra + 3 app/business tracks
    const trackH = innerH / tracks;

    const cpu = seriesFromProm(data.indicators.infrastructure.cpu);
    const mem = seriesFromProm(data.indicators.infrastructure.mem);
    const disk = seriesFromProm(data.indicators.infrastructure.disk);
    const success = seriesFromProm(data.indicators.business.success);
    const kafkaLag = seriesFromProm(data.indicators.application?.kafkaLag);
    const cassandra = seriesFromProm(data.indicators.application?.cassandraReadP95);
    const redisHit = seriesFromProm(data.indicators.application?.redisHitRate);

    function drawTrack(y: number, series: Array<{ ts: number; v: number }>, color: string, label: string, yDomain?: [number, number]) {
      const yScale = d3
        .scaleLinear()
        .domain(yDomain ?? [0, d3.max(series, (d) => d.v) || 1])
        .nice()
        .range([y + trackH - 20, y + 10]);
      const line = d3
        .line<{ ts: number; v: number }>()
        .x((d) => x(d.ts))
        .y((d) => yScale(d.v));

      g.append('rect').attr('x', 0).attr('y', y).attr('width', innerW).attr('height', trackH).attr('fill', '#f8fafc');
      g.append('path').datum(series).attr('fill', 'none').attr('stroke', color).attr('stroke-width', 1.5).attr('d', line);
      g.append('text').attr('x', 0).attr('y', y + 12).attr('font-size', 10).text(label);

      // Hover interaction
      const hover = g.append('g');
      const focusLine = hover.append('line').attr('y1', y + 5).attr('y2', y + trackH - 5).attr('stroke', '#94a3b8').attr('visibility', 'hidden');
      const focusDot = hover.append('circle').attr('r', 3).attr('fill', color).attr('visibility', 'hidden');

      g.append('rect')
        .attr('x', 0)
        .attr('y', y)
        .attr('width', innerW)
        .attr('height', trackH)
        .attr('fill', 'transparent')
        .on('mousemove', (event) => {
          const [mx] = d3.pointer(event);
          const ts = x.invert(mx).getTime();
          const i = d3.bisector((d: any) => d.ts).center(series, ts);
          const d = series[Math.max(0, Math.min(series.length - 1, i))];
          focusLine.attr('x1', x(d.ts)).attr('x2', x(d.ts)).attr('visibility', 'visible');
          focusDot.attr('cx', x(d.ts)).attr('cy', yScale(d.v)).attr('visibility', 'visible');
          if (tooltipRef.current) {
            tooltipRef.current.style.display = 'block';
            tooltipRef.current.style.left = `${margin.left + x(d.ts) + 8}px`;
            tooltipRef.current.style.top = `${margin.top + yScale(d.v) - 28}px`;
            tooltipRef.current.textContent = `${label}: ${d.v.toFixed(2)}`;
          }
        })
        .on('mouseleave', () => {
          focusLine.attr('visibility', 'hidden');
          focusDot.attr('visibility', 'hidden');
          if (tooltipRef.current) tooltipRef.current.style.display = 'none';
        });
    }

    drawTrack(0, cpu, '#ef4444', 'CPU %', [0, 100]);
    drawTrack(trackH, mem, '#22c55e', 'Memory %', [0, 100]);
    drawTrack(trackH * 2, disk, '#0ea5e9', 'Disk IO %');
    drawTrack(trackH * 3, kafkaLag, '#f97316', 'Kafka Lag');
    drawTrack(trackH * 4, cassandra, '#10b981', 'Cassandra P95 (ms)');
    drawTrack(trackH * 5, success, '#a855f7', 'Success %', [0, 100]);

    // Findings as events overlay on bottom track
    const events = data.findings || [];
    const eventG = g.append('g');
    const drag = d3.drag<SVGCircleElement, any>()
      .on('drag', function (event, d) {
        const nx = Math.max(0, Math.min(innerW, event.x));
        const nts = Math.round(x.invert(nx).getTime() / 1000);
        d3.select(this).attr('cx', nx);
        onEventChange?.(events.indexOf(d), nts);
      });

    eventG
      .selectAll('circle.event')
      .data(events)
      .enter()
      .append('circle')
      .attr('class', 'event')
      .attr('cx', (d) => x(d.at * 1000))
      .attr('cy', innerH - trackH + 20)
      .attr('r', 5)
      .attr('fill', '#f59e0b')
      .call(drag as any)
      .append('title')
      .text((d) => `${d.type}: ${d.message}`);

    // Axes
    const xAxis = d3.axisBottom(x);
    g.append('g').attr('transform', `translate(0,${innerH})`).call(xAxis);

    // Zoom and Pan
    const zoomed = (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
      const zx = event.transform.rescaleX(x);
      g.selectAll('path').attr('transform', event.transform.toString());
      g.selectAll('g.x-axis').call(d3.axisBottom(zx) as any);
    };

    svg.call(
      d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([1, 10])
        .translateExtent([
          [0, 0],
          [width, height],
        ])
        .on('zoom', zoomed as any),
    );

    // Brush for time selection
    const brush = d3.brushX().extent([[0, 0], [innerW, innerH]]).on('end', (event) => {
      if (!event.selection) return;
      const [x0, x1] = event.selection as [number, number];
      const s = Math.round(x.invert(x0).getTime() / 1000);
      const e = Math.round(x.invert(x1).getTime() / 1000);
      onBrush?.(s, e);
    });
    g.append('g').attr('class', 'brush').call(brush as any);

    return () => {
      svg.on('.zoom', null);
    };
  }, [data, width, height, onBrush]);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={ref} width={width} height={height} />
      <div ref={tooltipRef} style={{ position: 'absolute', display: 'none', pointerEvents: 'none', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '2px 6px', borderRadius: 4, fontSize: 12 }} />
    </div>
  );
}
