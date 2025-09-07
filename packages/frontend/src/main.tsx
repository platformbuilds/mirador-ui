import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes, useNavigate } from 'react-router-dom';
import type { Dashboard, PrometheusVectorResult } from '@mirador/shared';
import './styles.css';

const qc = new QueryClient();

function Home() {
  return (
    <div className="container">
      <h1>Mirador UI</h1>
      <ul>
        <li><Link to="/health">Health</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/dashboards">Dashboards</Link></li>
        <li><Link to="/metrics">Metrics Demo</Link></li>
      </ul>
    </div>
  );
}

function Health() {
  const [data, setData] = React.useState<any>(null);
  const [error, setError] = React.useState<any>(null);
  React.useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then(setData)
      .catch(setError);
  }, []);
  return (
    <div className="container">
      <h2>Backend Health</h2>
      <pre>{error ? String(error) : JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

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

function Login() {
  const nav = useNavigate();
  const [email, setEmail] = React.useState('admin@example.com');
  const [password, setPassword] = React.useState('password');
  const [err, setErr] = React.useState<string | null>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (res.ok) {
      const { token } = await res.json();
      localStorage.setItem('token', token);
      nav('/dashboards');
    } else {
      setErr('Invalid credentials');
    }
  }
  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={submit} className="space-y-2">
        <div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
        </div>
        <div>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
        </div>
        <button type="submit">Login</button>
      </form>
      {err && <p>{err}</p>}
    </div>
  );
}

function Dashboards() {
  const [items, setItems] = React.useState<Dashboard[]>([]);
  const [error, setError] = React.useState<any>(null);
  React.useEffect(() => {
    api('/dashboards')
      .then((r) => r.json())
      .then(setItems)
      .catch(setError);
  }, []);
  return (
    <div className="container">
      <h2>Dashboards</h2>
      {error && <pre>{String(error)}</pre>}
      <ul>
        {items.map((d) => (
          <li key={d.id}>{d.name}</li>
        ))}
      </ul>
    </div>
  );
}

function MetricsDemo() {
  const [data, setData] = React.useState<PrometheusVectorResult | null>(null);
  const [error, setError] = React.useState<any>(null);
  React.useEffect(() => {
    const now = Math.floor(Date.now() / 1000);
    fetch(`/api/mirador/query?query=${encodeURIComponent('up')}`)
      .then((r) => r.json())
      .then(setData)
      .catch(setError);
  }, []);
  return (
    <div className="container">
      <h2>Metrics Demo (query: up)</h2>
      {error && <pre>{String(error)}</pre>}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/health" element={<Health />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboards" element={<Dashboards />} />
          <Route path="/metrics" element={<MetricsDemo />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
