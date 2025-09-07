import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MiniLineChart } from '../components/dashboard/MiniLineChart';
import { StatWidget } from '../components/dashboard/StatWidget';
import { TimelinePreview } from '../components/dashboard/TimelinePreview';
import { templates } from './templates';

type WidgetType = 'stat' | 'line' | 'timeline';
type Widget = {
  id: string;
  type: WidgetType;
  title: string;
  query?: string;
  threshold?: number;
  orgId?: string;
  x: number; y: number; w: number; h: number;
};

type DashboardConfig = { widgets: Widget[]; defaults?: { orgId?: string }; sharing?: { public?: boolean } };

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

function newWidget(type: WidgetType, x = 0, y = 0): Widget {
  return { id: Math.random().toString(36).slice(2), type, title: `${type} widget`, x, y, w: 3, h: 2 };
}

export default function BuilderPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [name, setName] = React.useState('Untitled');
  const [cfg, setCfg] = React.useState<DashboardConfig>({ widgets: [], defaults: { orgId: '001' }, sharing: { public: false } });
  const [sel, setSel] = React.useState<string | null>(null);
  const gridCols = 12;

  React.useEffect(() => {
    async function load() {
      if (!id) return;
      const res = await api(`/dashboards/${id}`);
      if (res.ok) {
        const d = await res.json();
        setName(d.name);
        setCfg(d.config || { widgets: [] });
      }
    }
    void load();
  }, [id]);

  async function save() {
    if (!id) return;
    const res = await api(`/dashboards/${id}`, { method: 'PUT', body: JSON.stringify({ name, config: cfg }) });
    if (!res.ok) alert('Failed to save');
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/x-widget') as WidgetType;
    if (!type) return;
    const rect = (e.target as HTMLDivElement).getBoundingClientRect();
    const gx = Math.floor(((e.clientX - rect.left) / rect.width) * gridCols);
    const gy = Math.floor(((e.clientY - rect.top) / rect.height) * 8);
    setCfg((c) => ({ widgets: [...c.widgets, newWidget(type, Math.max(0, gx - 1), Math.max(0, gy - 1))] }));
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function updateWidget(id: string, patch: Partial<Widget>) {
    setCfg((c) => ({ widgets: c.widgets.map((w) => (w.id === id ? { ...w, ...patch } : w)) }));
  }

  function removeWidget(id: string) {
    setCfg((c) => ({ widgets: c.widgets.filter((w) => w.id !== id) }));
    if (sel === id) setSel(null);
  }

  return (
    <div className="container">
      <div className="flex items-center justify-between mb-3">
        <h1>Dashboard Builder</h1>
        <div className="space-x-2">
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <input value={cfg.defaults?.orgId || ''} onChange={(e) => setCfg((c) => ({ ...c, defaults: { ...(c.defaults||{}), orgId: e.target.value } }))} placeholder="Org ID" />
          <label className="text-sm"><input type="checkbox" checked={!!cfg.sharing?.public} onChange={(e) => setCfg((c) => ({ ...c, sharing: { ...(c.sharing||{}), public: e.target.checked } }))} /> Public</label>
          <button onClick={() => void save()}>Save</button>
          <button onClick={() => nav('/dashboards')}>Back</button>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-2">
          <h3 className="font-semibold mb-2">Components</h3>
          <div className="mb-1 text-xs uppercase text-neutral-500">Business</div>
          {(['stat'] as WidgetType[]).map((t) => (
            <div key={t} draggable onDragStart={(e) => e.dataTransfer.setData('application/x-widget', t)} className="p-2 mb-2 border rounded cursor-move">{t}</div>
          ))}
          <div className="mb-1 mt-2 text-xs uppercase text-neutral-500">Technical</div>
          {(['line'] as WidgetType[]).map((t) => (
            <div key={t} draggable onDragStart={(e) => e.dataTransfer.setData('application/x-widget', t)} className="p-2 mb-2 border rounded cursor-move">{t}</div>
          ))}
          <div className="mb-1 mt-2 text-xs uppercase text-neutral-500">Timeline</div>
          {(['timeline'] as WidgetType[]).map((t) => (
            <div key={t} draggable onDragStart={(e) => e.dataTransfer.setData('application/x-widget', t)} className="p-2 mb-2 border rounded cursor-move">{t}</div>
          ))}
          <h3 className="font-semibold mt-4 mb-2">Import/Export</h3>
          <button
            onClick={async () => { await navigator.clipboard.writeText(JSON.stringify(cfg, null, 2)); }}
            className="mb-2"
          >Copy JSON</button>
          <button
            onClick={async () => {
              const text = prompt('Paste dashboard JSON');
              if (text) setCfg(JSON.parse(text));
            }}
          >Import JSON</button>
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Templates</h3>
            {templates.map((tpl) => (
              <button key={tpl.id} className="block mb-1" onClick={() => setCfg(tpl.config)}>Apply: {tpl.name}</button>
            ))}
          </div>
        </div>
        <div className="col-span-7">
          <div
            className="border rounded h-[600px] grid"
            style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            {cfg.widgets.map((w) => (
              <div
                key={w.id}
                onClick={() => setSel(w.id)}
                className={`border rounded m-1 p-2 bg-white/50 ${sel === w.id ? 'ring-2 ring-blue-500' : ''}`}
                style={{ gridColumn: `${w.x + 1} / span ${w.w}`, gridRow: `${w.y + 1} / span ${w.h}` }}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('application/x-move', w.id)}
                onDragEnd={(e) => {
                  const parent = (e.currentTarget.parentElement as HTMLDivElement).getBoundingClientRect();
                  const gx = Math.floor(((e.clientX - parent.left) / parent.width) * gridCols);
                  const gy = Math.floor(((e.clientY - parent.top) / parent.height) * 8);
                  updateWidget(w.id, { x: Math.max(0, gx - Math.ceil(w.w / 2)), y: Math.max(0, gy - Math.ceil(w.h / 2)) });
                }}
              >
                <div className="flex items-center justify-between">
                  <strong>{w.title}</strong>
                  <button onClick={() => removeWidget(w.id)}>✕</button>
                </div>
                {w.type === 'line' && <MiniLineChart query={w.query || ''} threshold={w.threshold} />}
                {w.type === 'timeline' && <TimelinePreview orgId={w.orgId || cfg.defaults?.orgId} />}
                {w.type === 'stat' && <StatWidget query={w.query || ''} threshold={w.threshold} />}
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-3">
          <h3 className="font-semibold mb-2">Properties</h3>
          {sel ? (
            (() => {
              const w = cfg.widgets.find((x) => x.id === sel)!;
              return (
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs">Title</label>
                    <input value={w.title} onChange={(e) => updateWidget(w.id, { title: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs">Type</label>
                    <select value={w.type} onChange={(e) => updateWidget(w.id, { type: e.target.value as WidgetType })}>
                      <option value="stat">stat</option>
                      <option value="line">line</option>
                      <option value="timeline">timeline</option>
                    </select>
                  </div>
                  {w.type !== 'timeline' && (
                    <div>
                      <label className="block text-xs">Query</label>
                      <input value={w.query || ''} onChange={(e) => updateWidget(w.id, { query: e.target.value })} placeholder="PromQL or LogsQL" />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs">Org ID (override)</label>
                    <input value={w.orgId || ''} onChange={(e) => updateWidget(w.id, { orgId: e.target.value })} placeholder="Defaults to dashboard org" />
                  </div>
                  <div>
                    <label className="block text-xs">Alert Threshold</label>
                    <input type="number" value={w.threshold ?? ''} onChange={(e) => updateWidget(w.id, { threshold: e.target.value ? Number(e.target.value) : undefined })} />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-xs">X</label>
                      <input type="number" value={w.x} onChange={(e) => updateWidget(w.id, { x: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="block text-xs">Y</label>
                      <input type="number" value={w.y} onChange={(e) => updateWidget(w.id, { y: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="block text-xs">W</label>
                      <input type="number" value={w.w} onChange={(e) => updateWidget(w.id, { w: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="block text-xs">H</label>
                      <input type="number" value={w.h} onChange={(e) => updateWidget(w.id, { h: Number(e.target.value) })} />
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="text-neutral-500 text-sm space-y-2">
              <div>Select a widget to edit its properties.</div>
              <div className="mt-4">
                <h4 className="font-semibold text-sm">Guided Workflow</h4>
                <ol className="list-decimal text-sm ml-4">
                  <li>Add a widget from the left.</li>
                  <li>Set a query and threshold (optional).</li>
                  <li>Adjust layout (drag to move).</li>
                  <li>Save your dashboard.</li>
                </ol>
              </div>
              <div className="mt-4">
                <label className="block text-xs">Raw Config (advanced)</label>
                <textarea className="w-full h-40" value={JSON.stringify(cfg, null, 2)} onChange={(e) => {
                  try { setCfg(JSON.parse(e.target.value)); } catch { /* ignore */ }
                }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
