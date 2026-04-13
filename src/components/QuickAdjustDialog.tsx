"use client";

import { useState } from "react";
import { adjustQuantity } from "@/lib/actions";
import type { Product } from "@/lib/types";
import {
  ADJUSTMENT_REASONS,
  OTHER_REASON,
} from "@/lib/adjustment-reasons";
import Barcode from "./Barcode";

interface QuickAdjustDialogProps {
  product: Product;
  onDone: () => void;
}

export default function QuickAdjustDialog({
  product,
  onDone,
}: QuickAdjustDialogProps) {
  const [quantity, setQuantity] = useState(product.quantity);
  const [delta, setDelta] = useState(0);
  const [reasonChoice, setReasonChoice] = useState<string>(
    ADJUSTMENT_REASONS[0]
  );
  const [otherReason, setOtherReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const finalReason =
    reasonChoice === OTHER_REASON ? otherReason.trim() : reasonChoice;

  async function handleSave() {
    if (delta === 0) return;
    if (reasonChoice === OTHER_REASON && !otherReason.trim()) {
      setMessage("Error: Please describe the reason for this adjustment.");
      return;
    }
    setSaving(true);
    setMessage(null);
    const result = await adjustQuantity(product.id, delta, finalReason);
    if (result?.error) {
      setMessage(`Error: ${result.error}`);
      setSaving(false);
    } else {
      setMessage("Quantity updated!");
      setTimeout(onDone, 1200);
    }
  }

  function adjust(amount: number) {
    const newDelta = delta + amount;
    setDelta(newDelta);
    setQuantity(Math.max(0, product.quantity + newDelta));
  }

  const stockBadgeClass =
    product.quantity === 0
      ? "bg-red-100 text-red-700"
      : product.quantity <= 10
        ? "bg-yellow-100 text-yellow-700"
        : "bg-green-100 text-green-700";

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Product information card */}
      <div className="border border-gray-200 rounded-lg p-5 bg-white">
        <div className="flex gap-4 mb-4">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-400 text-xs">
              No image
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900">
              {product.name}
            </h2>
            <p className="text-sm text-gray-500 font-mono mt-0.5">
              {product.sku}
            </p>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span
                className={`inline-block px-2 py-1 rounded text-sm ${stockBadgeClass}`}
              >
                {product.quantity} on hand
              </span>
              <span className="text-sm text-gray-700">
                ${Number(product.price).toFixed(2)}
              </span>
              {product.drawer_number ? (
                <a
                  href={`/drawers/${product.drawer_number}`}
                  className="inline-block text-sm px-2 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
                >
                  Drawer {product.drawer_number}
                </a>
              ) : (
                <span className="text-xs text-gray-400">No drawer</span>
              )}
            </div>
          </div>
        </div>

        {product.description && (
          <div className="mb-3 pb-3 border-b border-gray-100">
            <p className="text-sm text-gray-700">{product.description}</p>
          </div>
        )}

        <div className="flex justify-center bg-gray-50 rounded p-3">
          <Barcode value={product.sku} />
        </div>

        <div className="mt-3 flex justify-end">
          <a
            href={`/products/${product.id}`}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            View full product page →
          </a>
        </div>
      </div>

      {/* Adjustment section */}
      <div className="border border-gray-200 rounded-lg p-5 bg-white">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Adjust Inventory
        </h3>

        <div className="flex items-center justify-center gap-4 mb-5">
          <button
            onClick={() => adjust(-1)}
            className="w-12 h-12 rounded-full border-2 border-gray-300 text-xl font-bold hover:bg-gray-100 transition-colors"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <div className="text-center min-w-[90px]">
            <div className="text-4xl font-bold">{quantity}</div>
            <div className="text-xs h-4">
              {delta !== 0 && (
                <span
                  className={
                    delta > 0
                      ? "text-green-600 font-medium"
                      : "text-red-600 font-medium"
                  }
                >
                  {delta > 0 ? `+${delta}` : delta}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => adjust(1)}
            className="w-12 h-12 rounded-full border-2 border-gray-300 text-xl font-bold hover:bg-gray-100 transition-colors"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <div className="mb-4">
          <label
            htmlFor="quick-reason"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Reason
          </label>
          <select
            id="quick-reason"
            value={reasonChoice}
            onChange={(e) => setReasonChoice(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ADJUSTMENT_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          {reasonChoice === OTHER_REASON && (
            <input
              type="text"
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
              placeholder="Describe the reason"
              className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>

        {message && (
          <div
            className={`text-sm text-center mb-3 ${message.startsWith("Error") ? "text-red-600" : "text-green-600"}`}
          >
            {message}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={delta === 0 || saving}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={onDone}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Scan Another
          </button>
        </div>
      </div>
    </div>
  );
}
