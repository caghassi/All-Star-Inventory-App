"use client";

import { useState } from "react";
import { setQuantity } from "@/lib/actions";
import type { Product } from "@/lib/types";
import { drawerName } from "@/lib/drawers";

interface DrawerTrueUpProps {
  product: Product;
  drawerNumber: number;
}

export default function DrawerTrueUp({
  product,
  drawerNumber,
}: DrawerTrueUpProps) {
  const [value, setValue] = useState(String(product.quantity));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const parsed = parseInt(value, 10);
  const isValid = !Number.isNaN(parsed) && parsed >= 0;
  const hasChanged = isValid && parsed !== product.quantity;

  async function handleSave() {
    if (!hasChanged) return;
    setSaving(true);
    setStatus("idle");
    setErrorMsg(null);

    const result = await setQuantity(
      product.id,
      parsed,
      `${drawerName(drawerNumber)} true-up`
    );

    if (result?.error) {
      setStatus("error");
      setErrorMsg(result.error);
    } else {
      setStatus("saved");
    }
    setSaving(false);
  }

  return (
    <div className="flex items-center gap-2">
      <div className="text-xs text-gray-500 whitespace-nowrap">
        Expected: <span className="font-semibold">{product.quantity}</span>
      </div>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setStatus("idle");
        }}
        className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={`Actual count for ${product.name}`}
      />
      <button
        onClick={handleSave}
        disabled={!hasChanged || saving}
        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {saving ? "..." : "Set"}
      </button>
      {status === "saved" && (
        <span className="text-green-600 text-xs">Saved</span>
      )}
      {status === "error" && (
        <span className="text-red-600 text-xs" title={errorMsg ?? ""}>
          Error
        </span>
      )}
    </div>
  );
}
