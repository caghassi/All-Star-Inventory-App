"use client";

import type { Product } from "@/lib/types";
import Barcode from "./Barcode";
import DeleteButton from "./DeleteButton";
import PrintLabelButton from "./PrintLabelButton";

export default function ProductTable({ products }: { products: Product[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
              Photo
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
              Name
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
              SKU
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
              Barcode
            </th>
            <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">
              Qty
            </th>
            <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">
              Price
            </th>
            <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="px-4 py-3">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                    No img
                  </div>
                )}
              </td>
              <td className="px-4 py-3 font-medium">{product.name}</td>
              <td className="px-4 py-3 font-mono text-sm text-gray-600">
                {product.sku}
              </td>
              <td className="px-4 py-3">
                <div className="max-w-[150px]">
                  <Barcode value={product.sku} />
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <span
                  className={`inline-block px-2 py-1 rounded text-sm ${
                    product.quantity === 0
                      ? "bg-red-100 text-red-700"
                      : product.quantity <= 10
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                  }`}
                >
                  {product.quantity}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                ${Number(product.price).toFixed(2)}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <PrintLabelButton product={product} />
                  <a
                    href={`/products/${product.id}/edit`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </a>
                  <DeleteButton productId={product.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
