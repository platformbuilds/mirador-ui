import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import './styles.css';

const qc = new QueryClient();

function Home() {
  return (
    <div className="container">
      <h1>Mirador UI</h1>
      <ul>
        <li><Link to="/health">Health</Link></li>
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

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/health" element={<Health />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

