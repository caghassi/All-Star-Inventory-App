"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  type PieLabelRenderProps,
} from "recharts";

const COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
];

interface CategoryData {
  category: string;
  productCount: number;
  totalUnits: number;
  totalValue: number;
}

export default function CategoryBreakdown({
  data,
}: {
  data: CategoryData[];
}) {
  if (data.length === 0) {
    return (
      <p className="text-center py-8 text-gray-400">
        No category data available
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Products by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="productCount"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(props: PieLabelRenderProps) =>
                  `${props.name ?? ""} (${props.value ?? 0})`
                }
                labelLine
              >
                {data.map((_, i) => (
                  <Cell
                    key={`cell-${i}`}
                    fill={COLORS[i % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Inventory Value by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ left: 20 }}>
              <XAxis dataKey="category" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => `$${v.toLocaleString()}`}
              />
              <Tooltip
                formatter={(value) =>
                  `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                }
              />
              <Bar dataKey="totalValue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                Category
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">
                Products
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">
                Total Units
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">
                Total Value
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((cat) => (
              <tr
                key={cat.category}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-3 font-medium">{cat.category}</td>
                <td className="px-4 py-3 text-right">{cat.productCount}</td>
                <td className="px-4 py-3 text-right">
                  {cat.totalUnits.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right">
                  $
                  {cat.totalValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
