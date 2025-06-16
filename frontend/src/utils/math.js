// Utility math functions
export function normalizeActivations(values) {
  const max = Math.max(...values);
  return values.map(v => v / max);
}