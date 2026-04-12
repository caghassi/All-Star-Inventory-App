"use client";

import type { Product } from "@/lib/types";
import Barcode from "./Barcode";
import DeleteButton from "./DeleteButton";
import PrintLabelButton from "./PrintLabelButton";

export default function ProductCards({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
        >
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
          <div className="p-4">
            <h3 className="font-semibold text-lg truncate">
              <a
                href={`/products/${product.id}`}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {product.name}
              </a>
            </h3>
            <p className="text-sm text-gray-500 font-mono mt-1">
              {product.sku}
            </p>
            {product.drawer_number && (
              <a
                href={`/drawers/${product.drawer_number}`}
                className="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                Drawer {product.drawer_number}
              </a>
            )}
            <div className="mt-2 flex items-center justify-between">
              <span
                className={`inline-block px-2 py-1 rounded text-sm ${
                  product.quantity === 0
                    ? "bg-red-100 text-red-700"
                    : product.quantity <= 10
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                }`}
              >
                Qty: {product.quantity}
              </span>
              <span className="font-semibold">
                ${Number(product.price).toFixed(2)}
              </span>
            </div>
            <div className="mt-3 flex justify-center">
              <Barcode value={product.sku} />
            </div>
            <div className="mt-3 flex gap-2 justify-end">
              <PrintLabelButton product={product} />
              <a
                href={`/products/${product.id}/edit`}
                className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Edit
              </a>
              <DeleteButton productId={product.id} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
