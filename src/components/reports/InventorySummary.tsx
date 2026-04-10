"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Product } from "@/lib/types";

export default function InventorySummary({
  products,
  summary,
}: {
  products: Product[];
  summary: { totalProducts: number; totalUnits: number; totalValue: number };
}) {
  const [threshold, setThreshold] = useState(10);
  const lowStock = products
    .filter((p) => p.quantity <= threshold)
    .sort((a, b) => a.quantity - b.quantity);

  const topProducts = [...products]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10)
    .map((p) => ({ name: p.name.slice(0, 20), quantity: p.quantity }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Products" value={summary.totalProducts} />
        <StatCard label="Total Units" value={summary.totalUnits.toLocaleString()} />
        <StatCard
          label="Inventory Value"
          value={`$${summary.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
        <StatCard
          label="Low Stock Items"
          value={lowStock.length}
          alert={lowStock.length > 0}
        />
      </div>

      {topProducts.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Top 10 Products by Quantity
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts} layout="vertical" margin={{ left: 80 }}>
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="quantity" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">
            Low Stock Alerts ({lowStock.length})
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <label className="text-gray-500">Threshold:</label>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value, 10) || 0)}
              min="0"
              className="w-16 border border-gray-300 rounded px-2 py-1 text-center text-sm"
            />
          </div>
        </div>
        {lowStock.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">
            No products below threshold
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-sm font-medium text-gray-600">Name</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">SKU</th>
                <th className="text-right py-2 text-sm font-medium text-gray-600">Qty</th>
                <th className="text-right py-2 text-sm font-medium text-gray-600">Price</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((p) => (
                <tr key={p.id} className="border-b border-gray-100">
                  <td className="py-2 text-sm">{p.name}</td>
                  <td className="py-2 text-sm font-mono text-gray-500">{p.sku}</td>
                  <td className="py-2 text-sm text-right">
                    <span
                      className={`px-2 py-0.5 rounded ${p.quantity === 0 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
                    >
                      {p.quantity}
                    </span>
                  </td>
                  <td className="py-2 text-sm text-right">
                    ${Number(p.price).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  alert,
}: {
  label: string;
  value: string | number;
  alert?: boolean;
}) {
  return (
    <div
      className={`border rounded-lg p-4 ${alert ? "border-red-200 bg-red-50" : "border-gray-200"}`}
    >
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${alert ? "text-red-700" : "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}
