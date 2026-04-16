export const DRAWER_COUNT = 21;

/** Custom names for specific drawers. Drawers without a label show "Drawer N". */
const DRAWER_LABELS: Record<number, string> = {
  21: "Plaques",
};

/** Human-readable drawer name, e.g. "Drawer 3" or "Plaques". */
export function drawerName(n: number): string {
  return DRAWER_LABELS[n] ?? `Drawer ${n}`;
}

export function drawerBarcodeValue(n: number): string {
  return `DRAWER-${String(n).padStart(2, "0")}`;
}

export function parseDrawerBarcode(value: string): number | null {
  const match = value.trim().toUpperCase().match(/^DRAWER-(\d{1,3})$/);
  if (!match) return null;
  const n = parseInt(match[1], 10);
  if (Number.isNaN(n) || n < 1 || n > DRAWER_COUNT) return null;
  return n;
}
