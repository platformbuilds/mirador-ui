import type { KpiDef } from "../../lib/kpi-types";
import { KpiCard } from "../KpiCard";
import { useBatchKpiValues } from "../../hooks/useBatchKpiValues";

export function KpiGrid({ defs }: { defs: KpiDef[] }) {
  const values = useBatchKpiValues(defs);
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {defs.map((d) => (
        <KpiCard key={d.id} def={d} valueOverride={values[d.id]?.value}/>
      ))}
    </div>
  );
}
