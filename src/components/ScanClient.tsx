"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getProductBySku } from "@/lib/actions";
import type { Product } from "@/lib/types";
import { parseDrawerBarcode } from "@/lib/drawers";
import QuickAdjustDialog from "./QuickAdjustDialog";

type ScanState =
  | { mode: "scanning" }
  | { mode: "found"; product: Product }
  | { mode: "not_found"; scannedValue: string };

export default function ScanClient() {
  const router = useRouter();
  const [state, setState] = useState<ScanState>({ mode: "scanning" });
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<unknown>(null);

  useEffect(() => {
    if (state.mode !== "scanning") return;

    let scanner: { clear: () => Promise<void>; stop: () => Promise<void> } | null = null;

    async function startScanner() {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import(
        "html5-qrcode"
      );

      if (!scannerRef.current) return;

      const scannerId = "barcode-scanner";
      scannerRef.current.id = scannerId;

      // Explicitly enable 1D barcode formats. Without this, html5-qrcode
      // only reliably decodes QR codes — CODE128 labels would not scan.
      const html5QrCode = new Html5Qrcode(scannerId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.CODABAR,
          Html5QrcodeSupportedFormats.QR_CODE,
        ],
        verbose: false,
      });
      html5QrCodeRef.current = html5QrCode;

      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 15,
            // Wider box suits 1D barcodes (which are horizontal and long)
            qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              const width = Math.floor(
                Math.min(viewfinderWidth * 0.9, minEdge * 2.5)
              );
              const height = Math.floor(minEdge * 0.5);
              return { width, height };
            },
            aspectRatio: 1.7778,
          },
          async (decodedText: string) => {
            // Stop scanning immediately
            try {
              await html5QrCode.stop();
            } catch {
              // Ignore stop errors
            }

            // Check if this is a drawer barcode — if so, navigate to it
            const drawerNumber = parseDrawerBarcode(decodedText);
            if (drawerNumber !== null) {
              router.push(`/drawers/${drawerNumber}`);
              return;
            }

            // Look up product by SKU
            const product = await getProductBySku(decodedText);
            if (product) {
              setState({ mode: "found", product });
            } else {
              setState({ mode: "not_found", scannedValue: decodedText });
            }
          },
          () => {
            // Scan error (no barcode found in frame) — ignore
          }
        );
        scanner = html5QrCode as unknown as typeof scanner;
      } catch (err) {
        setError(
          "Could not access camera. Please allow camera permissions and try again."
        );
      }
    }

    startScanner();

    return () => {
      if (html5QrCodeRef.current) {
        const qr = html5QrCodeRef.current as { stop: () => Promise<void> };
        qr.stop().catch(() => {});
        html5QrCodeRef.current = null;
      }
    };
  }, [state.mode]);

  function resetScanner() {
    setError(null);
    setState({ mode: "scanning" });
  }

  if (state.mode === "found") {
    return <QuickAdjustDialog product={state.product} onDone={resetScanner} />;
  }

  return (
    <div className="max-w-lg mx-auto">
      {state.mode === "not_found" && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4">
          <p className="font-medium">Product not found</p>
          <p className="text-sm mt-1">
            No product matches SKU:{" "}
            <code className="bg-yellow-100 px-1 rounded">
              {state.scannedValue}
            </code>
          </p>
          <button
            onClick={resetScanner}
            className="mt-2 text-sm text-yellow-900 underline hover:no-underline"
          >
            Scan again
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {state.mode === "scanning" && (
        <>
          <div
            ref={scannerRef}
            className="rounded-lg overflow-hidden border-2 border-gray-300"
          />
          <p className="text-center text-sm text-gray-500 mt-4">
            Point your camera at a barcode to scan
          </p>
        </>
      )}
    </div>
  );
}
