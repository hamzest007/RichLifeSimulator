export const formatCurrency = (value: number) => {
  if (!Number.isFinite(value)) return '$0';
  const safe = Math.round(value);
  if (safe >= 1_000_000_000) return `$${(safe / 1_000_000_000).toFixed(2)}B`;
  if (safe >= 1_000_000) return `$${(safe / 1_000_000).toFixed(2)}M`;
  if (safe >= 1000)
    return `$${(safe / 1000).toFixed(safe >= 100_000 ? 0 : 1)}K`;
  return `$${safe.toLocaleString()}`;
};
