"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { InventoryLogWithProduct } from "@/lib/types";

export default function StockMovementLog({
  logs,
}: {
  logs: InventoryLogWithProduct[];
}) {
  const [filterDays, setFilterDays] = useState(30);

  const filteredLogs = useMemo(() => {
    const since = new Date();
    since.setDate(since.getDate() - filterDays);
    return logs.filter((l) => new Date(l.created_at) >= since);
  }, [logs, filterDays]);

  const dailyData = useMemo(() => {
    const map = new Map<string, number>();
    for (const log of filteredLogs) {
      const day = new Date(log.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      map.set(day, (map.get(day) ?? 0) + log.change_amount);
    }
    return Array.from(map.entries()).map(([date, net]) => ({ date, net }));
  }, [filteredLogs]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Show last:</span>
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setFilterDays(d)}
            className={`px-3 py-1 text-sm rounded-lg ${
              filterDays === d
                ? "bg-blue-600 text-white"
                : "border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {d} days
          </button>
        ))}
      </div>

      {dailyData.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Daily Net Stock Changes
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="net"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                Date
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                Product
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">
                Change
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">
                Prev
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">
                New
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                Reason
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">
                  No stock movements in this period
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span className="font-medium">{log.product_name}</span>
                    <span className="text-gray-400 font-mono text-xs ml-2">
                      {log.product_sku}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-right">
                    <span
                      className={`font-medium ${log.change_amount > 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {log.change_amount > 0
                        ? `+${log.change_amount}`
                        : log.change_amount}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-right text-gray-500">
                    {log.previous_qty}
                  </td>
                  <td className="px-4 py-2 text-sm text-right">
                    {log.new_qty}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {log.reason ?? "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
