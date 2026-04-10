"use client";

import type { Product } from "@/lib/types";

export default function PrintLabelButton({ product }: { product: Product }) {
  function handlePrint() {
    const win = window.open("", "_blank", "width=400,height=300");
    if (!win) return;

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Label - ${product.sku}</title>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
        <style>
          body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
          .label { text-align: center; padding: 8px; }
          .label-name { font-size: 12pt; font-weight: bold; margin-bottom: 4px; font-family: sans-serif; }
          .label-sku { font-size: 9pt; color: #666; font-family: monospace; margin-bottom: 6px; }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="label-name">${product.name}</div>
          <div class="label-sku">${product.sku}</div>
          <svg id="barcode"></svg>
        </div>
        <script>
          JsBarcode("#barcode", "${product.sku}", {
            format: "CODE128", width: 1.5, height: 50, displayValue: false, margin: 5
          });
          setTimeout(function() { window.print(); }, 300);
        <\/script>
      </body>
      </html>
    `);
    win.document.close();
  }

  return (
    <button
      onClick={handlePrint}
      className="text-sm text-gray-600 hover:text-gray-800"
    >
      Print
    </button>
  );
}
