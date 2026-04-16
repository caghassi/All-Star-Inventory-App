"use client";

import { drawerBarcodeValue, drawerName } from "@/lib/drawers";

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
      <section class="label">
        <div class="left">
          <div class="name">${drawerName(n)}</div>
        </div>
        <div class="right">
          <svg id="bc-${i}"></svg>
          <div class="code">${drawerBarcodeValue(n)}</div>
        </div>
      </section>`
      )
      .join("");

    const barcodeScripts = drawers
      .map(
        (n, i) =>
          `JsBarcode("#bc-${i}", "${drawerBarcodeValue(n)}", { format: "CODE128", width: 2, height: 55, displayValue: false, margin: 0 });`
      )
      .join("\n");

    // Sized for Rollo thermal printer — 1" x 4" label, landscape
    // One label per page so the printer feeds correctly between each label
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Drawer Labels</title>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
        <style>
          @page {
            size: 4in 1in;
            margin: 0;
          }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { width: 4in; font-family: sans-serif; }
          .label {
            width: 4in;
            height: 1in;
            padding: 0.06in 0.1in;
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 0.12in;
            page-break-after: always;
            break-after: page;
            overflow: hidden;
          }
          .label:last-child {
            page-break-after: auto;
            break-after: auto;
          }
          .left {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            width: 1.1in;
          }
          .name {
            font-size: 18pt;
            font-weight: 900;
            line-height: 1.1;
            text-align: center;
            word-break: break-word;
          }
          .right {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-width: 0;
          }
          .code {
            font-family: monospace;
            font-size: 8pt;
            color: #000;
            margin-top: 2px;
          }
          svg { max-width: 100%; height: auto; display: block; }
          /* Preview-only styling that is hidden when printing */
          @media screen {
            body { background: #f5f5f5; padding: 12px; }
            .label {
              background: white;
              border: 1px dashed #bbb;
              margin-bottom: 8px;
            }
          }
        </style>
      </head>
      <body>
        ${labelHtml}
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
