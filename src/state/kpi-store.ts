import { proxy, useSnapshot } from "valtio";
import type { KpiDef } from "../lib/kpi-types";
import { zKpiDef } from "../lib/kpi-schema";
import { fetchKpiDefsRemote, upsertKpiDefRemote, deleteKpiDefRemote } from "../lib/kpi-remote";

const LS_KEY = "mirador.kpi.defs";

function lsLoad(): KpiDef[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
}
function lsSave(defs: KpiDef[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(defs));
}

export const kpiState = proxy<{ defs: KpiDef[]; loadedRemote: boolean }>({
  defs: lsLoad(),
  loadedRemote: false
});

export function useKpiDefs() {
  return useSnapshot(kpiState).defs;
}

// Load from remote once (then cache to LS so refresh keeps them)
export async function ensureKpiDefsLoaded() {
  if (kpiState.loadedRemote) return;
  try {
    const remote = await fetchKpiDefsRemote();
    if (remote?.length) {
      kpiState.defs = remote;
      lsSave(kpiState.defs);
    }
    kpiState.loadedRemote = true;
  } catch {
    // stay on local storage if remote unavailable
    kpiState.loadedRemote = true;
  }
}

export async function addOrUpdateKpi(def: KpiDef) {
  const parsed = zKpiDef.parse(def);
  // optimistic local update
  const i = kpiState.defs.findIndex((d) => d.id === parsed.id);
  if (i >= 0) kpiState.defs[i] = parsed; else kpiState.defs.push(parsed);
  lsSave(kpiState.defs);
  // remote write (best-effort)
  try { await upsertKpiDefRemote(parsed); } catch {}
}

export async function removeKpi(id: string) {
  kpiState.defs = kpiState.defs.filter((d) => d.id !== id);
  lsSave(kpiState.defs);
  try { await deleteKpiDefRemote(id); } catch {}
}
