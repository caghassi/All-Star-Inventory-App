"use client";

import type { Product } from "@/lib/types";

export default function ProductTable({ products }: { products: Product[] }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-3 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
              Product
            </th>
            <th className="text-center px-3 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide hidden sm:table-cell">
              Drawer
            </th>
            <th className="text-right px-3 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
              Qty
            </th>
            <th className="text-right px-3 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide hidden sm:table-cell">
              Price
            </th>
            <th className="px-3 py-2 w-6" aria-hidden="true"></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const stockClass =
              product.quantity === 0
                ? "bg-red-100 text-red-700"
                : product.quantity <= 10
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700";

            return (
              <tr
                key={product.id}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  window.location.href = `/products/${product.id}`;
                }}
              >
                <td className="px-3 py-2">
                  <a
                    href={`/products/${product.id}`}
                    className="flex items-center gap-3 min-w-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt=""
                        className="w-10 h-10 object-cover rounded flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center text-gray-400 text-[9px] uppercase">
                        No img
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 text-sm truncate">
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500 font-mono truncate">
                        {product.sku}
                      </div>
                      {/* Show drawer inline on narrow screens */}
                      {product.drawer_number && (
                        <div className="mt-0.5 sm:hidden">
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700">
                            Drawer {product.drawer_number}
                          </span>
                        </div>
                      )}
                    </div>
                  </a>
                </td>
                <td className="px-3 py-2 text-center hidden sm:table-cell">
                  {product.drawer_number ? (
                    <span className="inline-block px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700">
                      #{product.drawer_number}
                    </span>
                  ) : (
                    <span className="text-gray-300 text-sm">—</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${stockClass}`}
                  >
                    {product.quantity}
                  </span>
                </td>
                <td className="px-3 py-2 text-right text-sm text-gray-700 hidden sm:table-cell">
                  ${Number(product.price).toFixed(2)}
                </td>
                <td className="px-2 py-2 text-right text-gray-400">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="inline-block"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
