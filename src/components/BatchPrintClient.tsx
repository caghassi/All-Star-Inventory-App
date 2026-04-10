"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import JsBarcode from "jsbarcode";
import type { Product } from "@/lib/types";

export default function BatchPrintClient({
  products,
}: {
  products: Product[];
}) {
  const [selected, setSelected] = useState<Record<string, number>>({});
  const printRef = useRef<HTMLDivElement>(null);

  const toggleProduct = (id: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = 1;
      }
      return next;
    });
  };

  const setLabelCount = (id: string, count: number) => {
    setSelected((prev) => ({ ...prev, [id]: Math.max(1, count) }));
  };

  const selectAll = () => {
    const all: Record<string, number> = {};
    products.forEach((p) => (all[p.id] = selected[p.id] || 1));
    setSelected(all);
  };

  const totalLabels = Object.values(selected).reduce((a, b) => a + b, 0);

  const handlePrint = useCallback(() => {
    const labels: { name: string; sku: string }[] = [];
    for (const [id, count] of Object.entries(selected)) {
      const product = products.find((p) => p.id === id);
      if (product) {
        for (let i = 0; i < count; i++) {
          labels.push({ name: product.name, sku: product.sku });
        }
      }
    }

    const win = window.open("", "_blank");
    if (!win) return;

    const labelHtml = labels
      .map(
        (l, i) => `
      <div class="label-cell">
        <div class="label-name">${l.name}</div>
        <div class="label-sku">${l.sku}</div>
        <svg id="bc-${i}"></svg>
      </div>`
      )
      .join("");

    const barcodeScripts = labels
      .map(
        (l, i) =>
          `JsBarcode("#bc-${i}", "${l.sku}", { format: "CODE128", width: 1, height: 30, displayValue: false, margin: 2 });`
      )
      .join("\n");

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Batch Labels</title>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: sans-serif; }
          .label-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0;
          }
          .label-cell {
            width: 2.625in;
            height: 1in;
            padding: 0.1in;
            overflow: hidden;
            border: 1px dashed #ccc;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .label-name { font-size: 8pt; font-weight: bold; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
          .label-sku { font-size: 6pt; color: #666; font-family: monospace; }
          svg { max-width: 100%; }
          @media print { .label-cell { border-color: transparent; } }
        </style>
      </head>
      <body>
        <div class="label-grid">${labelHtml}</div>
        <script>
          ${barcodeScripts}
          setTimeout(function() { window.print(); }, 500);
        <\/script>
      </body>
      </html>
    `);
    win.document.close();
  }, [selected, products]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Select All
          </button>
          <button
            onClick={() => setSelected({})}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Deselect All
          </button>
        </div>
        <button
          onClick={handlePrint}
          disabled={totalLabels === 0}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Print {totalLabels} Label{totalLabels !== 1 ? "s" : ""}
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="w-10 px-4 py-3"></th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                Product
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                SKU
              </th>
              <th className="text-center px-4 py-3 text-sm font-medium text-gray-600 w-32">
                Labels
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
                  <input
                    type="checkbox"
                    checked={!!selected[product.id]}
                    onChange={() => toggleProduct(product.id)}
                    className="w-4 h-4"
                  />
                </td>
                <td className="px-4 py-3 font-medium">{product.name}</td>
                <td className="px-4 py-3 font-mono text-sm text-gray-600">
                  {product.sku}
                </td>
                <td className="px-4 py-3 text-center">
                  {selected[product.id] ? (
                    <input
                      type="number"
                      min="1"
                      value={selected[product.id]}
                      onChange={(e) =>
                        setLabelCount(
                          product.id,
                          parseInt(e.target.value, 10) || 1
                        )
                      }
                      className="w-16 border border-gray-300 rounded px-2 py-1 text-center text-sm"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div ref={printRef} />
    </div>
  );
}
