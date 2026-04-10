"use client";

import { useState } from "react";
import type { Product, InventoryLogWithProduct } from "@/lib/types";
import { computeSummary, computeCategoryBreakdown } from "@/lib/report-queries";
import InventorySummary from "./reports/InventorySummary";
import StockMovementLog from "./reports/StockMovementLog";
import CategoryBreakdown from "./reports/CategoryBreakdown";

type Tab = "summary" | "movement" | "categories";

export default function ReportsTabs({
  products,
  inventoryLogs,
}: {
  products: Product[];
  inventoryLogs: InventoryLogWithProduct[];
}) {
  const [tab, setTab] = useState<Tab>("summary");
  const summary = computeSummary(products);
  const categoryData = computeCategoryBreakdown(products);

  const tabs: { id: Tab; label: string }[] = [
    { id: "summary", label: "Summary" },
    { id: "movement", label: "Stock Movement" },
    { id: "categories", label: "Categories" },
  ];

  return (
    <div>
      <div className="flex mb-6">
        <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm ${
                tab === t.id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "summary" && (
        <InventorySummary products={products} summary={summary} />
      )}
      {tab === "movement" && <StockMovementLog logs={inventoryLogs} />}
      {tab === "categories" && <CategoryBreakdown data={categoryData} />}
    </div>
  );
}
