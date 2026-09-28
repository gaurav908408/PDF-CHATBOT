export function normalizeNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

export function safeToFixed(value: unknown, digits = 2, fallback = "N/A"): string {
  const num = normalizeNumber(value, NaN);
  if (Number.isNaN(num)) {
    return fallback;
  }
  return num.toFixed(digits);
}
