"use client";

import { useState } from "react";
import { generateSku } from "@/lib/sku";
import { createProduct, updateProduct } from "@/lib/actions";
import type { Product } from "@/lib/types";
import Barcode from "./Barcode";
import ImageUpload from "./ImageUpload";
import { DRAWER_COUNT, drawerName } from "@/lib/drawers";

interface ProductFormProps {
  product?: Product;
}

export default function ProductForm({ product }: ProductFormProps) {
  const [sku, setSku] = useState(product?.sku ?? generateSku());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isEditing = !!product;

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);

    formData.set("sku", sku);

    const result = isEditing
      ? await updateProduct(product!.id, formData)
      : await createProduct(formData);

    if (result?.error) {
      setError(result.error);
      setSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Product Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={product?.name}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          SKU *
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            required
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setSku(generateSku())}
            className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm hover:bg-gray-200 transition-colors"
          >
            Regenerate
          </button>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border">
        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium">
          Barcode Preview
        </p>
        <Barcode value={sku} />
      </div>

      <div>
        <label
          htmlFor="drawer_number"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Drawer
        </label>
        <select
          id="drawer_number"
          name="drawer_number"
          defaultValue={product?.drawer_number ?? ""}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">— No drawer assigned —</option>
          {Array.from({ length: DRAWER_COUNT }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {drawerName(n)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={product?.description ?? ""}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="quantity"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Quantity *
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            required
            min="0"
            defaultValue={product?.quantity ?? 0}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Price *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            required
            min="0"
            step="0.01"
            defaultValue={product?.price ?? 0}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <ImageUpload existingUrl={product?.image_url} />

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {submitting
            ? "Saving..."
            : isEditing
              ? "Update Product"
              : "Add Product"}
        </button>
        <a
          href="/"
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
