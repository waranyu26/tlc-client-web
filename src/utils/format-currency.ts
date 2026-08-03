// ----------------------------------------------------------------------
// Money is int64 satang (1 THB = 100 satang). Never use floats for currency math.
// ----------------------------------------------------------------------

/** Format satang as Thai Baht, e.g. 1248000 -> "฿12,480". Whole baht only by default. */
export function formatThb(satang: number, opts?: { decimals?: boolean }): string {
  const baht = satang / 100;
  const formatted = baht.toLocaleString('en-US', {
    minimumFractionDigits: opts?.decimals ? 2 : 0,
    maximumFractionDigits: opts?.decimals ? 2 : 0,
  });
  return `฿${formatted}`;
}

/** Signed variant for ledger entries, e.g. +฿180 / -฿300. */
export function formatThbSigned(satang: number, opts?: { decimals?: boolean }): string {
  const sign = satang > 0 ? '+' : satang < 0 ? '-' : '';
  return `${sign}${formatThb(Math.abs(satang), opts)}`;
}
