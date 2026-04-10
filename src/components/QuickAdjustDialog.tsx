"use client";

import { useState } from "react";
import { adjustQuantity } from "@/lib/actions";
import type { Product } from "@/lib/types";
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
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSave() {
    if (delta === 0) return;
    setSaving(true);
    const result = await adjustQuantity(product.id, delta, reason);
    if (result?.error) {
      setMessage(`Error: ${result.error}`);
      setSaving(false);
    } else {
      setMessage("Quantity updated!");
      setTimeout(onDone, 1500);
    }
  }

  function adjust(amount: number) {
    const newDelta = delta + amount;
    setDelta(newDelta);
    setQuantity(Math.max(0, product.quantity + newDelta));
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-4">
        {product.image_url && (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-20 h-20 object-cover rounded mx-auto mb-3"
          />
        )}
        <h2 className="text-lg font-semibold">{product.name}</h2>
        <p className="text-sm text-gray-500 font-mono">{product.sku}</p>
        <div className="mt-2 flex justify-center">
          <Barcode value={product.sku} />
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 my-6">
        <button
          onClick={() => adjust(-1)}
          className="w-12 h-12 rounded-full border-2 border-gray-300 text-xl font-bold hover:bg-gray-100 transition-colors"
        >
          -
        </button>
        <div className="text-center">
          <div className="text-4xl font-bold">{quantity}</div>
          <div className="text-xs text-gray-500">
            {delta !== 0 && (
              <span className={delta > 0 ? "text-green-600" : "text-red-600"}>
                {delta > 0 ? `+${delta}` : delta}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => adjust(1)}
          className="w-12 h-12 rounded-full border-2 border-gray-300 text-xl font-bold hover:bg-gray-100 transition-colors"
        >
          +
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reason (optional)
        </label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Received shipment, Sold 2 units"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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
  );
}
