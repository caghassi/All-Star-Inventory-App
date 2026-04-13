"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import ProductTable from "./ProductTable";
import ProductCards from "./ProductCard";

export default function ProductList({ products }: { products: Product[] }) {
  const [view, setView] = useState<"table" | "cards">("cards");

  return (
    <div>
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setView("table")}
            className={`px-3 py-1.5 text-sm ${
              view === "table"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setView("cards")}
            className={`px-3 py-1.5 text-sm ${
              view === "cards"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Cards
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-2">No products yet</p>
          <p className="text-sm">
            <a href="/products/new" className="text-blue-600 hover:underline">
              Add your first product
            </a>
          </p>
        </div>
      ) : view === "table" ? (
        <ProductTable products={products} />
      ) : (
        <ProductCards products={products} />
      )}
    </div>
  );
}
