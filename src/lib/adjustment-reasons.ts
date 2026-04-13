export const ADJUSTMENT_REASONS = [
  "Received shipment",
  "Sold",
  "Customer return",
  "Damaged",
  "Lost / missing",
  "Returned to supplier",
  "Inventory true-up",
  "Sample / giveaway",
  "Internal use",
  "Transferred",
  "Other",
] as const;

export type AdjustmentReason = (typeof ADJUSTMENT_REASONS)[number];

export const OTHER_REASON = "Other";
