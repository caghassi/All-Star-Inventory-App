"use client";

import { drawerBarcodeValue } from "@/lib/drawers";

interface PrintDrawerLabelsProps {
  drawers: number[];
  buttonLabel?: string;
  className?: string;
}

export default function PrintDrawerLabels({
  drawers,
  buttonLabel,
  className,
}: PrintDrawerLabelsProps) {
  function handlePrint() {
    const win = window.open("", "_blank");
    if (!win) return;

    const labelHtml = drawers
      .map(
        (n, i) => `
      <div class="label-cell">
        <div class="label-heading">DRAWER</div>
        <div class="label-number">${n}</div>
        <svg id="bc-${i}"></svg>
        <div class="label-code">${drawerBarcodeValue(n)}</div>
      </div>`
      )
      .join("");

    const barcodeScripts = drawers
      .map(
        (n, i) =>
          `JsBarcode("#bc-${i}", "${drawerBarcodeValue(n)}", { format: "CODE128", width: 2, height: 60, displayValue: false, margin: 4 });`
      )
      .join("\n");

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Drawer Labels</title>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: sans-serif; padding: 0.25in; }
          .label-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.15in;
          }
          .label-cell {
            width: 4in;
            height: 2.5in;
            padding: 0.2in;
            border: 1px dashed #bbb;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            page-break-inside: avoid;
          }
          .label-heading {
            font-size: 12pt;
            letter-spacing: 0.15em;
            color: #555;
            font-weight: 600;
          }
          .label-number {
            font-size: 48pt;
            font-weight: 800;
            line-height: 1;
            margin: 6px 0 10px;
          }
          .label-code {
            font-family: monospace;
            font-size: 9pt;
            color: #666;
            margin-top: 4px;
          }
          svg { max-width: 100%; }
          @media print {
            body { padding: 0; }
            .label-cell { border-color: transparent; }
          }
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
  }

  const label =
    buttonLabel ??
    (drawers.length === 1
      ? "Print Label"
      : `Print ${drawers.length} Drawer Labels`);

  return (
    <button
      onClick={handlePrint}
      className={
        className ??
        "px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
      }
    >
      {label}
    </button>
  );
}
