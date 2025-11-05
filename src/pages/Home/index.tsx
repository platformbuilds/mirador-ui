import { useKpiDefs } from "../../state/kpi-store";
import { KpiGrid } from "../../components/KpiGrid";

export default function Home() {
  const defs = useKpiDefs();
  return (
    <div className="p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-white dark:text-white text-light-text-primary">Dashboard</h1>
          <p className="text-gray-400 dark:text-gray-400 text-light-text-secondary text-sm font-body">Monitor your key performance indicators</p>
        </div>
        <a 
          href="#/kpi-builder" 
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-impact-primary text-white hover:bg-impact-primary/90 transition-colors font-body text-sm shadow-lg"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
          </svg>
          New KPI
        </a>
      </div>
      
      {/* Content */}
      {defs.length ? (
        <KpiGrid defs={defs} />
      ) : (
        <div className="text-center py-16">
          <div className="opacity-70 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-500 dark:text-gray-500 text-light-text-secondary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
            <p className="text-lg mb-2 text-white dark:text-white text-light-text-primary">No KPIs yet</p>
            <p className="text-gray-400 dark:text-gray-400 text-light-text-secondary font-body">Create your first KPI to get started monitoring your metrics</p>
          </div>
          <a 
            href="#/kpi-builder" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-impact-primary text-white hover:bg-impact-primary/90 transition-colors font-body text-sm"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
            </svg>
            Create First KPI
          </a>
        </div>
      )}
    </div>
  );
}
