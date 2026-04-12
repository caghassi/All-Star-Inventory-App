export const DRAWER_COUNT = 20;

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
