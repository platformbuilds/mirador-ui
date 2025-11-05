import { useEffect, useState } from "react";
import type { KpiDef } from "../lib/kpi-types";
import { batchResolveKpis } from "../lib/kpi-remote";

export function useBatchKpiValues(defs: KpiDef[]) {
  const [values, setValues] = useState<Record<string, { value: number; spark?: [number,number][] }>>({});
  useEffect(() => {
    let alive = true;
    if (!defs.length) { setValues({}); return; }
    batchResolveKpis(defs).then((map) => { if (alive) setValues(map); });
    return () => { alive = false; };
  }, [JSON.stringify(defs.map(d => d.id))]); // change only when ids change
  return values;
}
