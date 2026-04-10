"use client";

import { useState } from "react";
import { adjustQuantity } from "@/lib/actions";

interface InventoryAdjusterProps {
  productId: string;
  currentQuantity: number;
}

export default function InventoryAdjuster({
  productId,
  currentQuantity,
}: InventoryAdjusterProps) {
  const [quantity, setQuantity] = useState(currentQuantity);
  const [delta, setDelta] = useState(0);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function adjust(amount: number) {
    const newDelta = delta + amount;
    setDelta(newDelta);
    setQuantity(Math.max(0, currentQuantity + newDelta));
  }

  async function handleSave() {
    if (delta === 0) return;
    if (!reason.trim()) {
      setMessage("Please enter a reason for this adjustment.");
      return;
    }
    setSaving(true);
    setMessage(null);
    const result = await adjustQuantity(productId, delta, reason.trim());
    if (result?.error) {
      setMessage(`Error: ${result.error}`);
      setSaving(false);
    } else {
      setMessage("Quantity updated!");
      setDelta(0);
      setReason("");
      setSaving(false);
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Adjust Inventory
      </h2>

      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => adjust(-1)}
          className="w-10 h-10 rounded-full border-2 border-gray-300 text-xl font-bold hover:bg-gray-100 transition-colors"
        >
          -
        </button>
        <div className="text-center">
          <div className="text-3xl font-bold">{quantity}</div>
          {delta !== 0 && (
            <div
              className={`text-sm font-medium ${delta > 0 ? "text-green-600" : "text-red-600"}`}
            >
              {delta > 0 ? `+${delta}` : delta}
            </div>
          )}
        </div>
        <button
          onClick={() => adjust(1)}
          className="w-10 h-10 rounded-full border-2 border-gray-300 text-xl font-bold hover:bg-gray-100 transition-colors"
        >
          +
        </button>
      </div>

      <div className="mb-4">
        <label
          htmlFor="adjust-reason"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Reason *
        </label>
        <input
          type="text"
          id="adjust-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Received shipment, Damaged goods, Sold 2 units"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {message && (
        <div
          className={`text-sm mb-3 ${message.startsWith("Error") || message.startsWith("Please") ? "text-red-600" : "text-green-600"}`}
        >
          {message}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={delta === 0 || saving}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {saving ? "Saving..." : "Save Adjustment"}
      </button>
    </div>
  );
}
