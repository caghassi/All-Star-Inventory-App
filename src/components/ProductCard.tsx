"use client";

import type { Product } from "@/lib/types";

export default function ProductCards({ products }: { products: Product[] }) {
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {products.map((product) => {
        const stockClass =
          product.quantity === 0
            ? "bg-red-100 text-red-700"
            : product.quantity <= 10
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700";

        return (
          <li key={product.id}>
            <a
              href={`/products/${product.id}`}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-white hover:shadow-sm hover:border-blue-300 transition-all"
            >
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt=""
                  className="w-16 h-16 object-cover rounded flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center text-gray-400 text-[10px] uppercase tracking-wide">
                  No img
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate">
                  {product.name}
                </div>
                <div className="text-xs text-gray-500 font-mono truncate">
                  {product.sku}
                </div>
                <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${stockClass}`}
                  >
                    Qty {product.quantity}
                  </span>
                  <span className="text-sm font-semibold text-gray-700">
                    ${Number(product.price).toFixed(2)}
                  </span>
                  {product.drawer_number ? (
                    <span className="inline-block px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-700">
                      Drawer {product.drawer_number}
                    </span>
                  ) : null}
                </div>
              </div>

              <svg
                className="flex-shrink-0 text-gray-400"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
