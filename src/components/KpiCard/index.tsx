import { useEffect, useState } from "react";
import type { KpiDef } from "../../lib/kpi-types";
import { resolveKpi } from "../../lib/kpi-data";
import { statusForValue } from "../../lib/kpi-threshold";

function fmt(v: number, fmt?: string, unit?: string) {
  if (fmt === "pct") return `${v.toFixed(2)}%`;
  if (fmt === "currency") return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(v);
  if (fmt === "duration") return `${Math.round(v)} ms`;
  return new Intl.NumberFormat("en-IN").format(v) + (unit ? ` ${unit}` : "");
}

export function KpiCard({ def, valueOverride }: { def: KpiDef; valueOverride?: number }) {
  const [value, setValue] = useState<number | null>(valueOverride ?? null);
  const [status, setStatus] = useState<"ok" | "warn" | "crit">("ok");

  useEffect(() => {
    if (typeof valueOverride === "number") {
      setValue(valueOverride);
      setStatus(statusForValue(def, valueOverride));
      return;
    }
    let alive = true;
    resolveKpi(def).then((res) => {
      if (!alive) return;
      setValue(res.value);
      setStatus(statusForValue(def, res.value));
    });
    return () => { alive = false; };
  }, [JSON.stringify(def), valueOverride]);

  const color = status === "crit" ? "text-red-500" : status === "warn" ? "text-yellow-400" : "text-green-400";

  return (
    <div className="rounded-2xl p-4 bg-white dark:bg-gray-800 shadow space-y-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700">
      <div className="text-xs uppercase opacity-70 font-body tracking-wide text-gray-400 dark:text-gray-400 text-light-text-secondary">{def.kind}</div>
      <div className="text-sm font-medium text-white dark:text-white text-light-text-primary">{def.name}</div>
      <div className={`text-2xl font-bold ${color} font-sans`}>{value === null ? "…" : fmt(value, def.format, def.unit)}</div>
      {def.tags?.length ? <div className="text-[10px] opacity-60 font-body text-gray-400 dark:text-gray-400 text-light-text-secondary">{def.tags.join(" · ")}</div> : null}
    </div>
  );
}
