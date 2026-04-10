"use client";

import { useState } from "react";
import { deleteProduct } from "@/lib/actions";

export default function DeleteButton({ productId }: { productId: string }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <span className="flex gap-1">
        <button
          onClick={async () => {
            await deleteProduct(productId);
          }}
          className="text-sm text-red-600 hover:text-red-800 font-medium"
        >
          Confirm
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-sm text-red-500 hover:text-red-700"
    >
      Delete
    </button>
  );
}
