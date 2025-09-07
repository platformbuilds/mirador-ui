type State = {
  failures: number;
  openedAt?: number;
};

const states = new Map<string, State>();

export async function withCircuitBreaker<T>(
  key: string,
  fn: () => Promise<T>,
  opts: { failureThreshold?: number; openMs?: number } = {},
): Promise<T> {
  const failureThreshold = opts.failureThreshold ?? 5;
  const openMs = opts.openMs ?? 30_000;
  const now = Date.now();
  const st = states.get(key) ?? { failures: 0 };

  if (st.openedAt && now - st.openedAt < openMs) {
    throw Object.assign(new Error('CircuitOpen'), { status: 503 });
  }

  try {
    const res = await fn();
    // success resets
    states.set(key, { failures: 0, openedAt: undefined });
    return res;
  } catch (e) {
    st.failures += 1;
    if (st.failures >= failureThreshold) st.openedAt = now;
    states.set(key, st);
    throw e;
  }
}

